import { Button, Space, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { CustomerListItem } from "../../../../schema/customer.schema";
import { formatDate } from "../../../../utils/helpers";

const { Text } = Typography;

export const getCustomerColumns = (onView: (id: number) => void) => [
  {
    title: "Tên khách hàng",
    key: "name",
    width: 200,
    render: (_: any, c: CustomerListItem) => (
      <Space direction="vertical" size={0}>
        <Text strong>{c.name}</Text>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {c.email}
        </Text>
      </Space>
    ),
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    width: 130,
    render: (phone: string | null) => phone || <Text type="secondary">—</Text>,
  },
  {
    title: "Đơn hàng",
    dataIndex: "ordersCount",
    key: "ordersCount",
    width: 90,
    align: "center" as const,
    render: (count: number) => <Text strong>{count}</Text>,
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 150,
    render: (date: string) => (
      <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
    ),
  },
  {
    title: "Trạng thái",
    dataIndex: "isActive",
    key: "isActive",
    width: 110,
    align: "center" as const,
    render: (isActive: boolean) =>
      isActive ? (
        <Tag color="success">Hoạt động</Tag>
      ) : (
        <Tag color="error">Vô hiệu</Tag>
      ),
  },
  {
    title: "Hành động",
    key: "action",
    width: 90,
    align: "center" as const,
    fixed: "right" as const,
    render: (_: any, c: CustomerListItem) => (
      <Button
        type="link"
        icon={<EyeOutlined />}
        onClick={() => onView(c.id)}
        size="small"
      >
        Xem
      </Button>
    ),
  },
];
