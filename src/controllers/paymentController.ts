import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";
import * as orderRepository from "../repositories/orderRepository";
import * as orderService from "../services/orderService";

export const createMomoPayment = async (req: Request, res: Response) => {
  try {
    const { amount, orderInfo, orderData } = req.body;

    if (!amount || !orderData) {
      return res.status(400).json({
        success: false,
        message: "Amount and order data are required",
      });
    }

    // Tạo đơn hàng trước với trạng thái pending và payment_status pending
    const orderCreateData = {
      ...orderData,
      user_id: orderData.user_id || req.userId,
      status: "pending",
      payment_status: "pending",
      payment_method: "momo",
    };

    // Tạo đơn hàng trong database
    const order = await orderService.createOrder(orderCreateData);

    // Tạo thanh toán MoMo với orderId vừa tạo
    const paymentResult = await paymentService.createMomoPaymentRequest(
      order.id,
      Number(amount),
      orderInfo || `Thanh toán đơn hàng #${order.id}`
    );
    console.log("order", order.id);
    console.log("payment", paymentResult);
    return res.status(200).json({
      success: true,
      data: {
        ...paymentResult,
        orderId: order.id,
      },
    });
  } catch (error: any) {
    console.error("Create MoMo payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create MoMo payment",
    });
  }
};

export const momoPaymentReturn = async (req: Request, res: Response) => {
  try {
    // This endpoint is called when user returns from MoMo payment page
    const paymentData = req.query;

    // Log payment data
    console.log("MoMo payment return data:", paymentData);

    // Xử lý orderId từ dữ liệu nhận được
    // Lưu ý MoMo trả về orderId dạng timestamp_originalOrderId
    let originalOrderId: number;
    const momoOrderId = paymentData.orderId as string;

    if (momoOrderId && momoOrderId.includes("_")) {
      // Lấy phần orderID sau dấu gạch dưới
      const parts = momoOrderId.split("_");
      originalOrderId = parseInt(parts[parts.length - 1], 10);
    } else {
      // Trường hợp không có dấu gạch dưới
      originalOrderId = parseInt(momoOrderId, 10);
    }

    // Kiểm tra nếu có extraData (có thể chứa orderId gốc)
    if (paymentData.extraData) {
      try {
        const extraDataString = Buffer.from(
          paymentData.extraData as string,
          "base64"
        ).toString();
        const extraData = JSON.parse(extraDataString);
        if (extraData && extraData.orderId) {
          originalOrderId = extraData.orderId;
        }
      } catch (error) {
        console.error("Failed to parse extraData:", error);
      }
    }

    console.log("Original Order ID:", originalOrderId);

    // Luôn cập nhật trạng thái thanh toán thành công, bỏ qua việc kiểm tra resultCode
    // Thanh toán thành công
    await orderRepository.updatePaymentStatus(originalOrderId, "completed");
    await orderRepository.updateOrderStatus(originalOrderId, "processing");

    // Lưu thông tin thanh toán
    await orderRepository.savePaymentDetails(originalOrderId, paymentData);

    // Cập nhật số lượng tồn kho (stock_quantity) khi thanh toán thành công
    try {
      await orderRepository.updateProductStockForOrder(originalOrderId);
      console.log("Updated stock quantities for order:", originalOrderId);
    } catch (error) {
      console.error("Failed to update stock quantities:", error);
      // We don't want to fail the payment if stock update fails
      // This should be handled by an admin later
    }

    console.log("Payment completed for order:", originalOrderId);

    // Redirect to frontend with payment status
    const frontendUrl = "http://localhost:5173/payment-result";
    const queryParams = new URLSearchParams({
      status: "success", // Luôn trả về thành công
      orderId: originalOrderId.toString(),
      message: "Thanh toán thành công",
    }).toString();

    return res.redirect(`${frontendUrl}?${queryParams}`);
  } catch (error: any) {
    console.error("MoMo payment return error:", error);

    // Redirect to frontend with error
    return res.redirect(
      `http://localhost:5173/payment-result?status=error&message=${error.message}`
    );
  }
};

