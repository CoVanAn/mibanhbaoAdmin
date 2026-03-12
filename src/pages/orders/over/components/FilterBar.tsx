import { useEffect, useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Affix,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_METHOD_CONFIG,
} from "../../../../utils/orderHelpers";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface FilterBarProps {
  searchTerm: string;
  statusFilter?: string;
  methodFilter?: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  isFetching: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: (value: string) => void;
  onStatusChange: (value?: string) => void;
  onMethodChange: (value?: string) => void;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onReset: () => void;
}

/**
 * Orders filter bar component with search, date range, status, and method filters
 */
const FilterBar = ({
  searchTerm,
  statusFilter,
  methodFilter,
  dateRange,
  isFetching,
  onSearchTermChange,
  onSearch,
  onStatusChange,
  onMethodChange,
  onDateRangeChange,
  onReset,
}: FilterBarProps) => {
  const [localValue, setLocalValue] = useState(searchTerm);
  const isComposing = useRef(false);

  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  return (
    <Affix offsetTop={0}>
      <Card
        style={{
          marginBottom: 16,
          boxShadow: isFetching ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="Tìm theo mã đơn, tên, SĐT..."
                allowClear
                enterButton={<SearchOutlined />}
                value={localValue}
                onChange={(e) => {
                  setLocalValue(e.target.value);
                  if (!isComposing.current) {
                    onSearchTermChange(e.target.value);
                  }
                }}
                onCompositionStart={() => {
                  isComposing.current = true;
                }}
                onCompositionEnd={(e) => {
                  isComposing.current = false;
                  // Sau khi compose xong mới propagate giá trị hoàn chỉnh
                  onSearchTermChange((e.target as HTMLInputElement).value);
                }}
                onSearch={onSearch}
                disabled={isFetching}
              />
            </Col>
            <Col span={6}>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                value={dateRange}
                onChange={onDateRangeChange}
                disabled={isFetching}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={onStatusChange}
                disabled={isFetching}
                loading={isFetching}
              >
                {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>
                    <Tag color={config.color}>{config.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Phương thức"
                allowClear
                style={{ width: "100%" }}
                value={methodFilter}
                onChange={onMethodChange}
                disabled={isFetching}
                loading={isFetching}
              >
                {Object.entries(FULFILLMENT_METHOD_CONFIG).map(
                  ([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ),
                )}
              </Select>
            </Col>
            <Col span={4}>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={onReset}
                  disabled={isFetching}
                >
                  Reset
                </Button>
                {isFetching && <Text type="secondary">Đang tải...</Text>}
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>
    </Affix>
  );
};

export default FilterBar;
