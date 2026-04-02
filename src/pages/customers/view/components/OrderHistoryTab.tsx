import { Table, Tag, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { CustomerOrderSummary } from "../../../../schema/customer.schema";
import {
  formatCurrencyVND,
  formatDateTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../../../utils/orderHelpers";
import type { OrderStatus } from "../../../../schema/order.schema";

const { Text } = Typography;

interface OrderHistoryTabProps {
  orders: CustomerOrderSummary[];
}

const PAYMENT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Chưa TT", color: "default" },
  AUTHORIZED: { label: "Ủy quyền", color: "processing" },
  PAID: { label: "Đã TT", color: "success" },
  FAILED: { label: "Thất bại", color: "error" },
  REFUNDED: { label: "Hoàn tiền", color: "purple" },
};

const OrderHistoryTab = ({ orders }: OrderHistoryTabProps) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      width: 110,
      render: (method: string) => (
        <Tag color={method === "DELIVERY" ? "blue" : "green"}>
          {method === "DELIVERY" ? "Giao hàng" : "Tự lấy"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => (
        <Tag color={getOrderStatusColor(status as OrderStatus)}>
          {getOrderStatusLabel(status as OrderStatus)}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 110,
      render: (status: string | null) => {
        if (!status) return <Text type="secondary">—</Text>;
        const cfg = PAYMENT_STATUS_LABEL[status];
        return (
          <Tag color={cfg?.color ?? "default"}>{cfg?.label ?? status}</Tag>
        );
      },
    },
    {
      title: "Số món",
      dataIndex: "itemsCount",
      key: "itemsCount",
      width: 70,
      align: "center" as const,
      render: (n: number) => <Text>{n}</Text>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right" as const,
      render: (total: number) => (
        <Text strong style={{ color: "#cf1322" }}>
          {formatCurrencyVND(total)}
        </Text>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: "12px" }}>{formatDateTime(date)}</Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 70,
      align: "center" as const,
      render: (_: unknown, o: CustomerOrderSummary) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/orders/${o.id}`)}
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={orders}
      scroll={{ x: 900 }}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `${total} đơn`,
        hideOnSinglePage: true,
      }}
      locale={{ emptyText: "Chưa có đơn hàng nào" }}
    />
  );
};

export default OrderHistoryTab;
