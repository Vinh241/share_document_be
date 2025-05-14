import * as orderRepository from "../repositories/orderRepository";
import * as productService from "../services/productService";
import { Order, OrderItem, OrderStatus } from "../types";

/**
 * Tạo mới đơn hàng và các sản phẩm trong đơn hàng
 */
export const createOrder = async (orderData: any) => {
  try {
    // Extract order items from the order data
    const { items, ...orderDetails } = orderData;

    // Kiểm tra tồn kho cho tất cả sản phẩm trong đơn hàng
    if (items && items.length > 0) {
      for (const item of items) {
        const hasStock = await productService.hasEnoughStock(
          item.product_id,
          item.quantity
        );

        if (!hasStock) {
          throw new Error(
            `Product with ID ${item.product_id} does not have enough stock`
          );
        }
      }
    }

    // Create the order
    const order = await orderRepository.createOrder(orderDetails);

    if (items && items.length > 0) {
      // Prepare order items with the new order ID
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      // Create order items
      await orderRepository.createOrderItems(orderItems);

      // Cập nhật số lượng sản phẩm trong kho sau khi tạo đơn hàng thành công
      await orderRepository.updateProductStockForOrder(order.id);
    }

    // Return the created order
    return order;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

/**
 * Lấy thông tin đơn hàng bao gồm các sản phẩm
 */
export const getOrderWithItems = async (orderId: number) => {
  try {
    return await orderRepository.getOrderWithItems(orderId);
  } catch (error) {
    console.error("Get order with items error:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus
) => {
  try {
    return await orderRepository.updateOrderStatus(orderId, status);
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng của người dùng
 */
export const getUserOrders = async (userId: number) => {
  try {
    return await orderRepository.getUserOrders(userId);
  } catch (error) {
    console.error("Get user orders error:", error);
    throw error;
  }
};
