import { useState, useEffect, useCallback } from "react";
import { productsApi } from "../api";
import { useApi } from "./useApi";

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  // Fetch products
  const {
    data: productsData,
    loading: loadingProducts,
    execute: fetchProducts,
  } = useApi(productsApi.getAll, {
    showErrorMessage: true,
  });

  // Create product
  const { loading: creating, execute: createProduct } = useApi(
    productsApi.create,
    {
      showSuccessMessage: true,
      successMessage: "Thêm sản phẩm thành công!",
      onSuccess: () => {
        fetchProducts(); // Refresh list
      },
    }
  );

  // Update product
  const { loading: updating, execute: updateProduct } = useApi(
    productsApi.update,
    {
      showSuccessMessage: true,
      successMessage: "Cập nhật sản phẩm thành công!",
      onSuccess: () => {
        fetchProducts(); // Refresh list
      },
    }
  );

  // Delete product
  const { loading: deleting, execute: deleteProduct } = useApi(
    productsApi.delete,
    {
      showSuccessMessage: true,
      successMessage: "Xóa sản phẩm thành công!",
      onSuccess: () => {
        fetchProducts(); // Refresh list
      },
    }
  );

  // Get single product
  const {
    data: selectedProduct,
    loading: loadingProduct,
    execute: getProduct,
  } = useApi(productsApi.getById, {
    showErrorMessage: true,
  });

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update local state when API data changes
  useEffect(() => {
    if (productsData) {
      setProducts(
        Array.isArray(productsData) ? productsData : productsData.data || []
      );
    }
  }, [productsData]);

  // Helper functions
  const getProductById = useCallback(
    (id) => {
      return products.find((product) => product.id === parseInt(id));
    },
    [products]
  );

  const searchProducts = useCallback(
    (searchTerm) => {
      if (!searchTerm) return products;

      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [products]
  );

  const filterProductsByCategory = useCallback(
    (categoryId) => {
      if (!categoryId) return products;

      return products.filter((product) =>
        product.categories?.some((cat) => cat.categoryId === categoryId)
      );
    },
    [products]
  );

  return {
    products,
    selectedProduct,
    loadingProducts,
    loadingProduct,
    creating,
    updating,
    deleting,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refreshProducts: fetchProducts,
    getProductById,
    searchProducts,
    filterProductsByCategory,
  };
};
