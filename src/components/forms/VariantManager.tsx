import { useState, useEffect } from "react";
import { Card, Form, InputNumber, Typography } from "antd";

const { Text } = Typography;

type VariantLike = {
  id?: number | null;
  name?: string;
  sku?: string;
  price?: number;
};

type ProductLike = {
  price?: number;
};

type VariantManagerProps = {
  variants?: VariantLike[];
  onVariantsChange?: (variants: VariantLike[]) => void;
  product?: ProductLike;
  mode?: "simple" | "advanced";
};

const VariantManager = ({
  variants = [],
  onVariantsChange,
  product,
  mode = "simple",
}: VariantManagerProps) => {
  const [price, setPrice] = useState(0);
  const [priceHistoryCount, setPriceHistoryCount] = useState(0);

  useEffect(() => {
    const defaultVariant =
      variants.find((v) => v.name?.toLowerCase() === "default") || variants[0];

    const currentPrice = defaultVariant?.price ?? product?.price ?? 0;
    setPrice(Number(currentPrice));
    setPriceHistoryCount(0);
  }, [variants, product]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const handlePriceChange = (value: number | null) => {
    const numericValue = Number(value ?? 0);
    setPrice(numericValue);

    const simpleVariant: VariantLike = {
      id: variants[0]?.id ?? null,
      name: "Default",
      sku: variants[0]?.sku || "",
      price: numericValue,
    };

    onVariantsChange?.([simpleVariant]);
  };

  if (mode === "simple") {
    return (
      <Card
        size="small"
        title="💰 Giá sản phẩm"
        className="variant-manager-simple"
      >
        <Form.Item
          label="Giá bán"
          name="price"
          rules={[
            // Only require price if no existing price history
            ...(priceHistoryCount === 0
              ? [{ required: true, message: "Vui lòng nhập giá!" }]
              : []),
            {
              validator: (_, value) => {
                // If no value entered and we have price history, it's valid
                if (
                  (value === undefined || value === null || value === "") &&
                  priceHistoryCount > 0
                ) {
                  return Promise.resolve();
                }
                // If value is entered, must be > 0
                if (
                  value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  Number(value) <= 0
                ) {
                  return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                }
                return Promise.resolve();
              },
            },
          ]}
          help={
            priceHistoryCount > 0
              ? "Để trống nếu không muốn thay đổi giá hiện tại"
              : undefined
          }
        >
          <InputNumber
            style={{ width: "100%" }}
            value={price}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number((value ?? "").replace(/\$\s?|(,*)/g, ""))}
            placeholder={
              priceHistoryCount > 0
                ? "Nhập giá mới (hoặc để trống)"
                : "Nhập giá sản phẩm"
            }
            addonAfter="VNĐ"
            min={0}
            step={1000}
            onChange={handlePriceChange}
          />
        </Form.Item>

        {price > 0 && (
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #91caff",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#1890ff",
              textAlign: "center",
            }}
          >
            <Text strong>Giá hiển thị: {formatPrice(price)}</Text>
          </div>
        )}

        <div
          style={{
            fontSize: "12px",
            color: "#999",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          <Text type="secondary">Hệ thống sẽ tự động tạo variant mặc định</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title="🕐 Quản lý giá nâng cao">
      <Text>Advanced pricing features coming soon...</Text>
    </Card>
  );
};

export default VariantManager;
