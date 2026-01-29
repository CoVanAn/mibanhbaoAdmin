import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  Form,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { productsApi } from "../../api/products";
import { formatCurrency, formatDate } from "../../utils";

const PriceManagementModal = ({
  product,
  variant,
  open,
  onClose,
  onUpdate,
}) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [form] = Form.useForm();
  const [activePriceId, setActivePriceId] = useState(null);

  const fetchPrices = async () => {
    if (!variant?.id) return;
    setLoading(true);
    try {
      const response = await productsApi.getVariantPrices(
        product.id,
        variant.id,
        { includeInactive: true },
      );
      const currentPriceId = response.currentPrice?.id;
      const normalized = (response.prices || []).slice();
      normalized.sort((a, b) => {
        if (currentPriceId) {
          if (a.id === currentPriceId) return -1;
          if (b.id === currentPriceId) return 1;
        }
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        const aHasRange = a.startsAt ? 1 : 0;
        const bHasRange = b.startsAt ? 1 : 0;
        if (aHasRange !== bHasRange) return bHasRange - aHasRange;
        if (a.startsAt || b.startsAt) {
          const aTime = a.startsAt ? new Date(a.startsAt).getTime() : 0;
          const bTime = b.startsAt ? new Date(b.startsAt).getTime() : 0;
          if (aTime !== bTime) return bTime - aTime;
        }
        const aEnds = a.endsAt ? new Date(a.endsAt).getTime() : 0;
        const bEnds = b.endsAt ? new Date(b.endsAt).getTime() : 0;
        if (aEnds !== bEnds) return bEnds - aEnds;
        return b.id - a.id;
      });
      setPrices(normalized);
      setActivePriceId(currentPriceId || null);
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      message.error("Không thể tải danh sách giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPrices();
    }
  }, [open, variant]);

  const handleOpenEditModal = (price = null) => {
    setEditingPrice(price);
    if (price) {
      form.setFieldsValue({
        amount: price.amount,
        dates:
          price.startsAt && price.endsAt
            ? [dayjs(price.startsAt), dayjs(price.endsAt)]
            : null,
        isActive: price.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingPrice(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    const priceData = {
      amount: Number(values.amount),
      isActive: values.isActive !== false,
    };

    // Only include dates if they exist
    if (values.dates && values.dates[0] && values.dates[1]) {
      priceData.startsAt = values.dates[0].toISOString();
      priceData.endsAt = values.dates[1].toISOString();
    }

    try {
      if (editingPrice) {
        // Update existing price
        await productsApi.updateVariantPrice(
          product.id,
          variant.id,
          editingPrice.id,
          priceData,
        );
        message.success("Cập nhật giá thành công!");
      } else {
        // Create new price
        await productsApi.setVariantPrice(product.id, variant.id, priceData);
        message.success("Thêm giá mới thành công!");
      }
      handleCloseEditModal();
      fetchPrices(); // Refresh price list
      onUpdate(); // Refresh variants list in parent
    } catch (error) {
      console.error("Failed to save price:", error);
      const errorMessage =
        error.response?.data?.message || "Thao tác thất bại.";
      message.error(errorMessage);
    }
  };

  const handleDeletePrice = async (priceId) => {
    try {
      await productsApi.deleteVariantPrice(product.id, variant.id, priceId);
      message.success("Xóa giá thành công!");
      fetchPrices();
      onUpdate();
    } catch (error) {
      console.error("Failed to delete price:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể xóa giá.";
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "Mức giá",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <strong>{formatCurrency(amount)}</strong>,
    },
    {
      title: "Loại giá",
      key: "type",
      render: (_, record) =>
        record.startsAt ? (
          <Tag icon={<ClockCircleOutlined />} color="blue">
            Theo lịch
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Vô thời hạn
          </Tag>
        ),
    },
    {
      title: "Trạng thái áp dụng",
      key: "current",
      render: (_, record) =>
        record.id === activePriceId ? (
          <Tag color="success">Đang áp dụng</Tag>
        ) : (
          <Tag color="default">Không</Tag>
        ),
    },
    {
      title: "Thời gian áp dụng",
      key: "period",
      render: (_, record) =>
        record.startsAt && record.endsAt
          ? `${formatDate(record.startsAt)} - ${formatDate(record.endsAt)}`
          : "Luôn áp dụng",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) =>
        isActive ? (
          <Tag color="success">Hoạt động</Tag>
        ) : (
          <Tag color="error">Vô hiệu</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa giá?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeletePrice(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Quản lý giá cho: ${variant?.name}`}
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Đóng
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenEditModal(null)}
          style={{ marginBottom: 16 }}
        >
          Thêm mức giá mới
        </Button>
        <Table
          columns={columns}
          dataSource={prices}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title={editingPrice ? "Chỉnh sửa giá" : "Thêm giá mới"}
        open={isEditModalVisible}
        onCancel={handleCloseEditModal}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="amount"
            label="Mức giá (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Thời gian áp dụng (Để trống nếu là giá vô thời hạn)"
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              showTime
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PriceManagementModal;
