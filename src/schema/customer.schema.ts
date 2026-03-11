import { z } from "zod";

/**
 * Customer Schemas — synced with server response
 */

// ── Address ──────────────────────────────────────────────────────────────────
export const CustomerAddressSchema = z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    company: z.string().nullable(),
    addressLine: z.string(),
    province: z.string(),
    district: z.string(),
    ward: z.string(),
    createdAt: z.string(),
});

// ── Order summary (inside customer detail) ───────────────────────────────────
export const CustomerOrderSummarySchema = z.object({
    id: z.number(),
    code: z.string(),
    method: z.string(),
    status: z.string(),
    total: z.coerce.number(),
    itemsSubtotal: z.coerce.number(),
    shippingFee: z.coerce.number(),
    discount: z.coerce.number(),
    customerNote: z.string().nullable(),
    itemsCount: z.number(),
    paymentStatus: z.string().nullable(),
    paymentProvider: z.string().nullable(),
    createdAt: z.string(),
});

// ── Coupon redemption (inside customer detail) ────────────────────────────────
export const CustomerCouponRedemptionSchema = z.object({
    id: z.number(),
    discountApplied: z.number(),
    redeemedAt: z.string(),
    status: z.string(),
    coupon: z.object({
        code: z.string(),
        type: z.string(),
        value: z.number(),
    }),
    order: z.object({
        id: z.number(),
        code: z.string(),
        total: z.coerce.number(),
    }),
});

// ── Customer list item ────────────────────────────────────────────────────────
export const CustomerListItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    avatar: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    ordersCount: z.number(),
});

// ── Customer detail ───────────────────────────────────────────────────────────
export const CustomerDetailSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    avatar: z.string().nullable(),
    isActive: z.boolean(),
    hasPassword: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    linkedProviders: z.array(z.string()),
    addresses: z.array(CustomerAddressSchema),
    orders: z.array(CustomerOrderSummarySchema),
    couponRedemptions: z.array(CustomerCouponRedemptionSchema),
});

// ── List response ─────────────────────────────────────────────────────────────
export const CustomerListResponseSchema = z.object({
    success: z.boolean(),
    customers: z.array(CustomerListItemSchema),
    pagination: z
        .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
        })
        .optional(),
});

// ── Detail response ───────────────────────────────────────────────────────────
export const CustomerDetailResponseSchema = z.object({
    success: z.boolean(),
    customer: CustomerDetailSchema,
});

// ── Types ─────────────────────────────────────────────────────────────────────
export type CustomerListItem = z.infer<typeof CustomerListItemSchema>;
export type CustomerDetail = z.infer<typeof CustomerDetailSchema>;
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;
export type CustomerOrderSummary = z.infer<typeof CustomerOrderSummarySchema>;
export type CustomerCouponRedemption = z.infer<
    typeof CustomerCouponRedemptionSchema
>;

// ── Parse helpers ─────────────────────────────────────────────────────────────
export function parseCustomerList(raw: unknown) {
    return CustomerListResponseSchema.parse(raw);
}

export function parseCustomerDetail(raw: unknown) {
    return CustomerDetailResponseSchema.parse(raw);
}
