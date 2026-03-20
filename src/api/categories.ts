import apiClient from "./client";

export const categoriesApi = {
  // Admin always includes inactive categories by default
  getAll: async (includeInactive = true) => {
    const response = await apiClient.get(
      `/api/category/list?includeInactive=${includeInactive ? "1" : "0"}`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/category/${id}`);
    return response.data;
  },

  create: async (categoryData: any) => {
    const response = await apiClient.post("/api/category/add", categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: any) => {
    const response = await apiClient.patch(`/api/category/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/category/${id}`);
    return response.data;
  },
};
