import { Tabs } from "antd";
import { ShakeOutlined, TagsOutlined } from "@ant-design/icons";
import PromotionList from "./promotion/PromotionList";
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
  {
    key: "promotions",
    label: (
      <span>
        <ShakeOutlined /> Ưu đãi sản phẩm
      </span>
    ),
    children: <PromotionList />,
  },
];

export default function PromotionsPage() {
  return (
    <div style={{ padding: "0 4px" }}>
      {/* <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Quản lý ưu đãi &amp; coupon</h2>
      </div> */}
      <Tabs defaultActiveKey="coupons" items={items} destroyInactiveTabPane />
    </div>
  );
}
