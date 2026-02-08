import apiClient from "../../lib/api";

// ============ Media Management ============

/**
 * Add media to product
 */
export async function addProductMedia(productId: number, files: File[]) {
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
export async function deleteProductMedia(productId: number, mediaId: number) {
  const response = await apiClient.delete(
    `/api/product/${productId}/media/${mediaId}`,
  );
  return response.data;
}

/**
 * Reorder product media
 */
export async function reorderProductMedia(productId: number, mediaOrder: number[]) {
  const response = await apiClient.patch(
    `/api/product/${productId}/media/reorder`,
    { mediaOrder },
  );
  return response.data;
}
