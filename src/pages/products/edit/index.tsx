import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Switch,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Space,
  Image,
  Spin,
  Tooltip,
  Tag,
  Table,
} from "antd";
import {
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  DragOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useParams } from "react-router-dom";
import {
  useProductQuery,
  useUpdateProductMutation,
} from "../../../hooks/useProductQuery";
import { useCategoriesQuery } from "../../../hooks/useCategoryQuery";
import { PageHeader } from "../../../components/common";
import { validationRules, formatCurrency } from "../../../utils";
import VariantManager from "../../../components/forms/VariantManager";
import VariantManagerAdvanced from "../../../components/forms/VariantManagerAdvanced";
import RichTextEditor from "../../../components/forms/RichTextEditor";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

// Sortable Image Item Component
const SortableImageItem = ({ id, image, index, onRemove, onPreview }: {
  id: any;
  image: any;
  index: number;
  onRemove: (id: any) => void;
  onPreview: (image: any) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    borderRadius: 12,
    overflow: "hidden",
    border: "2px solid",
    borderColor: isDragging ? "#1890ff" : "#f0f0f0",
    boxShadow: isDragging
      ? "0 8px 16px rgba(0,0,0,0.2)"
      : "0 2px 8px rgba(0,0,0,0.1)",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div>
        <Image
          src={image.url}
          alt={image.alt || `Product image ${index + 1}`}
          style={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            opacity: 0,
            transition: "opacity 0.2s",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              padding: 8,
            }}
          >
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onPreview(image)}
                className="action-btn preview-btn"
              />
            </Tooltip>
            <Tooltip title="Xóa ảnh">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(image.id)}
              />
            </Tooltip>
          </div>

          <div
            style={{
              padding: 8,
              cursor: "move",
              display: "flex",
              justifyContent: "center",
              color: "white",
            }}
            {...attributes}
            {...listeners}
          >
            <DragOutlined />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "#1890ff",
            color: "white",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>

        {index === 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#faad14",
              color: "white",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Ảnh chính
          </div>
        )}
      </div>
    </div>
  );
};

