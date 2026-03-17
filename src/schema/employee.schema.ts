import { z } from "zod";

export const EmployeeRoleSchema = z.enum(["ADMIN", "STAFF"]);

export const EmployeeListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  role: EmployeeRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const EmployeeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  role: EmployeeRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EmployeeListResponseSchema = z.object({
  success: z.boolean(),
  employees: z.array(EmployeeListItemSchema),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
    .optional(),
});

export const EmployeeDetailResponseSchema = z.object({
  success: z.boolean(),
  employee: EmployeeDetailSchema,
});

export type EmployeeListItem = z.infer<typeof EmployeeListItemSchema>;
export type EmployeeDetail = z.infer<typeof EmployeeDetailSchema>;

export function parseEmployeeList(raw: unknown) {
  return EmployeeListResponseSchema.parse(raw);
}

export function parseEmployeeDetail(raw: unknown) {
  return EmployeeDetailResponseSchema.parse(raw);
}
