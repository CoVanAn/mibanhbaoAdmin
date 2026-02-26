import type { Order } from "../../../../schema/order.schema";

export interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  completedCount: number;
  totalRevenue: number;
}

/**
 * Calculate order statistics from orders data
 */
export const calculateOrderStats = (
  orders: Order[] | undefined,
  totalFromPagination?: number
): OrderStats | null => {
  if (!orders) return null;

  const totalOrders = totalFromPagination || orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders,
    pendingCount,
    completedCount,
    totalRevenue,
  };
};
