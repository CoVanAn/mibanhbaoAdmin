import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────
export const PromotionTypeEnum = z.enum(["PERCENT", "FIXED"]);
export type PromotionType = z.infer<typeof PromotionTypeEnum>;

export const CouponRedemptionStatusEnum = z.enum(["ACTIVE", "RELEASED"]);
export type CouponRedemptionStatus = z.infer<typeof CouponRedemptionStatusEnum>;

// ─── Promotion ────────────────────────────────────────────
export const PromotionSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: PromotionTypeEnum,
    value: z.number(),
    startsAt: z.string(),
    endsAt: z.string(),
    minSubtotal: z.number().nullable().optional(),
    maxUses: z.number().nullable().optional(),
    usedCount: z.number(),
    isActive: z.boolean(),
    isGlobal: z.boolean(),
    categories: z.array(z.object({ categoryId: z.number() })).optional(),
    products: z.array(z.object({ productId: z.number() })).optional(),
    variants: z.array(z.object({ variantId: z.number() })).optional(),
});

export type Promotion = z.infer<typeof PromotionSchema>;

export const PromotionListResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(PromotionSchema),
    pagination: z
        .object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            pages: z.number(),
        })
        .optional(),
});

export const PromotionResponseSchema = z.object({
    success: z.boolean(),
    data: PromotionSchema,
});

// Form schema (react-hook-form + zod resolver)
export const PromotionFormSchema = z.object({
    name: z.string().min(1, "Tên ưu đãi không được để trống"),
    type: PromotionTypeEnum,
    value: z.coerce.number().int().positive("Giá trị phải > 0"),
    dateRange: z.tuple([z.string(), z.string()]).optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    minSubtotal: z.coerce.number().int().nonnegative().optional().nullable(),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    isActive: z.boolean().default(true),
    isGlobal: z.boolean().default(false),
});

export type PromotionFormValues = z.infer<typeof PromotionFormSchema>;

export const parsePromotionList = (payload: unknown): Promotion[] => {
    const parsed = PromotionListResponseSchema.safeParse(payload);
    if (!parsed.success) {
        console.error("❌ Promotion list parse error", parsed.error.format());
        throw new Error("Không thể tải danh sách ưu đãi");
    }
    return parsed.data.data;
};

export const parsePromotion = (payload: unknown): Promotion => {
    const parsed = PromotionResponseSchema.safeParse(payload);
    if (!parsed.success) {
        console.error("❌ Promotion parse error", parsed.error.format());
        throw new Error("Dữ liệu ưu đãi không hợp lệ");
    }
    return parsed.data.data;
};

// // ─── Coupon ───────────────────────────────────────────────
// export const CouponSchema = z.object({
//   id: z.number(),
//   code: z.string(),
//   type: PromotionTypeEnum,
//   value: z.number(),
//   startsAt: z.string().nullable().optional(),
//   endsAt: z.string().nullable().optional(),
//   minSubtotal: z.number().nullable().optional(),
//   maxRedemptions: z.number().nullable().optional(),
//   perUserLimit: z.number().nullable().optional(),
//   usedCount: z.number(),
//   isActive: z.boolean(),
// });

// export type Coupon = z.infer<typeof CouponSchema>;

// export const CouponListResponseSchema = z.object({
//   success: z.boolean(),
//   data: z.array(CouponSchema),
//   pagination: z
//     .object({
//       total: z.number(),
//       page: z.number(),
//       limit: z.number(),
//       pages: z.number(),
//     })
//     .optional(),
// });

// export const CouponResponseSchema = z.object({
//   success: z.boolean(),
//   data: CouponSchema,
// });

// export const CouponFormSchema = z.object({
//   code: z.string().min(1, "Mã coupon không được để trống").max(64),
//   type: PromotionTypeEnum,
//   value: z.coerce.number().int().positive("Giá trị phải > 0"),
//   dateRange: z.tuple([z.string(), z.string()]).optional().nullable(),
//   startsAt: z.string().optional().nullable(),
//   endsAt: z.string().optional().nullable(),
//   minSubtotal: z.coerce.number().int().nonnegative().optional().nullable(),
//   maxRedemptions: z.coerce.number().int().positive().optional().nullable(),
//   perUserLimit: z.coerce.number().int().positive().optional().nullable(),
//   isActive: z.boolean().default(true),
// });

// export type CouponFormValues = z.infer<typeof CouponFormSchema>;

// export const parseCouponList = (payload: unknown): Coupon[] => {
//   const parsed = CouponListResponseSchema.safeParse(payload);
//   if (!parsed.success) {
//     console.error("❌ Coupon list parse error", parsed.error.format());
//     throw new Error("Không thể tải danh sách coupon");
//   }
//   return parsed.data.data;
// };

// export const parseCoupon = (payload: unknown): Coupon => {
//   const parsed = CouponResponseSchema.safeParse(payload);
//   if (!parsed.success) {
//     console.error("❌ Coupon parse error", parsed.error.format());
//     throw new Error("Dữ liệu coupon không hợp lệ");
//   }
//   return parsed.data.data;
// };

// // ─── CouponRedemption ─────────────────────────────────────
// export const CouponRedemptionSchema = z.object({
//   id: z.number(),
//   couponId: z.number(),
//   userId: z.number().nullable().optional(),
//   orderId: z.number(),
//   discountApplied: z.number(),
//   status: CouponRedemptionStatusEnum,
//   redeemedAt: z.string(),
//   user: z
//     .object({ id: z.number(), name: z.string().nullable(), email: z.string().nullable() })
//     .nullable()
//     .optional(),
//   order: z
//     .object({
//       id: z.number(),
//       code: z.string(),
//       status: z.string(),
//       total: z.coerce.number(),
//       createdAt: z.string(),
//     })
//     .nullable()
//     .optional(),
// });

// export type CouponRedemption = z.infer<typeof CouponRedemptionSchema>;

// export const parseCouponRedemptions = (data: unknown[]): CouponRedemption[] => {
//   return data.map((item) => {
//     const parsed = CouponRedemptionSchema.safeParse(item);
//     if (!parsed.success) return item as CouponRedemption;
//     return parsed.data;
//   });
// };
