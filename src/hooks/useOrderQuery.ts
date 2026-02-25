import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  updateOrderNote,
  fetchOrderStatusHistory,
  fetchOrderPayments,
  cancelOrder,
  deleteOrder,
} from "../queries/order";
import { OrderListParams, UpdateStatusPayload, UpdateNotePayload, CancelOrderPayload } from "../api/orders";
import { toast } from "react-toastify";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderListParams = {}) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  history: (id: number) => [...orderKeys.all, "history", id] as const,
  payments: (id: number) => [...orderKeys.all, "payments", id] as const,
};

/**
 * Hook to fetch all orders with filters
 */
export function useOrdersQuery(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => fetchOrders(params),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 30000, // 30 seconds - reduce unnecessary refetches
  });
}

/**
 * Hook to fetch single order by ID
 */
export function useOrderQuery(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch order status history
 */
export function useOrderStatusHistoryQuery(id: number) {
  return useQuery({
    queryKey: orderKeys.history(id),
    queryFn: () => fetchOrderStatusHistory(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch order payments
 */
export function useOrderPaymentsQuery(id: number) {
  return useQuery({
    queryKey: orderKeys.payments(id),
    queryFn: () => fetchOrderPayments(id),
    enabled: !!id,
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStatusPayload }) => 
      updateOrderStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.history(variables.id),
      });
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật đơn hàng thất bại",
      );
    },
  });
}

/**
 * Hook to update order note
 */
export function useUpdateOrderNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNotePayload }) => 
      updateOrderNote(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      toast.success("Cập nhật ghi chú thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật ghi chú thất bại",
      );
    },
  });
}

/**
 * Hook to cancel order
 */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CancelOrderPayload }) => 
      cancelOrder(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.history(variables.id),
      });
      toast.success("Đã hủy đơn hàng!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Hủy đơn hàng thất bại");
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xóa đơn hàng thất bại");
    },
  });
}
