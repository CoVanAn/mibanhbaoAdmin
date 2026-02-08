import { z } from "zod";

// Order Item Schema
export const OrderItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  variantId: z.number().nullable().optional(),
  variantName: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.coerce.number(),
  total: z.coerce.number(),
});

// Order Schema
export const OrderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  userId: z.string().nullable().optional(),
  customerName: z.string(),
  customerEmail: z.string().nullable().optional(),
  customerPhone: z.string(),
  shippingAddress: z.string(),
  status: z.enum([
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ]),
  paymentMethod: z.string().nullable().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  subtotal: z.coerce.number(),
  shippingFee: z.coerce.number().default(0),
  discount: z.coerce.number().default(0),
  total: z.coerce.number(),
  note: z.string().nullable().optional(),
  items: z.array(OrderItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OrderListSchema = z.array(OrderSchema);

// Order Status Update Schema
export const OrderStatusUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ]),
});

// Parse helpers
export const parseOrder = (payload: unknown) => {
  const parsed = OrderSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected order shape", parsed.error);
    throw new Error("Dữ liệu đơn hàng không hợp lệ");
  }
  return parsed.data;
};

export const parseOrderList = (payload: unknown) => {
  const parsed = OrderListSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected order list shape", parsed.error);
    throw new Error("Không thể tải danh sách đơn hàng");
  }
  return parsed.data;
};
