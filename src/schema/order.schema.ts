import { z } from "zod";

/**
 * Order Schemas - Synced with Prisma Schema
 */

// Enums matching Prisma
export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
]);

export const FulfillmentMethodEnum = z.enum(["DELIVERY", "PICKUP"]);

export const PaymentStatusEnum = z.enum([
  "UNPAID",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

// User info schema (from order.user)
export const OrderUserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

// Address schema (from order.address)
export const OrderAddressSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  addressLine: z.string().nullable(),
  province: z.string().nullable(),
  district: z.string().nullable(),
  ward: z.string().nullable(),
});

// Coupon schema (simplified)
export const OrderCouponSchema = z.object({
  id: z.number(),
  code: z.string(),
  type: z.string(),
  value: z.number(),
});

// Order Item Schema - matching server response format
export const OrderItemSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  variantId: z.number().nullable(),
  name: z.string(),
  variant: z.string().nullable(),
  sku: z.string().nullable(),
  image: z.string().nullable(),
  unitPrice: z.coerce.number(),
  quantity: z.number(),
  lineTotal: z.coerce.number(),
});

// Payment schema (matches server's formatOrderResponse output)
export const OrderPaymentSchema = z.object({
  id: z.number(),
  provider: z.string(),
  amount: z.coerce.number(),
  status: PaymentStatusEnum,
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  // Optional fields (not included in formatOrderResponse)
  orderId: z.number().optional(),
  providerRef: z.string().nullable().optional(),
});

// Status History schema
export const OrderStatusHistorySchema = z.object({
  id: z.number(),
  fromStatus: OrderStatusEnum.nullable(),
  toStatus: OrderStatusEnum,
  reason: z.string().nullable(),
  createdAt: z.string(),
  changedBy: z.object({
    id: z.number(),
    name: z.string().nullable(),
  }).nullable().optional(),
});

// Main Order Schema - matching server response
export const OrderSchema = z.object({
  id: z.number(),
  code: z.string(),
  status: OrderStatusEnum,
  method: FulfillmentMethodEnum,
  currency: z.string(),
  itemsSubtotal: z.coerce.number(),
  shippingFee: z.coerce.number(),
  discount: z.coerce.number(),
  total: z.coerce.number(),
  customerNote: z.string().nullable(),
  internalNote: z.string().nullable(),
  pickupAt: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.number().nullable(),
  // Relations
  user: OrderUserSchema.nullable(),
  address: OrderAddressSchema.nullable(),
  coupon: OrderCouponSchema.nullable(),
  items: z.array(OrderItemSchema),
  payments: z.array(OrderPaymentSchema).optional(),
  statusHistory: z.array(OrderStatusHistorySchema).optional(),
  shipment: z.unknown().nullable().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>;

// List response from API
export const OrderListResponseSchema = z.object({
  success: z.boolean(),
  orders: z.array(OrderSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
});

// Single order response
export const OrderResponseSchema = z.object({
  success: z.boolean(),
  order: OrderSchema,
});

// Order Status Update Schema
export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusEnum,
  reason: z.string().max(500).optional(),
});

// Order Note Update Schema
export const OrderNoteUpdateSchema = z.object({
  customerNote: z.string().max(500).optional(),
  internalNote: z.string().max(500).optional(),
});

// Cancel Order Schema
export const CancelOrderSchema = z.object({
  reason: z.string().min(1, "Lý do hủy là bắt buộc").max(500),
});

// Parse helpers
export const parseOrder = (payload: unknown) => {
  const parsed = OrderSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("❌ Order validation failed!");
    console.error("Payload:", JSON.stringify(payload, null, 2));
    console.error("Errors:", JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Dữ liệu đơn hàng không hợp lệ");
  }
  return parsed.data;
};

export const parseOrderListResponse = (payload: unknown) => {
  const parsed = OrderListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("❌ Order list validation failed!");
    console.error("Payload received:", JSON.stringify(payload, null, 2));
    console.error("Validation errors:", JSON.stringify(parsed.error.format(), null, 2));
    
    // Log specific field errors
    if (parsed.error.issues) {
      console.error("Detailed issues:");
      parsed.error.issues.forEach((issue, index) => {
        console.error(`  ${index + 1}. Path: ${issue.path.join('.')} - ${issue.message}`);
      });
    }
    
    throw new Error("Không thể tải danh sách đơn hàng. Kiểm tra console để xem chi tiết lỗi.");
  }
  return parsed.data;
};
