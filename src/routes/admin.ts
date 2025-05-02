import { Router } from "express";
import adminController from "../controllers/adminController";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// Protect all admin routes with authentication and admin check
router.use(authenticate);
router.use(requireAdmin);

// Admin dashboard endpoints
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/dashboard/recent-orders", adminController.getRecentOrders);
router.get(
  "/dashboard/bestselling-products",
  adminController.getBestsellingProducts
);
router.get("/dashboard/sales-by-date", adminController.getSalesByDate);

export default router;
