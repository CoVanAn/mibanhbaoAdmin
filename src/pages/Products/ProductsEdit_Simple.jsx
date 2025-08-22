import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
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
} from "antd";
import {
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts, useCategories } from "../../hooks";
import { PageHeader } from "../../components/common";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Debug log (after state declarations)
  console.log("ProductsEdit render - updating:", updating);
  console.log("ProductsEdit render - id:", id);
  console.log("ProductsEdit render - loading:", loading);
  console.log("ProductsEdit render - product:", product);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        console.log("Loading product with ID:", id);
        const productData = await getProduct(id);
        console.log("Loaded product data:", productData);
        
        setProduct(productData);

        // Process images
        const imageItems = productData.images || [];
        const processedImages = imageItems.map((item, index) => ({
          id: item.id || `existing-${index}`,
          url: item.url,
          alt: item.alt || `Product image ${index + 1}`,
          position: item.position !== undefined ? item.position : index,
        }));

        processedImages.sort((a, b) => a.position - b.position);
        setExistingImages(processedImages);

        // Set form values - simplified without variants
        const formValues = {
          name: productData.name || "",
          description: productData.description || "",
          content: productData.content || "",
          price: productData.price || "",
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
        form.setFieldsValue(formValues);
        
      } catch (error) {
        console.error("Error loading product:", error);
        message.error("Không thể tải thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, getProduct, form]);

  const handleSubmit = async (values) => {
    console.log("=== HANDLE SUBMIT CALLED ===");
    console.log("Submit triggered with values:", values);
    
    if (updating) {
      console.log("Already updating, skipping...");
      return;
    }
    
    try {
      console.log("Form values:", values);
      console.log("Existing images:", existingImages);
      console.log("New images:", newImages);

      // Prepare form data - simplified without variants
      const productData = {
        name: values.name,
        description: values.description || "",
        content: values.content || "",
        price: parseFloat(values.price) || 0,
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

  // Image upload handlers
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể upload file hình ảnh!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleImageChange = ({ fileList }) => {
    setNewImages(fileList);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
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
        <Card>
          <Title level={4}>Không tìm thấy sản phẩm</Title>
          <Button onClick={() => navigate("/products")}>
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="products-edit">
      <PageHeader
        title="Chỉnh sửa sản phẩm"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Hủy
            </Button>
            {process.env.NODE_ENV === "development" && (
              <>
                <Button
                  type="default"
                  onClick={() => {
                    console.log("=== DEBUG INFO ===");
                    console.log("Product:", product);
                    console.log("Existing images:", existingImages);
                    console.log("Form values:", form.getFieldsValue());
                    console.log("Form errors:", form.getFieldsError());
                    console.log("Form validation status:", form.getFieldsError().filter(({ errors }) => errors.length));
                    console.log("=================");
                  }}
                >
                  Debug
                </Button>
                <Button
                  type="dashed"
                  onClick={async () => {
                    console.log("=== VALIDATION TEST ===");
                    try {
                      const values = await form.validateFields();
                      console.log("Form validation SUCCESS:", values);
                      console.log("Calling handleSubmit manually...");
                      await handleSubmit(values);
                    } catch (error) {
                      console.log("Form validation FAILED:", error);
                    }
                  }}
                >
                  Test Submit
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              disabled={updating}
              onClick={() => {
                console.log("=== UPDATE BUTTON CLICKED ===");
                console.log("updating state:", updating);
                console.log("Form instance:", form);
                console.log("Current form values:", form.getFieldsValue());
                console.log("Form errors before submit:", form.getFieldsError());
                
                if (updating) {
                  console.log("Already updating, button should be disabled!");
                  return;
                }
                
                console.log("Calling form.submit()...");
                
                // Try manual validation first
                form.validateFields()
                  .then(values => {
                    console.log("Manual validation SUCCESS:", values);
                    form.submit();
                  })
                  .catch(error => {
                    console.log("Manual validation FAILED:", error);
                  });
              }}
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
                  <div>{product.name}</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="info-item">
                  <strong>Giá hiện tại:</strong>
                  <div>
                    {product.price
                      ? `${parseInt(product.price).toLocaleString()} VNĐ`
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
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSubmit}
              onFinishFailed={(errorInfo) => {
                console.log("=== FORM VALIDATION FAILED ===");
                console.log("Error Info:", errorInfo);
                console.log("Failed fields:", errorInfo.errorFields);
              }}
            >
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: "Tên sản phẩm là bắt buộc" }]}
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

              {/* Price and Category */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    label="Giá sản phẩm" 
                    name="price"
                    rules={[{ required: true, message: "Giá sản phẩm là bắt buộc" }]}
                  >
                    <InputNumber
                      placeholder="Nhập giá sản phẩm"
                      style={{ width: "100%" }}
                      min={0}
                      step={1000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      addonAfter="VNĐ"
                      size="large"
                    />
                  </Form.Item>
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

              {/* Status Settings */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Trạng thái hoạt động"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Hiển thị"
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
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <>
                <div className="section-header">
                  <Title level={5}>
                    Hình ảnh hiện tại ({existingImages.length})
                  </Title>
                </div>

                <div className="existing-images-grid">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="image-item">
                      <div className="image-wrapper">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                        <div className="image-overlay">
                          <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                              setPreviewImage(image.url);
                              setPreviewVisible(true);
                            }}
                          />
                          <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => removeExistingImage(image.id)}
                          />
                        </div>
                      </div>
                      <div className="image-position">#{index + 1}</div>
                    </div>
                  ))}
                </div>
                <Divider />
              </>
            )}

            {/* Upload New Images */}
            <div className="section-header">
              <Title level={5}>Thêm hình ảnh mới</Title>
            </div>

            <Dragger
              fileList={newImages}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*"
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click hoặc kéo thả file vào đây để upload
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ upload nhiều file. Chỉ chấp nhận file hình ảnh.
              </p>
            </Dragger>
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
