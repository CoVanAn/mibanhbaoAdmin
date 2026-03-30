import apiClient from "../../lib/api";
import {
  parseProductDetail,
  parseProductList,
} from "../../schema/product.schema";

// Re-export types from product-types
export type {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  VariantData,
  PriceData,
  InventoryData,
} from "./types";

// Re-export media functions
export {
  addProductMedia,
  deleteProductMedia,
  reorderProductMedia,
} from "./media";

// Re-export variant/price/inventory functions
export {
  fetchProductVariants,
  fetchProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  setVariantPrice,
  updateVariantPrice,
  fetchVariantPrices,
  deleteVariantPrice,
  updateVariantInventory,
} from "./variant";

import type { ProductFilters, CreateProductData, UpdateProductData } from "./types";

/**
 * Fetch all products with optional filters
 * Admin always includes inactive products
 */
export async function fetchProducts(params: ProductFilters = {}) {
  const response = await apiClient.get("/api/product/list", {
    params: { ...params, includeInactive: 1 },
  });
  return parseProductList(response.data);
}

/**
 * Fetch single product by ID
 */
export async function fetchProductById(id: number) {
  const response = await apiClient.get(`/api/product/${id}`);
  return parseProductDetail(response.data);
}

/**
 * Fetch single product by slug
 */
export async function fetchProductBySlug(slug: string) {
  const response = await apiClient.get(
    `/api/product/${encodeURIComponent(slug)}`,
  );
  return parseProductDetail(response.data);
}

/**
 * Create new product
 */
export async function createProduct(productData: CreateProductData) {
  const formData = new FormData();

  // Add basic fields
  (Object.keys(productData) as Array<keyof CreateProductData>).forEach((key) => {
    if (key !== "images" && key !== "categories") {
      const value = productData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }
  });

  // Add images
  if (productData.images) {
    productData.images.forEach((image) => {
      formData.append("images", image);
    });
  }

  // Add categories
  if (productData.categories) {
    productData.categories.forEach((categoryId) => {
      formData.append("categories[]", categoryId.toString());
    });
  }

  const response = await apiClient.post("/api/product/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Update product
 */
export async function updateProduct(id: number, productData: UpdateProductData) {
  // Check if we have files to upload
  const hasFiles = productData.newImages && productData.newImages.length > 0;

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = new FormData();

    // Add basic fields
    (Object.keys(productData) as Array<keyof UpdateProductData>).forEach((key) => {
      if (
        key !== "newImages" &&
        key !== "existingImageIds" &&
        key !== "imagePositions"
      ) {
        const value = productData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    });

    // Add new images
    if (productData.newImages) {
      productData.newImages.forEach((image: File) => {
        formData.append("newImages", image);
      });
    }

    // Add existing image IDs to keep
    if (productData.existingImageIds) {
      formData.append(
        "existingImageIds",
        JSON.stringify(productData.existingImageIds),
      );
    }

    // Add image positions for reordering
    if (productData.imagePositions) {
      formData.append(
        "imagePositions",
        JSON.stringify(productData.imagePositions),
      );
    }

    const response = await apiClient.patch(`/api/product/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } else {
    // Regular JSON update for text-only changes
    const response = await apiClient.patch(`/api/product/${id}`, productData);
    return response.data;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: number) {
  const response = await apiClient.delete(`/api/product/${id}`);
  return response.data;
}

// ============ Category Management ============

/**
 * Set product categories
 */
export async function setProductCategories(productId: number, categoryIds: number[]) {
  const response = await apiClient.put(`/api/product/${productId}/categories`, {
    categoryIds,
  });
  return response.data;
}

/**
 * Add category to product
 */
export async function addProductCategory(productId: number, categoryId: number) {
  const response = await apiClient.post(
    `/api/product/${productId}/categories/${categoryId}`,
  );
  return response.data;
}

/**
 * Remove category from product
 */
export async function removeProductCategory(productId: number, categoryId: number) {
  const response = await apiClient.delete(
    `/api/product/${productId}/categories/${categoryId}`,
  );
  return response.data;
}
