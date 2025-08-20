import { VALIDATION_MESSAGES } from "./constants";

// Common validation rules for Ant Design forms
export const validationRules = {
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
  confirmPassword: (password) => ({
    validator: (_, value) => {
      if (!value || password === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
    },
  }),

  phoneNumber: {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (phoneRegex.test(value)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Số điện thoại không hợp lệ"));
    },
  },

  uniqueSlug: (checkFunction, currentId = null) => ({
    validator: async (_, value) => {
      if (!value) return Promise.resolve();

      try {
        const isUnique = await checkFunction(value, currentId);
        if (isUnique) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Slug này đã được sử dụng"));
      } catch (error) {
        return Promise.reject(
          new Error("Không thể kiểm tra tính duy nhất của slug")
        );
      }
    },
  }),

  fileSize: (maxSize = 5 * 1024 * 1024) => ({
    validator: (_, value) => {
      if (!value || !value.file) return Promise.resolve();

      if (value.file.size > maxSize) {
        return Promise.reject(new Error(VALIDATION_MESSAGES.FILE_TOO_LARGE));
      }
      return Promise.resolve();
    },
  }),

  fileType: (
    allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
  ) => ({
    validator: (_, value) => {
      if (!value || !value.file) return Promise.resolve();

      if (!allowedTypes.includes(value.file.type)) {
        return Promise.reject(new Error(VALIDATION_MESSAGES.FILE_TYPE_INVALID));
      }
      return Promise.resolve();
    },
  }),
};
