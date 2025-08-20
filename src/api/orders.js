import apiClient from "./client";

export const ordersApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/order/list", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/order/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/order/${id}/status`, {
      status,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/order/${id}`);
    return response.data;
  },
};
