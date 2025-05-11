import { Request, Response, NextFunction } from "express";
import * as orderRepository from "../repositories/orderRepository";
import * as productRepository from "../repositories/productRepository";
import db from "../database/connection";
import { AppError } from "../middleware/errorHandler";

class AdminController {
  /**
   * Get dashboard stats (order count, revenue, product count)
   */
  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      // Get orders count
      const orderCount = await db("orders").count("id as count").first();

      // Get total revenue
      const totalRevenue = await db("orders")
        .sum("total_amount as sum")
        .where("status", "!=", "cancelled")
        .first();

      // Get product count
      const productCount = await db("products").count("id as count").first();

      // Get low stock products count
      const lowStockCount = await db("products")
        .count("id as count")
        .where("stock_quantity", "<", 10)
        .first();

      return res.json({
        status: "success",
        data: {
          orderCount: parseInt(orderCount?.count as string) || 0,
          totalRevenue: parseFloat(totalRevenue?.sum as string) || 0,
          productCount: parseInt(productCount?.count as string) || 0,
          lowStockCount: parseInt(lowStockCount?.count as string) || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recent orders
   */
  getRecentOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const orders = await db("orders")
        .join("users", "orders.user_id", "=", "users.id")
        .select(
          "orders.id",
          "orders.total_amount",
          "orders.status",
          "orders.created_at",
          "users.full_name"
        )
        .orderBy("orders.created_at", "desc")
        .limit(limit);

      return res.json({
        status: "success",
        data: {
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all orders with pagination, search and filters
   */
  getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const search = req.query.search as string;

      // Start building query
      let query = db("orders")
        .join("users", "orders.user_id", "=", "users.id")
        .select(
          "orders.id",
          "orders.total_amount",
          "orders.status",
          "orders.created_at",
          "orders.payment_method",
          "orders.payment_status",
          "users.full_name",
          "users.email"
        );

      // Add count query for total orders
      let countQuery = db("orders");

      // Apply status filter if provided
      if (status && status !== "all") {
        query = query.where("orders.status", status);
        countQuery = countQuery.where("orders.status", status);
      }

      // Apply search filter if provided
      if (search) {
        query = query.where((builder) => {
          builder
            .where("users.full_name", "ILIKE", `%${search}%`)
            .orWhere("users.email", "ILIKE", `%${search}%`)
            .orWhere("orders.id", "ILIKE", `%${search}%`);
        });

        countQuery = countQuery
          .join("users", "orders.user_id", "=", "users.id")
          .where((builder) => {
            builder
              .where("users.full_name", "ILIKE", `%${search}%`)
              .orWhere("users.email", "ILIKE", `%${search}%`)
              .orWhere("orders.id", "ILIKE", `%${search}%`);
          });
      }

      // Get order counts
      const countResult = await countQuery.count("* as total").first();
      const total = parseInt(countResult?.total as string) || 0;
      const totalPages = Math.ceil(total / limit);

      // Get orders with pagination
      const orders = await query
        .orderBy("orders.created_at", "desc")
        .limit(limit)
        .offset(offset);

      // For each order, get the count of items
      const ordersWithItemCount = await Promise.all(
        orders.map(async (order) => {
          const itemCount = await db("order_items")
            .where({ order_id: order.id })
            .count("* as count")
            .first();

          return {
            ...order,
            items: parseInt(itemCount?.count as string) || 0,
            date: order.created_at,
            customer: order.full_name,
            email: order.email,
            amount: order.total_amount,
          };
        })
      );

      return res.json({
        status: "success",
        data: {
          orders: ordersWithItemCount,
          total,
          totalPages,
          currentPage: page,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get bestselling products
   */
  getBestsellingProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const products = await db("products")
        .join("categories", "products.category_id", "=", "categories.id")
        .select(
          "products.id",
          "products.name",
          "products.price",
          "products.quantity_sold",
          "categories.name as category_name"
        )
        .orderBy("products.quantity_sold", "desc")
        .limit(limit);

      // Get primary images for each product
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          const image = await db("product_images")
            .where({ product_id: product.id })
            .where({ is_primary: true })
            .first();

          return {
            ...product,
            image_url: image ? image.image_url : null,
          };
        })
      );

      return res.json({
        status: "success",
        data: {
          products: productsWithImages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get slow-selling products
   */
  getSlowSellingProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const products = await db("products")
        .join("categories", "products.category_id", "=", "categories.id")
        .select(
          "products.id",
          "products.name",
          "products.price",
          "products.quantity_sold",
          "products.stock_quantity",
          "categories.name as category_name"
        )
        .orderBy("products.stock_quantity", "desc")
        .limit(limit);

      // Get primary images for each product
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          const image = await db("product_images")
            .where({ product_id: product.id })
            .where({ is_primary: true })
            .first();

          return {
            ...product,
            image_url: image ? image.image_url : null,
          };
        })
      );

      return res.json({
        status: "success",
        data: {
          products: productsWithImages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get total sales by date range
   */
  getSalesByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const { startDate, endDate } = req.query;

      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate
        ? new Date(startDate as string)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Format dates for database query
      const formattedStartDate = start.toISOString().split("T")[0];
      const formattedEndDate = end.toISOString().split("T")[0];

      // Query sales by date
      const salesByDate = await db("orders")
        .select(
          db.raw("DATE(created_at) as date"),
          db.raw("SUM(total_amount) as total_amount"),
          db.raw("COUNT(id) as order_count")
        )
        .where("created_at", ">=", formattedStartDate)
        .where("created_at", "<=", formattedEndDate + " 23:59:59")
        .where("status", "!=", "cancelled")
        .groupBy(db.raw("DATE(created_at)"))
        .orderBy("date");

      return res.json({
        status: "success",
        data: {
          salesByDate,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status
   */
  updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (
        ![
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid status value",
        });
      }

      const updatedOrder = await db("orders")
        .where({ id: orderId })
        .update({
          status,
          updated_at: db.fn.now(),
        })
        .returning("*");

      if (!updatedOrder.length) {
        return res.status(404).json({
          status: "error",
          message: "Order not found",
        });
      }

      return res.json({
        status: "success",
        data: updatedOrder[0],
        message: "Order status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order details for admin
   */
  getOrderDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order ID",
        });
      }

      // Get order base information
      const order = await db("orders")
        .leftJoin("users", "orders.user_id", "=", "users.id")
        .where("orders.id", orderId)
        .select(
          "orders.*",
          "users.full_name",
          "users.email",
          "users.phone_number"
        )
        .first();

      if (!order) {
        return res.status(404).json({
          status: "error",
          message: "Order not found",
        });
      }

      // Get order items with product information
      const orderItems = await db("order_items")
        .leftJoin("products", "order_items.product_id", "=", "products.id")
        .where("order_items.order_id", orderId)
        .select(
          "order_items.*",
          "products.name",
          "products.slug",
          "products.isbn"
        );

      // Get payment details if available
      const paymentDetails = await db("payment_details")
        .where("order_id", orderId)
        .first();

      return res.json({
        status: "success",
        data: {
          order: {
            ...order,
            items: orderItems,
            payment_details: paymentDetails || null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sales by category
   */
  getSalesByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId || !req.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - Admin access required",
        });
      }

      const { startDate, endDate } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate
        ? new Date(startDate as string)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Format dates for database query
      const formattedStartDate = start.toISOString().split("T")[0];
      const formattedEndDate = end.toISOString().split("T")[0];

      // Query sales by category
      const salesByCategory = await db("order_items")
        .join("orders", "order_items.order_id", "=", "orders.id")
        .join("products", "order_items.product_id", "=", "products.id")
        .join("categories", "products.category_id", "=", "categories.id")
        .select(
          "categories.id as category_id",
          "categories.name as name",
          db.raw("SUM(order_items.unit_price * order_items.quantity) as amount")
        )
        .where("orders.status", "!=", "cancelled")
        .where("orders.created_at", ">=", formattedStartDate)
        .where("orders.created_at", "<=", formattedEndDate + " 23:59:59")
        .groupBy("categories.id", "categories.name")
        .orderBy("amount", "desc")
        .limit(limit);

      // Calculate total sales amount to get percentages
      const totalSales = salesByCategory.reduce(
        (sum, category) => sum + parseFloat(category.amount),
        0
      );

      // Add percentage to each category
      const categoriesWithPercentage = salesByCategory.map((category) => ({
        ...category,
        percentage:
          totalSales > 0
            ? Math.round((parseFloat(category.amount) / totalSales) * 100)
            : 0,
      }));

      return res.json({
        status: "success",
        data: {
          salesByCategory: categoriesWithPercentage,
          totalSales,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
