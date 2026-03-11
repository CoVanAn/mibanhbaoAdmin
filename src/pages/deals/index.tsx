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
      {/* <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý ưu đãi &amp; coupon</h2>
      </div> */}
      <Tabs defaultActiveKey="coupons" items={items} destroyInactiveTabPane />
    </div>
  );
}
