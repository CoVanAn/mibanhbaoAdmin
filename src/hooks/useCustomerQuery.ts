import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import { CustomerListParams } from "../api/customers";
import {
    fetchCustomers,
    fetchCustomerById,
    toggleCustomerStatus,
} from "../queries/user/customer";
import { toast } from "react-toastify";

// ── Query keys ────────────────────────────────────────────────────────────────
export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (filters: CustomerListParams = {}) =>
        [...customerKeys.lists(), filters] as const,
    details: () => [...customerKeys.all, "detail"] as const,
    detail: (id: number) => [...customerKeys.details(), id] as const,
};

// ── List ──────────────────────────────────────────────────────────────────────
export function useCustomersQuery(params: CustomerListParams = {}) {
    return useQuery({
        queryKey: customerKeys.list(params),
        queryFn: () => fetchCustomers(params),
        placeholderData: keepPreviousData,
        retry: 1,
        staleTime: 30_000,
    });
}

// ── Detail ────────────────────────────────────────────────────────────────────
export function useCustomerQuery(id: number) {
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: () => fetchCustomerById(id),
        enabled: !!id,
    });
}

// ── Toggle status ─────────────────────────────────────────────────────────────
export function useToggleCustomerStatusMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            isActive,
        }: {
            id: number;
            isActive: boolean;
        }) => toggleCustomerStatus(id, { isActive }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: customerKeys.detail(variables.id),
            });
            toast.success(
                variables.isActive
                    ? "Kích hoạt tài khoản thành công!"
                    : "Vô hiệu hoá tài khoản thành công!",
            );
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Cập nhật trạng thái thất bại",
            );
        },
    });
}
