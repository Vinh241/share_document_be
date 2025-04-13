import db from "../database/connection";
import { Category } from "../types";

/**
 * Find all categories
 */
export const findAll = async () => {
  return db("categories").select("*").orderBy("name", "asc");
};

/**
 * Find category by ID
 */
export const findById = async (id: number): Promise<Category | null> => {
  return db("categories").where("id", id).first() || null;
};

/**
 * Create a new category
 */
export const create = async (
  category: Partial<Category>
): Promise<Category> => {
  const [newCategory] = await db("categories").insert(category).returning("*");
  return newCategory;
};
