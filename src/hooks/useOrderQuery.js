import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  deleteOrder,
} from "@/src/queries/order";
import { toast } from "react-toastify";

// Query Keys
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],
};

/**
 * Hook to fetch all orders
 */
export function useOrdersQuery(params = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => fetchOrders(params),
  });
}

/**
 * Hook to fetch single order by ID
 */
export function useOrderQuery(id) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Cập nhật đơn hàng thất bại",
      );
    },
  });
}

/**
 * Hook to delete order
 */
export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Xóa đơn hàng thành công!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa đơn hàng thất bại");
    },
  });
}

// ============ Helper Constants ============

export const ORDER_STATUS = {
  pending: { label: "Chờ xác nhận", color: "orange" },
  confirmed: { label: "Đã xác nhận", color: "blue" },
  shipping: { label: "Đang giao", color: "cyan" },
  delivered: { label: "Đã giao", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

export const PAYMENT_STATUS = {
  pending: { label: "Chưa thanh toán", color: "orange" },
  paid: { label: "Đã thanh toán", color: "green" },
  failed: { label: "Thanh toán thất bại", color: "red" },
};
