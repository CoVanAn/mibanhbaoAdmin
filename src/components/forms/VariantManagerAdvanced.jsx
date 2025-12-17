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
  Table,
  Tooltip,
  Modal,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../utils";
import { productsApi } from "../../api/products";
import PriceManagementModal from "./PriceManagementModal";
import "./VariantManager.css";

const { Title, Text } = Typography;

const VariantManagerAdvanced = ({
  variants = [],
  onVariantsChange,
  product = {},
  mode = "advanced",
}) => {
  const [localVariants, setLocalVariants] = useState(variants);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [inventoryVariant, setInventoryVariant] = useState(null); // State for inventory modal
  const [priceVariant, setPriceVariant] = useState(null); // State for price management
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [inventoryForm] = Form.useForm();

  // Load variants from API
  const loadVariants = async () => {
    if (!product?.id) return;

    setLoading(true);
    try {
      const response = await productsApi.getVariants(product.id);
      const variantsData = response.variants || [];

      // The getVariants endpoint now returns everything we need (including currentPrice and inventory)
      // No need for extra API calls per variant.
      const processedVariants = variantsData.map((variant) => {
        const currentPrice = variant.currentPrice;
        let priceValue = 0;

        if (typeof currentPrice === "number") {
          priceValue = currentPrice;
        } else if (currentPrice?.amount !== undefined) {
          priceValue = Number(currentPrice.amount || 0);
        } else if (variant.prices?.length) {
          priceValue = Number(variant.prices[0]?.amount || 0);
        }

        return {
          ...variant,
          price: priceValue,
          inventory: variant.inventory || { quantity: 0, safetyStock: 0 },
        };
      });

      // Keep default first, then others by name for stable display
      const orderedVariants = processedVariants.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (a.name || "").localeCompare(b.name || "");
      });

      setLocalVariants(orderedVariants);
      onVariantsChange?.(orderedVariants);
    } catch (error) {
      console.error("Error loading variants:", error);
      message.error("Lỗi khi tải variants");
    } finally {
      setLoading(false);
    }
  };

  // Load variants when product changes
  useEffect(() => {
    if (product?.id) {
      loadVariants();
    } else {
      // For new products, show default variant
      setLocalVariants([
        {
          id: null,
          name: "Default",
          sku: "",
          price: product?.price || 0,
          isActive: true,
          isDefault: true,
        },
      ]);
    }
  }, [product?.id]);

  const handleAddVariant = async (values) => {
    if (!product?.id) {
      message.error("Cần lưu sản phẩm trước khi thêm variant");
      return;
    }

    try {
      const newVariantData = {
        name: values.name,
        sku:
          values.sku ||
          `${product?.slug || "PRODUCT"}-${values.name.toLowerCase()}`,
        isActive: values.isActive !== false,
        initialStock: values.initialStock || 0,
        safetyStock: values.safetyStock || 0,
      };

      const response = await productsApi.createVariant(
        product.id,
        newVariantData
      );

      if (response.success) {
        // Add price for the new variant
        if (values.price) {
          await productsApi.setVariantPrice(product.id, response.id, {
            amount: values.price,
          });
        }

        // Refresh variants list
        await loadVariants();

        setShowAddModal(false);
        form.resetFields();
        message.success("Thêm variant thành công!");
      }
    } catch (error) {
      console.error("Error adding variant:", error);
      message.error("Lỗi khi thêm variant");
    }
  };

  const handleEditVariant = async (values) => {
    if (!editingVariant?.id || !product?.id) {
      message.error("Dữ liệu không hợp lệ");
      return;
    }

    try {
      const updateData = {
        name: values.name,
        sku: values.sku,
        isActive: values.isActive,
      };

      await productsApi.updateVariant(
        product.id,
        editingVariant.id,
        updateData
      );

      // Refresh variants list
      await loadVariants();

      setEditingVariant(null);
      setShowAddModal(false); // Close modal
      form.resetFields();
      message.success("Cập nhật variant thành công!");
    } catch (error) {
      console.error("Error updating variant:", error);
      message.error("Lỗi khi cập nhật variant");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!product?.id) {
      message.error("Dữ liệu không hợp lệ");
      return;
    }

    try {
      await productsApi.deleteVariant(product.id, variantId);
      await loadVariants();
      message.success("Xóa variant thành công!");
    } catch (error) {
      console.error("Error deleting variant:", error);
      message.error("Lỗi khi xóa variant");
    }
  };

  const handleInventoryModalOpen = (variant) => {
    setInventoryVariant(variant);
    inventoryForm.setFieldsValue({
      quantity: variant.inventory?.quantity ?? 0,
      safetyStock: variant.inventory?.safetyStock ?? 0,
    });
  };

  const handleInventoryModalCancel = () => {
    setInventoryVariant(null);
    inventoryForm.resetFields();
  };

  const handleInventoryUpdate = async (values) => {
    if (!inventoryVariant) return;

    try {
      setLoading(true);
      await productsApi.updateVariantInventory(
        product.id,
        inventoryVariant.id,
        {
          quantity: values.quantity,
          safetyStock: values.safetyStock,
        }
      );
      message.success("Cập nhật tồn kho thành công!");
      handleInventoryModalCancel();
      await loadVariants(); // Refresh data
    } catch (error) {
      console.error("Error updating inventory:", error);
      message.error("Lỗi khi cập nhật tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceModalOpen = (variant) => {
    setPriceVariant(variant);
  };

  const handlePriceModalClose = () => {
    setPriceVariant(null);
  };

  const columns = [
    {
      title: "Tên Variant",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isDefault && (
            <Tag color="blue" size="small">
              Mặc định
            </Tag>
          )}
          {!record.isActive && (
            <Tag color="red" size="small">
              Tạm dừng
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => (
        <Text code style={{ fontSize: "12px" }}>
          {text || "Chưa có SKU"}
        </Text>
      ),
    },
    {
      title: "Giá hiện tại",
      dataIndex: "price",
      key: "price",
      render: (price) => <Text strong>{formatCurrency(price)}</Text>,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => {
        const qty =
          record.inventory?.quantity ??
          record.stock ??
          record.quantity ??
          (Array.isArray(record.inventories)
            ? record.inventories[0]?.quantity
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
      render: (_, record) => {
        const safety =
          record.inventory?.safetyStock ??
          record.safetyStock ??
          (Array.isArray(record.inventories)
            ? record.inventories[0]?.safetyStock
            : undefined);
        return safety !== undefined && safety !== null ? (
          <Tag color="blue">{Number(safety).toLocaleString()}</Tag>
        ) : (
          <Tag color="default">Không có</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          disabled={record.isDefault}
          onChange={async (checked) => {
            try {
              await productsApi.updateVariant(product.id, record.id, {
                name: record.name,
                sku: record.sku,
                isActive: checked,
              });

              // Reload variants to ensure data sync
              await loadVariants();

              message.success(
                `${checked ? "Kích hoạt" : "Tạm dừng"} variant thành công!`
              );
            } catch (error) {
              console.error("Error updating variant status:", error);
              message.error("Lỗi khi cập nhật trạng thái");
            }
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space className="variant-action-buttons">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingVariant(record);
                form.setFieldsValue({
                  ...record,
                  price: typeof record.price === "number" ? record.price : 0,
                });
                setShowAddModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Quản lý giá">
            <Button
              type="text"
              icon={<i className="fa-solid fa-tags"></i>}
              onClick={() => handlePriceModalOpen(record)}
            />
          </Tooltip>
          <Tooltip title="Quản lý tồn kho">
            <Button
              type="text"
              icon={<DatabaseOutlined />}
              onClick={() => handleInventoryModalOpen(record)}
            />
          </Tooltip>
          {!record.isDefault && (
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc muốn xóa variant này?"
              onConfirm={() => handleDeleteVariant(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Simple mode - just show price input
  if (mode === "simple") {
    const defaultVariant =
      localVariants.find((v) => v.isDefault) || localVariants[0];

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
            { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
            {
              validator: (_, value) => {
                if (
                  (value === undefined || value === null || value === "") &&
                  defaultVariant
                ) {
                  return Promise.resolve();
                }
                return Promise.resolve();
              },
            },
          ]}
          help={
            defaultVariant
              ? "Để trống nếu không muốn thay đổi giá hiện tại"
              : undefined
          }
        >
          <InputNumber
            style={{ width: "100%" }}
            value={defaultVariant?.price}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            placeholder={
              defaultVariant
                ? "Nhập giá mới (hoặc để trống)"
                : "Nhập giá sản phẩm"
            }
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
                  isDefault: true,
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

  // Advanced mode - show full variant management
  return (
    <Card
      title={
        <Space>
          <span>🔄 Quản lý Variants</span>
          <Tooltip title="Variants cho phép bạn tạo nhiều phiên bản khác nhau của sản phẩm với giá riêng">
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
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
          className="add-variant-btn"
          disabled={!product?.id}
        >
          Thêm Variant
        </Button>
      }
      className="variant-manager-advanced"
    >
      <Table
        columns={columns}
        dataSource={localVariants}
        rowKey="id"
        pagination={false}
        loading={loading}
        size="small"
        className="variants-table"
      />

      {/* Add/Edit Variant Modal */}
      <Modal
        title={editingVariant ? "Chỉnh sửa Variant" : "Thêm Variant mới"}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setEditingVariant(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingVariant ? handleEditVariant : handleAddVariant}
          initialValues={{
            isActive: true,
            price: 0,
            initialStock: 0,
            safetyStock: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Tên Variant"
            rules={[{ required: true, message: "Vui lòng nhập tên variant!" }]}
          >
            <Input placeholder="VD: Lớn, Nhỏ, Xanh, Đỏ" />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU (Mã định danh sản phẩm)"
            help="Để trống để tự động tạo SKU."
          >
            <Input placeholder="VD: BANHBAO-LON" />
          </Form.Item>
          {!editingVariant && (
            <>
              <Form.Item
                name="price"
                label="Giá ban đầu"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Giá phải là số không âm!",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập giá cho variant này"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="VNĐ"
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="initialStock"
                    label="Số lượng ban đầu"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        message: "Số lượng phải là số không âm!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Số lượng trong kho"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="safetyStock"
                    label="Tồn kho an toàn"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        message: "Số lượng phải là số không âm!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Ngưỡng cảnh báo tồn kho"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch
              checkedChildren="Đang hoạt động"
              unCheckedChildren="Tạm dừng"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Price Management Modal */}
      {priceVariant && (
        <PriceManagementModal
          product={product}
          variant={priceVariant}
          open={!!priceVariant}
          onClose={handlePriceModalClose}
          onUpdate={loadVariants}
        />
      )}

      {/* Inventory Management Modal */}
      <Modal
        title={`Quản lý tồn kho cho: ${inventoryVariant?.name}`}
        open={!!inventoryVariant}
        onCancel={handleInventoryModalCancel}
        onOk={() => inventoryForm.submit()}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={inventoryForm}
          layout="vertical"
          onFinish={handleInventoryUpdate}
        >
          <Form.Item
            name="quantity"
            label="Số lượng hiện tại"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              {
                type: "number",
                min: 0,
                message: "Số lượng phải là số không âm!",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="Số lượng trong kho" />
          </Form.Item>
          <Form.Item
            name="safetyStock"
            label="Tồn kho an toàn"
            rules={[
              { required: true, message: "Vui lòng nhập tồn kho an toàn!" },
              {
                type: "number",
                min: 0,
                message: "Số lượng phải là số không âm!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Ngưỡng cảnh báo tồn kho thấp"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VariantManagerAdvanced;
