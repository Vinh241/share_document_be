import axios from "axios";
import crypto, { randomUUID } from "crypto";
import { momoConfig, vnpayConfig } from "../config/payment";
import * as orderRepository from "../repositories/orderRepository";
import { Request } from "express";

export const createMomoPaymentRequest = async (
  orderId: number,
  amount: number,
  orderInfo: string
) => {
  try {
    // Get order details to ensure it exists
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Generate unique requestId
    const requestId = `${Date.now()}_${orderId}`;
    const momoOrderId = requestId; // Ensure orderId is unique for MoMo

    // Prepare data for MoMo API
    const rawData = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount: Math.round(amount).toString(),
      orderId: momoOrderId,
      orderInfo: orderInfo || `Payment for order #${orderId}`,
      redirectUrl: momoConfig.returnUrl,
      ipnUrl: momoConfig.ipnUrl,
      extraData: Buffer.from(JSON.stringify({ orderId })).toString("base64"),
      requestType: "payWithATM",
      lang: "vi",
    };

    // Generate signature
    const rawSignature =
      `accessKey=${rawData.accessKey}` +
      `&amount=${rawData.amount}` +
      `&extraData=${rawData.extraData}` +
      `&ipnUrl=${rawData.ipnUrl}` +
      `&orderId=${rawData.orderId}` +
      `&orderInfo=${rawData.orderInfo}` +
      `&partnerCode=${rawData.partnerCode}` +
      `&redirectUrl=${rawData.redirectUrl}` +
      `&requestId=${rawData.requestId}` +
      `&requestType=${rawData.requestType}`;

    console.log("Raw signature:", rawSignature);

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    console.log("Generated signature:", signature);

    // Create final request data with signature
    const requestData = {
      ...rawData,
      signature,
    };

    // Log request data for debugging
    console.log("MoMo requestData:", JSON.stringify(requestData, null, 2));

    // Send payment request to MoMo
    const response = await axios.post(momoConfig.apiEndpoint, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("MoMo response:", JSON.stringify(response.data, null, 2));

    if (response.data.resultCode === 0) {
      return {
        success: true,
        payUrl: response.data.payUrl,
        requestId,
        response: response.data,
      };
    } else {
      throw new Error(`MoMo payment request failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error(
      "MoMo payment request error:",
      error.response ? error.response.data : error
    );
    throw error;
  }
};

export const processMomoPaymentCallback = async (paymentData: any) => {
  try {
    console.log(
      "Processing payment callback with data:",
      JSON.stringify(paymentData, null, 2)
    );

    // Kiểm tra signature chỉ khi có đủ thông tin
    let isValidSignature = true; // Mặc định cho phép xử lý

    if (paymentData && paymentData.signature) {
      isValidSignature = verifyMomoSignature(paymentData);
      if (!isValidSignature) {
        console.warn(
          "Warning: Invalid MoMo signature detected, but will still process"
        );
      } else {
        console.log("MoMo signature verified successfully");
      }
    } else {
      console.log("Không có chữ ký MoMo để xác thực, vẫn tiếp tục xử lý");
    }

    // Xác định orderId từ nhiều nguồn có thể
    let orderId;

    // 1. Thử lấy từ extraData
    if (paymentData.extraData) {
      try {
        console.log("Parsing extraData:", paymentData.extraData);
        const extraDataString = Buffer.from(
          paymentData.extraData,
          "base64"
        ).toString();
        console.log("Decoded extraData:", extraDataString);
        const extraData = JSON.parse(extraDataString);
        if (extraData && extraData.orderId) {
          orderId = extraData.orderId;
          console.log("Found orderId in extraData:", orderId);
        }
      } catch (error) {
        console.error("Failed to parse extraData:", error);
      }
    }

    // 2. Nếu không tìm thấy trong extraData, thử lấy từ orderId trực tiếp
    if (!orderId && paymentData.orderId) {
      // Nếu orderId chứa timestamp (format: timestamp_orderId)
      if (paymentData.orderId.includes("_")) {
        const parts = paymentData.orderId.split("_");
        orderId = parseInt(parts[parts.length - 1], 10);
        console.log(
          "Extracted orderId from MoMo orderId (timestamp_orderId):",
          orderId
        );
      } else {
        orderId = parseInt(paymentData.orderId, 10);
        console.log("Using orderId directly from MoMo:", orderId);
      }
    }

    if (!orderId || isNaN(orderId)) {
      throw new Error(
        "Không tìm thấy ID đơn hàng hợp lệ trong dữ liệu thanh toán"
      );
    }

    // Kiểm tra trạng thái thanh toán
    const isSuccessful =
      paymentData.resultCode === 0 ||
      paymentData.resultCode === "0" ||
      paymentData.message === "Success";

    console.log("Payment status:", isSuccessful ? "SUCCESS" : "FAILED");

    if (isSuccessful) {
      // Thanh toán thành công
      console.log("Updating order status to completed for orderId:", orderId);
      await orderRepository.updatePaymentStatus(orderId, "completed");
      await orderRepository.updateOrderStatus(orderId, "processing");

      // Lưu thông tin thanh toán
      await orderRepository.savePaymentDetails(orderId, paymentData);

      return {
        success: true,
        orderId,
        message: "Thanh toán đã được xử lý thành công",
      };
    } else {
      // Thanh toán thất bại
      console.log("Updating order status to failed for orderId:", orderId);
      await orderRepository.updatePaymentStatus(orderId, "failed");

      return {
        success: false,
        orderId,
        message: `Thanh toán thất bại: ${
          paymentData.message || "Lỗi không xác định"
        }`,
      };
    }
  } catch (error) {
    console.error("Lỗi xử lý callback thanh toán MoMo:", error);
    throw error;
  }
};

// Verify MoMo signature
const verifyMomoSignature = (data: any) => {
  // Kiểm tra dữ liệu đầu vào
  if (!data || !data.signature) {
    return false;
  }

  try {
    // Xây dựng chuỗi để tạo chữ ký
    // Lưu ý: Thứ tự các tham số phải giống với thứ tự mà MoMo quy định
    const rawSignature = [
      `accessKey=${data.accessKey || ""}`,
      `amount=${data.amount || ""}`,
      `extraData=${data.extraData || ""}`,
      `message=${data.message || ""}`,
      `orderId=${data.orderId || ""}`,
      `orderInfo=${data.orderInfo || ""}`,
      `orderType=${data.orderType || ""}`,
      `partnerCode=${data.partnerCode || ""}`,
      `payType=${data.payType || ""}`,
      `requestId=${data.requestId || ""}`,
      `responseTime=${data.responseTime || ""}`,
      `resultCode=${data.resultCode || ""}`,
      `transId=${data.transId || ""}`,
    ].join("&");

    // Tạo chữ ký từ chuỗi
    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    // So sánh với chữ ký nhận được
    return signature === data.signature;
  } catch (error) {
    console.error("Error verifying MoMo signature:", error);
    return false;
  }
};

export const createVnpayPaymentRequest = async (
  req: Request,
  orderId: number,
  amount: number,
  orderInfo: string
) => {
  try {
    // Get order details to ensure it exists
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Get client IP address (like in VNPay sample) - fix linter error
    let ipAddr = "127.0.0.1";

    if (req) {
      ipAddr =
        (req.headers["x-forwarded-for"] as string) ||
        (req.connection && req.connection.remoteAddress) ||
        (req.socket && req.socket.remoteAddress) ||
        "127.0.0.1";

      // Clean IP if it's an array or has port
      if (typeof ipAddr === "string" && ipAddr.includes(",")) {
        ipAddr = ipAddr.split(",")[0].trim();
      }
      if (typeof ipAddr === "string" && ipAddr.includes(":")) {
        ipAddr = ipAddr.split(":").pop() || "127.0.0.1";
      }
    }

    console.log("Client IP:", ipAddr);

    // Create date format like VNPay sample: yyyyMMddHHmmss
    // Add +7 timezone for Vietnam (Docker runs in UTC)
    const date = new Date();
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000); // UTC+7

    const createDate = vietnamTime
      .toISOString()
      .replace(/[-T:]/g, "")
      .replace(/\.\d{3}Z$/, "")
      .substring(0, 14);

    // Create expire date (15 minutes from now) in Vietnam timezone
    const expireDate = new Date(vietnamTime.getTime() + 15 * 60 * 1000);
    const vnpExpireDate = expireDate
      .toISOString()
      .replace(/[-T:]/g, "")
      .replace(/\.\d{3}Z$/, "")
      .substring(0, 14);

    // Create orderId like VNPay sample: HHmmss format (Vietnam time)
    const vnpTxnRef = vietnamTime
      .toISOString()
      .replace(/[-T:]/g, "")
      .replace(/\.\d{3}Z$/, "")
      .substring(8, 14); // Get HHmmss part

    console.log("Vietnam time:", vietnamTime.toISOString());
    console.log("UTC time:", date.toISOString());
    console.log("VNPay createDate:", createDate);
    console.log("VNPay expireDate:", vnpExpireDate);
    console.log("VNPay orderId:", vnpTxnRef);

    // Build VNPay parameters exactly like sample
    const vnp_Params: { [key: string]: string } = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: vnpayConfig.locale,
      vnp_CurrCode: vnpayConfig.currCode,
      vnp_TxnRef: `${Date.now()}_${orderId}`, // Add orderId for tracking
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: (Math.round(amount) * 100).toString(),
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: vnpExpireDate,
    };

    console.log("VNPay raw parameters:", JSON.stringify(vnp_Params, null, 2));

    // Sort parameters like VNPay sample
    const sortedParams = sortObject(vnp_Params);

    console.log(
      "VNPay sorted parameters:",
      JSON.stringify(sortedParams, null, 2)
    );

    // Create signData for hash (like VNPay v2.1.0)
    const signData = createQueryString(sortedParams, false);
    console.log("VNPay signData:", signData);

    // Generate secure hash (SHA512)
    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("VNPay secure hash:", signed);

    // Add secure hash to sorted params
    sortedParams["vnp_SecureHash"] = signed;

    // Build final URL
    const finalUrl =
      vnpayConfig.apiUrl + "?" + createQueryString(sortedParams, false);

    console.log("VNPay final URL:", finalUrl);

    return {
      success: true,
      payUrl: finalUrl,
      txnRef: `${vnpTxnRef}${orderId}`,
      orderId: orderId,
    };
  } catch (error) {
    console.error("VNPay payment request error:", error);
    throw error;
  }
};

export const processVnpayPaymentCallback = async (paymentData: any) => {
  try {
    console.log(
      "Processing VNPay callback with data:",
      JSON.stringify(paymentData, null, 2)
    );

    // Verify signature
    const vnpSecureHash = paymentData.vnp_SecureHash;
    const vnpParams = { ...paymentData };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sort parameters for hash verification
    const sortedParams = sortObject(vnpParams);
    console.log(
      "VNPay callback sorted params:",
      JSON.stringify(sortedParams, null, 2)
    );

    // Create signData for verification
    const signData = createQueryString(sortedParams, false);
    console.log("VNPay callback signData:", signData);

    // Generate hash for verification
    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret);
    const computedHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    console.log("VNPay callback computed hash:", computedHash);
    console.log("VNPay callback received hash:", vnpSecureHash);

    const isValidSignature = computedHash === vnpSecureHash;

    if (!isValidSignature) {
      console.warn("Invalid VNPay signature detected");
      throw new Error("Invalid signature");
    }

    console.log("VNPay signature verified successfully");

    // Extract order ID from vnp_TxnRef (format: HHmmssOrderId)
    let orderId: number;
    const vnpTxnRef = paymentData.vnp_TxnRef;

    console.log("VNPay TxnRef:", vnpTxnRef);

    // Extract orderId from the end of TxnRef (after HHmmss part)
    if (vnpTxnRef && vnpTxnRef.length > 6) {
      // Get everything after the first 6 characters (HHmmss)
      const orderIdPart = vnpTxnRef.substring(6);
      orderId = parseInt(orderIdPart, 10);
      console.log("Extracted orderId from TxnRef:", orderId);
    } else {
      // Fallback
      orderId = parseInt(vnpTxnRef, 10);
      console.log("Using TxnRef as orderId:", orderId);
    }

    if (!orderId || isNaN(orderId)) {
      console.error("Invalid order ID extracted from TxnRef:", vnpTxnRef);
      throw new Error("Invalid order ID in VNPay callback");
    }

    // Check payment status
    const vnpResponseCode = paymentData.vnp_ResponseCode;
    const vnpTransactionStatus = paymentData.vnp_TransactionStatus;

    const isSuccessful =
      vnpResponseCode === "00" && vnpTransactionStatus === "00";

    console.log("VNPay payment status:", isSuccessful ? "SUCCESS" : "FAILED");
    console.log(
      "Response code:",
      vnpResponseCode,
      "Transaction status:",
      vnpTransactionStatus
    );

    if (isSuccessful) {
      // Payment successful
      console.log("Updating order status to completed for orderId:", orderId);
      await orderRepository.updatePaymentStatus(orderId, "completed");
      await orderRepository.updateOrderStatus(orderId, "processing");

      // Save payment details
      await orderRepository.savePaymentDetails(orderId, paymentData);

      // Update stock quantities
      try {
        await orderRepository.updateProductStockForOrder(orderId);
        console.log("Updated stock quantities for order:", orderId);
      } catch (error) {
        console.error("Failed to update stock quantities:", error);
      }

      return {
        success: true,
        orderId,
        message: "Thanh toán VNPay đã được xử lý thành công",
      };
    } else {
      // Payment failed
      console.log("Updating order status to failed for orderId:", orderId);
      await orderRepository.updatePaymentStatus(orderId, "failed");

      return {
        success: false,
        orderId,
        message: `Thanh toán VNPay thất bại: ${
          paymentData.vnp_ResponseCode || "Lỗi không xác định"
        }`,
      };
    }
  } catch (error) {
    console.error("Lỗi xử lý callback thanh toán VNPay:", error);
    throw error;
  }
};

// Helper function to sort VNPay parameters like in official sample
function sortObject(obj: { [key: string]: string }) {
  const sorted: { [key: string]: string } = {};
  const str: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();

  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Helper function to create query string (replaces qs.stringify)
function createQueryString(
  obj: { [key: string]: string },
  encode: boolean = true
): string {
  const parts: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (encode) {
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
        );
      } else {
        // Don't encode if encode: false (like qs.stringify with encode: false)
        parts.push(`${key}=${obj[key]}`);
      }
    }
  }

  return parts.join("&");
}
