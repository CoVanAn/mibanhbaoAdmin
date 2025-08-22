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
} from "antd";
import {
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  DragOutlined,
  EyeOutlined,
  SettingOutlined,
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
import { useProducts, useCategories } from "../../hooks";
import { PageHeader } from "../../components/common";
import { validationRules } from "../../utils";
import VariantManager from "../../components/forms/VariantManager";
import "./ProductsEdit.css";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

// Sortable Image Item Component
const SortableImageItem = ({ id, image, index, onRemove, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-image-item ${isDragging ? "dragging" : ""}`}
    >
      <div className="image-container">
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

        {/* Image Controls */}
        <div className="image-controls">
          <div className="image-actions">
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
                className="action-btn remove-btn"
              />
            </Tooltip>
          </div>

          <div className="drag-handle" {...attributes} {...listeners}>
            <DragOutlined />
          </div>
        </div>

        {/* Position Badge */}
        <div className="position-badge">{index + 1}</div>

        {/* Main Image Badge */}
        {index === 0 && <div className="main-badge">Ảnh chính</div>}
      </div>
    </div>
  );
};

const ProductsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { getProduct, updateProduct, updating } = useProducts();
  const { categories, loadingCategories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [variants, setVariants] = useState([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log("Loading product with ID:", id);

        const response = await getProduct(id);
        console.log("Raw API response:", response);

        const productData = response.data || response;
        console.log("Product data after extraction:", productData);

        setProduct(productData);

        // Set existing images with proper structure - backend returns 'images' array
        const imageItems = productData.images || productData.media || [];
        console.log("Image items from backend:", imageItems);

        if (imageItems.length === 0) {
          console.warn(
            "No images found in product data. Product structure:",
            Object.keys(productData)
          );
        }

        const processedImages = imageItems.map((item, index) => ({
          id: item.id || `existing-${index}`,
          url: item.url,
          alt: item.alt || `Product image ${index + 1}`,
          position: item.position !== undefined ? item.position : index,
        }));

        // Sort by position to ensure correct order
        processedImages.sort((a, b) => a.position - b.position);

        console.log("Processed images:", processedImages);
        setExistingImages(processedImages);

        // Process variants data
        const variantsData = productData.variants || [];
        console.log("Variants from backend:", variantsData);

        setVariants(variantsData);

        // Set form values with better data mapping
        const formValues = {
          name: productData.name || "",
          description: productData.description || "",
          content: productData.content || "",
          price:
            productData.price ||
            productData.variants?.[0]?.prices?.[0]?.amount ||
            "",
          // Handle both new and old data structure for categories
          categoryId:
            productData.categoryIds?.[0] ||
            productData.categories?.[0]?.categoryId ||
            productData.categories?.[0]?.id ||
            "",
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
          isFeatured:
            productData.isFeatured !== undefined
              ? productData.isFeatured
              : false,
        };

        console.log("Setting form values:", formValues);
        console.log("Product data:", productData);

        form.setFieldsValue(formValues);
      } catch (error) {
        console.error("Load product error:", error);
        message.error("Không thể tải thông tin sản phẩm!");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, getProduct, form, navigate]);

  // Handle drag end for existing images
  const handleDragEnd = (event) => {
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
  const handleExistingImageRemove = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Preview image
  const handleImagePreview = (image) => {
    setPreviewImage(image.url);
    setPreviewVisible(true);
  };

  // Handle new image upload
  const handleImageChange = ({ fileList }) => {
    setNewImages(fileList);

    // Create preview URLs for new images
    const previews = fileList.map((file) => {
      if (file.originFileObj) {
        return URL.createObjectURL(file.originFileObj);
      }
      return file.url;
    });
    setPreviewImages(previews);
  };

  // Remove new image
  const handleImageRemove = (file) => {
    const newImageList = newImages.filter((img) => img.uid !== file.uid);
    setNewImages(newImageList);

    const newPreviews = previewImages.filter(
      (_, index) => newImages[index]?.uid !== file.uid
    );
    setPreviewImages(newPreviews);

    return true;
  };

  // Custom upload validation
  const beforeUpload = (file) => {
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

  const handleSubmit = async (values) => {
    try {
      console.log("Form values:", values);
      console.log("Existing images:", existingImages);
      console.log("New images:", newImages);
      console.log("New images originFileObj:", newImages.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type,
        hasOriginFileObj: !!img.originFileObj
      })));
      console.log("Variants data:", variants);

      // Use the price from variants (simplified approach)
      const finalPrice = variants[0]?.price || values.price || 0;

      // Prepare form data
      const productData = {
        name: values.name,
        description: values.description || "",
        content: values.content || "",
        price: parseFloat(finalPrice),
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

      const result = await updateProduct(id, productData);
      console.log("Update result:", result);

      // Show success message and navigate
      message.success("Cập nhật sản phẩm thành công!");
      console.log("Navigating back to products list...");
      navigate("/products");
    } catch (error) {
      console.error("Update product error:", error);

      // More specific error handling
      if (error.response?.data?.message) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        message.error(`Có lỗi xảy ra: ${error.message}`);
      } else {
        message.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
      }
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="products-edit-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="products-edit-error">
        <Title level={3}>Không tìm thấy sản phẩm</Title>
        <Button onClick={() => navigate("/products")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="products-edit">
      <PageHeader
        title={`Chỉnh sửa: ${product.name}`}
        subtitle="Cập nhật thông tin sản phẩm"
        onBack={() => navigate("/products")}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Hủy
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
              loading={updating}
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
            className="product-summary-card"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Tên sản phẩm:</strong>
                  <div>{product.name || "Chưa có"}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Giá hiện tại:</strong>
                  <div>
                    {product.price
                      ? `${parseInt(product.price).toLocaleString()} VNĐ`
                      : product.variants?.[0]?.prices?.[0]?.amount
                      ? `${parseInt(
                          product.variants[0].prices[0].amount
                        ).toLocaleString()} VNĐ`
                      : "Chưa có giá"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Danh mục:</strong>
                  <div>
                    {product.categoryIds?.length > 0
                      ? product.categoryIds
                          .map((catId) => {
                            const cat = categories.find((c) => c.id === catId);
                            return cat?.name;
                          })
                          .filter(Boolean)
                          .join(", ")
                      : product.categories?.length > 0
                      ? product.categories
                          .map((c) => c.category?.name || c.name)
                          .filter(Boolean)
                          .join(", ")
                      : "Chưa có danh mục"}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <div>
                    <Space>
                      <span
                        style={{ color: product.isActive ? "green" : "red" }}
                      >
                        {product.isActive ? "● Hoạt động" : "● Ẩn"}
                      </span>
                      {product.isFeatured && (
                        <span style={{ color: "gold" }}>★ Nổi bật</span>
                      )}
                    </Space>
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
          <Card title="Thông tin cơ bản" className="product-form-card">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[validationRules.required]}
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
                <TextArea
                  placeholder={
                    product.content
                      ? `Hiện tại: ${product.content.substring(0, 100)}${
                          product.content.length > 100 ? "..." : ""
                        }`
                      : "Nội dung chi tiết về sản phẩm (hỗ trợ HTML)"
                  }
                  rows={6}
                  maxLength={5000}
                  showCount
                />
              </Form.Item>

              {/* Simplified Price Management */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <VariantManager
                    variants={variants}
                    product={product}
                    onVariantsChange={(newVariants) => {
                      setVariants(newVariants);
                      // Sync price with form
                      if (newVariants[0]?.price !== undefined) {
                        form.setFieldsValue({ price: newVariants[0].price });
                      }
                    }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Danh mục" name="categoryId">
                    <Select
                      placeholder="Chọn danh mục"
                      loading={loadingCategories}
                      size="large"
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
              </Row>

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
          <Card title="Quản lý hình ảnh" className="product-image-card">
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
