import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Typography,
  Divider,
  Tag,
  message,
  Popconfirm,
  DatePicker,
  Alert,
  Collapse,
} from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  CalendarOutlined,
  InfoCircleOutlined 
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./VariantManager.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const VariantManager = ({ variants = [], onVariantsChange, product, mode = 'simple' }) => {
  const [price, setPrice] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Extract current price and price history from variants
    const defaultVariant = variants.find((v) => v.name?.toLowerCase() === "default") || variants[0];
    
    if (defaultVariant?.prices) {
      // Sort prices by date to find current one
      const sortedPrices = defaultVariant.prices.sort((a, b) => {
        // Current active prices first
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        
        // Then by date range (current date within range)
        const now = new Date();
        const aInRange = (!a.startsAt || new Date(a.startsAt) <= now) && (!a.endsAt || new Date(a.endsAt) >= now);
        const bInRange = (!b.startsAt || new Date(b.startsAt) <= now) && (!b.endsAt || new Date(b.endsAt) >= now);
        
        if (aInRange && !bInRange) return -1;
        if (!aInRange && bInRange) return 1;
        
        // Finally by newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      
      const currentPrice = sortedPrices[0]?.amount || product?.price || 0;
      setPrice(Number(currentPrice));
      setPriceHistory(sortedPrices);
    } else {
      const currentPrice = defaultVariant?.price || product?.price || 0;
      setPrice(Number(currentPrice));
      setPriceHistory([]);
    }
  }, [variants, product]);

  const handlePriceChange = (value) => {
    const numericValue = Number(value) || 0;
    setPrice(numericValue);

    // Create simple variant structure
    const simpleVariant = {
      id: variants[0]?.id || null,
      name: "Default",
      sku: variants[0]?.sku || "",
      price: numericValue,
      isActive: true,
    };

    onVariantsChange?.([simpleVariant]);
  };

  const addPriceSchedule = (priceAmount, dateRange) => {
    const newPrice = {
      amount: priceAmount,
      startsAt: dateRange?.[0]?.toISOString() || null,
      endsAt: dateRange?.[1]?.toISOString() || null,
      isActive: true,
    };

    // Update variants with new price
    const updatedVariants = variants.map(variant => {
      if (variant.name?.toLowerCase() === 'default' || variants.indexOf(variant) === 0) {
        return {
          ...variant,
          prices: [...(variant.prices || []), newPrice]
        };
      }
      return variant;
    });

    onVariantsChange?.(updatedVariants);
    message.success('Đã thêm lịch giá mới!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateRange = (startsAt, endsAt) => {
    if (!startsAt && !endsAt) return "Vĩnh viễn";
    if (!startsAt) return `Đến ${dayjs(endsAt).format('DD/MM/YYYY')}`;
    if (!endsAt) return `Từ ${dayjs(startsAt).format('DD/MM/YYYY')}`;
    return `${dayjs(startsAt).format('DD/MM/YYYY')} - ${dayjs(endsAt).format('DD/MM/YYYY')}`;
  };

  const isPriceActive = (priceObj) => {
    if (!priceObj.isActive) return false;
    
    const now = new Date();
    const startsAt = priceObj.startsAt ? new Date(priceObj.startsAt) : null;
    const endsAt = priceObj.endsAt ? new Date(priceObj.endsAt) : null;
    
    const isAfterStart = !startsAt || now >= startsAt;
    const isBeforeEnd = !endsAt || now <= endsAt;
    
    return isAfterStart && isBeforeEnd;
  };

  if (mode === 'simple' && !showAdvanced) {
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
            ...(priceHistory.length === 0 ? [
              { required: true, message: "Vui lòng nhập giá!" }
            ] : []),
            { 
              validator: (_, value) => {
                // If no value entered and we have price history, it's valid
                if ((value === undefined || value === null || value === '') && priceHistory.length > 0) {
                  return Promise.resolve();
                }
                // If value is entered, must be > 0
                if (value !== undefined && value !== null && value !== '' && Number(value) <= 0) {
                  return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                }
                return Promise.resolve();
              }
            }
          ]}
          help={priceHistory.length > 0 ? "Để trống nếu không muốn thay đổi giá hiện tại" : undefined}
        >
          <InputNumber
            style={{ width: "100%" }}
            value={price}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            placeholder={priceHistory.length > 0 ? "Nhập giá mới (hoặc để trống)" : "Nhập giá sản phẩm"}
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
