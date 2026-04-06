import { VALIDATION_MESSAGES } from "./constants";
import { Rule } from "antd/es/form";
import { normalizePhone } from "./phone";

// Common validation rules for Ant Design forms
export const validationRules: Record<string, Rule | Rule[]> = {
  required: {
    required: true,
    message: VALIDATION_MESSAGES.REQUIRED,
  },

  email: [
    {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED,
    },
    {
      type: "email",
      message: VALIDATION_MESSAGES.EMAIL_INVALID,
    },
  ],

  password: [
    {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED,
    },
    {
      min: 6,
      message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    },
  ],

  name: [
    {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED,
    },
    {
      min: 2,
      message: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
    },
  ],

  price: [
    {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED,
    },
    {
      type: "number",
      min: 0,
      message: VALIDATION_MESSAGES.PRICE_INVALID,
    },
  ],

  positiveNumber: {
    type: "number",
    min: 0,
    message: "Giá trị phải là số không âm",
  },

  slug: {
    pattern: /^[a-z0-9-]+$/,
    message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  },
};

// Custom validators
export const customValidators = {
  confirmPassword: (password: string): Rule => ({
    validator: (_: unknown, value: string) => {
      if (!value || password === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
    },
  }),

  phoneNumber: {
    validator: (_: unknown, value: string) => {
      if (!value) return Promise.resolve();
      const normalized = normalizePhone(value);
      const phoneRegex = /^[0-9]{10,11}$/;
      if (phoneRegex.test(normalized)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Số điện thoại không hợp lệ"));
    },
  } as Rule,

  uniqueSlug: (
    checkFunction: (slug: string, currentId?: string | number | null) => Promise<boolean>,
    currentId: string | number | null = null
  ): Rule => ({
    validator: async (_: unknown, value: string) => {
      if (!value) return Promise.resolve();

      try {
        const isUnique = await checkFunction(value, currentId);
        if (isUnique) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Slug này đã được sử dụng"));
      } catch (_error) {
        return Promise.reject(
          new Error("Không thể kiểm tra tính duy nhất của slug")
        );
      }
    },
  }),

  fileSize: (maxSize: number = 5 * 1024 * 1024): Rule => ({
    validator: (_: unknown, value: { file?: { size?: number } } | undefined) => {
      if (!value || !value.file) return Promise.resolve();

      if ((value.file.size ?? 0) > maxSize) {
        return Promise.reject(new Error(VALIDATION_MESSAGES.FILE_TOO_LARGE));
      }
      return Promise.resolve();
    },
  }),

  fileType: (
    allowedTypes: string[] = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
  ): Rule => ({
    validator: (_: unknown, value: { file?: { type?: string } } | undefined) => {
      if (!value || !value.file) return Promise.resolve();

      if (!value.file.type || !allowedTypes.includes(value.file.type)) {
        return Promise.reject(new Error(VALIDATION_MESSAGES.FILE_TYPE_INVALID));
      }
      return Promise.resolve();
    },
  }),
};
