import { z } from "zod";

// Product Variant Schema
export const ProductVariantSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  isActive: z.boolean(),
  price: z.coerce.number().nullable(),
  currentPrice: z.coerce.number().nullable(),
  quantity: z.coerce.number().nullable(),
  safetyStock: z.coerce.number().nullable(),
});

// Product Image Schema
export const ProductImageSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  position: z.number().optional(),
  alt: z.string().nullable().optional(),
});

// Product Category Schema
export const ProductCategorySchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
});

// Product Detail Schema (for single product view/edit)
export const ProductDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  image: z.string().nullable().optional(),
  images: z.array(ProductImageSchema),
  price: z.coerce.number().nullable(),
  currentPrice: z.coerce.number().nullable(),
  variants: z.array(ProductVariantSchema),
  categories: z.array(ProductCategorySchema),
});

// Product Summary Schema (for list view)
export const ProductSummarySchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  price: z.coerce.number().nullable(),
  currentPrice: z.coerce.number().nullable(),
  createdAt: z.string().nullable(),
  categoryIds: z.array(z.number()),
  categoryNames: z.array(z.string()),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z.array(ProductVariantSchema),
});

export const ProductListSchema = z.array(ProductSummarySchema);

export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type ProductSummary = z.infer<typeof ProductSummarySchema>;

// Form validation schemas for Admin
const trimmedString = (message : string) => z.string().trim().min(1, { message });

const optionalTrimmedString = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "");

export const ProductFormSchema = z.object({
  name: trimmedString("Tên sản phẩm không được để trống"),
  slug: optionalTrimmedString(),
  description: optionalTrimmedString(),
  content: optionalTrimmedString(),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  currentPrice: z.coerce
    .number()
    .min(0, "Giá khuyến mãi phải lớn hơn hoặc bằng 0")
    .optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categories: z.array(z.number()).optional(),
});

// Parse helpers
export const parseProductDetail = (payload: unknown) => {
  const parsed = ProductDetailSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected product detail shape", parsed.error);
    throw new Error("Dữ liệu sản phẩm không hợp lệ");
  }
  return parsed.data;
};

export const parseProductList = (payload: unknown) => {
  // Handle both formats: direct array or { data: [...], pagination: {...} }
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;
  const parsed = ProductListSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Unexpected product list shape", parsed.error);
    throw new Error("Không thể tải danh sách sản phẩm");
  }
  return parsed.data;
};
