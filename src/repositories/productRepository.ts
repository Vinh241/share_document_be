import db from "../database/connection";
import { Product, GetProductsQuery } from "../types";

/**
 * Find all products with applied filters, sorting and pagination
 */
export const findAll = async (query: GetProductsQuery) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "quantity_sold",
    sortOrder = "desc",
    categoryId,
    publisherId,
    authorId,
    minPrice,
    maxPrice,
    search,
  } = query;

  // Convert to numbers
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build query
  const dbQuery = db("products").select("*");

  // Apply filters
  if (categoryId) {
    dbQuery.where("category_id", categoryId);
  }
  if (publisherId) {
    dbQuery.where("publisher_id", publisherId);
  }
  if (authorId) {
    dbQuery.where("author_id", authorId);
  }
  if (minPrice !== undefined) {
    dbQuery.where("price", ">=", minPrice);
  }
  if (maxPrice !== undefined) {
    dbQuery.where("price", "<=", maxPrice);
  }
  if (search) {
    dbQuery
      .whereRaw("LOWER(name) LIKE ?", [`%${search.toLowerCase()}%`])
      .orWhereRaw("LOWER(description) LIKE ?", [`%${search.toLowerCase()}%`]);
  }

  // Clone the query for count
  const countQuery = dbQuery.clone();

  // Apply sorting and pagination
  const products = await dbQuery
    .orderBy(sortBy, sortOrder)
    .limit(limitNum)
    .offset(offset);

  // Get total count
  const [{ count }] = await countQuery.count({ count: "*" });

  return {
    products,
    total: Number(count),
  };
};

/**
 * Find product by ID
 */
export const findById = async (id: number): Promise<Product | null> => {
  return db("products").where("id", id).first() || null;
};

/**
 * Create a new product
 */
export const create = async (product: Partial<Product>): Promise<Product> => {
  const [newProduct] = await db("products").insert(product).returning("*");
  return newProduct;
};

/**
 * Update a product
 */
export const update = async (
  id: number,
  data: Partial<Product>
): Promise<Product | null> => {
  const [updatedProduct] = await db("products")
    .where("id", id)
    .update(data)
    .returning("*");

  return updatedProduct || null;
};

/**
 * Delete a product
 */
export const remove = async (id: number): Promise<boolean> => {
  const deleted = await db("products").where("id", id).delete();
  return deleted > 0;
};
