// ============ Type Definitions ============

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  slug?: string;
  description?: string | null;
  content?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  price?: number | null;
  currentPrice?: number | null;
  images?: File[];
  categories?: number[];
}

export interface UpdateProductData {
  name?: string;
  slug?: string;
  description?: string | null;
  content?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  price?: number | null;
  currentPrice?: number | null;
  newImages?: File[];
  existingImageIds?: number[];
  imagePositions?: number[];
  categories?: number[];
}

export interface VariantData {
  name: string;
  sku?: string;
  attributes?: Record<string, any>;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
}

export interface PriceData {
  price: number;
  compareAtPrice?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface InventoryData {
  stock: number;
  lowStockThreshold?: number;
  isInStock?: boolean;
}
