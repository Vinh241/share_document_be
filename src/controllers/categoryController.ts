import { Request, Response } from "express";
import * as categoryRepository from "../repositories/categoryRepository";

/**
 * Get all categories
 */
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryRepository.findAll();

    return res.json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID",
      });
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch category",
    });
  }
};
