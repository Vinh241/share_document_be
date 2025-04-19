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
    publisherIds, // Add support for array of publisher IDs
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
  const dbQuery = db("products")
    .select(
      "products.*",
      db.raw("authors.name as author_name"),
      db.raw("publishers.name as publisher_name"),
      db.raw("categories.name as category_name")
    )
    .leftJoin("authors", "products.author_id", "authors.id")
    .leftJoin("publishers", "products.publisher_id", "publishers.id")
    .leftJoin("categories", "products.publisher_id", "categories.id");

  // Apply filters
  if (categoryId) {
    dbQuery.where("products.category_id", categoryId);
  }
  console.log("query", query);
  console.log("pipeline", publisherId, publisherIds);

  // Handle publisherIds array or single publisherId
  if (publisherIds && Array.isArray(publisherIds) && publisherIds.length > 0) {
    dbQuery.whereIn("products.publisher_id", publisherIds);
  } else if (publisherId) {
    dbQuery.where("products.publisher_id", publisherId);
  }

  if (authorId) {
    dbQuery.where("products.author_id", authorId);
  }
  if (minPrice !== undefined) {
    dbQuery.where("products.price", ">=", minPrice);
  }
  if (maxPrice !== undefined) {
    dbQuery.where("products.price", "<=", maxPrice);
  }
  if (search) {
    dbQuery
      .whereRaw("LOWER(products.name) LIKE ?", [`%${search.toLowerCase()}%`])
      .orWhereRaw("LOWER(products.description) LIKE ?", [
        `%${search.toLowerCase()}%`,
      ]);
  }

  // Clone the query for count
  const countQuery = dbQuery.clone();

  // Fix: Clear the select clause and only count
  countQuery.clearSelect().count({ count: "*" });

  // Apply sorting and pagination
  const products = await dbQuery
    .orderBy(`products.${sortBy}`, sortOrder)
    .limit(limitNum)
    .offset(offset);

  // Get total count
  const [{ count }] = await countQuery;

  return {
    products,
    total: Number(count),
  };
};

/**
 * Find product by ID
 */
export const findById = async (id: number): Promise<Product | null> => {
  const product = await db("products")
    .select(
      "products.*",
      db.raw("authors.name as author_name"),
      db.raw("publishers.name as publisher_name"),
      db.raw("COALESCE(AVG(reviews.rating), 0) as average_rating"),
      db.raw("COUNT(DISTINCT reviews.id) as review_count")
    )
    .leftJoin("authors", "products.author_id", "authors.id")
    .leftJoin("publishers", "products.publisher_id", "publishers.id")
    .leftJoin("reviews", "products.id", "reviews.product_id")
    .where("products.id", id)
    .groupBy("products.id", "authors.name", "publishers.name")
    .first();

  return product || null;
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

/**
 * Find flash sale products (products with sale_price, ordered by lowest price)
 */
export const findFlashSaleProducts = async (
  page: number = 1,
  limit: number = 5
) => {
  const offset = (page - 1) * limit;

  // Build query for products with author and publisher join
  const productsQuery = db("products")
    .select(
      "products.*",
      db.raw("authors.name as author_name"),
      db.raw("publishers.name as publisher_name")
    )
    .leftJoin("authors", "products.author_id", "authors.id")
    .leftJoin("publishers", "products.publisher_id", "publishers.id")
    .whereNotNull("sale_price")
    .orderBy("sale_price", "asc")
    .limit(limit)
    .offset(offset);

  // Build query for count - modified to use a simpler count query
  const countQuery = db("products")
    .whereNotNull("sale_price")
    .count({ count: "*" });

  // Execute both queries
  const products = await productsQuery;
  const [{ count }] = await countQuery;

  return {
    products,
    total: Number(count),
  };
};

/**
 * Find new products (newest products by created_at)
 */
export const findNewProducts = async (page: number = 1, limit: number = 5) => {
  const offset = (page - 1) * limit;

  // Build query for products with author and publisher join
  const productsQuery = db("products")
    .select(
      "products.*",
      db.raw("authors.name as author_name"),
      db.raw("publishers.name as publisher_name")
    )
    .leftJoin("authors", "products.author_id", "authors.id")
    .leftJoin("publishers", "products.publisher_id", "publishers.id")
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);

  // Build query for count
  const countQuery = db("products").count({ count: "*" });

  // Execute both queries
  const products = await productsQuery;
  const [{ count }] = await countQuery;

  return {
    products,
    total: Number(count),
  };
};

/**
 * Find bestseller products (products with highest quantity_sold)
 */
export const findBestsellerProducts = async (
  page: number = 1,
  limit: number = 5
) => {
  const offset = (page - 1) * limit;

  // Build query for products with author and publisher join
  const productsQuery = db("products")
    .select(
      "products.*",
      db.raw("authors.name as author_name"),
      db.raw("publishers.name as publisher_name")
    )
    .leftJoin("authors", "products.author_id", "authors.id")
    .leftJoin("publishers", "products.publisher_id", "publishers.id")
    .orderBy("quantity_sold", "desc")
    .limit(limit)
    .offset(offset);

  // Build query for count
  const countQuery = db("products").count({ count: "*" });

  // Execute both queries
  const products = await productsQuery;
  const [{ count }] = await countQuery;

  return {
    products,
    total: Number(count),
  };
};

/**
 * Find products by IDs
 */
export const findByIds = async (ids: number[]): Promise<Product[]> => {
  return db("products").whereIn("id", ids);
};
