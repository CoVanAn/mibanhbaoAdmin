import { z } from "zod";

export const PromotionTypeEnum = z.enum(["PERCENT", "FIXED"]);
export type PromotionType = z.infer<typeof PromotionTypeEnum>;

export const CouponRedemptionStatusEnum = z.enum(["ACTIVE", "RELEASED"]);
export type CouponRedemptionStatus = z.infer<typeof CouponRedemptionStatusEnum>;
// ─── Coupon ───────────────────────────────────────────────
export const CouponSchema = z.object({
  id: z.number(),
  code: z.string(),
  type: PromotionTypeEnum,
  value: z.number(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  minSubtotal: z.number().nullable().optional(),
  maxRedemptions: z.number().nullable().optional(),
  perUserLimit: z.number().nullable().optional(),
  usedCount: z.number(),
  isActive: z.boolean(),
});

export type Coupon = z.infer<typeof CouponSchema>;

export const CouponListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CouponSchema),
  pagination: z
    .object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      pages: z.number(),
    })
    .optional(),
});

export const CouponResponseSchema = z.object({
  success: z.boolean(),
  data: CouponSchema,
});

export const CouponFormSchema = z.object({
  code: z.string().min(1, "Mã coupon không được để trống").max(64),
  type: PromotionTypeEnum,
  value: z.coerce.number().int().positive("Giá trị phải > 0"),
  dateRange: z.tuple([z.string(), z.string()]).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  minSubtotal: z.coerce.number().int().nonnegative().optional().nullable(),
  maxRedemptions: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof CouponFormSchema>;

export const parseCouponList = (payload: unknown): Coupon[] => {
  const parsed = CouponListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("❌ Coupon list parse error", parsed.error.format());
    throw new Error("Không thể tải danh sách coupon");
  }
  return parsed.data.data;
};

export const parseCoupon = (payload: unknown): Coupon => {
  const parsed = CouponResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("❌ Coupon parse error", parsed.error.format());
    throw new Error("Dữ liệu coupon không hợp lệ");
  }
  return parsed.data.data;
};

// ─── CouponRedemption ─────────────────────────────────────
export const CouponRedemptionSchema = z.object({
  id: z.number(),
  couponId: z.number(),
  userId: z.number().nullable().optional(),
  orderId: z.number(),
  discountApplied: z.number(),
  status: CouponRedemptionStatusEnum,
  redeemedAt: z.string(),
  user: z
    .object({ id: z.number(), name: z.string().nullable(), email: z.string().nullable() })
    .nullable()
    .optional(),
  order: z
    .object({
      id: z.number(),
      code: z.string(),
      status: z.string(),
      total: z.coerce.number(),
      createdAt: z.string(),
    })
    .nullable()
    .optional(),
});

export type CouponRedemption = z.infer<typeof CouponRedemptionSchema>;

export const parseCouponRedemptions = (data: unknown[]): CouponRedemption[] => {
  return data.map((item) => {
    const parsed = CouponRedemptionSchema.safeParse(item);
    if (!parsed.success) return item as CouponRedemption;
    return parsed.data;
  });
};
