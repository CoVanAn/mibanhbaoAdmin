import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Space,
  Typography,
} from "antd";
import type { Promotion } from "../../../schema/promotion.schema";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Props {
  open: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export default function PromotionFormModal({
  open,
  promotion,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [form] = Form.useForm();
  const isEditing = !!promotion;

  useEffect(() => {
    if (open) {
      if (promotion) {
        form.setFieldsValue({
          name: promotion.name,
          type: promotion.type,
          value: promotion.value,
          dateRange:
            promotion.startsAt && promotion.endsAt
              ? [dayjs(promotion.startsAt), dayjs(promotion.endsAt)]
              : null,
          minSubtotal: promotion.minSubtotal ?? undefined,
          maxUses: promotion.maxUses ?? undefined,
          isActive: promotion.isActive,
          isGlobal: promotion.isGlobal,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          isGlobal: false,
          type: "PERCENT",
        });
      }
    }
  }, [open, promotion, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const [startsAt, endsAt] = values.dateRange
        ? [
            (values.dateRange[0] as dayjs.Dayjs).toISOString(),
            (values.dateRange[1] as dayjs.Dayjs).toISOString(),
          ]
        : [null, null];

      await onSubmit({
        name: values.name,
        type: values.type,
        value: values.value,
        startsAt,
        endsAt,
        minSubtotal: values.minSubtotal ?? null,
        maxUses: values.maxUses ?? null,
        isActive: values.isActive,
        isGlobal: values.isGlobal,
      });
    } catch {
      // validation handled by Form
    }
  };

  return (
    <Modal
      title={isEditing ? "Sửa ưu đãi" : "Thêm ưu đãi mới"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEditing ? "Lưu" : "Tạo"}
      cancelText="Hủy"
      confirmLoading={loading}
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="Tên ưu đãi"
          rules={[{ required: true, message: "Vui lòng nhập tên ưu đãi" }]}
        >
          <Input placeholder="VD: Giảm 20% dịp 30/4" />
        </Form.Item>

        <Space style={{ width: "100%" }} size={16}>
          <Form.Item
            name="type"
            label="Loại giảm giá"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select>
              <Select.Option value="PERCENT">% Phần trăm</Select.Option>
              <Select.Option value="FIXED">VND Số tiền cố định</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: "Nhập giá trị" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v!.replace(/,/g, "") as any}
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="dateRange"
          label="Thời gian áp dụng"
          rules={[{ required: true, message: "Chọn thời gian" }]}
        >
          <RangePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          />
        </Form.Item>

        <Space style={{ width: "100%" }} size={16}>
          <Form.Item
            name="minSubtotal"
            label="Đơn tối thiểu (VND)"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Không giới hạn"
              formatter={(v) =>
                `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(v) => v!.replace(/,/g, "") as any}
            />
          </Form.Item>

          <Form.Item
            name="maxUses"
            label="Lượt dùng tối đa"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Không giới hạn"
            />
          </Form.Item>
        </Space>

        <Space size={32}>
          <Form.Item
            name="isGlobal"
            label="Áp dụng toàn bộ"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>

        <Text type="secondary" style={{ fontSize: 12 }}>
          * Nếu không chọn "Toàn bộ", hãy gán sản phẩm/danh mục cụ thể sau khi
          tạo.
        </Text>
      </Form>
    </Modal>
  );
}
