import apiClient from "./client";

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "STAFF";
  isActive?: boolean;
  sortBy?: "createdAt" | "name" | "email" | "role";
  order?: "asc" | "desc";
}

export interface EmployeeListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  ordersHandledCount: number;
}

export interface EmployeeDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  linkedProviders: string[];
  ordersHandledCount: number;
  addressesCount: number;
}

export interface ToggleEmployeeStatusPayload {
  isActive: boolean;
}

export const employeesApi = {
  getAll: async (params: EmployeeListParams = {}) => {
    const response = await apiClient.get("/api/admin/employees", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/api/admin/employees/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number, payload: ToggleEmployeeStatusPayload) => {
    const response = await apiClient.patch(
      `/api/admin/employees/${id}/status`,
      payload,
    );
    return response.data;
  },
};
