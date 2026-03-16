import { z } from "zod";

const trimmedString = (message : string) => z.string().trim().min(1, { message });

const optionalTrimmedString = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "");

// Login Form Schema
export const LoginFormSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: trimmedString("Mật khẩu không được để trống"),
});

// Profile Form Schema
export const ProfileFormSchema = z.object({
  name: trimmedString("Tên không được để trống"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: optionalTrimmedString(),
});

// Change Password Schema
export const PasswordFormSchema = z
  .object({
    currentPassword: trimmedString("Nhập mật khẩu hiện tại"),
    newPassword: z.string().trim().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: trimmedString("Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// User Schema
export const UserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((val) => String(val)),
  name: z.string(),
  email: z.string().trim().email(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  role: z
    .enum(["ADMIN", "STAFF", "CUSTOMER", "admin", "staff", "customer"])
    .optional(),
  createdAt: z.string().optional(),
});

// Parse helpers
export const parseUser = (payload: unknown) => {
  const parsed = UserSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Unexpected user shape", parsed.error, payload);
    throw new Error("Dữ liệu người dùng không hợp lệ");
  }
  return parsed.data;
};
