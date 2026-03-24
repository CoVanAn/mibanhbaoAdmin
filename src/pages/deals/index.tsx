import { Tabs } from "antd";
import { TagsOutlined } from "@ant-design/icons";
import CouponList from "./coupon/CouponList";

const items = [
  {
    key: "coupons",
    label: (
      <span>
        <TagsOutlined /> Mã giảm giá
      </span>
    ),
    children: <CouponList />,
  },
];

export default function DealsPage() {
  return (
    <div style={{ padding: "0 4px" }}>
      <Tabs defaultActiveKey="coupons" items={items} destroyInactiveTabPane />
    </div>
  );
}
