import { GetProductsQuery, PaginatedResponse, Product } from "../types";
import * as productRepository from "../repositories/productRepository";

/**
 * Get all products with pagination and sorting
 */
export const getProducts = async (
  query: GetProductsQuery
): Promise<PaginatedResponse<Product>> => {
  const { products, total } = await productRepository.findAll(query);

  const pageNum = Number(query.page || 1);
  const limitNum = Number(query.limit || 10);

  return {
    data: products,
    pagination: {
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Get product by ID
 */
export const getProductById = async (id: number): Promise<Product | null> => {
  return productRepository.findById(id);
};

/**
 * Create a new product
 */
export const createProduct = async (
  productData: Partial<Product>
): Promise<Product> => {
  return productRepository.create(productData);
};

/**
 * Update a product
 */
export const updateProduct = async (
  id: number,
  productData: Partial<Product>
): Promise<Product | null> => {
  return productRepository.update(id, productData);
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: number): Promise<boolean> => {
  return productRepository.remove(id);
};
