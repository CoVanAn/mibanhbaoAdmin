import apiClient from "./client";

export const categoriesApi = {
  getAll: async (includeInactive = false) => {
    const response = await apiClient.get(
      `/api/category/list?includeInactive=${includeInactive ? "1" : "0"}`
    );
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/category/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await apiClient.post("/api/category/add", categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await apiClient.patch(`/api/category/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/category/${id}`);
    return response.data;
  },
};
