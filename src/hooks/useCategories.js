import { useState, useEffect, useCallback } from "react";
import { categoriesApi } from "../api";
import { useApi } from "./useApi";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  // Fetch categories
  const {
    data: categoriesData,
    loading: loadingCategories,
    execute: fetchCategories,
  } = useApi(categoriesApi.getAll, {
    showErrorMessage: true,
  });

  // Create category
  const { loading: creating, execute: createCategory } = useApi(
    categoriesApi.create,
    {
      showSuccessMessage: true,
      successMessage: "Thêm category thành công!",
      onSuccess: () => {
        fetchCategories(true); // Refresh list including inactive
      },
    }
  );

  // Update category
  const { loading: updating, execute: updateCategory } = useApi(
    categoriesApi.update,
    {
      showSuccessMessage: true,
      successMessage: "Cập nhật category thành công!",
      onSuccess: () => {
        fetchCategories(true); // Refresh list
      },
    }
  );

  // Delete category
  const { loading: deleting, execute: deleteCategory } = useApi(
    categoriesApi.delete,
    {
      showSuccessMessage: true,
      successMessage: "Xóa category thành công!",
      onSuccess: () => {
        fetchCategories(true); // Refresh list
      },
    }
  );

  // Load categories on mount
  useEffect(() => {
    fetchCategories(true); // Include inactive categories
  }, [fetchCategories]);

  // Update local state when API data changes
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Helper functions
  const getCategoryDisplayName = useCallback(
    (category, allCategories = categories) => {
      if (!category.parentId) return category.name;

      const parent = allCategories.find((cat) => cat.id === category.parentId);
      if (!parent) return category.name;

      return `${getCategoryDisplayName(parent, allCategories)} > ${
        category.name
      }`;
    },
    [categories]
  );

  const getParentOptions = useCallback(
    (excludeCategoryId = null) => {
      if (!excludeCategoryId) return categories;

      // For editing, exclude the category itself and its descendants
      const excludeIds = [excludeCategoryId];
      const addDescendants = (parentId) => {
        categories.forEach((cat) => {
          if (cat.parentId === parentId && !excludeIds.includes(cat.id)) {
            excludeIds.push(cat.id);
            addDescendants(cat.id);
          }
        });
      };
      addDescendants(excludeCategoryId);

      return categories.filter((cat) => !excludeIds.includes(cat.id));
    },
    [categories]
  );

  return {
    categories,
    loadingCategories,
    creating,
    updating,
    deleting,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: () => fetchCategories(true),
    getCategoryDisplayName,
    getParentOptions,
  };
};
