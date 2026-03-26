import apiClient from "./client";

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface UpdateStatusPayload {
  status: string;
  reason?: string;
}

export interface UpdateNotePayload {
  customerNote?: string;
  internalNote?: string;
}

export interface CancelOrderPayload {
  reason: string;
}

export interface RefundOrderPayload {
  reason?: string;
  amount?: number;
}

export const ordersApi = {
  /**
   * Get all orders with filters and pagination
   */
  getAll: async (params: OrderListParams = {}) => {
    const response = await apiClient.get("/api/order/list", { params });
    return response.data;
  },

  /**
   * Get single order by ID with full details
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/api/order/${id}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: number, payload: UpdateStatusPayload) => {
    const response = await apiClient.patch(`/api/order/${id}/status`, payload);
    return response.data;
  },

  /**
   * Update order notes (customer note or internal note)
   */
  updateNote: async (id: number, payload: UpdateNotePayload) => {
    const response = await apiClient.patch(`/api/order/${id}/note`, payload);
    return response.data;
  },

  /**
   * Get order status history
   */
  getStatusHistory: async (id: number) => {
    const response = await apiClient.get(`/api/order/${id}/history`);
    return response.data;
  },

  /**
   * Get order payments
   */
  getPayments: async (id: number) => {
    const response = await apiClient.get(`/api/order/${id}/payments`);
    return response.data;
  },

  /**
   * Cancel order with reason
   */
  cancelOrder: async (id: number, payload: CancelOrderPayload) => {
    const response = await apiClient.post(`/api/order/${id}/cancel`, payload);
    return response.data;
  },

  /**
   * Process refund (Admin/Staff)
   */
  processRefund: async (id: number, payload: RefundOrderPayload = {}) => {
    const response = await apiClient.post(`/api/order/${id}/refund`, payload);
    return response.data;
  },

  /**
   * Delete order (Admin only)
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/order/${id}`);
    return response.data;
  },
};
