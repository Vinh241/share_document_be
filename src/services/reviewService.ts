import * as reviewRepository from "../repositories/reviewRepository";
import { Review } from "../types";

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (productId: number) => {
  return reviewRepository.findByProductId(productId);
};

/**
 * Get average rating for a product
 */
export const getProductAverageRating = async (
  productId: number
): Promise<number | null> => {
  return reviewRepository.getAverageRating(productId);
};

/**
 * Get review count for a product
 */
export const getProductReviewCount = async (
  productId: number
): Promise<number> => {
  return reviewRepository.getReviewCount(productId);
};

/**
 * Create a new review for a product
 */
export const createReview = async (
  userId: number,
  productId: number,
  rating: number,
  comment?: string
): Promise<Review> => {
  // Check if the user has already reviewed this product
  const existingReview = await reviewRepository.findUserProductReview(
    userId,
    productId
  );

  if (existingReview) {
    // Update existing review
    return reviewRepository.update(existingReview.id, {
      rating,
      comment,
    });
  }

  // Create new review
  return reviewRepository.create({
    user_id: userId,
    product_id: productId,
    rating,
    comment,
  });
};

/**
 * Check if a user has already reviewed a product
 */
export const hasUserReviewedProduct = async (
  userId: number,
  productId: number
): Promise<boolean> => {
  const review = await reviewRepository.findUserProductReview(
    userId,
    productId
  );
  return !!review;
};

/**
 * Get a user's review for a product
 */
export const getUserProductReview = async (
  userId: number,
  productId: number
): Promise<Review | null> => {
  return reviewRepository.findUserProductReview(userId, productId);
};
