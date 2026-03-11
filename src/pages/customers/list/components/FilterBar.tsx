import { Card, Row, Col, Input, Select, Button, Space, Affix } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRef, useState, useEffect } from "react";

const { Search } = Input;
const { Option } = Select;

interface FilterBarProps {
  searchTerm: string;
  isActiveFilter?: string;
  isFetching: boolean;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onIsActiveChange: (value?: string) => void;
  onReset: () => void;
}

const FilterBar = ({
  searchTerm,
  isActiveFilter,
  isFetching,
  onSearchChange,
  onSearch,
  onIsActiveChange,
  onReset,
}: FilterBarProps) => {
  // Local display value — luôn hiển thị đúng kể cả đang compose IME
  const [localValue, setLocalValue] = useState(searchTerm);
  // Ref theo dõi trạng thái đang compose (gõ tiếng Việt có dấu)
  const isComposing = useRef(false);

  // Đồng bộ khi parent reset (handleReset)
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
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="Tìm theo tên, email, SĐT..."
              allowClear
              enterButton={<SearchOutlined />}
              value={localValue}
              onChange={(e) => {
                const val = e.target.value;
                setLocalValue(val);
                // Chỉ propagate khi KHÔNG đang compose (không bị trigger giữa "oo"→"ô")
                if (!isComposing.current) {
                  onSearchChange(val);
                }
              }}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={(e) => {
                isComposing.current = false;
                // Sau khi compose xong mới propagate giá trị hoàn chỉnh
                onSearchChange((e.target as HTMLInputElement).value);
              }}
              onSearch={onSearch}
              disabled={isFetching}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: "100%" }}
              value={isActiveFilter}
              onChange={(val) => onIsActiveChange(val)}
              disabled={isFetching}
            >
              <Option value="true">Hoạt động</Option>
              <Option value="false">Vô hiệu</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={onReset}
                disabled={isFetching}
              >
                Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </Affix>
  );
};

export default FilterBar;
