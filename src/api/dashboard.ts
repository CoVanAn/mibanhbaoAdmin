import apiClient from "./client";

export interface DashboardOverviewParams {
  year: number;
  quarter: number;
}

export interface DashboardDailyParams {
  startDate: string;
  endDate: string;
}

export interface DashboardTopProductsParams {
  year?: number;
  quarter?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface DashboardLowStockParams {
  limit?: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  metrics: {
    totalRevenue: number;
    totalCollected: number;
    totalOrders: number;
    averageOrderValue: number;
    canceledOrders: number;
    cancelRate: number;
  };
  monthlyRevenueTrend: Array<{ month: string; revenue: number }>;
}

export interface DashboardDailyPoint {
  date: string;
  revenue: number;
  collected: number;
  orders: number;
}

export interface DashboardDailyResponse {
  success: boolean;
  daily: DashboardDailyPoint[];
}

export interface DashboardTopProduct {
  productId: number | null;
  name: string;
  sold: number;
  revenue: number;
}

export interface DashboardTopProductsResponse {
  success: boolean;
  topProducts: DashboardTopProduct[];
}

export interface DashboardLowStockItem {
  variantId: number;
  productId: number | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  safetyStock: number;
}

export interface DashboardLowStockResponse {
  success: boolean;
  lowStockThreshold?: number;
  lowStock: DashboardLowStockItem[];
}

export const dashboardApi = {
  getOverview: async (
    params: DashboardOverviewParams,
  ): Promise<DashboardOverviewResponse> => {
    const response = await apiClient.get("/api/dashboard/overview", { params });
    return response.data;
  },

  getDaily: async (params: DashboardDailyParams): Promise<DashboardDailyResponse> => {
    const response = await apiClient.get("/api/dashboard/daily", { params });
    return response.data;
  },

  getTopProducts: async (
    params: DashboardTopProductsParams,
  ): Promise<DashboardTopProductsResponse> => {
    const response = await apiClient.get("/api/dashboard/top-products", {
      params,
    });
    return response.data;
  },

  getLowStock: async (
    params: DashboardLowStockParams = {},
  ): Promise<DashboardLowStockResponse> => {
    const response = await apiClient.get("/api/dashboard/low-stock", { params });
    return response.data;
  },
};
