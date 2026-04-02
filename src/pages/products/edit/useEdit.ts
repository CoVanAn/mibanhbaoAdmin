import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, message } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  useProductQuery,
  useUpdateProductMutation,
} from "../../../hooks/useProductQuery";
import { useCategoriesQuery } from "../../../hooks/useCategoryQuery";

type ExistingImage = {
  id: number;
  url: string;
  alt?: string;
  position: number;
};

type ProductVariant = {
  id?: number | null;
  name: string;
  sku?: string;
  price?: number;
  currentPrice?: number;
  isActive?: boolean;
  inventory?: { quantity?: number; safetyStock?: number };
  inventories?: Array<{ quantity?: number; safetyStock?: number }>;
  stock?: number;
  quantity?: number;
  safetyStock?: number;
};

type ProductDetail = {
  id: number;
  name: string;
  description?: string;
  content?: string;
  price?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  currentPrice?: { amount?: number };
  categories?: Array<{ id?: number; categoryId?: number }>;
  variants?: ProductVariant[];
  images?: Array<{
    id?: number;
    url: string;
    alt?: string;
    position?: number;
  }>;
};

type ProductEditFormValues = {
  name: string;
  description?: string;
  content?: string;
  price?: number;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

export const useProductEditLogic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const productId = id ? Number(id) : 0;
  const [form] = Form.useForm();

  // TanStack Query hooks
  const {
    data: productData,
    isLoading: loadingProduct,
  } = useProductQuery(productId);
  const { data: categories = [], isLoading: loadingCategories } =
    useCategoriesQuery(true);
  const updateProductMutation = useUpdateProductMutation();

  // State
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [newImages, setNewImages] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [useVariants, setUseVariants] = useState(false);

  const revokeBlobUrls = (urls: string[]) => {
    urls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  useEffect(() => {
    return () => {
      revokeBlobUrls(previewImages);
    };
  }, [previewImages]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Process product data when it loads
  useEffect(() => {
    if (productData) {
      const data = productData as ProductDetail;

      setProduct(data);

      // Set existing images with proper structure
      const imageItems = data.images || [];

      const processedImages = imageItems.map((item, index: number) => ({
        id: typeof item.id === "number" ? item.id : -(index + 1),
        url: item.url,
        alt: item.alt || `Product image ${index + 1}`,
        position: item.position !== undefined ? item.position : index,
      }));

      // Sort by position to ensure correct order
      processedImages.sort((a, b) => a.position - b.position);

      setExistingImages(processedImages);

      // Process variants data
      const variantsData = data.variants || [];

      setVariants(variantsData);

      // Determine if using variants mode
      const hasMultipleVariants = variantsData.length > 1;
      const hasNamedVariants = variantsData.some((v) => v.name !== "Default");
      setUseVariants(hasMultipleVariants || hasNamedVariants);

      // Set form values with better data mapping
      // Helper to get display price: prefer product.price, else default variant price
      const getDisplayPrice = () => {
        if (productData.price) return productData.price;
        const variants = productData.variants || [];
        const defaultVariant = variants[0];
        return defaultVariant?.price || defaultVariant?.currentPrice || "";
      };

      const firstCategory = productData.categories?.[0] as
        | { id?: number; categoryId?: number }
        | undefined;
      const resolvedCategoryId = firstCategory?.categoryId ?? firstCategory?.id ?? "";

      const formValues = {
        name: productData.name || "",
        description: productData.description || "",
        content: productData.content || "",
        price: getDisplayPrice(),
        // Handle both new and old data structure for categories
        categoryId: resolvedCategoryId,
        isActive:
          productData.isActive !== undefined ? productData.isActive : true,
        isFeatured:
          productData.isFeatured !== undefined ? productData.isFeatured : false,
      };

      form.setFieldsValue(formValues);
    }
  }, [productData, form]);

  // Handle drag end for existing images
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setExistingImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update position for each item
        return newItems.map((item, index) => ({
          ...item,
          position: index,
        }));
      });
    }
  };

  // Remove existing image
  const handleExistingImageRemove = (imageId: ExistingImage["id"]) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Preview image
  const handleImagePreview = (image: ExistingImage) => {
    setPreviewImage(image.url);
    setPreviewVisible(true);
  };

  // Handle new image upload
  const handleImageChange = ({ fileList }: { fileList: UploadFile[] }) => {
    revokeBlobUrls(previewImages);
    setNewImages(fileList);

    // Create preview URLs for new images
    const previews = fileList.map((file) => {
      if (file.originFileObj) {
        return URL.createObjectURL(file.originFileObj);
      }
      return file.url || "";
    });
    setPreviewImages(previews);
  };

  // Remove new image
  const handleImageRemove = (file: UploadFile) => {
    const removedPreview = previewImages.find(
      (_, index) => newImages[index]?.uid === file.uid,
    );
    if (removedPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(removedPreview);
    }

    const newImageList = newImages.filter((img) => img.uid !== file.uid);
    setNewImages(newImageList);

    const newPreviews = previewImages.filter(
      (_, index) => newImages[index]?.uid !== file.uid,
    );
    setPreviewImages(newPreviews);

    return true;
  };

  // Custom upload validation
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể upload file hình ảnh!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Hình ảnh phải nhỏ hơn 5MB!");
      return false;
    }

    return false; // Prevent auto upload
  };

  const handleSubmit = async (values: ProductEditFormValues) => {
    if (!productId) {
      message.error("Không tìm thấy mã sản phẩm hợp lệ");
      return;
    }

    try {
      // Use the price from variants (simplified approach)
      const finalPrice = Number(variants[0]?.price ?? values.price ?? 0);

      // Prepare form data
      const productData = {
        name: values.name,
        description: values.description || "",
        content: values.content || "",
        ...(!useVariants ? { price: finalPrice } : {}),
        categoryId: values.categoryId || null,
        isActive: values.isActive !== undefined ? values.isActive : true,
        isFeatured: values.isFeatured !== undefined ? values.isFeatured : false,
        // Include information about images to keep and new images to add
        existingImageIds: existingImages
          .map((img) => img.id)
          .filter((imageId) => imageId > 0),
        // Include image positions for reordering
        imagePositions: existingImages
          .filter((img) => img.id > 0)
          .map((img, index) => ({
            id: img.id,
            position: index,
          })),
        newImages: newImages
          .map((img) => img.originFileObj)
          .filter((f): f is NonNullable<typeof f> => !!f),
      };

      await updateProductMutation.mutateAsync({ id: productId, data: productData });

      // Navigate back (success message handled by mutation)
      navigate(-1);
    } catch (_error) {
      // Error is handled by mutation's onError
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return {
    // Navigation
    navigate,
    id,

    // Form
    form,

    // Query data
    product,
    categories,
    loadingProduct,
    loadingCategories,
    updateProductMutation,

    // State
    newImages,
    existingImages,
    previewImages,
    previewVisible,
    previewImage,
    variants,
    useVariants,
    sensors,

    // Setters
    setPreviewVisible,
    setVariants,
    setUseVariants,

    // Handlers
    handleDragEnd,
    handleExistingImageRemove,
    handleImagePreview,
    handleImageChange,
    handleImageRemove,
    beforeUpload,
    handleSubmit,
    handleCancel,
  };
};
