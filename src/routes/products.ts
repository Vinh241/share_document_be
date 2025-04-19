import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

// Get homepage product sections
router.get("/flash-sale", productController.getFlashSaleProducts);
router.get("/new", productController.getNewProducts);
router.get("/bestseller", productController.getBestsellerProducts);

// Get all products
router.get("/", productController.getProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Get product reviews
router.get("/:id/reviews", productController.getProductReviews);

// Create a new product
router.post("/", productController.createProduct);

// Update a product
router.put("/:id", productController.updateProduct);

// Delete a product
router.delete("/:id", productController.deleteProduct);

// Get products by IDs
router.post("/by-ids", productController.getProductsByIds);

export default router;