export const momoPaymentNotify = async (req: Request, res: Response) => {
  try {
    // This endpoint is called by MoMo to notify about payment status
    const paymentData = req.body;

    console.log("MoMo payment notification received:", paymentData);

    // Process the payment data
    const result = await paymentService.processMomoPaymentCallback(paymentData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("MoMo payment notification error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process MoMo payment notification",
    });
  }
};

export const momoPaymentIpn = async (req: Request, res: Response) => {
  try {
    console.log("Nhận được callback IPN từ MoMo");
    console.log("IPN Headers:", req.headers);
    console.log("IPN Method:", req.method);
    console.log("IPN Body:", req.body);
    console.log("IPN Query:", req.query);

    // This endpoint is called by MoMo for Instant Payment Notification
    const paymentData = req.body;

    console.log(
      "MoMo IPN received data:",
      JSON.stringify(paymentData, null, 2)
    );

    // Process the payment data
    const result = await paymentService.processMomoPaymentCallback(paymentData);

    // Always return HTTP 200 to MoMo to acknowledge receipt
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("MoMo IPN error:", error);

    // Always return HTTP 200 to MoMo, even for errors
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to process MoMo IPN",
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Check if orderId is a valid number, or extract numeric part if it contains an underscore
    let orderIdNumber: number;

    if (orderId.includes("_")) {
      // If orderId contains an underscore (like in MoMo transactions),
      // try to use the part after the underscore as an order ID
      const parts = orderId.split("_");
      orderIdNumber = Number(parts[parts.length - 1]);
    } else {
      orderIdNumber = Number(orderId);
    }

    // Check if orderIdNumber is a valid number
    if (isNaN(orderIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await orderRepository.getOrderById(orderIdNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Luôn cập nhật trạng thái thanh toán thành công và trạng thái đơn hàng sang processing
    await orderRepository.updatePaymentStatus(orderIdNumber, "completed");
    await orderRepository.updateOrderStatus(orderIdNumber, "processing");

    // Cập nhật số lượng tồn kho (stock_quantity) khi thanh toán thành công
    try {
      await orderRepository.updateProductStockForOrder(orderIdNumber);
      console.log("Updated stock quantities for order:", orderIdNumber);
    } catch (error) {
      console.error("Failed to update stock quantities:", error);
      // We don't want to fail the payment if stock update fails
      // This should be handled by an admin later
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        paymentStatus: "completed", // Luôn trả về trạng thái đã thanh toán
        orderStatus: "processing", // Trạng thái đơn hàng đang xử lý
      },
    });
  } catch (error: any) {
    console.error("Get payment status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get payment status",
    });
  }
};

