import { Secret } from "jsonwebtoken";

export interface Config {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: Secret;
    expiresIn: string;
  };
  cors: {
    enabled: boolean;
    origins: string[];
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface GetProductsQuery {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryId?: number | string;
  publisherId?: number | string;
  publisherIds?: (number | string)[]; // Add this line
  authorId?: number | string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface User {
  id: number;
  email: string;
  phone_number?: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: number;
  user_id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Publisher {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  quantity_sold: number;
  category_id?: number;
  publisher_id?: number;
  author_id?: number;
  isbn?: string;
  publication_date?: Date;
  created_at: Date;
  updated_at: Date;

  // Fields that might be joined from other tables
  author_name?: string;
  publisher_name?: string;
  category_name?: string;

  // Used for image handling
  images?: ProductImage[];
  product_images?:
    | ProductImage[]
    | {
        image_url: string;
        is_primary: boolean;
      }[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "bank_transfer"
  | "cash_on_delivery"
  | "momo"
  | "vnpay";

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
  user_name?: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}
