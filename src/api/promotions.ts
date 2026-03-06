import apiClient from "./client";

export interface PromotionListParams {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isGlobal?: boolean;
}

export interface PromotionPayload {
    name: string;
    type: "PERCENT" | "FIXED";
    value: number;
    startsAt: string;
    endsAt: string;
    minSubtotal?: number | null;
    maxUses?: number | null;
    isActive?: boolean;
    isGlobal?: boolean;
}

export interface PromotionTargetPayload {
    categoryIds?: number[];
    productIds?: number[];
    variantIds?: number[];
}

export const promotionsApi = {
    getAll: async (params: PromotionListParams = {}) => {
        const response = await apiClient.get("/api/promotion", { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/api/promotion/${id}`);
        return response.data;
    },

    create: async (data: PromotionPayload) => {
        const response = await apiClient.post("/api/promotion", data);
        return response.data;
    },

    update: async (id: number, data: Partial<PromotionPayload>) => {
        const response = await apiClient.patch(`/api/promotion/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/api/promotion/${id}`);
        return response.data;
    },

    addTargets: async (id: number, data: PromotionTargetPayload) => {
        const response = await apiClient.post(`/api/promotion/${id}/targets`, data);
        return response.data;
    },

    removeTargets: async (id: number, data: PromotionTargetPayload) => {
        const response = await apiClient.delete(`/api/promotion/${id}/targets`, {
            data,
        });
        return response.data;
    },
};
