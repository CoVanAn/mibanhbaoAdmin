import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    fetchCouponRedemptions,
} from "../queries/coupon";
import type { CouponListParams, CouponPayload } from "../api/coupons";

// ─── Query Keys ───────────────────────────────────────────

export const couponKeys = {
    all: ["coupons"] as const,
    lists: () => [...couponKeys.all, "list"] as const,
    list: (filters: CouponListParams = {}) => [...couponKeys.lists(), filters] as const,
    details: () => [...couponKeys.all, "detail"] as const,
    detail: (id: number) => [...couponKeys.details(), id] as const,
    redemptions: (id: number) => [...couponKeys.all, "redemptions", id] as const,
};

// ─── Coupon Hooks ─────────────────────────────────────────

export function useCouponsQuery(params: CouponListParams = {}) {
    return useQuery({
        queryKey: couponKeys.list(params),
        queryFn: () => fetchCoupons(params),
        staleTime: 30_000,
        retry: 1,
    });
}

export function useCouponQuery(id: number) {
    return useQuery({
        queryKey: couponKeys.detail(id),
        queryFn: () => fetchCouponById(id),
        enabled: !!id,
    });
}

export function useCouponRedemptionsQuery(id: number) {
    return useQuery({
        queryKey: couponKeys.redemptions(id),
        queryFn: () => fetchCouponRedemptions(id),
        enabled: !!id,
    });
}

export function useCreateCouponMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CouponPayload) => createCoupon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
            toast.success("Tạo coupon thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Tạo coupon thất bại");
        },
    });
}

export function useUpdateCouponMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Omit<CouponPayload, "code">> }) =>
            updateCoupon(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
            queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.id) });
            toast.success("Cập nhật coupon thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật coupon thất bại");
        },
    });
}

export function useDeleteCouponMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
            toast.success("Xóa coupon thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Xóa coupon thất bại");
        },
    });
}
