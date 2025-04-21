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
    // Verify the signature from MoMo
    const isValidSignature = verifyMomoSignature(paymentData);

    if (!isValidSignature) {
      throw new Error("Invalid signature from MoMo");
    }

    // Extract orderId from extraData
    const extraData = JSON.parse(paymentData.extraData || "{}");
    const orderId = extraData.orderId;

    if (!orderId) {
      throw new Error("Order ID not found in payment data");
    }

    // Update order based on payment status
    if (paymentData.resultCode === 0) {
      // Payment successful
      await orderRepository.updatePaymentStatus(orderId, "completed");
      await orderRepository.updateOrderStatus(orderId, "processing");

      // Save payment details
      await orderRepository.savePaymentDetails(orderId, paymentData);

      return {
        success: true,
        orderId,
        message: "Payment processed successfully",
      };
    } else {
      // Payment failed
      await orderRepository.updatePaymentStatus(orderId, "failed");

      return {
        success: false,
        orderId,
        message: `Payment failed: ${paymentData.message}`,
      };
    }
  } catch (error) {
    console.error("Process MoMo payment callback error:", error);
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
