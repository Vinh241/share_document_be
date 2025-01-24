import { Router } from "express";
import userRoutes from "./userRoutes";

const router = Router();

// Mount user routes
router.use("/users", userRoutes);

// Root API route
router.get("/", (_req, res) => {
  console.log("API root route hit 123");
  res.json({
    status: "success",
    message: "API is running",
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
