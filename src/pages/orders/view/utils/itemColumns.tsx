import { Space, Avatar, Typography } from "antd";
import { formatCurrencyVND } from "../../../../utils/orderHelpers";
import type { OrderItem } from "../../../../schema/order.schema";

const { Text } = Typography;

export const getItemColumns = () => [
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
