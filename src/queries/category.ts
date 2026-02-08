import apiClient from "../lib/api";
import { parseCategoryList, parseCategory } from "../schema/category.schema";

/**
 * Fetch all categories
 * Admin always includes inactive categories by default
 */
export async function fetchCategories(includeInactive = true) {
  const response = await apiClient.get(
    `/api/category/list?includeInactive=${includeInactive ? "1" : "0"}`,
  );
  // Server returns array directly, parse it
  const data = Array.isArray(response.data) ? response.data : [];
  return parseCategoryList(data);
}

/**
 * Fetch single category by ID
 */
export async function fetchCategoryById(id: number) {
  const response = await apiClient.get(`/api/category/${id}`);
  return parseCategory(response.data);
}

/**
 * Create new category
 */
export async function createCategory(categoryData: {
  name: string;
  slug?: string;
  parentId?: number | null;
  position?: number;
  isActive?: boolean;
}) {
  const response = await apiClient.post("/api/category/add", categoryData);
  return response.data;
}

/**
 * Update category
 */
export async function updateCategory(id: number, categoryData: {
  name?: string;
  slug?: string;
  parentId?: number | null;
  position?: number;
  isActive?: boolean;
}) {
  const response = await apiClient.patch(`/api/category/${id}`, categoryData);
  return response.data;
}

/**
 * Delete category
 */
export async function deleteCategory(id: number) {
  const response = await apiClient.delete(`/api/category/${id}`);
  return response.data;
}
