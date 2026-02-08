// App constants
export const APP_CONFIG = {
  NAME: "Mi Banh Bao Admin",
  VERSION: "1.0.0",
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/user/login",
    PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
  },
  CATEGORIES: {
    LIST: "/api/category/list",
    CREATE: "/api/category/add",
    UPDATE: (id: string | number) => `/api/category/${id}`,
    DELETE: (id: string | number) => `/api/category/${id}`,
    GET: (id: string | number) => `/api/category/${id}`,
  },
  PRODUCTS: {
    LIST: "/api/product/list",
    CREATE: "/api/product/add",
    UPDATE: (id: string | number) => `/api/product/${id}`,
    DELETE: (id: string | number) => `/api/product/${id}`,
    GET: (id: string | number) => `/api/product/${id}`,
  },
  ORDERS: {
    LIST: "/api/order/list",
    GET: (id: string | number) => `/api/order/${id}`,
    UPDATE_STATUS: (id: string | number) => `/api/order/${id}/status`,
    DELETE: (id: string | number) => `/api/order/${id}`,
  },
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Trường này là bắt buộc",
  EMAIL_INVALID: "Email không hợp lệ",
  PASSWORD_MIN_LENGTH: "Mật khẩu phải có ít nhất 6 ký tự",
  NAME_MIN_LENGTH: "Tên phải có ít nhất 2 ký tự",
  PRICE_INVALID: "Giá phải là số dương",
  FILE_TOO_LARGE: "File quá lớn. Tối đa 5MB",
  FILE_TYPE_INVALID: "Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)",
};

// Status options
export const STATUS_OPTIONS = [
  { label: "Hoạt động", value: true, color: "green" },
  { label: "Tạm ngừng", value: false, color: "red" },
];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ xử lý",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị",
  [ORDER_STATUS.SHIPPING]: "Đang giao",
  [ORDER_STATUS.DELIVERED]: "Đã giao",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "orange",
  [ORDER_STATUS.CONFIRMED]: "blue",
  [ORDER_STATUS.PREPARING]: "cyan",
  [ORDER_STATUS.SHIPPING]: "purple",
  [ORDER_STATUS.DELIVERED]: "green",
  [ORDER_STATUS.CANCELLED]: "red",
};
