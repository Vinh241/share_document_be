import express from "express";
import * as paymentController from "../controllers/paymentController";

const router = express.Router();

// Route to create MoMo payment request
router.post("/momo", paymentController.createMomoPayment);

// Route for MoMo to redirect user after payment
router.get("/momo/return", paymentController.momoPaymentReturn);

// Route for MoMo to notify about payment status
router.post("/momo/notify", paymentController.momoPaymentNotify);

// Route for MoMo IPN (Instant Payment Notification)
router.post("/momo/ipn", paymentController.momoPaymentIpn);

// Route to get payment status
router.get("/:orderId/status", paymentController.getPaymentStatus);

export default router;
