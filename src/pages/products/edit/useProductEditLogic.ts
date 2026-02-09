import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, message } from "antd";
import {
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

export const useProductEditLogic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  // TanStack Query hooks
  const {
    data: productData,
    isLoading: loadingProduct,
  } = useProductQuery(id ? parseInt(id) : 0);
  const { data: categories = [], isLoading: loadingCategories } =
    useCategoriesQuery(true);
  const updateProductMutation = useUpdateProductMutation();

  // State
  const [product, setProduct] = useState<any>(null);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [variants, setVariants] = useState<any[]>([]);
  const [useVariants, setUseVariants] = useState(false);

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
      const data = productData;
      console.log("Product data loaded:", data);

      setProduct(data);

      // Set existing images with proper structure
      const imageItems = data.images || [];
      console.log("Image items from backend:", imageItems);

      if (imageItems.length === 0) {
        console.warn(
          "No images found in product data. Product structure:",
          Object.keys(productData),
        );
      }

      const processedImages = imageItems.map((item: any, index: number) => ({
        id: item.id || `existing-${index}`,
        url: item.url,
        alt: item.alt || `Product image ${index + 1}`,
        position: item.position !== undefined ? item.position : index,
      }));

      // Sort by position to ensure correct order
      processedImages.sort((a: any, b: any) => a.position - b.position);

      console.log("Processed images:", processedImages);
      setExistingImages(processedImages);

      // Process variants data
      const variantsData = productData.variants || [];
      console.log("Variants from backend:", variantsData);

      setVariants(variantsData);

      // Determine if using variants mode
      const hasMultipleVariants = variantsData.length > 1;
      const hasNamedVariants = variantsData.some((v: any) => v.name !== "Default");
      setUseVariants(hasMultipleVariants || hasNamedVariants);

      // Set form values with better data mapping
      // Helper to get display price: prefer product.price, else default variant price
      const getDisplayPrice = () => {
        if (productData.price) return productData.price;
        const variants = productData.variants || [];
        const defaultVariant = variants[0];
        return defaultVariant?.price || defaultVariant?.currentPrice || "";
      };

      const formValues = {
        name: productData.name || "",
        description: productData.description || "",
        content: productData.content || "",
        price: getDisplayPrice(),
        // Handle both new and old data structure for categories
        categoryId:
          productData.categories?.[0]?.id ||
          "",
        isActive:
          productData.isActive !== undefined ? productData.isActive : true,
        isFeatured:
          productData.isFeatured !== undefined ? productData.isFeatured : false,
      };

      console.log("Setting form values:", formValues);
      console.log("Product data:", data);

      form.setFieldsValue(formValues);
    }
  }, [productData, form]);

  // Handle drag end for existing images
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
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
  const handleExistingImageRemove = (imageId: any) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Preview image
  const handleImagePreview = (image: any) => {
    setPreviewImage(image.url);
    setPreviewVisible(true);
  };

  // Handle new image upload
  const handleImageChange = ({ fileList }: any) => {
    setNewImages(fileList);

    // Create preview URLs for new images
    const previews = fileList.map((file: any) => {
      if (file.originFileObj) {
        return URL.createObjectURL(file.originFileObj);
      }
      return file.url;
    });
    setPreviewImages(previews);
  };

  // Remove new image
  const handleImageRemove = (file: any) => {
    const newImageList = newImages.filter((img) => img.uid !== file.uid);
    setNewImages(newImageList);

    const newPreviews = previewImages.filter(
      (_, index) => newImages[index]?.uid !== file.uid,
    );
    setPreviewImages(newPreviews);

    return true;
  };

  // Custom upload validation
  const beforeUpload = (file: any) => {
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

  const handleSubmit = async (values: any) => {
    try {
      console.log("Form values:", values);
      console.log("Existing images:", existingImages);
      console.log("New images:", newImages);
      console.log(
        "New images originFileObj:",
        newImages.map((img) => ({
          name: img.name,
          size: img.size,
          type: img.type,
          hasOriginFileObj: !!img.originFileObj,
        })),
      );
      console.log("Variants data:", variants);

      // Use the price from variants (simplified approach)
      const finalPrice = variants[0]?.price || values.price || 0;

      // Prepare form data
      const productData = {
        name: values.name,
        description: values.description || "",
        content: values.content || "",
        ...(!useVariants ? { price: parseFloat(finalPrice) } : {}),
        categoryId: values.categoryId || null,
        isActive: values.isActive !== undefined ? values.isActive : true,
        isFeatured: values.isFeatured !== undefined ? values.isFeatured : false,
        // Include information about images to keep and new images to add
        existingImageIds: existingImages.map((img) => img.id),
        // Include image positions for reordering
        imagePositions: existingImages.map((img, index) => ({
          id: img.id,
          position: index,
        })),
        newImages: newImages.map((img) => img.originFileObj).filter(Boolean),
      };

      console.log("Submitting product data:", productData);

      await updateProductMutation.mutateAsync({ id: parseInt(id!), data: productData });
      console.log("Update success");

      // Navigate back (success message handled by mutation)
      navigate(-1);
    } catch (error) {
      console.error("Update product error:", error);
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
