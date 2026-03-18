import { useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  useDashboardDailyQuery,
  useDashboardLowStockQuery,
  useDashboardOverviewQuery,
  useDashboardTopProductsQuery,
} from "../../hooks/useDashboardQuery";
import {
  DashboardLowStockItem,
  DashboardTopProduct,
} from "../../api/dashboard";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const quarterOptions = [
  { value: 1, label: "Quy 1" },
  { value: 2, label: "Quy 2" },
  { value: 3, label: "Quy 3" },
  { value: 4, label: "Quy 4" },
];

const yearOptions = [2024, 2025, 2026, 2027].map((value) => ({
  value,
  label: String(value),
}));

const formatCurrency = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")} đ`;

const DashboardPage = () => {
  const today = dayjs();
  const [quarter, setQuarter] = useState(1);
  const [year, setYear] = useState(today.year());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    today.subtract(6, "day"),
    today,
  ]);

  const overviewQuery = useDashboardOverviewQuery({ year, quarter });

  const dailyParams = useMemo(
    () => ({
      startDate: dateRange[0].startOf("day").toISOString(),
      endDate: dateRange[1].endOf("day").toISOString(),
    }),
    [dateRange],
  );

  const dailyQuery = useDashboardDailyQuery(dailyParams);

  const topProductsQuery = useDashboardTopProductsQuery({
    year,
    quarter,
    limit: 5,
  });

  const lowStockQuery = useDashboardLowStockQuery(8);

  const isError =
    overviewQuery.isError ||
    dailyQuery.isError ||
    topProductsQuery.isError ||
    lowStockQuery.isError;

  const loading =
    overviewQuery.isLoading ||
    dailyQuery.isLoading ||
    topProductsQuery.isLoading ||
    lowStockQuery.isLoading;

  const metrics = overviewQuery.data?.metrics;
  const daily = dailyQuery.data?.daily || [];
  const topProducts =
    (topProductsQuery.data?.topProducts || []) as DashboardTopProduct[];
  const lowStock = (lowStockQuery.data?.lowStock || []) as DashboardLowStockItem[];

  return (
    <div style={{ padding: 16 }}>
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Dashboard
        </Title>

        <Card>
          <Space wrap>
            <Select
              value={quarter}
              options={quarterOptions}
              onChange={setQuarter}
              style={{ width: 120 }}
            />
            <Select
              value={year}
              options={yearOptions}
              onChange={setYear}
              style={{ width: 120 }}
            />
            <RangePicker
              value={dateRange}
              onChange={(value) => {
                if (value && value[0] && value[1]) {
                  setDateRange([value[0], value[1]]);
                }
              }}
              allowClear={false}
            />
          </Space>
        </Card>

        {isError ? (
          <Alert
            type="error"
            showIcon
            message="Khong the tai du lieu dashboard"
            description="Vui long kiem tra API server va quyen ADMIN/STAFF."
          />
        ) : null}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card loading={loading}>
              <Statistic
                title="Doanh thu"
                value={metrics ? formatCurrency(metrics.totalRevenue) : "0 đ"}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card loading={loading}>
              <Statistic
                title="Tien thu"
                value={
                  metrics ? formatCurrency(metrics.totalCollected) : "0 đ"
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card loading={loading}>
              <Statistic title="Don hang" value={metrics?.totalOrders || 0} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card loading={loading}>
              <Statistic
                title="AOV"
                value={
                  metrics ? formatCurrency(metrics.averageOrderValue) : "0 đ"
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card loading={loading}>
              <Statistic
                title="Ty le huy"
                value={`${Number(metrics?.cancelRate || 0).toFixed(1)}%`}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="Theo ngay">
              <Table
                size="small"
                dataSource={daily}
                rowKey="date"
                pagination={{ pageSize: 7 }}
                columns={[
                  { title: "Ngay", dataIndex: "date" },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    render: (value: number) => formatCurrency(value),
                  },
                  {
                    title: "Tien thu",
                    dataIndex: "collected",
                    render: (value: number) => formatCurrency(value),
                  },
                  { title: "So don", dataIndex: "orders" },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Top 5 san pham">
              <Table
                size="small"
                dataSource={topProducts}
                rowKey={(row) => String(row.productId || row.name)}
                pagination={false}
                columns={[
                  { title: "San pham", dataIndex: "name" },
                  { title: "Da ban", dataIndex: "sold" },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    render: (value: number) => formatCurrency(value),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Ton kho thap">
          <Row gutter={[16, 16]}>
            {lowStock.length === 0 ? (
              <Col span={24}>
                <Text type="secondary">Khong co san pham duoi nguong ton.</Text>
              </Col>
            ) : (
              lowStock.map((item) => {
                const percent =
                  item.safetyStock > 0
                    ? Math.min(100, (item.quantity / item.safetyStock) * 100)
                    : item.quantity > 0
                      ? 100
                      : 0;

                return (
                  <Col xs={24} md={12} key={`${item.variantId}-${item.productId}`}>
                    <div>
                      <Text strong>{item.productName}</Text>
                      <br />
                      <Text type="secondary">
                        {item.variantName || "Variant mac dinh"} - ton {item.quantity} /
                        nguong {item.safetyStock}
                      </Text>
                      <Progress
                        percent={Number(percent.toFixed(0))}
                        status={item.quantity <= item.safetyStock ? "exception" : "normal"}
                      />
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default DashboardPage;
