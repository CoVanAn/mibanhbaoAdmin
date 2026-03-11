import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Button,
  Space,
  Form,
  InputNumber,
  DatePicker,
  Switch,
  Popconfirm,
  Tag,
  Typography,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useVariants } from "../../hooks/useVariants";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const PriceManagement = ({
  visible,
  onCancel,
  variant,
  productId,
  onPricesUpdated,
}) => {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    loading,
    getVariantPrices,
    setVariantPrice,
    updateVariantPrice,
    deleteVariantPrice,
  } = useVariants();

  useEffect(() => {
    if (visible && variant?.id) {
      loadPrices();
    }
  }, [visible, variant?.id]);

  const loadPrices = async () => {
    try {
      const response = await getVariantPrices(productId, variant.id);
      // Backend trả về { prices: [...] }, chúng ta cần lấy array từ response.prices
      const pricesArray = response?.prices || response || [];
      setPrices(Array.isArray(pricesArray) ? pricesArray : []);
    } catch (error) {
      console.error("Error loading prices:", error);
      setPrices([]); // Set về empty array khi có lỗi
    }
  };

  const getCurrentPrice = () => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) return 0;

    const now = new Date();
    const validPrices = prices.filter((price) => {
      if (!price.isActive) return false;

      const afterStart = !price.startsAt || new Date(price.startsAt) <= now;
      const beforeEnd = !price.endsAt || new Date(price.endsAt) >= now;

      return afterStart && beforeEnd;
    });

    if (validPrices.length === 0) return 0;

    // Ưu tiên giá có date range, sau đó giá permanent
    const dateRangePrice = validPrices.find((p) => p.startsAt && p.endsAt);
    if (dateRangePrice) return Number(dateRangePrice.amount);

    const permanentPrice = validPrices.find((p) => !p.startsAt && !p.endsAt);
    if (permanentPrice) return Number(permanentPrice.amount);

    return Number(validPrices[0].amount);
  };

  const handleAddPrice = () => {
    form.resetFields();
    setEditingPrice(null);
    setAddModalVisible(true);
  };

  const handleEditPrice = (price) => {
    setEditingPrice(price);
    form.setFieldsValue({
      amount: price.amount,
      isActive: price.isActive,
      dateRange:
        price.startsAt && price.endsAt
          ? [dayjs(price.startsAt), dayjs(price.endsAt)]
          : null,
    });
    setEditModalVisible(true);
  };

  const handleSavePrice = async (values) => {
    try {
      const priceData = {
        amount: values.amount,
        isActive: values.isActive ?? true,
        startsAt: values.dateRange?.[0]?.toISOString() || null,
        endsAt: values.dateRange?.[1]?.toISOString() || null,
      };

      if (editingPrice) {
        await updateVariantPrice(productId, variant.id, {
          ...priceData,
          priceId: editingPrice.id,
        });
        setEditModalVisible(false);
      } else {
        await setVariantPrice(productId, variant.id, priceData);
        setAddModalVisible(false);
      }

      await loadPrices();
      onPricesUpdated?.();
      form.resetFields();
    } catch (error) {
      console.error("Error saving price:", error);
    }
  };

  const handleDeletePrice = async (priceId) => {
    try {
      await deleteVariantPrice(productId, variant.id, priceId);
      await loadPrices();
      onPricesUpdated?.();
    } catch (error) {
      console.error("Error deleting price:", error);
    }
  };

  const columns = [
    {
      title: "Giá",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
          {Number(amount).toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "Thời gian áp dụng",
      key: "timeRange",
      render: (_, record) => {
        if (!record.startsAt && !record.endsAt) {
          return <Tag color="green">Vĩnh viễn</Tag>;
        }

        return (
          <Space direction="vertical" size="small">
            {record.startsAt && (
              <Text type="secondary">
                Từ: {dayjs(record.startsAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            )}
            {record.endsAt && (
              <Text type="secondary">
                Đến: {dayjs(record.endsAt).format("DD/MM/YYYY HH:mm")}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const isCurrentlyActive =
          record.isActive &&
          (!record.startsAt || new Date(record.startsAt) <= now) &&
          (!record.endsAt || new Date(record.endsAt) >= now);

        if (isCurrentlyActive) {
          return <Tag color="green">Đang áp dụng</Tag>;
        } else if (!record.isActive) {
          return <Tag color="red">Tạm dừng</Tag>;
        } else if (record.startsAt && new Date(record.startsAt) > now) {
          return <Tag color="blue">Chưa đến thời gian</Tag>;
        } else if (record.endsAt && new Date(record.endsAt) < now) {
          return <Tag color="gray">Đã hết hạn</Tag>;
        }

        return <Tag color="orange">Không xác định</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPrice(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa giá này?"
            onConfirm={() => handleDeletePrice(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <span>Quản lý giá - {variant?.name}</span>
          </Space>
        }
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Đóng
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message={
              <Space>
                <Text>Giá hiện tại:</Text>
                <Text strong style={{ color: "#1890ff", fontSize: "18px" }}>
                  {getCurrentPrice().toLocaleString("vi-VN")}đ
                </Text>
              </Space>
            }
            type="info"
            showIcon
          />

          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPrice}
              disabled={loading}
            >
              Thêm giá mới
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={Array.isArray(prices) ? prices : []}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            locale={{
              emptyText: "Chưa có giá nào được thiết lập",
            }}
          />
        </Space>
      </Modal>

      <Modal
        title="Thêm giá mới"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePrice}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="amount"
            label="Giá"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng (tùy chọn)"
            extra="Để trống nếu muốn áp dụng vĩnh viễn"
          >
            <RangePicker
              style={{ width: "100%" }}
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setAddModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm
            </Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="Sửa giá"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSavePrice}>
          <Form.Item
            name="amount"
            label="Giá"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập giá"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng (tùy chọn)"
            extra="Để trống nếu muốn áp dụng vĩnh viễn"
          >
            <RangePicker
              style={{ width: "100%" }}
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default PriceManagement;