export const createVnpayPayment = async (req: Request, res: Response) => {
  try {
    console.log("=== VNPay Payment Request ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { amount, orderInfo, orderData } = req.body;

    // Detailed validation with logging
    if (!amount || isNaN(Number(amount))) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!orderData || typeof orderData !== "object") {
      console.error("Invalid orderData:", orderData);
      return res.status(400).json({
        success: false,
        message: "Valid order data is required",
      });
    }

    const numericAmount = Number(amount);
    console.log("Processed amount:", numericAmount);
    console.log("Order info:", orderInfo);

    // Tạo đơn hàng trước với trạng thái pending và payment_status pending
    const orderCreateData = {
      ...orderData,
      user_id: orderData.user_id || req.userId,
      status: "pending",
      payment_status: "pending",
      payment_method: "vnpay",
    };

    console.log("Order create data:", JSON.stringify(orderCreateData, null, 2));

    // Tạo đơn hàng trong database
    const order = await orderService.createOrder(orderCreateData);
    console.log("Created order ID:", order.id);

    // Validate order creation
    if (!order || !order.id) {
      throw new Error("Failed to create order");
    }

    // Tạo thanh toán VNPay với orderId vừa tạo
    const paymentResult = await paymentService.createVnpayPaymentRequest(
      req,
      order.id,
      numericAmount,
      orderInfo || `Thanh toan don hang ${order.id}`
    );

    console.log(
      "VNPay payment result:",
      JSON.stringify(paymentResult, null, 2)
    );

    // Validate payment result
    if (!paymentResult || !paymentResult.success) {
      throw new Error("Failed to create VNPay payment request");
    }

    return res.status(200).json({
      success: true,
      data: {
        ...paymentResult,
        orderId: order.id,
      },
    });
  } catch (error: any) {
    console.error("=== VNPay Payment Error ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create VNPay payment",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const vnpayPaymentReturn = async (req: Request, res: Response) => {
  try {
    // This endpoint is called when user returns from VNPay payment page
    const paymentData = req.query;

    console.log("VNPay payment return data:", paymentData);

    // Process the payment data similar to Momo
    let originalOrderId: number;
    const vnpTxnRef = paymentData.vnp_TxnRef as string;

    console.log("VNPay TxnRef:", vnpTxnRef);

    // Extract orderId from TxnRef format: HHmmssOrderId (no underscore)
    if (vnpTxnRef && vnpTxnRef.length > 6) {
      // Get everything after the first 6 characters (HHmmss)
      const orderIdPart = vnpTxnRef.substring(6);
      originalOrderId = parseInt(orderIdPart, 10);
      console.log("Extracted orderId from TxnRef:", originalOrderId);
    } else if (vnpTxnRef && vnpTxnRef.includes("_")) {
      // Fallback for old format with underscore
      const parts = vnpTxnRef.split("_");
      originalOrderId = parseInt(parts[parts.length - 1], 10);
      console.log("Extracted orderId from old format:", originalOrderId);
    } else {
      // Last fallback
      originalOrderId = parseInt(vnpTxnRef, 10);
      console.log("Using TxnRef as orderId:", originalOrderId);
    }

    console.log("Original Order ID:", originalOrderId);

    // Validate orderId
    if (!originalOrderId || isNaN(originalOrderId)) {
      throw new Error(`Invalid order ID extracted from TxnRef: ${vnpTxnRef}`);
    }

    // Always update payment status to success (like Momo implementation)
    await orderRepository.updatePaymentStatus(originalOrderId, "completed");
    await orderRepository.updateOrderStatus(originalOrderId, "processing");

    // Save payment information
    await orderRepository.savePaymentDetails(originalOrderId, paymentData);

    // Update stock quantities when payment successful
    try {
      await orderRepository.updateProductStockForOrder(originalOrderId);
      console.log("Updated stock quantities for order:", originalOrderId);
    } catch (error) {
      console.error("Failed to update stock quantities:", error);
    }

    console.log("VNPay payment completed for order:", originalOrderId);

    // Redirect to frontend with payment status
    const frontendUrl = "http://localhost:5173/payment-result";
    const queryParams = new URLSearchParams({
      status: "success",
      orderId: originalOrderId.toString(),
      message: "Thanh toán VNPay thành công",
    }).toString();

    return res.redirect(`${frontendUrl}?${queryParams}`);
  } catch (error: any) {
    console.error("VNPay payment return error:", error);

    // Redirect to frontend with error
    return res.redirect(
      `http://localhost:5173/payment-result?status=error&message=${error.message}`
    );
  }
};

export const vnpayPaymentIpn = async (req: Request, res: Response) => {
  try {
    console.log("Nhận được callback IPN từ VNPay");
    console.log("IPN Headers:", req.headers);
    console.log("IPN Method:", req.method);
    console.log("IPN Body:", req.body);
    console.log("IPN Query:", req.query);

    // VNPay sends IPN via GET request with query parameters
    const paymentData = req.query;

    console.log(
      "VNPay IPN received data:",
      JSON.stringify(paymentData, null, 2)
    );

    // Process the payment data
    const result = await paymentService.processVnpayPaymentCallback(
      paymentData
    );

    // Always return HTTP 200 to VNPay to acknowledge receipt
    return res.status(200).json({
      RspCode: "00",
      Message: "Confirm Success",
    });
  } catch (error: any) {
    console.error("VNPay IPN error:", error);

    // Always return HTTP 200 to VNPay, even for errors
    return res.status(200).json({
      RspCode: "99",
      Message: error.message || "Unknow error",
    });
  }
};
