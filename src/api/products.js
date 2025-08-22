import apiClient from "./client";

export const productsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/product/list", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/product/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(productData).forEach((key) => {
      if (key !== "images" && key !== "categories") {
        formData.append(key, productData[key]);
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
  },

  update: async (id, productData) => {
    console.log("=== PRODUCTS API UPDATE DEBUG ===");
    console.log("Product ID:", id);
    console.log("Product data:", productData);
    console.log("Has newImages:", productData.newImages?.length || 0);
    
    // Check if we have files to upload
    const hasFiles = productData.newImages && productData.newImages.length > 0;

    if (hasFiles) {
      console.log("Using FormData for file upload");
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
            console.log(`Added field ${key}:`, productData[key]);
          }
        }
      });

      // Add new images
      if (productData.newImages) {
        console.log("Adding newImages files:", productData.newImages.length);
        productData.newImages.forEach((image, index) => {
          formData.append("newImages", image);
          console.log(`Added newImages[${index}]:`, {
            name: image.name,
            size: image.size,
            type: image.type
          });
        });
      }

      // Add existing image IDs to keep
      if (productData.existingImageIds) {
        formData.append(
          "existingImageIds",
          JSON.stringify(productData.existingImageIds)
        );
      }

      // Add image positions for reordering
      if (productData.imagePositions) {
        formData.append(
          "imagePositions",
          JSON.stringify(productData.imagePositions)
        );
      }

      console.log("Sending FormData request to:", `/api/product/${id}`);
      const response = await apiClient.patch(`/api/product/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("FormData response:", response.data);
      return response.data;
    } else {
      console.log("Using JSON for text-only update");
      // Regular JSON update for text-only changes
      const response = await apiClient.patch(`/api/product/${id}`, productData);
      console.log("JSON response:", response.data);
      return response.data;
    }
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/product/${id}`);
    return response.data;
  },

  // Category management
  setCategories: async (productId, categoryIds) => {
    const response = await apiClient.put(
      `/api/product/${productId}/categories`,
      {
        categoryIds,
      }
    );
    return response.data;
  },

  addCategory: async (productId, categoryId) => {
    const response = await apiClient.post(
      `/api/product/${productId}/categories/${categoryId}`
    );
    return response.data;
  },

  removeCategory: async (productId, categoryId) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/categories/${categoryId}`
    );
    return response.data;
  },

  // Media management
  addMedia: async (productId, files) => {
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
      }
    );
    return response.data;
  },

  deleteMedia: async (productId, mediaId) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/media/${mediaId}`
    );
    return response.data;
  },

  reorderMedia: async (productId, mediaOrder) => {
    const response = await apiClient.patch(
      `/api/product/${productId}/media/reorder`,
      { mediaOrder }
    );
    return response.data;
  },

  // Variant Management
  getVariants: async (productId) => {
    const response = await apiClient.get(`/api/product/${productId}/variants`);
    return response.data;
  },

  getVariant: async (productId, variantId) => {
    const response = await apiClient.get(`/api/product/${productId}/variants/${variantId}`);
    return response.data;
  },

  createVariant: async (productId, variantData) => {
    const response = await apiClient.post(`/api/product/${productId}/variants`, variantData);
    return response.data;
  },

  updateVariant: async (productId, variantId, variantData) => {
    const response = await apiClient.patch(`/api/product/${productId}/variants/${variantId}`, variantData);
    return response.data;
  },

  deleteVariant: async (productId, variantId) => {
    const response = await apiClient.delete(`/api/product/${productId}/variants/${variantId}`);
    return response.data;
  },

  // Price Management
  setVariantPrice: async (productId, variantId, priceData) => {
    const response = await apiClient.post(`/api/product/${productId}/variants/${variantId}/price`, priceData);
    return response.data;
  },

  updateVariantPrice: async (productId, variantId, priceData) => {
    const response = await apiClient.patch(`/api/product/${productId}/variants/${variantId}/price`, priceData);
    return response.data;
  },

  getVariantPrices: async (productId, variantId) => {
    const response = await apiClient.get(`/api/product/${productId}/variants/${variantId}/prices`);
    return response.data;
  },

  deleteVariantPrice: async (productId, variantId, priceId) => {
    const response = await apiClient.delete(`/api/product/${productId}/variants/${variantId}/prices/${priceId}`);
    return response.data;
  },

  // Debug and Cleanup
  debugProduct: async (productId) => {
    const response = await apiClient.get(`/api/product/${productId}/debug`);
    return response.data;
  },

  cleanupVariants: async (productId) => {
    const response = await apiClient.post(`/api/product/${productId}/cleanup-variants`);
    return response.data;
  },
};
