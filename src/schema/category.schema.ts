import { z } from "zod";

// Category Schema
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  parentId: z.number().nullable().optional(),
  position: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const CategoryListSchema = z.array(CategorySchema);

// Form validation schema for Admin
const trimmedString = (message : any) => z.string().trim().min(1, { message });

const optionalTrimmedString = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "");

export const CategoryFormSchema = z.object({
  name: trimmedString("Tên danh mục không được để trống"),
  slug: optionalTrimmedString(),
  parentId: z.number().nullable().optional(),
  position: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Parse helpers
export const parseCategory = (payload: unknown) => {
  const parsed = CategorySchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected category shape", parsed.error);
    throw new Error("Dữ liệu danh mục không hợp lệ");
  }
  return parsed.data;
};

export const parseCategoryList = (payload: unknown) => {
  const parsed = CategoryListSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected category list shape", parsed.error);
    throw new Error("Không thể tải danh sách danh mục");
  }
  return parsed.data;
};
