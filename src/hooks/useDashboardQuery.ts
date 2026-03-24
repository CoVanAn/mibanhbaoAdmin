import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardDaily,
  fetchDashboardLowStock,
  fetchDashboardOverview,
  fetchDashboardTopProducts,
} from "../queries/user/dashboard";
import {
  DashboardDailyParams,
  DashboardOverviewParams,
  DashboardTopProductsParams,
} from "../api/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (params: DashboardOverviewParams) =>
    [...dashboardKeys.all, "overview", params] as const,
  daily: (params: DashboardDailyParams) =>
    [...dashboardKeys.all, "daily", params] as const,
  topProducts: (params: DashboardTopProductsParams) =>
    [...dashboardKeys.all, "top-products", params] as const,
  lowStock: (limit: number) =>
    [...dashboardKeys.all, "low-stock", limit] as const,
};

export function useDashboardOverviewQuery(params: DashboardOverviewParams) {
  return useQuery({
    queryKey: dashboardKeys.overview(params),
    queryFn: () => fetchDashboardOverview(params),
    staleTime: 60 * 1000,
  });
}

export function useDashboardDailyQuery(params: DashboardDailyParams) {
  return useQuery({
    queryKey: dashboardKeys.daily(params),
    queryFn: () => fetchDashboardDaily(params),
    staleTime: 60 * 1000,
  });
}

export function useDashboardTopProductsQuery(
  params: DashboardTopProductsParams,
) {
  return useQuery({
    queryKey: dashboardKeys.topProducts(params),
    queryFn: () => fetchDashboardTopProducts(params),
    staleTime: 60 * 1000,
  });
}

export function useDashboardLowStockQuery(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(limit),
    queryFn: () => fetchDashboardLowStock(limit),
    staleTime: 60 * 1000,
  });
}
