import db from "../database/connection";
import { Review } from "../types";

/**
 * Find all reviews for a product
 */
export const findByProductId = async (productId: number) => {
  return db("reviews")
    .select("reviews.*", db.raw("users.full_name as user_name"))
    .leftJoin("users", "reviews.user_id", "users.id")
    .where("product_id", productId)
    .orderBy("created_at", "desc");
};

/**
 * Calculate average rating for a product
 */
export const getAverageRating = async (
  productId: number
): Promise<number | null> => {
  const result = await db("reviews")
    .where("product_id", productId)
    .avg("rating as average_rating")
    .first();

  return result && result.average_rating ? Number(result.average_rating) : null;
};

/**
 * Get review count for a product
 */
export const getReviewCount = async (productId: number): Promise<number> => {
  const result = await db("reviews")
    .where("product_id", productId)
    .count("id as count")
    .first();

  return result ? Number(result.count) : 0;
};
