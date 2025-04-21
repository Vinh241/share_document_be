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

    // Redirect to frontend with payment status
    // You should replace this URL with your frontend URL
    const frontendUrl = "http://localhost:5173/payment-result";
    const queryParams = new URLSearchParams({
      status: paymentData.resultCode === "0" ? "success" : "failed",
      orderId: paymentData.orderId as string,
      message: paymentData.message as string,
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
    // This endpoint is called by MoMo for Instant Payment Notification
    const paymentData = req.body;

    console.log("MoMo IPN received:", paymentData);

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

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        paymentStatus: order.payment_status,
        orderStatus: order.status,
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
