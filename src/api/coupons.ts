import apiClient from "./client";

export interface CouponListParams {
    page?: number;
    limit?: number;
    isActive?: boolean;
    code?: string;
}

export interface CouponPayload {
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    startsAt?: string | null;
    endsAt?: string | null;
    minSubtotal?: number | null;
    maxRedemptions?: number | null;
    perUserLimit?: number | null;
    isActive?: boolean;
}

export const couponsApi = {
    getAll: async (params: CouponListParams = {}) => {
        const response = await apiClient.get("/api/coupon", { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/api/coupon/${id}`);
        return response.data;
    },

    create: async (data: CouponPayload) => {
        const response = await apiClient.post("/api/coupon", data);
        return response.data;
    },

    update: async (id: number, data: Partial<Omit<CouponPayload, "code">>) => {
        const response = await apiClient.patch(`/api/coupon/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/api/coupon/${id}`);
        return response.data;
    },

    getRedemptions: async (id: number) => {
        const response = await apiClient.get(`/api/coupon/${id}/redemptions`);
        return response.data;
    },
};
