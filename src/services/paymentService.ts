import axios from "axios";
import crypto from "crypto";
import { momoConfig } from "../config/payment";
import * as orderRepository from "../repositories/orderRepository";

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
