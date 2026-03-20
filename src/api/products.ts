import apiClient from "./client";

export const productsApi = {
  getAll: async (params = {}) => {
    // Admin always includes inactive products
    const response = await apiClient.get("/api/product/list", {
      params: { ...params, includeInactive: 1 },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/product/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(productData).forEach((key) => {
      if (key !== "images" && key !== "categories") {
        formData.append(key, productData[key]);
      }
    });

    // Add images
    if (productData.images) {
      productData.images.forEach((image: File) => {
        formData.append("images", image);
      });
    }

    // Add categories
    if (productData.categories) {
      productData.categories.forEach((categoryId: string) => {
        formData.append("categories[]", categoryId);
      });
    }

    const response = await apiClient.post("/api/product/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for file uploads
    });
    return response.data;
  },

  update: async (id: string, productData: any) => {
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
        productData.newImages.forEach((image: File, index: number) => {
          formData.append("newImages", image);
          console.log(`Added newImages[${index}]:`, {
            name: image.name,
            size: image.size,
            type: image.type,
          });
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

      console.log("Sending FormData request to:", `/api/product/${id}`);
      const response = await apiClient.patch(`/api/product/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds for file uploads
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

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/product/${id}`);
    return response.data;
  },

  // Category management
  setCategories: async (productId: string, categoryIds: string[]) => {
    const response = await apiClient.put(
      `/api/product/${productId}/categories`,
      {
        categoryIds,
      },
    );
    return response.data;
  },

  addCategory: async (productId: string, categoryId: string) => {
    const response = await apiClient.post(
      `/api/product/${productId}/categories/${categoryId}`,
    );
    return response.data;
  },

  removeCategory: async (productId: string, categoryId: string) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/categories/${categoryId}`,
    );
    return response.data;
  },

  // Media management
  addMedia: async (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file: File) => {
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
  },

  deleteMedia: async (productId: string, mediaId: string) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/media/${mediaId}`,
    );
    return response.data;
  },

  reorderMedia: async (productId: string, mediaOrder: string[]) => {
    const response = await apiClient.patch(
      `/api/product/${productId}/media/reorder`,
      { mediaOrder },
    );
    return response.data;
  },

  // Variant Management
  getVariants: async (productId: string) => {
    const response = await apiClient.get(`/api/product/${productId}/variants`);
    return response.data;
  },

  getVariant: async (productId: string, variantId: string) => {
    const response = await apiClient.get(
      `/api/product/${productId}/variants/${variantId}`,
    );
    return response.data;
  },

  createVariant: async (productId: string, variantData: any) => {
    const response = await apiClient.post(
      `/api/product/${productId}/variants`,
      variantData,
    );
    return response.data;
  },

  updateVariant: async (productId: string, variantId: string, variantData: any) => {
    const response = await apiClient.patch(
      `/api/product/${productId}/variants/${variantId}`,
      variantData,
    );
    return response.data;
  },

  deleteVariant: async (productId: string, variantId: string) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/variants/${variantId}`,
    );
    return response.data;
  },

  // Price Management
  setVariantPrice: async (productId: string, variantId: string, priceData: any) => {
    console.log("setVariantPrice called:", { productId, variantId, priceData });
    const response = await apiClient.post(
      `/api/product/${productId}/variants/${variantId}/price`,
      { amount: Number(priceData.amount) },
    );
    return response.data;
  },

  updateVariantPrice: async (productId: string, variantId: string, priceId: string, priceData: any) => {
    const response = await apiClient.patch(
      `/api/product/${productId}/variants/${variantId}/price/${priceId}`,
      priceData,
    );
    return response.data;
  },

  getVariantPrices: async (productId: string, variantId: string, options = {}) => {
    const query = new URLSearchParams();
    if (options.includeInactive) {
      query.set("includeInactive", "true");
    }

    const url = query.toString()
      ? `/api/product/${productId}/variants/${variantId}/prices?${query}`
      : `/api/product/${productId}/variants/${variantId}/prices`;

    const response = await apiClient.get(url);
    return response.data;
  },

  deleteVariantPrice: async (productId: string, variantId: string, priceId: string) => {
    const response = await apiClient.delete(
      `/api/product/${productId}/variants/${variantId}/price/${priceId}`,
    );
    return response.data;
  },

  // Inventory Management
  updateVariantInventory: async (productId: string, variantId: string, inventoryData: any) => {
    const response = await apiClient.patch(
      `/api/product/${productId}/variants/${variantId}/inventory`,
      inventoryData,
    );
    return response.data;
  },

  // Debug and Cleanup
  debugProduct: async (productId: string) => {
    const response = await apiClient.get(`/api/product/${productId}/debug`);
    return response.data;
  },

  cleanupVariants: async (productId: string) => {
    const response = await apiClient.post(
      `/api/product/${productId}/cleanup-variants`,
    );
    return response.data;
  },
};
