import { Drawer, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCouponRedemptionsQuery } from "../../../hooks/useCouponQuery";
import type { Coupon, CouponRedemption } from "../../../schema/coupon.schema";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  open: boolean;
  coupon: Coupon;
  onClose: () => void;
}

export default function CouponRedemptionDrawer({
  open,
  coupon,
  onClose,
}: Props) {
  const { data: redemptions = [], isLoading } = useCouponRedemptionsQuery(
    coupon.id,
  );

  const columns: ColumnsType<CouponRedemption> = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      width: 80,
      render: (id: number) => <Text code>#{id}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "userId",
      width: 90,
      render: (id: number) => <Text type="secondary">User #{id}</Text>,
    },
    {
      title: "Tiền giảm",
      dataIndex: "discountAmount",
      width: 110,
      align: "right",
      render: (amount: number) => (
        <strong style={{ color: "#f5222d" }}>
          {amount.toLocaleString("vi-VN")} ₫
        </strong>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 110,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>
          {status === "ACTIVE" ? "Đang dùng" : "Đã hoàn"}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "redeemedAt",
      width: 150,
      render: (dt: string) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(dt).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span>
          Lịch sử sử dụng:{" "}
          <Text code style={{ fontSize: 14 }}>
            {coupon.code}
          </Text>
        </span>
      }
      width={620}
      destroyOnClose
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={redemptions}
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} lượt` }}
        locale={{ emptyText: "Chưa có lượt nào dùng coupon này" }}
      />
    </Drawer>
  );
}
