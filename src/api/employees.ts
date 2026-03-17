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
  createdAt: string;
}

export interface EmployeeDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleEmployeeStatusPayload {
  isActive: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "STAFF";
  password: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  phone?: string;
  role?: "ADMIN" | "STAFF";
}

export interface ResetEmployeePasswordPayload {
  newPassword: string;
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

  create: async (payload: CreateEmployeePayload) => {
    const response = await apiClient.post("/api/admin/employees", payload);
    return response.data;
  },

  update: async (id: number, payload: UpdateEmployeePayload) => {
    const response = await apiClient.patch(`/api/admin/employees/${id}`, payload);
    return response.data;
  },

  resetPassword: async (
    id: number,
    payload: ResetEmployeePasswordPayload,
  ) => {
    const response = await apiClient.patch(
      `/api/admin/employees/${id}/reset-password`,
      payload,
    );
    return response.data;
  },
};
