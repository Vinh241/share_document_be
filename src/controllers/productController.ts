import { Request, Response, NextFunction } from "express";
import { GetProductsQuery } from "../types";
import * as productService from "../services/productService";
import * as reviewService from "../services/reviewService";
import { AppError } from "../middleware/errorHandler";

/**
 * Get all products with pagination and sorting
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("req.query", req.query);
    const query: GetProductsQuery = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      sortBy: (req.query.sortBy as string) || "quantity_sold",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
      categoryId: req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined,
      publisherId: req.query.publisherId
        ? Number(req.query.publisherId)
        : undefined,
      authorId: req.query.authorId ? Number(req.query.authorId) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      search: req.query.search as string,
      publisherIds: req.query.publisherIds
        ? (req.query.publisherIds as string[]).map(Number)
        : undefined,
    };

    const products = await productService.getProducts(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Get product reviews
    const reviews = await reviewService.getProductReviews(productId);

    res.json({
      ...product,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body;

    // Basic validation
    if (!productData.name || !productData.price) {
      throw new AppError("Name and price are required", 400);
    }

    const newProduct = await productService.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const productData = req.body;
    const updatedProduct = await productService.updateProduct(
      productId,
      productData
    );

    if (!updatedProduct) {
      throw new AppError("Product not found", 404);
    }

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const isDeleted = await productService.deleteProduct(productId);

    if (!isDeleted) {
      throw new AppError("Product not found", 404);
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get flash sale products (5 products with lowest sale_price)
 */
export const getFlashSaleProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = await productService.getFlashSaleProducts(page, limit);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get new products (newest products by created_at)
 */
export const getNewProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = await productService.getNewProducts(page, limit);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bestseller products (products with highest quantity_sold)
 */
export const getBestsellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = await productService.getBestsellerProducts(page, limit);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product reviews
 */
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const reviews = await reviewService.getProductReviews(productId);
    const averageRating = await reviewService.getProductAverageRating(
      productId
    );
    const reviewCount = await reviewService.getProductReviewCount(productId);

    res.json({
      reviews,
      average_rating: averageRating,
      review_count: reviewCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by IDs
 */
export const getProductsByIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError("Invalid product IDs", 400);
    }

    const products = await productService.getProductsByIds(ids);
    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
