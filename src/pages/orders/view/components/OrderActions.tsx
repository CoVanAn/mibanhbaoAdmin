import { useState } from "react";
import {
  Card,
  Tag,
  Space,
  Button,
  Typography,
  Select,
  Modal,
  Input,
  InputNumber,
} from "antd";
import { StopOutlined, DollarOutlined } from "@ant-design/icons";
import {
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useProcessRefundMutation,
} from "../../../../hooks/useOrderQuery";
import {
  getAvailableStatuses,
  getOrderStatusColor,
  getOrderStatusLabel,
  canCancelOrder,
  canRefundOrder,
} from "../../../../utils/orderHelpers";
import type { OrderStatus, Order } from "../../../../schema/order.schema";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface OrderActionsProps {
  orderId: number;
  status: OrderStatus;
  method: Order["method"];
  hasPaidPayment: boolean;
}

const OrderActions = ({
  orderId,
  status,
  method,
  hasPaidPayment,
}: OrderActionsProps) => {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const processRefundMutation = useProcessRefundMutation();

  const availableStatuses = getAvailableStatuses(status, method);
  const canCancel = canCancelOrder(status);
  const canRefund = canRefundOrder(status) && hasPaidPayment;

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) return;

    cancelOrderMutation.mutate(
      {
        id: orderId,
        payload: { reason: cancelReason },
      },
      {
        onSuccess: () => {
          setCancelModalVisible(false);
          setCancelReason("");
        },
      },
    );
  };

  const handleProcessRefund = () => {
    processRefundMutation.mutate(
      {
        id: orderId,
        payload: {
          reason: refundReason.trim() || undefined,
          amount: refundAmount ?? undefined,
        },
      },
      {
        onSuccess: () => {
          setRefundModalVisible(false);
          setRefundReason("");
          setRefundAmount(null);
        },
      },
    );
  };

  return (
    <>
      <Card title="Thao tác" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Status Change */}
          {availableStatuses.length > 0 && (
            <div>
              <Text strong style={{ marginBottom: 8, display: "block" }}>
                Thay đổi trạng thái:
              </Text>
              <Select
                style={{ width: "100%", fontSize: "24px" }}
                placeholder="Chọn trạng thái mới"
                onChange={(value) => {
                  if (value === "CANCELED") {
                    setCancelModalVisible(true);
                  } else {
                    updateStatusMutation.mutate({
                      id: orderId,
                      payload: {
                        status: value,
                      },
                    });
                  }
                }}
              >
                {availableStatuses.map((status) => (
                  <Option key={status} value={status}>
                    <Tag
                      color={getOrderStatusColor(status)}
                      style={{ fontSize: "16px" }}
                    >
                      {getOrderStatusLabel(status)}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <Button
              danger
              block
              icon={<StopOutlined />}
              onClick={() => setCancelModalVisible(true)}
            >
              Hủy đơn hàng
            </Button>
          )}

          {/* Refund */}
          {canRefund && (
            <Button
              block
              icon={<DollarOutlined />}
              onClick={() => {
                setRefundModalVisible(true);
              }}
            >
              Hoàn tiền
            </Button>
          )}
        </Space>
      </Card>

      {/* Cancel Order Modal */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={cancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
        }}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
        confirmLoading={cancelOrderMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text type="danger">
            Bạn có chắc chắn muốn hủy đơn hàng này không?
          </Text>
          <div>
            <Text strong>Lý do hủy (bắt buộc):</Text>
            <TextArea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              maxLength={500}
              required
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Xác nhận hoàn tiền"
        open={refundModalVisible}
        onOk={handleProcessRefund}
        onCancel={() => {
          setRefundModalVisible(false);
          setRefundReason("");
          setRefundAmount(null);
        }}
        okText="Xác nhận hoàn tiền"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
        confirmLoading={processRefundMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text type="danger">
            Hệ thống sẽ chuyển trạng thái đơn hàng và thanh toán sang Đã hoàn
            tiền.
          </Text>

          <div>
            <Text strong>Lý do hoàn tiền (không bắt buộc):</Text>
            <TextArea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Nhập lý do hoàn tiền..."
              maxLength={500}
            />
          </div>

          <div>
            <Text strong>Số tiền hoàn (không bắt buộc):</Text>
            <InputNumber
              style={{ width: "100%", marginTop: 8 }}
              min={1}
              value={refundAmount}
              onChange={(value) => setRefundAmount(value)}
              placeholder="Để trống để hoàn toàn bộ"
              formatter={(value) =>
                value
                  ? `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`
                  : ""
              }
              parser={(value) => {
                if (!value) return Number.NaN;
                const parsed = Number(value.replace(/[^0-9]/g, ""));
                return Number.isNaN(parsed) ? Number.NaN : parsed;
              }}
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default OrderActions;
