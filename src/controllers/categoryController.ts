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
