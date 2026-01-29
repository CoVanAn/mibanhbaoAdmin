import apiClient from "@/src/lib/api";
import {
  parseProductDetail,
  parseProductList,
} from "@/src/schema/product.schema";

/**
 * Fetch all products with optional filters
 * Admin always includes inactive products
 */
export async function fetchProducts(params = {}) {
  const response = await apiClient.get("/api/product/list", {
    params: { ...params, includeInactive: 1 },
  });
  return parseProductList(response.data);
}

/**
 * Fetch single product by ID
 */
export async function fetchProductById(id) {
  const response = await apiClient.get(`/api/product/${id}`);
  return parseProductDetail(response.data);
}

/**
 * Fetch single product by slug
 */
export async function fetchProductBySlug(slug) {
  const response = await apiClient.get(
    `/api/product/${encodeURIComponent(slug)}`,
  );
  return parseProductDetail(response.data);
}

/**
 * Create new product
 */
export async function createProduct(productData) {
  const formData = new FormData();

  // Add basic fields
  Object.keys(productData).forEach((key) => {
    if (key !== "images" && key !== "categories") {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
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
      formData.append("categories[]", categoryId);
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
export async function updateProduct(id, productData) {
  // Check if we have files to upload
  const hasFiles = productData.newImages && productData.newImages.length > 0;

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = new FormData();

    // Add basic fields
    Object.keys(productData).forEach((key) => {
      if (
        key !== "newImages" &&
        key !== "existingImageIds" &&
        key !== "imagePositions"
      ) {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      }
    });

    // Add new images
    if (productData.newImages) {
      productData.newImages.forEach((image) => {
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
export async function deleteProduct(id) {
  const response = await apiClient.delete(`/api/product/${id}`);
  return response.data;
}

// ============ Category Management ============

/**
 * Set product categories
 */
export async function setProductCategories(productId, categoryIds) {
  const response = await apiClient.put(`/api/product/${productId}/categories`, {
    categoryIds,
  });
  return response.data;
}

/**
 * Add category to product
 */
export async function addProductCategory(productId, categoryId) {
  const response = await apiClient.post(
    `/api/product/${productId}/categories/${categoryId}`,
  );
  return response.data;
}

/**
 * Remove category from product
 */
export async function removeProductCategory(productId, categoryId) {
  const response = await apiClient.delete(
    `/api/product/${productId}/categories/${categoryId}`,
  );
  return response.data;
}

// ============ Media Management ============

/**
 * Add media to product
 */
export async function addProductMedia(productId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("media", file);
  });

  const response = await apiClient.post(
    `/api/product/${productId}/media`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

/**
 * Delete media from product
 */
export async function deleteProductMedia(productId, mediaId) {
  const response = await apiClient.delete(
    `/api/product/${productId}/media/${mediaId}`,
  );
  return response.data;
}

/**
 * Reorder product media
 */
export async function reorderProductMedia(productId, mediaOrder) {
  const response = await apiClient.patch(
    `/api/product/${productId}/media/reorder`,
    { mediaOrder },
  );
  return response.data;
}

// ============ Variant Management ============

/**
 * Get product variants
 */
export async function fetchProductVariants(productId) {
  const response = await apiClient.get(`/api/product/${productId}/variants`);
  return response.data;
}

/**
 * Get single variant
 */
export async function fetchProductVariant(productId, variantId) {
  const response = await apiClient.get(
    `/api/product/${productId}/variants/${variantId}`,
  );
  return response.data;
}

/**
 * Create variant
 */
export async function createProductVariant(productId, variantData) {
  const response = await apiClient.post(
    `/api/product/${productId}/variants`,
    variantData,
  );
  return response.data;
}

/**
 * Update variant
 */
export async function updateProductVariant(productId, variantId, variantData) {
  const response = await apiClient.patch(
    `/api/product/${productId}/variants/${variantId}`,
    variantData,
  );
  return response.data;
}

/**
 * Delete variant
 */
export async function deleteProductVariant(productId, variantId) {
  const response = await apiClient.delete(
    `/api/product/${productId}/variants/${variantId}`,
  );
  return response.data;
}

// ============ Price Management ============

/**
 * Set variant price
 */
export async function setVariantPrice(productId, variantId, priceData) {
  const response = await apiClient.post(
    `/api/product/${productId}/variants/${variantId}/price`,
    priceData,
  );
  return response.data;
}

/**
 * Update variant price
 */
export async function updateVariantPrice(
  productId,
  variantId,
  priceId,
  priceData,
) {
  const response = await apiClient.patch(
    `/api/product/${productId}/variants/${variantId}/price/${priceId}`,
    priceData,
  );
  return response.data;
}

/**
 * Get variant prices
 */
export async function fetchVariantPrices(productId, variantId, options = {}) {
  const query = new URLSearchParams();
  if (options.includeInactive) {
    query.set("includeInactive", "true");
  }

  const url = query.toString()
    ? `/api/product/${productId}/variants/${variantId}/prices?${query}`
    : `/api/product/${productId}/variants/${variantId}/prices`;

  const response = await apiClient.get(url);
  return response.data;
}

/**
 * Delete variant price
 */
export async function deleteVariantPrice(productId, variantId, priceId) {
  const response = await apiClient.delete(
    `/api/product/${productId}/variants/${variantId}/price/${priceId}`,
  );
  return response.data;
}

// ============ Inventory Management ============

/**
 * Update variant inventory
 */
export async function updateVariantInventory(
  productId,
  variantId,
  inventoryData,
) {
  const response = await apiClient.patch(
    `/api/product/${productId}/variants/${variantId}/inventory`,
    inventoryData,
  );
  return response.data;
}

// ============ Debug and Cleanup ============

/**
 * Debug product
 */
export async function debugProduct(productId) {
  const response = await apiClient.get(`/api/product/${productId}/debug`);
  return response.data;
}

/**
 * Cleanup variants
 */
export async function cleanupVariants(productId) {
  const response = await apiClient.post(
    `/api/product/${productId}/cleanup-variants`,
  );
  return response.data;
}
