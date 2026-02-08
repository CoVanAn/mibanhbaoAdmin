import apiClient from "../../lib/api";
import type { VariantData, PriceData, InventoryData } from "./types";

// ============ Variant Management ============

/**
 * Get product variants
 */
export async function fetchProductVariants(productId: number) {
  const response = await apiClient.get(`/api/product/${productId}/variants`);
  return response.data;
}

/**
 * Get single variant
 */
export async function fetchProductVariant(productId: number, variantId: number) {
  const response = await apiClient.get(
    `/api/product/${productId}/variants/${variantId}`,
  );
  return response.data;
}

/**
 * Create variant
 */
export async function createProductVariant(productId: number, variantData: VariantData) {
  const response = await apiClient.post(
    `/api/product/${productId}/variants`,
    variantData,
  );
  return response.data;
}

/**
 * Update variant
 */
export async function updateProductVariant(productId: number, variantId: number, variantData: Partial<VariantData>) {
  const response = await apiClient.patch(
    `/api/product/${productId}/variants/${variantId}`,
    variantData,
  );
  return response.data;
}

/**
 * Delete variant
 */
export async function deleteProductVariant(productId: number, variantId: number) {
  const response = await apiClient.delete(
    `/api/product/${productId}/variants/${variantId}`,
  );
  return response.data;
}

// ============ Price Management ============

/**
 * Set variant price
 */
export async function setVariantPrice(productId: number, variantId: number, priceData: PriceData) {
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
  productId: number,
  variantId: number,
  priceId: number,
  priceData: Partial<PriceData>,
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
export async function fetchVariantPrices(productId: number, variantId: number, options = { includeInactive: false }) {
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
export async function deleteVariantPrice(productId: number, variantId: number, priceId: number) {
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
  productId: number,
  variantId: number,
  inventoryData: InventoryData,
) {
  const response = await apiClient.patch(
    `/api/product/${productId}/variants/${variantId}/inventory`,
    inventoryData,
  );
  return response.data;
}
