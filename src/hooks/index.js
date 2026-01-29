// Re-export all hooks for easy importing

// Legacy hooks (for backward compatibility)
export { useApi } from "./useApi";
export { useCategories } from "./useCategories";
export { useProducts } from "./useProducts";
export { useVariants } from "./useVariants";
export { useAuth } from "./useAuth";

// New TanStack Query hooks (recommended)
export * from "./useProductQuery";
export * from "./useCategoryQuery";
export * from "./useOrderQuery";
export * from "./useAuthQuery";
