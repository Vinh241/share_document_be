import { Router } from "express";
import productsRoutes from "./products";
import categoriesRoutes from "./categories";
import publisherRoutes from "./publishers";
import paymentsRoutes from "./payments";
import authRoutes from "./auth";
import ordersRoutes from "./orders";
const router = Router();

// Mount routes

// Root API route
router.get("/test", (_req, res) => {
  res.json({
    status: "success",
    message: "Bookstore API is running",
  });
});

// Health check route
router.get("/health", (_req, res) => {
  res.json({
    status: "success",
    message: "API health check passed",
  });
});

router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/publishers", publisherRoutes);
router.use("/payments", paymentsRoutes);
router.use("/auth", authRoutes);
router.use("/orders", ordersRoutes);
export default router;
