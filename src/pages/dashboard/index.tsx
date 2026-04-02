import { Suspense, lazy, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Table,
} from "antd";
import {
  BarChartOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  WarningOutlined,
  WalletOutlined,
} from "@ant-design/icons";
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
const RevenueLineChart = lazy(() => import("./components/RevenueLineChart"));

const quarterOptions = [
  { value: 1, label: "Quý 1" },
  { value: 2, label: "Quý 2" },
  { value: 3, label: "Quý 3" },
  { value: 4, label: "Quý 4" },
];

const yearOptions = [2024, 2025, 2026, 2027].map((value) => ({
  value,
  label: String(value),
}));

const formatCurrency = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")} đ`;

const getCancelRateColor = (cancelRate: number) => {
  if (cancelRate >= 20) return "#cf1322";
  if (cancelRate >= 10) return "#d46b08";
  return "#389e0d";
};

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
  const topProducts = (topProductsQuery.data?.topProducts ||
    []) as DashboardTopProduct[];
  const lowStock = (lowStockQuery.data?.lowStock ||
    []) as DashboardLowStockItem[];
  return (
    <div style={{ padding: 16 }}>
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", marginBottom: 16 }}
      >
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
            message="Không thể tải dữ liệu dashboard"
            description="Vui lòng kiểm tra API server và quyền ADMIN/STAFF."
          />
        ) : null}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card
              loading={loading}
              style={{ borderTop: "3px solid #1677ff" }}
              title={
                <Space>
                  <DollarCircleOutlined style={{ color: "#1677ff" }} />
                  Doanh thu
                </Space>
              }
            >
              <Statistic
                value={metrics ? formatCurrency(metrics.totalRevenue) : "0 đ"}
                valueStyle={{ color: "#1677ff", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card
              loading={loading}
              style={{ borderTop: "3px solid #13c2c2" }}
              title={
                <Space>
                  <WalletOutlined style={{ color: "#13c2c2" }} />
                  Tiền thu
                </Space>
              }
            >
              <Statistic
                value={metrics ? formatCurrency(metrics.totalCollected) : "0 đ"}
                valueStyle={{ color: "#08979c", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              loading={loading}
              style={{ borderTop: "3px solid #722ed1" }}
              title={
                <Space>
                  <ShoppingCartOutlined style={{ color: "#722ed1" }} />
                  Đơn hàng
                </Space>
              }
            >
              <Statistic
                value={metrics?.totalOrders || 0}
                valueStyle={{ color: "#531dab", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card
              loading={loading}
              style={{ borderTop: "3px solid #2f54eb" }}
              title={
                <Space>
                  <BarChartOutlined style={{ color: "#2f54eb" }} />
                  AOV
                </Space>
              }
            >
              <Statistic
                value={
                  metrics ? formatCurrency(metrics.averageOrderValue) : "0 đ"
                }
                valueStyle={{ color: "#1d39c4", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card
              loading={loading}
              style={{ borderTop: "3px solid #fa8c16" }}
              title={
                <Space>
                  <WarningOutlined style={{ color: "#fa8c16" }} />
                  Tỷ lệ hủy
                </Space>
              }
            >
              <Statistic
                value={`${Number(metrics?.cancelRate || 0).toFixed(1)}%`}
                valueStyle={{
                  color: getCancelRateColor(Number(metrics?.cancelRate || 0)),
                  fontWeight: 700,
                }}
              />
            </Card>
          </Col>
        </Row>
        <Card title="Doanh thu theo ngày">
          <Suspense fallback={<div>Đang tải biểu đồ...</div>}>
            <RevenueLineChart data={daily} />
          </Suspense>
        </Card>
        <Card>
          <Table
            size="small"
            dataSource={daily}
            rowKey="date"
            pagination={{ pageSize: 7 }}
            columns={[
              { title: "Ngày", dataIndex: "date" },
              { title: "Số đơn", dataIndex: "orders" },
              {
                title: "Doanh thu",
                dataIndex: "revenue",
                render: (value: number) => formatCurrency(value),
              },
              {
                title: "Tiền thu",
                dataIndex: "collected",
                render: (value: number) => formatCurrency(value),
              },
            ]}
          />
        </Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color: "#faad14" }} />
                  Top 5 sản phẩm bán chạy
                </Space>
              }
            >
              <Table
                size="small"
                dataSource={topProducts}
                rowKey={(row) => String(row.productId || row.name)}
                pagination={false}
                columns={[
                  { title: "Sản phẩm", dataIndex: "name" },
                  {
                    title: "Đã bán",
                    dataIndex: "sold",
                    render: (value: number) => (
                      <Tag
                        color={
                          value > 100
                            ? "green"
                            : value > 50
                              ? "blue"
                              : "default"
                        }
                      >
                        {value}
                      </Tag>
                    ),
                  },
                  {
                    title: "Doanh thu",
                    dataIndex: "revenue",
                    render: (value: number) => formatCurrency(value),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: "#cf1322" }} />
                  Số lượng / Tồn kho thấp
                </Space>
              }
            >
              <Table
                size="small"
                dataSource={lowStock}
                rowKey={(row) => String(row.variantId || row.productId)}
                pagination={false}
                columns={[
                  { title: "Sản phẩm", dataIndex: "productName" },
                  { title: "Loại ", dataIndex: "variantName" },
                  { title: "Số lượng (<15)", dataIndex: "quantity" },
                  { title: "Tồn kho", dataIndex: "safetyStock" },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;
