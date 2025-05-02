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
        .select(
          "products.id",
          "products.name",
          "products.price",
          "products.quantity_sold"
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
}

export default new AdminController();
