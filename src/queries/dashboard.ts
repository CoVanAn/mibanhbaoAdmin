import {
  dashboardApi,
  DashboardDailyParams,
  DashboardOverviewParams,
  DashboardTopProductsParams,
} from "../api/dashboard";

export async function fetchDashboardOverview(params: DashboardOverviewParams) {
  return dashboardApi.getOverview(params);
}

export async function fetchDashboardDaily(params: DashboardDailyParams) {
  return dashboardApi.getDaily(params);
}

export async function fetchDashboardTopProducts(
  params: DashboardTopProductsParams,
) {
  return dashboardApi.getTopProducts(params);
}

export async function fetchDashboardLowStock(limit = 10) {
  return dashboardApi.getLowStock({ limit });
}
