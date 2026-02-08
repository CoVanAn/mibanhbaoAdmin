import { useState } from "react";
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
  Tabs,
} from "antd";
import {
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../hooks/useProductQuery";
import { useCategoriesQuery } from "../../../hooks/useCategoryQuery";
import { PageHeader } from "../../../components/common";
import RichTextEditor from "../../../components/forms/RichTextEditor";
import { validationRules } from "../../../utils";
import VariantManagerAdvanced from "../../../components/forms/VariantManagerAdvanced";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { Dragger } = Upload;

const ProductsAdd = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // TanStack Query hooks
  const createProductMutation = useCreateProductMutation();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategoriesQuery(true);

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

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Thêm sản phẩm mới"
        subtitle="Tạo sản phẩm mới trong hệ thống"
        onBack={() => navigate("/products")}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createProductMutation.isPending}
              onClick={() => form.submit()}
            >
              Lưu sản phẩm
            </Button>
          </Space>
        }
      />

      <Row gutter={24}>
        {/* Main Form */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin cơ bản">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                isActive: true,
                isFeatured: false,
              }}
            >
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[validationRules.required as any]}
              >
                <Input placeholder="Nhập tên sản phẩm" size="large" />
              </Form.Item>

              <Form.Item label="Mô tả ngắn" name="description">
                <TextArea
                  placeholder="Mô tả ngắn về sản phẩm (hiển thị trong danh sách)"
                  rows={3}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item label="Nội dung chi tiết" name="content">
                <RichTextEditor placeholder="Nội dung chi tiết (hỗ trợ đậm/ nghiêng/ danh sách)" />
              </Form.Item>

              <Divider orientation="left">💰 Giá & Variants</Divider>

              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Space>
                    <Switch
                      checked={useVariants}
                      onChange={setUseVariants}
                      checkedChildren="Nhiều variants"
                      unCheckedChildren="Giá đơn giản"
                    />
                    <span style={{ color: "#666" }}>
                      {useVariants
                        ? "Sử dụng variants để tạo nhiều phiên bản sản phẩm"
                        : "Sử dụng một giá cố định"}
                    </span>
                  </Space>
                </div>

                {!useVariants ? (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Giá sản phẩm (VNĐ)"
                          name="price"
                          rules={[
                            validationRules.required as any,
                            {
                              pattern: /^\d+(\.\d{1,2})?$/,
                              message: "Giá phải là số hợp lệ",
                            },
                          ]}
                        >
                          <Input
                            placeholder="0"
                            size="large"
                            suffix="VNĐ"
                            type="number"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
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
                    </Row>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Số lượng ban đầu"
                          name="quantity"
                          tooltip="Số lượng tồn kho ban đầu cho sản phẩm"
                        >
                          <Input
                            placeholder="0"
                            size="large"
                            type="number"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Mức cảnh báo tồn kho"
                          name="safetyStock"
                          tooltip="Cảnh báo khi số lượng dưới mức này"
                        >
                          <Input
                            placeholder="0"
                            size="large"
                            type="number"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <div>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
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
                    </Row>

                    <VariantManagerAdvanced
                      variants={variants as never[]}
                      onVariantsChange={setVariants}
                      product={{ slug: form.getFieldValue("name") }}
                      mode="advanced"
                    />
                  </div>
                )}
              </Space>

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

        {/* Image Upload */}
        <Col xs={24} lg={8}>
          <Card title="Hình ảnh sản phẩm">
            <Form.Item>
              <Dragger
                multiple
                listType="picture"
                fileList={images}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                beforeUpload={beforeUpload}
                accept="image/*"
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
                <Title level={5}>Xem trước</Title>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {previewImages.map((url, index) => (
                    <div key={index}>
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
            <div>
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
    </div>
  );
};

export default ProductsAdd;
