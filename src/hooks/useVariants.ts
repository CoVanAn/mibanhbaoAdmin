import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  productKeys,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useSetVariantPriceMutation,
  useUpdateVariantPriceMutation,
  useDeleteVariantPriceMutation,
  useUpdateVariantInventoryMutation,
  useCleanupVariantsMutation,
} from "./useProductQuery";
import {
  fetchProductVariants,
  fetchProductVariant,
  fetchVariantPrices,
  debugProduct as fetchProductDebug,
} from "../queries/product/product";

export const useVariants = () => {
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

  const createVariantMutation = useCreateVariantMutation();
  const updateVariantMutation = useUpdateVariantMutation();
  const deleteVariantMutation = useDeleteVariantMutation();
  const setVariantPriceMutation = useSetVariantPriceMutation();
  const updateVariantPriceMutation = useUpdateVariantPriceMutation();
  const deleteVariantPriceMutation = useDeleteVariantPriceMutation();
  const updateVariantInventoryMutation = useUpdateVariantInventoryMutation();
  const cleanupVariantsMutation = useCleanupVariantsMutation();

  const loading =
    loadingAction ||
    createVariantMutation.isPending ||
    updateVariantMutation.isPending ||
    deleteVariantMutation.isPending ||
    setVariantPriceMutation.isPending ||
    updateVariantPriceMutation.isPending ||
    deleteVariantPriceMutation.isPending ||
    updateVariantInventoryMutation.isPending ||
    cleanupVariantsMutation.isPending;

  const getVariants = async (productId: number) => {
    setLoadingAction(true);
    try {
      const response = await queryClient.fetchQuery({
        queryKey: productKeys.variants(productId),
        queryFn: () => fetchProductVariants(productId),
      });

      const normalized = response?.variants || response || [];
      setVariants(Array.isArray(normalized) ? normalized : []);
      return response;
    } finally {
      setLoadingAction(false);
    }
  };

  const getVariant = async (productId: number, variantId: number) => {
    setLoadingAction(true);
    try {
      return await queryClient.fetchQuery({
        queryKey: productKeys.variant(productId, variantId),
        queryFn: () => fetchProductVariant(productId, variantId),
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const createVariant = async (productId: number, variantData: any) => {
    return createVariantMutation.mutateAsync({ productId, data: variantData });
  };

  const updateVariant = async (
    productId: number,
    variantId: number,
    variantData: any,
  ) => {
    return updateVariantMutation.mutateAsync({
      productId,
      variantId,
      data: variantData,
    });
  };

  const deleteVariant = async (productId: number, variantId: number) => {
    return deleteVariantMutation.mutateAsync({ productId, variantId });
  };

  const setVariantPrice = async (
    productId: number,
    variantId: number,
    priceData: any,
  ) => {
    return setVariantPriceMutation.mutateAsync({
      productId,
      variantId,
      data: priceData,
    });
  };

  const updateVariantPrice = async (
    productId: number,
    variantId: number,
    priceIdOrPayload: number | any,
    maybePriceData?: any,
  ) => {
    let priceId: number;
    let data: any;

    if (typeof priceIdOrPayload === "object" && priceIdOrPayload !== null) {
      priceId = Number(priceIdOrPayload.priceId);
      const { priceId: _ignored, ...rest } = priceIdOrPayload;
      data = rest;
    } else {
      priceId = Number(priceIdOrPayload);
      data = maybePriceData;
    }

    return updateVariantPriceMutation.mutateAsync({
      productId,
      variantId,
      priceId,
      data,
    });
  };

  const getVariantPrices = async (
    productId: number,
    variantId: number,
    options: { includeInactive?: boolean } = {},
  ) => {
    setLoadingAction(true);
    try {
      return await queryClient.fetchQuery({
        queryKey: productKeys.prices(productId, variantId, options),
        queryFn: () => fetchVariantPrices(productId, variantId, options),
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteVariantPrice = async (
    productId: number,
    variantId: number,
    priceId: number,
  ) => {
    return deleteVariantPriceMutation.mutateAsync({
      productId,
      variantId,
      priceId,
    });
  };

  const updateVariantInventory = async (
    productId: number,
    variantId: number,
    inventoryData: any,
  ) => {
    return updateVariantInventoryMutation.mutateAsync({
      productId,
      variantId,
      data: inventoryData,
    });
  };

  const cleanupVariants = async (productId: number) => {
    return cleanupVariantsMutation.mutateAsync({ productId });
  };

  const debugProduct = async (productId: number) => {
    setLoadingAction(true);
    try {
      return await queryClient.fetchQuery({
        queryKey: [...productKeys.all, productId, "debug"],
        queryFn: () => fetchProductDebug(productId),
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    loading,
    variants,
    setVariants,
    getVariants,
    getVariant,
    createVariant,
    updateVariant,
    deleteVariant,
    setVariantPrice,
    updateVariantPrice,
    getVariantPrices,
    deleteVariantPrice,
    updateVariantInventory,
    cleanupVariants,
    debugProduct,
  };
};

export default useVariants;
