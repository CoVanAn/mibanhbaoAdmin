import { APP_CONFIG } from "./constants";
import { getErrorMessage } from "./httpError";

// Format currency (VND)
export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
export const formatDate = (
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return "";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("vi-VN", {
    ...defaultOptions,
    ...options,
  });
};

// Generate slug from string
export const generateSlug = (text: string | null | undefined): string => {
  if (!text) return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Validate file type and size
export const validateFile = (file: File | null | undefined): string[] => {
  const errors: string[] = [];

  if (!file) {
    errors.push("File is required");
    return errors;
  }

  if (!APP_CONFIG.ALLOWED_IMAGE_TYPES.some((type) => type === file.type)) {
    errors.push("Invalid file type. Only PNG, JPG, JPEG, WEBP allowed");
  }

  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    errors.push("File too large. Maximum 5MB allowed");
  }

  return errors;
};

// Validate multiple files
export const validateFiles = (files: FileList | File[] | null | undefined) => {
  if (!files || files.length === 0) return [];

  const fileArray = Array.from(files);
  return fileArray.map((file, index) => ({
    index,
    file,
    errors: validateFile(file),
  }));
};

// Get file preview URL
export const getFilePreviewUrl = (file: File | Blob | string | null | undefined): string | null => {
  if (!file) return null;

  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

  // If it's already a URL string
  if (typeof file === "string") {
    return file;
  }

  return null;
};

// Clean up object URLs to prevent memory leaks
export const revokeFilePreviewUrl = (url: string | null | undefined): void => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (typeof obj === "object") {
    const source = obj as Record<string, unknown>;
    const clonedObj: Record<string, unknown> = {};
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        clonedObj[key] = deepClone(source[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
};

// Check if object is empty
export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === "string" || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

// Truncate text
export const truncateText = (text: string | null | undefined, maxLength: number = 100): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Parse API error
export const parseApiError = (error: unknown): string =>
  getErrorMessage(error, "Có lỗi xảy ra. Vui lòng thử lại sau.");
