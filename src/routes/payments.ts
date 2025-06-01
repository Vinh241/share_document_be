import express from "express";
import * as paymentController from "../controllers/paymentController";
import { authenticate, checkUserExists } from "../middleware/auth.middleware";

const router = express.Router();

// Route to create MoMo payment request - protected
router.post(
  "/momo",
  authenticate,
  checkUserExists,
  paymentController.createMomoPayment
);

// Route for MoMo to redirect user after payment
router.get("/momo/return", paymentController.momoPaymentReturn);

// Route for MoMo to notify about payment status
router.post("/momo/notify", paymentController.momoPaymentNotify);

// Route for MoMo IPN (Instant Payment Notification)
router.post("/momo/ipn", paymentController.momoPaymentIpn);

// Route to create VNPay payment request - protected
router.post(
  "/vnpay",
  authenticate,
  checkUserExists,
  paymentController.createVnpayPayment
);

// Route for VNPay to redirect user after payment
router.get("/vnpay/return", paymentController.vnpayPaymentReturn);

// Route for VNPay IPN (Instant Payment Notification)
router.get("/vnpay/ipn", paymentController.vnpayPaymentIpn);

// Route to get payment status - protected
router.get(
  "/:orderId/status",
  authenticate,
  checkUserExists,
  paymentController.getPaymentStatus
);

export default router;
