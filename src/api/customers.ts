import apiClient from "./client";

export interface CustomerListParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: "createdAt" | "name" | "email" | "ordersCount";
    order?: "asc" | "desc";
}

export interface CustomerListItem {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    createdAt: string;
    ordersCount: number;
}

export interface CustomerAddress {
    id: number;
    name: string;
    phone: string;
    company: string | null;
    addressLine: string;
    province: string;
    district: string;
    ward: string;
    createdAt: string;
}

export interface CustomerOrderSummary {
    id: number;
    code: string;
    method: string;
    status: string;
    total: number;
    itemsSubtotal: number;
    shippingFee: number;
    discount: number;
    customerNote: string | null;
    itemsCount: number;
    paymentStatus: string | null;
    paymentProvider: string | null;
    createdAt: string;
}

export interface CustomerCouponRedemption {
    id: number;
    discountApplied: number;
    redeemedAt: string;
    status: string;
    coupon: {
        code: string;
        type: string;
        value: number;
    };
    order: {
        id: number;
        code: string;
        total: number;
    };
}

export interface CustomerDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string;
    linkedProviders: string[];
    addresses: CustomerAddress[];
    orders: CustomerOrderSummary[];
    couponRedemptions: CustomerCouponRedemption[];
}

export interface ToggleStatusPayload {
    isActive: boolean;
}

export const customersApi = {
    /**
     * Get customer list with pagination, search, filter
     */
    getAll: async (params: CustomerListParams = {}) => {
        const response = await apiClient.get("/api/admin/customers", { params });
        return response.data;
    },

    /**
     * Get full customer detail by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get(`/api/admin/customers/${id}`);
        return response.data;
    },

    /**
     * Toggle customer isActive status
     */
    toggleStatus: async (id: number, payload: ToggleStatusPayload) => {
        const response = await apiClient.patch(
            `/api/admin/customers/${id}/status`,
            payload,
        );
        return response.data;
    },
};
