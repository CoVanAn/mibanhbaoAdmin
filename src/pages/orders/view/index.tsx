import { useState } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Row,
  Col,
  Timeline,
  Select,
  Modal,
  Input,
  Divider,
  Avatar,
  Alert,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  SaveOutlined,
  StopOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useOrderQuery,
  useOrderStatusHistoryQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderNoteMutation,
  useCancelOrderMutation,
} from "../../../hooks/useOrderQuery";
import { PageHeader, Loading } from "../../../components/common";
import {
  FULFILLMENT_METHOD_CONFIG,
  PAYMENT_STATUS_CONFIG,
  formatCurrencyVND,
  formatDateTime,
  getCustomerName,
  getCustomerPhone,
  getFullAddress,
  getAvailableStatuses,
  getOrderStatusColor,
  getOrderStatusLabel,
  canCancelOrder,
  canRefundOrder,
} from "../../../utils/orderHelpers";
import type { OrderItem } from "../../../schema/order.schema";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  // State
  const [internalNote, setInternalNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Queries
  const { data: order, isLoading, error, isError } = useOrderQuery(orderId);
  const { data: statusHistory } = useOrderStatusHistoryQuery(orderId);

  // Mutations
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateNoteMutation = useUpdateOrderNoteMutation();
  const cancelOrderMutation = useCancelOrderMutation();

  // Initialize internal note when order loads
  useState(() => {
    if (order?.internalNote) {
      setInternalNote(order.internalNote);
    }
  });

  // Handlers
  const handleBack = () => {
    navigate("/orders");
  };

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

  const handleSaveNote = () => {
    updateNoteMutation.mutate(
      {
        id: orderId,
        payload: { internalNote },
      },
      {
        onSuccess: () => {
          setIsEditingNote(false);
        },
      },
    );
  };

  if (isLoading) return <Loading />;

  if (isError || !order) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <PageHeader title="Chi tiết đơn hàng" onBack={handleBack} />
        <Alert
          message="Lỗi tải chi tiết đơn hàng"
          description={
            error instanceof Error
              ? error.message
              : "Không thể tải chi tiết đơn hàng. Vui lòng thử lại."
          }
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              Quay lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      </div>
    );
  }

  const availableStatuses = getAvailableStatuses(order.status);
  const canCancel = canCancelOrder(order.status);
  const canRefund = canRefundOrder(order.status);

  // Table columns for order items
  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: "40%",
      render: (_: any, item: OrderItem) => (
        <Space>
          {item.image && <Avatar src={item.image} size={50} shape="square" />}
          <div>
            <Text strong>{item.name}</Text>
            {item.variant && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {item.variant}
                </Text>
              </div>
            )}
            {item.sku && (
              <div>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  SKU: {item.sku}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => formatCurrencyVND(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right" as const,
      render: (total: number) => <Text strong>{formatCurrencyVND(total)}</Text>,
    },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <PageHeader
        title={`Chi tiết đơn hàng ${order.code}`}
        subtitle={`Tạo lúc: ${formatDateTime(order.createdAt)}`}
        onBack={handleBack}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />}>In hóa đơn</Button>
          </Space>
        }
      />

      <Row gutter={24}>
        {/* Left Column */}
        <Col span={16}>
          {/* Customer Information */}
          <Card title="Thông tin khách hàng" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item
                label={
                  <>
                    <UserOutlined />
                  </>
                }
                span={2}
              >
                <Text strong>{getCustomerName(order)}</Text>
              </Descriptions.Item>
              {order.user?.email && (
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined />
                    </>
                  }
                >
                  {order.user.email}
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined />
                  </>
                }
              >
                {getCustomerPhone(order)}
              </Descriptions.Item>
              {/* {order.user?.id && (
                <Descriptions.Item label="User ID" span={2}>
                  <Tag color="blue">#{order.user.id}</Tag>
                </Descriptions.Item>
              )} */}
            </Descriptions>
          </Card>

          {/* Order Items */}
          <Card title="Sản phẩm đã đặt" style={{ marginBottom: 24 }}>
            <Table
              columns={itemColumns}
              dataSource={order.items || []}
              rowKey="id"
              pagination={false}
              footer={() => (
                <div>
                  <Row justify="end" style={{ marginTop: 16 }}>
                    <Col span={8}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Row justify="space-between">
                          <Text>Tạm tính:</Text>
                          <Text>{formatCurrencyVND(order.itemsSubtotal)}</Text>
                        </Row>
                        <Row justify="space-between">
                          <Text>Phí vận chuyển:</Text>
                          <Text>{formatCurrencyVND(order.shippingFee)}</Text>
                        </Row>
                        {order.discount > 0 && (
                          <Row justify="space-between">
                            <Text>Giảm giá:</Text>
                            <Text type="danger">
                              -{formatCurrencyVND(order.discount)}
                            </Text>
                          </Row>
                        )}
                        <Divider style={{ margin: "8px 0" }} />
                        <Row justify="space-between">
                          <Text strong style={{ fontSize: "16px" }}>
                            Tổng cộng:
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: "16px", color: "#cf1322" }}
                          >
                            {formatCurrencyVND(order.total)}
                          </Text>
                        </Row>
                      </Space>
                    </Col>
                  </Row>
                </div>
              )}
            />
          </Card>

          {/* Delivery/Pickup Information */}
          <Card
            title={
              order.method === "DELIVERY"
                ? "Thông tin giao hàng"
                : "Thông tin nhận hàng"
            }
            style={{ marginBottom: 24 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Phương thức: </Text>
                <Tag color={FULFILLMENT_METHOD_CONFIG[order.method].color}>
                  {FULFILLMENT_METHOD_CONFIG[order.method].icon}{" "}
                  {FULFILLMENT_METHOD_CONFIG[order.method].label}
                </Tag>
              </div>

              {order.method === "DELIVERY" && order.address && (
                <div>
                  <Text strong>
                    <EnvironmentOutlined /> Địa chỉ giao hàng:
                  </Text>
                  <br />
                  <Text>{getFullAddress(order.address)}</Text>
                </div>
              )}

              {order.pickupAt && (
                <div>
                  <Text strong>
                    <CalendarOutlined /> Thời gian lấy hàng:
                  </Text>
                  <br />
                  <Text>{formatDateTime(order.pickupAt)}</Text>
                </div>
              )}

              {order.scheduledAt && (
                <div>
                  <Text strong>
                    <CalendarOutlined /> Thời gian giao hàng:
                  </Text>
                  <br />
                  <Text>{formatDateTime(order.scheduledAt)}</Text>
                </div>
              )}
            </Space>
          </Card>

          {/* Notes */}
          <Card title="Ghi chú" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {order.customerNote && (
                <div>
                  <Text strong>Ghi chú từ khách hàng:</Text>
                  <div
                    style={{
                      background: "#fafafa",
                      padding: "12px",
                      borderRadius: "4px",
                      marginTop: "8px",
                    }}
                  >
                    <Text>{order.customerNote}</Text>
                  </div>
                </div>
              )}

              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Ghi chú nội bộ:</Text>
                  {!isEditingNote && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setIsEditingNote(true)}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
                {isEditingNote ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <TextArea
                      rows={4}
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Nhập ghi chú nội bộ..."
                      maxLength={500}
                    />
                    <Space>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveNote}
                        loading={updateNoteMutation.isPending}
                      >
                        Lưu
                      </Button>
                      <Button onClick={() => setIsEditingNote(false)}>
                        Hủy
                      </Button>
                    </Space>
                  </Space>
                ) : (
                  <div
                    style={{
                      background: "#fafafa",
                      padding: "12px",
                      borderRadius: "4px",
                      minHeight: "60px",
                    }}
                  >
                    <Text>{internalNote || "Chưa có ghi chú nội bộ"}</Text>
                  </div>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column */}
        <Col span={8}>
          {/* Status Timeline */}
          <Card title="Lịch sử trạng thái" style={{ marginBottom: 24 }}>
            <Timeline>
              {statusHistory?.map((history: any) => (
                <Timeline.Item
                  key={history.id}
                  color={getOrderStatusColor(history.toStatus)}
                >
                  <div>
                    <Tag color={getOrderStatusColor(history.toStatus)}>
                      {getOrderStatusLabel(history.toStatus)}
                    </Tag>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatDateTime(history.createdAt)}
                      </Text>
                    </div>
                    {history.changedBy && (
                      <div>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Bởi:{" "}
                          {history.changedBy.name || history.changedBy.email}
                        </Text>
                      </div>
                    )}
                    {history.reason && (
                      <div>
                        <Text style={{ fontSize: "12px" }}>
                          Lý do: {history.reason}
                        </Text>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <Card title="Thông tin thanh toán" style={{ marginBottom: 24 }}>
              {order.payments.map((payment) => (
                <Space
                  key={payment.id}
                  direction="vertical"
                  style={{ width: "100%" }}
                >
                  <Row justify="space-between">
                    <Text>Nhà cung cấp:</Text>
                    <Tag>{payment.provider}</Tag>
                  </Row>
                  <Row justify="space-between">
                    <Text>Trạng thái:</Text>
                    <Tag color={PAYMENT_STATUS_CONFIG[payment.status].color}>
                      {PAYMENT_STATUS_CONFIG[payment.status].label}
                    </Tag>
                  </Row>
                  <Row justify="space-between">
                    <Text>Số tiền:</Text>
                    <Text strong>{formatCurrencyVND(payment.amount)}</Text>
                  </Row>
                  {payment.paidAt && (
                    <Row justify="space-between">
                      <Text>Thanh toán lúc:</Text>
                      <Text>{formatDateTime(payment.paidAt)}</Text>
                    </Row>
                  )}
                </Space>
              ))}
            </Card>
          )}

          {/* Coupon Information */}
          {order.coupon && (
            <Card title="Mã giảm giá" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Row justify="space-between">
                  <Text>Mã:</Text>
                  <Tag color="green">{order.coupon.code}</Tag>
                </Row>
                <Row justify="space-between">
                  <Text>Loại:</Text>
                  <Text>{order.coupon.type}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Giá trị:</Text>
                  <Text strong>
                    {order.coupon.type === "PERCENTAGE"
                      ? `${order.coupon.value}%`
                      : formatCurrencyVND(order.coupon.value)}
                  </Text>
                </Row>
              </Space>
            </Card>
          )}

          {/* Actions */}
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
        </Col>
      </Row>

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
    </div>
  );
};

export default OrderView;
