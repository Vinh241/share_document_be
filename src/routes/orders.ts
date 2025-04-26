import { Router } from "express";
import orderController from "../controllers/orderController";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Protect all order routes with authentication
router.use(authenticate);

// Create a new order
router.post("/", orderController.createOrder);

// Get user's order history
router.get("/", orderController.getUserOrders);

// Get details of a specific order
router.get("/:id", orderController.getOrderDetails);

export default router;
