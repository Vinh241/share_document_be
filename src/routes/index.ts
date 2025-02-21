import { Router } from "express";
import userRoutes from "./userRoutes";
import documentRoutes from "./documentRoutes";

const router = Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/documents", documentRoutes);
// Root API route
router.get("/test", (_req, res) => {
  console.log("API root route hit 1hhj3123 123");
  res.json({
    status: "success",
    message: "Test",
  });
});

// Health check route
router.get("/health", (_req, res) => {
  console.log("Health check route hit 123");
  res.json({
    status: "success",
    message: "API health check passed",
  });
});

export default router;
