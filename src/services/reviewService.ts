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
