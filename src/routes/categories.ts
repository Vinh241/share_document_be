import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// Get all categories
router.get("/", categoryController.getAllCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

export default router;
