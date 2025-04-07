import { Router } from "express";
import productsRoutes from "./products";
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

export default router;
