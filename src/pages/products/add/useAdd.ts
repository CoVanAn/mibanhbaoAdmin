import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import { useCreateProductMutation } from "../../../hooks/useProductQuery";
import { useCategoriesQuery } from "../../../hooks/useCategoryQuery";

export const useProductAddLogic = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // TanStack Query hooks
  const createProductMutation = useCreateProductMutation();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategoriesQuery(true);

  // State
  const [images, setImages] = useState<any[]>([]);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [useVariants, setUseVariants] = useState(false);

  // Handle image upload
  const handleImageChange = ({ fileList }: any) => {
    setImages(fileList);

    // Create preview URLs
    const previews = fileList.map((file: any) => {
      if (file.originFileObj) {
        return URL.createObjectURL(file.originFileObj);
      }
      return file.url;
    });
    setPreviewImages(previews);
  };

  // Remove image
  const handleImageRemove = (file: any) => {
    const newImages = images.filter((img) => img.uid !== file.uid);
    setImages(newImages);

    const newPreviews = previewImages.filter(
      (_, index) => images[index]?.uid !== file.uid,
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
      // Prepare form data
      const productData: any = {
        name: values.name,
        description: values.description,
        content: values.content,
        categoryId: values.categoryId,
        isActive: values.isActive !== false,
        isFeatured: values.isFeatured || false,
        images: images.map((img: any) => img.originFileObj).filter(Boolean),
      };

      // Handle pricing based on variant mode
      if (useVariants && variants.length > 0) {
        // Use first variant price as product price for backend compatibility
        productData.price = variants[0]?.price || 0;
        productData.variants = variants;
      } else {
        // Simple pricing mode
        productData.price = values.price;
        // Include initial quantity and safety stock
        if (
          values.quantity !== undefined &&
          values.quantity !== null &&
          values.quantity !== ""
        ) {
          productData.quantity = Number(values.quantity);
        }
        if (
          values.safetyStock !== undefined &&
          values.safetyStock !== null &&
          values.safetyStock !== ""
        ) {
          productData.safetyStock = Number(values.safetyStock);
        }
      }

      console.log("Submitting product data:", productData);

      const result = await createProductMutation.mutateAsync(productData);
      console.log("Product created:", result);

      navigate("/products");
    } catch (error) {
      console.error("Create product error:", error);
      // Error is handled by mutation's onError
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return {
    // Navigation
    navigate,

    // Form
    form,

    // Query data
    categories,
    loadingCategories,
    createProductMutation,

    // State
    images,
    previewImages,
    variants,
    useVariants,

    // Setters
    setVariants,
    setUseVariants,

    // Handlers
    handleImageChange,
    handleImageRemove,
    beforeUpload,
    handleSubmit,
    handleCancel,
  };
};
