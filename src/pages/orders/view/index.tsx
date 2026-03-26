import { useState, useEffect } from "react";
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
  Input,
  Alert,
  Timeline,
} from "antd";
import {
  CalendarOutlined,
  SaveOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useOrderQuery,
  useOrderStatusHistoryQuery,
  useUpdateOrderNoteMutation,
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
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../../utils/orderHelpers";
import { OrderActions } from "./components";
import { getItemColumns } from "./utils";

const { Text } = Typography;
const { TextArea } = Input;

const OrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  // State
  const [internalNote, setInternalNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Queries
  const { data: order, isLoading, error, isError } = useOrderQuery(orderId);
  const { data: statusHistory } = useOrderStatusHistoryQuery(orderId);

  // Mutations
  const updateNoteMutation = useUpdateOrderNoteMutation();

  // Initialize internal note when order loads
  useEffect(() => {
    if (order?.internalNote !== undefined) {
      setInternalNote(order.internalNote || "");
    }
  }, [order]);

  // Handlers
  const handleBack = () => {
    navigate("/orders");
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

  const hasPaidPayment =
    order.payments?.some((payment) => payment.status === "PAID") ?? false;

  const itemColumns = getItemColumns();

  return (
    <div style={{ padding: 16 }}>
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
        <Col span={16}>
          <Card size="small" title="Khách hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Tên">
                <Text strong>{getCustomerName(order)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {getCustomerPhone(order)}
              </Descriptions.Item>
              {order.user?.email && (
                <Descriptions.Item label="Email" span={2}>
                  {order.user.email}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card size="small">
            <Table
              columns={itemColumns}
              dataSource={order.items || []}
              rowKey="id"
              pagination={false}
            />

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Space direction="vertical" size={0}>
                <Text type="secondary">
                  Tạm tính: {formatCurrencyVND(order.itemsSubtotal)}
                </Text>
                <Text type="secondary">
                  Phí ship: {formatCurrencyVND(order.shippingFee)}
                </Text>
                {order.discount > 0 && (
                  <Text type="danger">
                    Giảm giá: -{formatCurrencyVND(order.discount)}
                  </Text>
                )}
                <Text strong style={{ fontSize: 16 }}>
                  Tổng: {formatCurrencyVND(order.total)}
                </Text>
              </Space>
            </div>
          </Card>

          {/* Delivery/Pickup Information */}
          <Card
            title={
              order.method === "DELIVERY"
                ? "Thông tin giao hàng"
                : "Thông tin nhận hàng"
            }
            style={{ marginBottom: 24, marginTop: 16 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Phương thức: </Text>
                {FULFILLMENT_METHOD_CONFIG[order.method].label}
              </div>

              {order.method === "DELIVERY" && order.address && (
                <div>
                  <Text strong>Địa chỉ giao hàng: </Text>
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
        <Col span={8}>
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
          <OrderActions
            orderId={orderId}
            status={order.status}
            hasPaidPayment={hasPaidPayment}
          />
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
        </Col>
      </Row>
    </div>
  );
};

export default OrderView;
