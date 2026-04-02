import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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
  addProductMedia,
  deleteProductMedia,
  reorderProductMedia,
} from "../queries/product/product";
import type {
  ProductFilters,
  UpdateProductData,
  VariantData,
  PriceData,
  InventoryData,
} from "../queries/product/types";
import { toast } from "react-toastify";
import { getErrorMessage } from "../utils/httpError";

// Query Keys
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters = {}) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (id: number) => [...productKeys.details(), id],
  variants: (productId: number) => [...productKeys.all, productId, "variants"],
  variant: (productId: number, variantId: number) =>
    [...productKeys.all, productId, "variant", variantId],
  prices: (
    productId: number,
    variantId: number,
    options: { includeInactive?: boolean } = {},
  ) => [...productKeys.all, productId, "variant", variantId, "prices", options],
};

/**
 * Hook to fetch all products
 */

export function useProductsQuery(params: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}

/**
 * Hook to fetch single product by ID
 */
export function useProductQuery(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create product
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Thêm sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Thêm sản phẩm thất bại"));
    },
  });
}

/**
 * Hook to update product
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductData }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      toast.success("Cập nhật sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật sản phẩm thất bại"));
    },
  });
}

/**
 * Hook to delete product
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Xóa sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Xóa sản phẩm thất bại"));
    },
  });
}

// ============ Variant Hooks ============

/**
 * Hook to fetch product variants
 */
export function useProductVariantsQuery(productId: number) {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => fetchProductVariants(productId),
    enabled: !!productId,
  });
}

export function useProductVariantQuery(productId: number, variantId: number) {
  return useQuery({
    queryKey: productKeys.variant(productId, variantId),
    queryFn: () => fetchProductVariant(productId, variantId),
    enabled: !!productId && !!variantId,
  });
}

/**
 * Hook to create product variant
 */
export function useCreateVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: VariantData }) =>
      createProductVariant(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Thêm biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Thêm biến thể thất bại"));
    },
  });
}

/**
 * Hook to update product variant
 */
export function useUpdateVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: number;
      variantId: number;
      data: Partial<VariantData>;
    }) => updateProductVariant(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Cập nhật biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật biến thể thất bại"));
    },
  });
}

/**
 * Hook to delete product variant
 */
export function useDeleteVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
      deleteProductVariant(productId, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Xóa biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Xóa biến thể thất bại"));
    },
  });
}

export function useSetVariantPriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: number;
      variantId: number;
      data: PriceData;
    }) => setVariantPrice(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.prices(variables.productId, variables.variantId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Thêm giá biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Thêm giá biến thể thất bại"));
    },
  });
}

export function useUpdateVariantPriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      priceId,
      data,
    }: {
      productId: number;
      variantId: number;
      priceId: number;
      data: Partial<PriceData>;
    }) => updateVariantPrice(productId, variantId, priceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.prices(variables.productId, variables.variantId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Cập nhật giá biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật giá biến thể thất bại"));
    },
  });
}

export function useVariantPricesQuery(
  productId: number,
  variantId: number,
  options: { includeInactive?: boolean } = {},
) {
  return useQuery({
    queryKey: productKeys.prices(productId, variantId, options),
    queryFn: () =>
      fetchVariantPrices(productId, variantId, {
        includeInactive: !!options.includeInactive,
      }),
    enabled: !!productId && !!variantId,
  });
}

export function useDeleteVariantPriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      priceId,
    }: {
      productId: number;
      variantId: number;
      priceId: number;
    }) => deleteVariantPrice(productId, variantId, priceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.prices(variables.productId, variables.variantId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Xóa giá biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Xóa giá biến thể thất bại"));
    },
  });
}

export function useUpdateVariantInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: number;
      variantId: number;
      data: InventoryData;
    }) => updateVariantInventory(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Cập nhật tồn kho biến thể thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Cập nhật tồn kho biến thể thất bại"));
    },
  });
}

// ============ Media Hooks ============

/**
 * Hook to add product media
 */
export function useAddMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: number; files: File[] }) => addProductMedia(productId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Thêm hình ảnh thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Thêm hình ảnh thất bại"));
    },
  });
}

/**
 * Hook to delete product media
 */
export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, mediaId }: { productId: number; mediaId: number }) =>
      deleteProductMedia(productId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
      toast.success("Xóa hình ảnh thành công!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Xóa hình ảnh thất bại"));
    },
  });
}

/**
 * Hook to reorder product media
 */
export function useReorderMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, mediaOrder }: { productId: number; mediaOrder: number[] }) =>
      reorderProductMedia(productId, mediaOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Sắp xếp hình ảnh thất bại"));
    },
  });
}
