import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Typography,
  Divider,
  Tag,
  message,
  Popconfirm,
  Collapse,
  Table,
  Tooltip,
  Modal,
} from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  InfoCircleOutlined 
} from "@ant-design/icons";
import { formatCurrency } from "../../utils";
import { productsApi } from "../../api/products";
import "./VariantManager.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const VariantManager = ({ 
  variants = [], 
  onVariantsChange, 
  product, 
  mode = 'advanced' // 'simple' or 'advanced'
}) => {
  const [localVariants, setLocalVariants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (variants.length > 0) {
      setLocalVariants(variants);
    } else if (product?.price) {
      // Auto-create default variant for simple mode
      setLocalVariants([{
        id: null,
        name: "Default",
        sku: "",
        price: product.price,
        isActive: true,
        isDefault: true
      }]);
    }
  }, [variants, product]);

  const handleAddVariant = async (values) => {
    if (!product?.id) {
      message.error('Cần lưu sản phẩm trước khi thêm variant');
      return;
    }

    try {
      const newVariantData = {
        name: values.name,
        sku: values.sku || `${product?.slug || 'PRODUCT'}-${values.name.toLowerCase()}`,
        isActive: values.isActive !== false,
        initialStock: values.initialStock || 0,
        safetyStock: values.safetyStock || 0
      };

      const response = await productsApi.createVariant(product.id, newVariantData);
      
      if (response.success) {
        // Add price for the new variant
        if (values.price) {
          await productsApi.setVariantPrice(product.id, response.id, {
            price: values.price,
            isPermanent: true
          });
        }

        // Refresh variants list
        await loadVariants();
        
        setShowAddModal(false);
        form.resetFields();
        message.success('Thêm variant thành công!');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      message.error('Lỗi khi thêm variant');
    }
  };

  const handleEditVariant = async (values) => {
    if (!editingVariant?.id || !product?.id) {
      message.error('Dữ liệu không hợp lệ');
      return;
    }

    try {
      const updateData = {
        name: values.name,
        sku: values.sku,
        isActive: values.isActive
      };

      await productsApi.updateVariant(product.id, editingVariant.id, updateData);
      
      // Update price if changed
      if (values.price !== editingVariant.price) {
        await productsApi.setVariantPrice(product.id, editingVariant.id, {
          price: values.price,
          isPermanent: true
        });
      }

      // Refresh variants list
      await loadVariants();
      
      setEditingVariant(null);
      form.resetFields();
      message.success('Cập nhật variant thành công!');
    } catch (error) {
      console.error('Error updating variant:', error);
      message.error('Lỗi khi cập nhật variant');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!product?.id) {
      message.error('Dữ liệu không hợp lệ');
      return;
    }

    try {
      await productsApi.deleteVariant(product.id, variantId);
      await loadVariants();
      message.success('Xóa variant thành công!');
    } catch (error) {
      console.error('Error deleting variant:', error);
      message.error('Lỗi khi xóa variant');
    }
  };

  // Load variants from API
  const loadVariants = async () => {
    if (!product?.id) return;
    
    try {
      const variantsData = await productsApi.getVariants(product.id);
      
      // Get prices for each variant
      const variantsWithPrices = await Promise.all(
        variantsData.map(async (variant) => {
          try {
            const priceData = await productsApi.getVariantPrices(product.id, variant.id);
            const currentPrice = priceData.find(p => p.isCurrent) || priceData[0];
            return {
              ...variant,
              price: currentPrice?.price || 0
            };
          } catch (error) {
            return {
              ...variant,
              price: 0
            };
          }
        })
      );
      
      setLocalVariants(variantsWithPrices);
      onVariantsChange?.(variantsWithPrices);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  // Load variants when product changes
  useEffect(() => {
    if (product?.id) {
      loadVariants();
    } else {
      // For new products, show default variant
      setLocalVariants([{
        id: null,
        name: "Default",
        sku: "",
        price: product?.price || 0,
        isActive: true,
        isDefault: true
      }]);
    }
  }, [product?.id]);

  const handlePriceChange = async (variantId, newPrice) => {
    if (!product?.id) return;
    
    try {
      await productsApi.setVariantPrice(product.id, variantId, {
        price: newPrice,
        isPermanent: true
      });
      
      // Update local state
      const updatedVariants = localVariants.map(v => 
        v.id === variantId ? { ...v, price: newPrice } : v
      );
      setLocalVariants(updatedVariants);
      onVariantsChange?.(updatedVariants);
    } catch (error) {
      console.error('Error updating price:', error);
      message.error('Lỗi khi cập nhật giá');
    }
  };

  const columns = [
    {
      title: 'Tên Variant',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isDefault && (
            <Tag color="blue" size="small">Mặc định</Tag>
          )}
          {!record.isActive && (
            <Tag color="red" size="small">Tạm dừng</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text) => (
        <Text code style={{ fontSize: '12px' }}>{text || 'Chưa có SKU'}</Text>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <InputNumber
          value={price}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          addonAfter="VNĐ"
          min={0}
          step={1000}
          onChange={(value) => handlePriceChange(record.id, value)}
          style={{ width: '140px' }}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          disabled={record.isDefault}
          onChange={(checked) => {
            const updatedVariants = localVariants.map(v => 
              v.id === record.id ? { ...v, isActive: checked } : v
            );
            setLocalVariants(updatedVariants);
            onVariantsChange?.(updatedVariants);
          }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingVariant(record);
                form.setFieldsValue(record);
                setShowAddModal(true);
              }}
            />
          </Tooltip>
          {!record.isDefault && (
            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa variant này?"
                description="Bạn có chắc chắn muốn xóa variant này?"
                onConfirm={() => handleDeleteVariant(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (mode === 'simple') {
    const defaultVariant = localVariants.find(v => v.isDefault) || localVariants[0];
    
    return (
      <Card
        size="small"
        title="💰 Giá sản phẩm"
        className="variant-manager-simple"
      >
        <Form.Item
          label="Giá bán"
          rules={[
            { required: !defaultVariant, message: "Vui lòng nhập giá!" },
            { 
              validator: (_, value) => {
                if ((value === undefined || value === null || value === '') && defaultVariant) {
                  return Promise.resolve();
                }
                if (value !== undefined && value !== null && value !== '' && Number(value) <= 0) {
                  return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                }
                return Promise.resolve();
              }
            }
          ]}
          help={defaultVariant ? "Để trống nếu không muốn thay đổi giá hiện tại" : undefined}
        >
          <InputNumber
            style={{ width: "100%" }}
            value={defaultVariant?.price}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            placeholder={defaultVariant ? "Nhập giá mới (hoặc để trống)" : "Nhập giá sản phẩm"}
            addonAfter="VNĐ"
            min={0}
            step={1000}
            onChange={(value) => {
              if (defaultVariant) {
                handlePriceChange(defaultVariant.id, value);
              } else {
                const newVariant = {
                  id: null,
                  name: "Default",
                  sku: "",
                  price: value,
                  isActive: true,
                  isDefault: true
                };
                setLocalVariants([newVariant]);
                onVariantsChange?.([newVariant]);
              }
            }}
          />
        </Form.Item>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <span>🔄 Quản lý Variants</span>
          <Tooltip title="Variants cho phép bạn tạo nhiều phiên bản khác nhau của sản phẩm với giá riêng">
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingVariant(null);
            form.resetFields();
            setShowAddModal(true);
          }}
        >
          Thêm Variant
        </Button>
      }
    >
      <Table
        dataSource={localVariants}
        columns={columns}
        rowKey={(record) => record.id || record.name}
        pagination={false}
        size="small"
        locale={{
          emptyText: 'Chưa có variant nào'
        }}
      />

      <Modal
        title={editingVariant ? "Chỉnh sửa Variant" : "Thêm Variant Mới"}
        open={showAddModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setShowAddModal(false);
          setEditingVariant(null);
          form.resetFields();
        }}
        okText={editingVariant ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingVariant ? handleEditVariant : handleAddVariant}
        >
          <Form.Item
            name="name"
            label="Tên Variant"
            rules={[
              { required: true, message: 'Vui lòng nhập tên variant!' },
              { min: 2, message: 'Tên variant phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Ví dụ: Size M, Màu đỏ, ..." />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU (Mã sản phẩm)"
            tooltip="Để trống để tự động tạo SKU"
          >
            <Input placeholder="Ví dụ: PRODUCT-SIZE-M" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[
              { required: true, message: 'Vui lòng nhập giá!' },
              { type: 'number', min: 0, message: 'Giá phải lớn hơn 0!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập giá variant"
              addonAfter="VNĐ"
              min={0}
              step={1000}
            />
          </Form.Item>

          <Form.Item
            name="initialStock"
            label="Số lượng ban đầu"
            initialValue={0}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng tồn kho ban đầu"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="safetyStock"
            label="Tồn kho an toàn"
            initialValue={0}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Số lượng tồn kho tối thiểu"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VariantManager;
