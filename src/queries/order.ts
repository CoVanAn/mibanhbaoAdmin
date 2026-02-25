import { ordersApi, OrderListParams, UpdateStatusPayload, UpdateNotePayload, CancelOrderPayload } from "../api/orders";
import { parseOrder, parseOrderListResponse } from "../schema/order.schema";

/**
 * Fetch all orders with optional filters
 */
export async function fetchOrders(params: OrderListParams = {}) {
  try {
    console.log('[fetchOrders] Fetching with params:', params);
    const response = await ordersApi.getAll(params);
    console.log('[fetchOrders] Raw response:', response);
    console.log('[fetchOrders] Response structure:', {
      success: response.success,
      ordersCount: response.orders?.length,
      firstOrder: response.orders?.[0],
      pagination: response.pagination,
    });
    
    const parsed = parseOrderListResponse(response);
    console.log('[fetchOrders] Parsed response:', parsed);
    return parsed;
  } catch (error) {
    console.error('[fetchOrders] Error:', error);
    if (error instanceof Error) {
      console.error('[fetchOrders] Error message:', error.message);
      console.error('[fetchOrders] Error stack:', error.stack);
    }
    throw error;
  }
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
  return response.data || [];
}

/**
 * Get order payments
 */
export async function fetchOrderPayments(id: number) {
  const response = await ordersApi.getPayments(id);
  return response.data || [];
}

/**
 * Cancel order
 */
export async function cancelOrder(id: number, payload: CancelOrderPayload) {
  const response = await ordersApi.cancelOrder(id, payload);
  return response;
}

/**
 * Delete order
 */
export async function deleteOrder(id: number) {
  const response = await ordersApi.delete(id);
  return response;
}
