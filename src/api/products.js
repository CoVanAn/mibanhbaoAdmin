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
    const response = await apiClient.patch(`/api/product/${id}`, productData);
    return response.data;
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
};
