import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    fetchPromotions,
    fetchPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    addPromotionTargets,
    removePromotionTargets,
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    fetchCouponRedemptions,
} from "../queries/promotion";
import type { PromotionListParams, PromotionPayload, PromotionTargetPayload } from "../api/promotions";
import type { CouponListParams, CouponPayload } from "../api/coupons";

// ─── Query Keys ───────────────────────────────────────────

export const promotionKeys = {
    all: ["promotions"] as const,
    lists: () => [...promotionKeys.all, "list"] as const,
    list: (filters: PromotionListParams = {}) => [...promotionKeys.lists(), filters] as const,
    details: () => [...promotionKeys.all, "detail"] as const,
    detail: (id: number) => [...promotionKeys.details(), id] as const,
};

export const couponKeys = {
    all: ["coupons"] as const,
    lists: () => [...couponKeys.all, "list"] as const,
    list: (filters: CouponListParams = {}) => [...couponKeys.lists(), filters] as const,
    details: () => [...couponKeys.all, "detail"] as const,
    detail: (id: number) => [...couponKeys.details(), id] as const,
    redemptions: (id: number) => [...couponKeys.all, "redemptions", id] as const,
};

// ─── Promotion Hooks ──────────────────────────────────────

export function usePromotionsQuery(params: PromotionListParams = {}) {
    return useQuery({
        queryKey: promotionKeys.list(params),
        queryFn: () => fetchPromotions(params),
        staleTime: 30_000,
        retry: 1,
    });
}

export function usePromotionQuery(id: number) {
    return useQuery({
        queryKey: promotionKeys.detail(id),
        queryFn: () => fetchPromotionById(id),
        enabled: !!id,
    });
}

export function useCreatePromotionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PromotionPayload) => createPromotion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
            toast.success("Tạo ưu đãi thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Tạo ưu đãi thất bại");
        },
    });
}

export function useUpdatePromotionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PromotionPayload> }) =>
            updatePromotion(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
            toast.success("Cập nhật ưu đãi thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật ưu đãi thất bại");
        },
    });
}

export function useDeletePromotionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deletePromotion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
            toast.success("Xóa ưu đãi thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Xóa ưu đãi thất bại");
        },
    });
}

export function useAddPromotionTargetsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: PromotionTargetPayload }) =>
            addPromotionTargets(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
            toast.success("Thêm đối tượng thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Thêm đối tượng thất bại");
        },
    });
}

export function useRemovePromotionTargetsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: PromotionTargetPayload }) =>
            removePromotionTargets(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
            toast.success("Xóa đối tượng thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Xóa đối tượng thất bại");
        },
    });
}

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
