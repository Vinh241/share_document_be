import db from "../database/connection";
import { Review } from "../types";

/**
 * Find all reviews for a product
 */
export const findByProductId = async (productId: number): Promise<Review[]> => {
  return db("reviews")
    .select("reviews.*", db.raw("users.full_name as user_name"))
    .leftJoin("users", "reviews.user_id", "users.id")
    .where({ product_id: productId })
    .orderBy("reviews.created_at", "desc");
};

/**
 * Calculate average rating for a product
 */
export const getAverageRating = async (productId: number): Promise<number> => {
  const result = await db("reviews")
    .where({ product_id: productId })
    .avg("rating as average_rating")
    .first();

  return result?.average_rating || 0;
};

/**
 * Get review count for a product
 */
export const getReviewCount = async (productId: number): Promise<number> => {
  const result = await db("reviews")
    .where({ product_id: productId })
    .count("* as count")
    .first();

  return Number(result?.count) || 0;
};

/**
 * Create a new review
 */
export const create = async (
  reviewData: Omit<Review, "id" | "created_at" | "updated_at">
): Promise<Review> => {
  const [review] = await db("reviews")
    .insert({
      ...reviewData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning("*");

  return review;
};

/**
 * Check if a user has already reviewed a product
 */
export const findUserProductReview = async (
  userId: number,
  productId: number
): Promise<Review | null> => {
  const review = await db("reviews")
    .where({ user_id: userId, product_id: productId })
    .first();

  return review || null;
};

/**
 * Update an existing review
 */
export const update = async (
  reviewId: number,
  reviewData: Partial<Omit<Review, "id" | "created_at" | "updated_at">>
): Promise<Review> => {
  const [review] = await db("reviews")
    .where({ id: reviewId })
    .update({
      ...reviewData,
      updated_at: new Date(),
    })
    .returning("*");

  return review;
};
