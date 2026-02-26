import { Button, Space, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { Order, OrderStatus } from "../../../../schema/order.schema";
import {
  FULFILLMENT_METHOD_CONFIG,
  formatCurrencyVND,
  formatDateTime,
  getCustomerName,
  getCustomerPhone,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../../../utils/orderHelpers";

const { Text } = Typography;

/**
 * Get table columns configuration for orders list
 */
export const getOrderColumns = (onViewOrder: (id: number) => void) => [
  {
    title: "Mã đơn hàng",
    dataIndex: "code",
    key: "code",
    width: 100,
    fixed: "left" as const,
    render: (code: string) => (
      <Text strong style={{ fontSize: "13px" }}>
        {code}
      </Text>
    ),
  },
  {
    title: "Khách hàng",
    key: "customer",
    width: 120,
    render: (_: any, order: Order) => (
      <Space direction="vertical" size={0}>
        <Text strong>{getCustomerName(order)}</Text>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {getCustomerPhone(order)}
        </Text>
      </Space>
    ),
  },
  {
    title: "Phương thức",
    dataIndex: "method",
    key: "method",
    width: 120,
    align: "left" as const,
    render: (method: string) => {
      const config =
        FULFILLMENT_METHOD_CONFIG[
          method as keyof typeof FULFILLMENT_METHOD_CONFIG
        ];
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "Số món",
    dataIndex: "items",
    key: "itemCount",
    width: 60,
    align: "center" as const,
    render: (items: any[]) => <Text strong>{items?.length || 0}</Text>,
  },
  {
    title: "Tổng tiền",
    dataIndex: "total",
    key: "total",
    width: 100,
    align: "center" as const,
    render: (total: number) => (
      <Text strong style={{ color: "#cf1322" }}>
        {formatCurrencyVND(total)}
      </Text>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: OrderStatus) => (
      <Tag color={getOrderStatusColor(status)}>
        {getOrderStatusLabel(status)}
      </Tag>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 150,
    render: (date: string) => (
      <Text style={{ fontSize: "12px" }}>{formatDateTime(date)}</Text>
    ),
  },
  {
    title: "Thao tác",
    key: "actions",
    width: 100,
    fixed: "right" as const,
    render: (_: any, order: Order) => (
      <Space>
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewOrder(order.id)}
          />
        </Tooltip>
      </Space>
    ),
  },
];