const ProductsEdit = () => {
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

  if (loadingProduct) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          textAlign: "center",
        }}
      >
        <Title level={3}>Không tìm thấy sản phẩm</Title>
        <Button onClick={() => navigate(-1)}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={`Chỉnh sửa: ${product.name}`}
        subtitle="Cập nhật thông tin sản phẩm"
        onBack={() => navigate(-1)}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Quay lại
            </Button>
            {process.env.NODE_ENV === "development" && (
              <Button
                type="default"
                onClick={() => {
                  console.log("=== DEBUG INFO ===");
                  console.log("Product:", product);
                  console.log("Existing images:", existingImages);
                  console.log("Form values:", form.getFieldsValue());
                  console.log("=================");
                }}
              >
                Debug
              </Button>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateProductMutation.isPending}
              onClick={() => form.submit()}
            >
              Cập nhật
            </Button>
          </Space>
        }
      />

      <Row gutter={24}>
        {/* Product Info Summary */}
        <Col xs={24}>
          <Card
            title="Thông tin sản phẩm hiện tại"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <div
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    background: "white",
                    borderRadius: 6,
                    borderLeft: "3px solid #1890ff",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#495057",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    Tên sản phẩm:
                  </strong>
                  <div>{product.name || "Chưa có"}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Giá hiện tại:</strong>
                  <div>
                    {product.currentPrice?.amount
                      ? formatCurrency(product.currentPrice.amount)
                      : "Chưa có giá"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Danh mục:</strong>
                  <div>
                    {(product.categories || [])
                      .map((cat: any) => {
                        const category = categories.find(
                          (c) => c.id === cat.categoryId,
                        );
                        return category?.name || null;
                      })
                      .filter(Boolean)
                      .join(", ") || "Chưa có"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <div>
                    {product.isActive ? (
                      <Tag color="success">Đang hoạt động</Tag>
                    ) : (
                      <Tag color="error">Tạm dừng</Tag>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Nổi bật:</strong>
                  <div>
                    {product.isFeatured ? (
                      <Tag color="purple">Nổi bật</Tag>
                    ) : (
                      "Không"
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            {product.description && (
              <Row style={{ marginTop: 12 }}>
                <Col xs={24}>
                  <div className="info-item">
                    <strong>Mô tả hiện tại:</strong>
                    <div style={{ marginTop: 4, color: "#666" }}>
                      {product.description}
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        {/* Main Form */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin cơ bản">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[validationRules.required as any]}
              >
                <Input
                  placeholder={
                    product.name
                      ? `Hiện tại: ${product.name}`
                      : "Nhập tên sản phẩm"
                  }
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Mô tả ngắn" name="description">
                <TextArea
                  placeholder={
                    product.description
                      ? `Hiện tại: ${product.description.substring(0, 100)}${
                          product.description.length > 100 ? "..." : ""
                        }`
                      : "Mô tả ngắn về sản phẩm (hiển thị trong danh sách)"
                  }
                  rows={3}
                  maxLength={200}
                  showCount
                />
              </Form.Item>
              <Form.Item label="Nội dung chi tiết" name="content">
                <RichTextEditor />
              </Form.Item>
              <Divider orientation="left">💰 Giá & Variants</Divider>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {/* Current Inventory by Variant */}
                {Array.isArray(variants) && variants.length > 0 && (
                  <>
                    <Title level={5}>Tồn kho hiện tại</Title>
                    <Table
                      dataSource={variants}
                      rowKey={(r) => r.id || r.sku}
                      size="small"
                      pagination={false}
                      columns={[
                        { title: "Tên", dataIndex: "name", key: "name" },
                        { title: "SKU", dataIndex: "sku", key: "sku" },
                        {
                          title: "Số lượng",
                          key: "quantity",
                          render: (_, r) => {
                            const qty =
                              r.inventory?.quantity ??
                              r.stock ??
                              r.quantity ??
                              (Array.isArray(r.inventories)
                                ? r.inventories[0]?.quantity
                                : undefined);
                            return qty !== undefined && qty !== null ? (
                              <Tag>{Number(qty).toLocaleString()}</Tag>
                            ) : (
                              <Tag color="default">Không có</Tag>
                            );
                          },
                        },
                        {
                          title: "Tồn kho an toàn",
                          key: "safetyStock",
                          render: (_, r) => {
                            const safety =
                              r.inventory?.safetyStock ??
                              r.safetyStock ??
                              (Array.isArray(r.inventories)
                                ? r.inventories[0]?.safetyStock
                                : undefined);
                            return safety !== undefined && safety !== null ? (
                              <Tag color="blue">
                                {Number(safety).toLocaleString()}
                              </Tag>
                            ) : (
                              <Tag color="default">Không có</Tag>
                            );
                          },
                        },
                      ]}
                      style={{ marginBottom: 12 }}
                    />
                  </>
                )}
                <div>
                  <Space>
                    <Switch
                      checked={useVariants}
                      onChange={(checked) => {
                        setUseVariants(checked);
                        if (!checked && variants.length > 0) {
                          // When switching to simple mode, keep the first variant's price
                          const firstPrice = variants[0]?.price || 0;
                          form.setFieldsValue({ price: firstPrice });
                        }
                      }}
                      checkedChildren="Nhiều variants"
                      unCheckedChildren="Giá đơn giản"
                    />
                    <span style={{ color: "#666" }}>
                      {useVariants
                        ? "Quản lý nhiều variants của sản phẩm"
                        : "Sử dụng một giá cố định"}
                    </span>
                  </Space>
                </div>

                {!useVariants ? (
                  <VariantManager
                    variants={variants as never[]}
                    product={product}
                    onVariantsChange={(newVariants: any) => {
                      setVariants(newVariants);
                      // Sync price with form
                      if (newVariants[0]?.price !== undefined) {
                        form.setFieldsValue({ price: newVariants[0].price });
                      }
                    }}
                    mode="simple"
                  />
                ) : (
                  <VariantManagerAdvanced
                    variants={variants as never[]}
                    onVariantsChange={setVariants}
                    product={product}
                    mode="advanced"
                  />
                )}
              </Space>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Danh mục" name="categoryId">
                    <Select
                      placeholder="Chọn danh mục"
                      size="large"
                      loading={loadingCategories}
                      allowClear
                    >
                      {categories.map((category) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>{" "}
              <Divider />
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Hoạt động"
                      unCheckedChildren="Ẩn"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Sản phẩm nổi bật"
                    name="isFeatured"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Nổi bật"
                      unCheckedChildren="Thường"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Image Management */}
        <Col xs={24} lg={8}>
          <Card title="Quản lý hình ảnh">
            {/* Existing Images with Drag & Drop */}
            {existingImages.length > 0 ? (
              <>
                <div className="section-header">
                  <Title level={5}>
                    Hình ảnh hiện tại ({existingImages.length})
                  </Title>
                  <Typography.Text type="secondary">
                    Kéo thả để sắp xếp thứ tự hiển thị
                  </Typography.Text>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={existingImages.map((img) => img.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="existing-images-grid">
                      {existingImages.map((image, index) => (
                        <SortableImageItem
                          key={image.id}
                          id={image.id}
                          image={image}
                          index={index}
                          onRemove={handleExistingImageRemove}
                          onPreview={handleImagePreview}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <Divider />
              </>
            ) : (
              <>
                <div className="no-images-state">
                  <div className="no-images-icon">
                    <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  </div>
                  <Title level={5} type="secondary">
                    Chưa có hình ảnh
                  </Title>
                  <Typography.Text type="secondary">
                    Sản phẩm này chưa có hình ảnh nào. Thêm hình ảnh bên dưới.
                  </Typography.Text>
                </div>
                <Divider />
              </>
            )}

            {/* Upload New Images */}
            <div className="section-header">
              <Title level={5}>Thêm hình ảnh mới</Title>
              <Typography.Text type="secondary">
                Hình đầu tiên sẽ là ảnh đại diện
              </Typography.Text>
            </div>
            <Form.Item>
              <Dragger
                multiple
                listType="picture"
                fileList={newImages}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                beforeUpload={beforeUpload}
                accept="image/*"
                className="product-upload"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Kéo thả hoặc click để upload hình ảnh
                </p>
                <p className="ant-upload-hint">
                  Hỗ trợ nhiều file. Chỉ chấp nhận file hình ảnh dưới 5MB.
                </p>
              </Dragger>
            </Form.Item>

            {previewImages.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Xem trước hình mới</Title>
                <div className="image-preview-grid">
                  {previewImages.map((url, index) => (
                    <div key={index} className="preview-item">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <Divider />
            <div className="upload-tips">
              <Title level={5}>Lưu ý:</Title>
              <ul>
                <li>Kích thước khuyến nghị: 800x800px</li>
                <li>Định dạng: JPG, PNG, WebP</li>
                <li>Dung lượng: Tối đa 5MB/file</li>
                <li>Hình đầu tiên sẽ là hình đại diện</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Image Preview Modal */}
      <Image
        style={{ display: "none" }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
          mask: <div>Xem chi tiết</div>,
        }}
      />
    </div>
  );
};

export default ProductsEdit;
