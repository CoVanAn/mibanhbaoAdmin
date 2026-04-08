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
} from "./useProductQuery";
import {
  fetchProductVariants,
  fetchProductVariant,
  fetchVariantPrices,
} from "../queries/product/product";
import type {
  InventoryData,
  PriceData,
  VariantData,
} from "../queries/product/types";

type VariantRecord = {
  id?: number | null;
  name?: string;
  sku?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

type VariantListResponse = {
  variants?: VariantRecord[];
};

type VariantPricePayload = {
  amount?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

type UpdateVariantPricePayload = VariantPricePayload & {
  priceId: number;
};

type VariantPricesResponse = {
  prices?: Array<Record<string, unknown>>;
  currentPrice?: { id?: number | null } | null;
};

export const useVariants = () => {
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState(false);
  const [variants, setVariants] = useState<VariantRecord[]>([]);

  const createVariantMutation = useCreateVariantMutation();
  const updateVariantMutation = useUpdateVariantMutation();
  const deleteVariantMutation = useDeleteVariantMutation();
  const setVariantPriceMutation = useSetVariantPriceMutation();
  const updateVariantPriceMutation = useUpdateVariantPriceMutation();
  const deleteVariantPriceMutation = useDeleteVariantPriceMutation();
  const updateVariantInventoryMutation = useUpdateVariantInventoryMutation();

  const loading =
    loadingAction ||
    createVariantMutation.isPending ||
    updateVariantMutation.isPending ||
    deleteVariantMutation.isPending ||
    setVariantPriceMutation.isPending ||
    updateVariantPriceMutation.isPending ||
    deleteVariantPriceMutation.isPending ||
    updateVariantInventoryMutation.isPending;

  const getVariants = async (productId: number) => {
    setLoadingAction(true);
    try {
      const response = await queryClient.fetchQuery<VariantListResponse | VariantRecord[]>({
        queryKey: productKeys.variants(productId),
        queryFn: () => fetchProductVariants(productId),
      });

      const normalized =
        !Array.isArray(response) && response?.variants
          ? response.variants
          : response;
      setVariants(Array.isArray(normalized) ? normalized : []);
      return response;
    } finally {
      setLoadingAction(false);
    }
  };

  const getVariant = async (productId: number, variantId: number) => {
    setLoadingAction(true);
    try {
      return await queryClient.fetchQuery<Record<string, unknown>>({
        queryKey: productKeys.variant(productId, variantId),
        queryFn: () => fetchProductVariant(productId, variantId),
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const createVariant = async (productId: number, variantData: VariantData) => {
    return createVariantMutation.mutateAsync({ productId, data: variantData });
  };

  const updateVariant = async (
    productId: number,
    variantId: number,
    variantData: Partial<VariantData>,
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
    priceData: PriceData,
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
    priceIdOrPayload: number | UpdateVariantPricePayload,
    maybePriceData?: Partial<PriceData>,
  ) => {
    let priceId: number;
    let data: Partial<PriceData>;

    if (typeof priceIdOrPayload === "object" && priceIdOrPayload !== null) {
      priceId = Number(priceIdOrPayload.priceId);
      const { priceId: _ignored, ...rest } = priceIdOrPayload;
      data = rest;
    } else {
      priceId = Number(priceIdOrPayload);
      data = maybePriceData || {};
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
      return await queryClient.fetchQuery<VariantPricesResponse>({
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
    inventoryData: InventoryData,
  ) => {
    return updateVariantInventoryMutation.mutateAsync({
      productId,
      variantId,
      data: inventoryData,
    });
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
  };
};

export default useVariants;
