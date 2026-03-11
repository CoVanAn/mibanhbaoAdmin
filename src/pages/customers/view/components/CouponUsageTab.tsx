import { Table, Tag, Typography } from "antd";
import type { CustomerCouponRedemption } from "../../../../schema/customer.schema";
import { formatDate } from "../../../../utils/helpers";
import { formatCurrencyVND } from "../../../../utils/orderHelpers";

const { Text } = Typography;

interface CouponUsageTabProps {
  redemptions: CustomerCouponRedemption[];
}

const CouponUsageTab = ({ redemptions }: CouponUsageTabProps) => {
  const columns = [
    {
      title: "Mã coupon",
      key: "code",
      width: 130,
      render: (_: any, r: CustomerCouponRedemption) => (
        <Text strong code>
          {r.coupon.code}
        </Text>
      ),
    },
    {
      title: "Loại / Giá trị",
      key: "value",
      width: 140,
      render: (_: any, r: CustomerCouponRedemption) => (
        <Text>
          {r.coupon.type === "PERCENT"
            ? `Giảm ${r.coupon.value}%`
            : `Giảm ${formatCurrencyVND(r.coupon.value)}`}
        </Text>
      ),
    },
    {
      title: "Tiết kiệm",
      dataIndex: "discountApplied",
      key: "discountApplied",
      width: 120,
      render: (d: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          -{formatCurrencyVND(d)}
        </Text>
      ),
    },
    {
      title: "Đơn hàng",
      key: "order",
      width: 120,
      render: (_: any, r: CustomerCouponRedemption) => (
        <Text>{r.order.code}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>
          {status === "ACTIVE" ? "Đang dùng" : "Đã giải phóng"}
        </Tag>
      ),
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "redeemedAt",
      key: "redeemedAt",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: "12px" }}>{formatDate(date)}</Text>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={redemptions}
      scroll={{ x: 700 }}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `${total} lần sử dụng`,
        hideOnSinglePage: true,
      }}
      locale={{ emptyText: "Chưa sử dụng coupon nào" }}
    />
  );
};

export default CouponUsageTab;
