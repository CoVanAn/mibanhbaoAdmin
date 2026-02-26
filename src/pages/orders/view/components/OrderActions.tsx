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
} from "antd";
import { StopOutlined, DollarOutlined } from "@ant-design/icons";
import {
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} from "../../../../hooks/useOrderQuery";
import {
  getAvailableStatuses,
  getOrderStatusColor,
  getOrderStatusLabel,
  canCancelOrder,
  canRefundOrder,
} from "../../../../utils/orderHelpers";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface OrderActionsProps {
  orderId: number;
  status: string;
}

const OrderActions = ({ orderId, status }: OrderActionsProps) => {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const cancelOrderMutation = useCancelOrderMutation();

  const availableStatuses = getAvailableStatuses(status as any);
  const canCancel = canCancelOrder(status as any);
  const canRefund = canRefundOrder(status as any);

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

          {/* Refund (Future) */}
          {canRefund && (
            <Button
              block
              icon={<DollarOutlined />}
              onClick={() => {
                // TODO: Implement refund
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
    </>
  );
};

export default OrderActions;
