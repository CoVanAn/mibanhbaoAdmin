import apiClient from "../lib/api";
import { parseOrderList, parseOrder } from "../schema/order.schema";

/**
 * Fetch all orders with optional filters
 */
export async function fetchOrders(params = {}) {
  const response = await apiClient.get("/api/order/list", { params });
  return parseOrderList(response.data);
}

/**
 * Fetch single order by ID
 */
export async function fetchOrderById(id: number) {
  const response = await apiClient.get(`/api/order/${id}`);
  return parseOrder(response.data);
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, status: string) {
  const response = await apiClient.patch(`/api/order/${id}/status`, {
    status,
  });
  return response.data;
}

/**
 * Delete order
 */
export async function deleteOrder(id: number) {
  const response = await apiClient.delete(`/api/order/${id}`);
  return response.data;
}
