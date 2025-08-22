import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Form,
  Input,
  InputNumber,
  Switch,
  Modal,
  message,
  Popconfirm,
  Tag,
  Typography,
  Divider,
  Alert,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useVariants } from "../../hooks";
import PriceManagement from "./PriceManagement";
import "./VariantDisplay.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const VariantDisplay = ({ productId, variants: initialVariants = [], onVariantsChange }) => {
  const [variants, setVariants] = useState(initialVariants);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [form] = Form.useForm();
  
  // Use variants hook
  const {
    loading,
    createVariant,
    updateVariant,
    deleteVariant,
    cleanupVariants: cleanupVariantsAPI,
  } = useVariants();

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  // Columns cho table hiển thị variants
  const columns = [
    {
      title: "Tên Variant",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <strong>{name}</strong>
          {record.name.toLowerCase() === "default" && (
            <Tag color="blue">Chính</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => <Text code>{sku}</Text>,
    },
    {
      title: "Giá hiện tại",
      key: "currentPrice",
      render: (_, record) => {
        // Logic để tìm giá hiện tại
        const getCurrentPrice = () => {
          if (!record.prices || record.prices.length === 0) {
            return 0;
          }

          const now = new Date();
          const validPrices = record.prices.filter((price) => {
            if (!price.isActive) return false;
            
            const afterStart = !price.startsAt || new Date(price.startsAt) <= now;
            const beforeEnd = !price.endsAt || new Date(price.endsAt) >= now;
            
            return afterStart && beforeEnd;
          });

          if (validPrices.length === 0) return 0;

          // Ưu tiên giá có date range, sau đó giá permanent
          const dateRangePrice = validPrices.find(p => p.startsAt && p.endsAt);
          if (dateRangePrice) return Number(dateRangePrice.amount);

          const permanentPrice = validPrices.find(p => !p.startsAt && !p.endsAt);
          if (permanentPrice) return Number(permanentPrice.amount);

          return Number(validPrices[0].amount);
        };

        const currentPrice = getCurrentPrice();
        return (
          <Space>
            <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
              {currentPrice.toLocaleString("vi-VN")}đ
            </Text>
            {record.prices && record.prices.length > 1 && (
              <Tag color="orange">{record.prices.length} giá</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditVariant(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            icon={<DollarOutlined />}
            onClick={() => handleManagePrices(record)}
          >
            Giá
          </Button>
          {variants.length > 1 && (
            <Popconfirm
              title="Bạn có chắc muốn xóa variant này?"
              onConfirm={() => handleDeleteVariant(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleAddVariant = () => {
    form.resetFields();
    setEditingVariant(null);
    setAddModalVisible(true);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    form.setFieldsValue({
      name: variant.name,
      sku: variant.sku,
      isActive: variant.isActive,
    });
    setEditModalVisible(true);
  };

  const handleSaveVariant = async (values) => {
    try {
      if (editingVariant) {
        // Update existing variant
        await updateVariant(productId, editingVariant.id, values);
        
        const updatedVariants = variants.map((v) =>
          v.id === editingVariant.id ? { ...v, ...values } : v
        );
        setVariants(updatedVariants);
        onVariantsChange?.(updatedVariants);
        
        setEditModalVisible(false);
      } else {
        // Create new variant
        await createVariant(productId, values);
        
        // Reload variants để có data đầy đủ - sử dụng API trực tiếp
        const { productsApi } = await import('../../api/products');
        const variantsResponse = await productsApi.getVariants(productId);
        setVariants(variantsResponse);
        onVariantsChange?.(variantsResponse);
        
        setAddModalVisible(false);
      }
    } catch (error) {
      console.error("Error saving variant:", error);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await deleteVariant(productId, variantId);
      
      const updatedVariants = variants.filter((v) => v.id !== variantId);
      setVariants(updatedVariants);
      onVariantsChange?.(updatedVariants);
    } catch (error) {
      console.error("Error deleting variant:", error);
    }
  };

  const handleCleanupDuplicates = async () => {
    try {
      const response = await cleanupVariantsAPI(productId);
      setVariants(response.variants);
      onVariantsChange?.(response.variants);
    } catch (error) {
      console.error("Error cleaning up variants:", error);
    }
  };

  const handleManagePrices = (variant) => {
    setSelectedVariant(variant);
    setPriceModalVisible(true);
  };

  const handlePricesUpdated = () => {
    // Refresh variants to get updated price information
    // You might want to call a function to reload variants here
    onVariantsChange?.(variants);
  };

  return (
    <Card 
      title={
        <Space>
          <SettingOutlined />
          <span>Quản lý Variants ({variants.length})</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVariant}
            disabled={loading}
          >
            Thêm Variant
          </Button>
          {variants.length > 1 && (
            <Button
              icon={<InfoCircleOutlined />}
              onClick={handleCleanupDuplicates}
              disabled={loading}
            >
              Cleanup
            </Button>
          )}
        </Space>
      }
    >
      {variants.length === 0 ? (
        <Alert
          message="Chưa có variant nào"
          description="Hãy thêm variant đầu tiên cho sản phẩm này"
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={variants}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      )}

      {/* Modal thêm variant */}
      <Modal
        title="Thêm Variant Mới"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveVariant}
        >
          <Form.Item
            name="name"
            label="Tên Variant"
            rules={[{ required: true, message: "Vui lòng nhập tên variant!" }]}
          >
            <Input placeholder="Ví dụ: Size M, Màu đỏ, ..." />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU (tùy chọn)"
          >
            <Input placeholder="Mã SKU riêng cho variant này" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Kích hoạt"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setAddModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Modal sửa variant */}
      <Modal
        title="Sửa Variant"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveVariant}
        >
          <Form.Item
            name="name"
            label="Tên Variant"
            rules={[{ required: true, message: "Vui lòng nhập tên variant!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Kích hoạt"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Price Management Modal */}
      <PriceManagement
        visible={priceModalVisible}
        onCancel={() => setPriceModalVisible(false)}
        variant={selectedVariant}
        productId={productId}
        onPricesUpdated={handlePricesUpdated}
      />
    </Card>
  );
};

export default VariantDisplay;
