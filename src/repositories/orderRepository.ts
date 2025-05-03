import db from "../database/connection";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "../types";

export const createOrder = async (
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
) => {
  console.log("orderData", orderData);
  const dataInsert = {
    user_id: orderData.user_id,
    total_amount: orderData.total_amount,
    shipping_address: orderData.shipping_address,
    payment_method: orderData.payment_method,
    // shipping_address_id BIGINT REFERENCES addresses(id),
    // payment_method payment_method NOT NULL,
    // payment_status payment_status DEFAULT 'pending',
    // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    // updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  };
  const [order] = await db("orders").insert(dataInsert).returning("*");
  return order;
};

export const createOrderItems = async (
  orderItems: Omit<OrderItem, "id" | "created_at" | "updated_at">[]
) => {
  console.log("orderItems", orderItems);
  return db("order_items").insert(orderItems).returning("*");
};

export const getOrderById = async (id: number) => {
  return db("orders").where({ id }).first();
};

export const getOrderWithItems = async (id: number) => {
  const order = await db("orders").where({ id }).first();

  if (!order) return null;

  const orderItems = await db("order_items")
    .where({ order_id: id })
    .join("products", "order_items.product_id", "products.id")
    .select("order_items.*", "products.name", "products.slug", "products.isbn");

  return { ...order, items: orderItems };
};

export const updateOrderStatus = async (id: number, status: OrderStatus) => {
  const [updatedOrder] = await db("orders")
    .where({ id })
    .update({ status, updated_at: new Date() })
    .returning("*");

  return updatedOrder;
};

export const updatePaymentStatus = async (
  id: number,
  paymentStatus: PaymentStatus
) => {
  const [updatedOrder] = await db("orders")
    .where({ id })
    .update({ payment_status: paymentStatus, updated_at: new Date() })
    .returning("*");

  return updatedOrder;
};

export const getUserOrders = async (userId: number) => {
  return db("orders").where({ user_id: userId }).orderBy("created_at", "desc");
};

export const savePaymentDetails = async (
  orderId: number,
  paymentDetails: any
) => {
  await db("payment_details").insert({
    order_id: orderId,
    provider: "momo",
    transaction_id: paymentDetails.transId || paymentDetails.orderId,
    amount: paymentDetails.amount,
    payment_data: JSON.stringify(paymentDetails),
    created_at: new Date(),
  });
};

/**
 * Update product stock quantities for a completed order
 */
export const updateProductStockForOrder = async (
  orderId: number
): Promise<boolean> => {
  const trx = await db.transaction();

  try {
    // Get order items
    const orderItems = await trx("order_items")
      .where({ order_id: orderId })
      .select("product_id", "quantity");

    if (!orderItems || orderItems.length === 0) {
      await trx.commit();
      return false;
    }

    // Update stock for each product
    for (const item of orderItems) {
      // Decrease stock and increase quantity_sold
      await trx("products")
        .where({ id: item.product_id })
        .decrement("stock_quantity", item.quantity)
        .increment("quantity_sold", item.quantity);
    }

    await trx.commit();
    return true;
  } catch (error) {
    await trx.rollback();
    console.error("Error updating product stock:", error);
    throw error;
  }
};
