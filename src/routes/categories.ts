import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// Get all categories
router.get("/", categoryController.getAllCategories);

export default router;
