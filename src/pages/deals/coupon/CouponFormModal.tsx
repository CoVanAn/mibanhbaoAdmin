import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Space,
} from "antd";
import type { CouponPayload } from "../../../api/coupons";
import type { Coupon } from "../../../schema/coupon.schema";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export type CouponModalSubmitPayload =
  | CouponPayload
  | Partial<Omit<CouponPayload, "code">>;

type CouponFormFields = {
  code?: string;
  type: CouponPayload["type"];
  value: number;
  dateRange?: [Dayjs, Dayjs] | null;
  minSubtotal?: number | null;
  maxRedemptions?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
};

interface Props {
  open: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSubmit: (values: CouponModalSubmitPayload) => Promise<void>;
  loading?: boolean;
}

export default function CouponFormModal({
  open,
  coupon,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [form] = Form.useForm();
  const isEditing = !!coupon;

  // reset / prefill
  const afterOpen = (isOpen: boolean) => {
    if (!isOpen) return;
    if (coupon) {
      form.setFieldsValue({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        dateRange:
          coupon.startsAt && coupon.endsAt
            ? [dayjs(coupon.startsAt), dayjs(coupon.endsAt)]
            : null,
        minSubtotal: coupon.minSubtotal ?? undefined,
        maxRedemptions: coupon.maxRedemptions ?? undefined,
        perUserLimit: coupon.perUserLimit ?? undefined,
        isActive: coupon.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, type: "PERCENT" });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields<CouponFormFields>();
      const startsAt = values.dateRange?.[0]
        ? values.dateRange[0].toISOString()
        : null;
      const endsAt = values.dateRange?.[1]
        ? values.dateRange[1].toISOString()
        : null;

      const payload = {
        type: values.type,
        value: values.value,
        startsAt,
        endsAt,
        minSubtotal: values.minSubtotal ?? null,
        maxRedemptions: values.maxRedemptions ?? null,
        perUserLimit: values.perUserLimit ?? null,
        isActive: values.isActive,
      };

      if (isEditing) {
        await onSubmit(payload);
      } else {
        await onSubmit({
          ...payload,
          code: values.code?.toUpperCase() ?? "",
        });
      }
    } catch {
      // validation handled
    }
  };

  return (
    <Modal
      title={isEditing ? "Sửa coupon" : "Tạo coupon mới"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEditing ? "Lưu" : "Tạo"}
      cancelText="Hủy"
      confirmLoading={loading}
      width={560}
      afterOpenChange={afterOpen}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {!isEditing && (
          <Form.Item
            name="code"
            label="Mã coupon"
            rules={[
              { required: true, message: "Nhập mã coupon" },
              { max: 64, message: "Tối đa 64 ký tự" },
              {
                pattern: /^[A-Z0-9_-]+$/i,
                message: "Chỉ gồm chữ cái, số, _ và -",
              },
            ]}
          >
            <Input
              placeholder="VD: SUMMER30"
              style={{ textTransform: "uppercase" }}
              //   onChange={(e) =>
              //     form.setFieldValue("code", e.target.value.toUpperCase())
              //   }
            />
          </Form.Item>
        )}

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
              parser={(v) => Number((v ?? "").replace(/,/g, ""))}
            />
          </Form.Item>
        </Space>

        <Form.Item name="dateRange" label="Thời hạn sử dụng (tùy chọn)">
          <RangePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder={["Ngày bắt đầu", "Ngày hết hạn"]}
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
              parser={(v) => Number((v ?? "").replace(/,/g, ""))}
            />
          </Form.Item>
          <Form.Item
            name="maxRedemptions"
            label="Tổng lượt tối đa"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Không giới hạn"
            />
          </Form.Item>
        </Space>

        <Space style={{ width: "100%" }} size={16}>
          <Form.Item
            name="perUserLimit"
            label="Lượt mỗi người"
            style={{ flex: 1 }}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Không giới hạn"
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Kích hoạt"
            valuePropName="checked"
            style={{ flex: 1 }}
          >
            <Switch />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
