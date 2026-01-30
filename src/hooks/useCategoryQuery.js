import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/src/queries/category";
import { toast } from "react-toastify";

// Query Keys
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (includeInactive) => [...categoryKeys.lists(), { includeInactive }],
  details: () => [...categoryKeys.all, "detail"],
  detail: (id) => [...categoryKeys.details(), id],
};

/**
 * Hook to fetch all categories
 */
export function useCategoriesQuery(includeInactive = false) {
  return useQuery({
    queryKey: categoryKeys.list(includeInactive),
    queryFn: () => fetchCategories(includeInactive),
  });
}

/**
 * Hook to fetch single category by ID
 */
export function useCategoryQuery(id) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Thêm danh mục thành công!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Thêm danh mục thất bại");
    },
  });
}

/**
 * Hook to update category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      toast.success("Cập nhật danh mục thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Cập nhật danh mục thất bại",
      );
    },
  });
}

/**
 * Hook to delete category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Xóa danh mục thành công!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa danh mục thất bại");
    },
  });
}

// ============ Helper Hooks ============

/**
 * Hook to get category display name with parent hierarchy
 */
export function useCategoryHelpers() {
  const { data: categories = [] } = useCategoriesQuery(true);

  const getCategoryDisplayName = (category, allCategories = categories) => {
    if (!category?.parentId) return category?.name || "";

    const parent = allCategories.find((cat) => cat.id === category.parentId);
    if (!parent) return category?.name || "";

    return `${getCategoryDisplayName(parent, allCategories)} > ${category.name}`;
  };

  // Returns filtered categories (excluding the one being edited)
  const getParentOptions = (excludeId = null) => {
    return categories.filter((cat) => cat.id !== excludeId);
  };

  // Returns categories as {value, label} for Select components
  const getCategorySelectOptions = (excludeId = null) => {
    return categories
      .filter((cat) => cat.id !== excludeId)
      .map((cat) => ({
        value: cat.id,
        label: getCategoryDisplayName(cat),
      }));
  };

  return {
    categories,
    getCategoryDisplayName,
    getParentOptions,
    getCategorySelectOptions,
  };
}
