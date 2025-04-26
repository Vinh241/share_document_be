import { Request, Response, NextFunction } from "express";
import * as orderRepository from "../repositories/orderRepository";

class OrderController {
  // Get order history for authenticated user
  getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
      }

      const orders = await orderRepository.getUserOrders(req.userId);

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

  // Get order details for a specific order
  getOrderDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
      }

      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order ID",
        });
      }

      const orderWithItems = await orderRepository.getOrderWithItems(orderId);

      if (!orderWithItems) {
        return res.status(404).json({
          status: "error",
          message: "Order not found",
        });
      }

      // Verify that the order belongs to the current user
      if (orderWithItems.user_id !== req.userId) {
        return res.status(403).json({
          status: "error",
          message: "Forbidden - You don't have permission to access this order",
        });
      }

      return res.json({
        status: "success",
        data: {
          order: orderWithItems,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new OrderController();
