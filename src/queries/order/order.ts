import {
  ordersApi,
  OrderListParams,
  UpdateStatusPayload,
  UpdateNotePayload,
  CancelOrderPayload,
  RefundOrderPayload,
} from "../../api/orders";
import { parseOrder, parseOrderListResponse } from "../../schema/order.schema";

/**
 * Fetch all orders with optional filters
 */
export async function fetchOrders(params: OrderListParams = {}) {
  const response = await ordersApi.getAll(params);
  return parseOrderListResponse(response);
}

/**
 * Fetch single order by ID with full details
 */
export async function fetchOrderById(id: number) {
  const response = await ordersApi.getById(id);
  if (!response.success || !response.order) {
    throw new Error("Failed to fetch order");
  }
  return parseOrder(response.order);
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, payload: UpdateStatusPayload) {
  const response = await ordersApi.updateStatus(id, payload);
  return response;
}

/**
 * Update order notes
 */
export async function updateOrderNote(id: number, payload: UpdateNotePayload) {
  const response = await ordersApi.updateNote(id, payload);
  return response;
}

/**
 * Get order status history
 */
export async function fetchOrderStatusHistory(id: number) {
  const response = await ordersApi.getStatusHistory(id);
  return response.history || [];
}

/**
 * Get order payments
 */
export async function fetchOrderPayments(id: number) {
  const response = await ordersApi.getPayments(id);
  return response.payments || [];
}

/**
 * Cancel order
 */
export async function cancelOrder(id: number, payload: CancelOrderPayload) {
  const response = await ordersApi.cancelOrder(id, payload);
  return response;
}

/**
 * Process refund
 */
export async function processRefund(id: number, payload: RefundOrderPayload = {}) {
  const response = await ordersApi.processRefund(id, payload);
  return response;
}

