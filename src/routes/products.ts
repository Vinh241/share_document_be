import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

// Get all products
router.get("/", productController.getProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Create a new product
router.post("/", productController.createProduct);

// Update a product
router.put("/:id", productController.updateProduct);

// Delete a product
router.delete("/:id", productController.deleteProduct);

export default router;
