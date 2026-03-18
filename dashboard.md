Hiện tại tôi đang muốn làm chức năng dashboard cho phần admin - server của MI_BANH_BAO.
Đây là kế hoạch tôi dự định làm ở dashboard
🔥 1. SECTION: Tổng quan theo QUÝ
👉 Dùng cho: nhìn big picture
Hiển thị:
Tổng doanh thu (Order.createdAt)
Tổng tiền thu (Payment.paidAt)
Tổng đơn hàng
AOV
Tỷ lệ huỷ đơn
👉 Filter:
Quý (Q1, Q2, Q3, Q4)
Năm
⚡ 2. SECTION: Theo NGÀY (range)
👉 Dùng cho: vận hành
Hiển thị:
Doanh thu theo ngày
Tiền thu theo ngày
Số đơn theo ngày
👉 UI:
Date range picker
👉 Bonus:
Biểu đồ line (rất nên có)
🥟 3. SECTION: Hiệu suất sản phẩm
👉 Không phụ thuộc quý hay ngày quá nhiều
Top 5 sản phẩm
Có thể filter theo:
Quý
Date range
⚠️ 4. SECTION: Vận hành
Tồn kho thấp.

Đây là UI tôi định làm theo
import { Card, Col, Row, Select, DatePicker, Typography, Space, Table, Progress } from "antd";
// import { Line, Column } from "@ant-design/plots";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Dashboard() {
  // 🔥 Fake revenue data (7 ngày)
  const revenueData = [
    { date: "01/03", value: 1200000 },
    { date: "02/03", value: 1800000 },
    { date: "03/03", value: 900000 },
    { date: "04/03", value: 2200000 },
    { date: "05/03", value: 1500000 },
    { date: "06/03", value: 2700000 },
    { date: "07/03", value: 2000000 },
  ];

  // 🔥 Fake quarterly revenue (theo tháng trong quý)
  const quarterlyData = [
    { month: "Tháng 1", value: 12000000 },
    { month: "Tháng 2", value: 15000000 },
    { month: "Tháng 3", value: 18000000 },
  ];

  const formatCurrency = (v: number) =>
    v.toLocaleString("vi-VN") + " đ";

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.value, 0);
  const totalOrders = 120;
  const canceledOrders = 8;
  const aov = totalRevenue / totalOrders;

  const lineConfig = {
    data: revenueData,
    xField: "date",
    yField: "value",
    smooth: true,
    tooltip: {
      formatter: (d: any) => ({ name: "Doanh thu", value: formatCurrency(d.value) }),
    },
  };

  const columnConfig = {
    data: quarterlyData,
    xField: "month",
    yField: "value",
    label: {
      position: "top",
      formatter: (v: any) => formatCurrency(v.value),
    },
  };

  // 🔥 Fake top products
  const topProducts = [
    { key: 1, name: "Bánh bao nhân thịt", sold: 120 },
    { key: 2, name: "Bánh bao trứng muối", sold: 95 },
    { key: 3, name: "Bánh bao chay", sold: 80 },
    { key: 4, name: "Bánh bao phô mai", sold: 60 },
    { key: 5, name: "Bánh bao socola", sold: 45 },
  ];

  // 🔥 Fake inventory
  const lowStock = [
    { key: 1, name: "Bánh bao nhân thịt", qty: 10 },
    { key: 2, name: "Bánh bao trứng muối", qty: 6 },
    { key: 3, name: "Bánh bao phô mai", qty: 4 },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* QUARTER FILTER */}
      <Card>
        <Space>
          <Select
            defaultValue="Q1"
            options={[
              { value: "Q1", label: "Quý 1" },
              { value: "Q2", label: "Quý 2" },
              { value: "Q3", label: "Quý 3" },
              { value: "Q4", label: "Quý 4" },
            ]}
          />
          <Select
            defaultValue="2025"
            options={[
              { value: "2024", label: "2024" },
              { value: "2025", label: "2025" },
              { value: "2026", label: "2026" },
            ]}
          />
        </Space>
      </Card>

      {/* TOP METRICS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Text type="secondary">Doanh thu</Text>
            <Title level={4}>{formatCurrency(totalRevenue)}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Text type="secondary">Tiền thu</Text>
            <Title level={4}>{formatCurrency(totalRevenue * 0.85)}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Text type="secondary">Đơn hàng</Text>
            <Title level={4}>{totalOrders}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Text type="secondary">AOV</Text>
            <Title level={4}>{formatCurrency(aov)}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Text type="secondary">Huỷ đơn</Text>
            <Title level={4}>
              <Space>
                {((canceledOrders / totalOrders) * 100).toFixed(1)}%
              </Space>
            </Title>
          </Card>
        </Col>
      </Row>

      {/* 🔥 QUARTERLY CHART */}
      <Card title="Doanh thu theo quý (theo tháng)">
        {/* <Column {...columnConfig} /> */}
      </Card>

      {/* DATE RANGE + CHART */}
      <Card title="Doanh thu theo ngày" extra={<RangePicker />}>
        {/* <Line {...lineConfig} /> */}
      </Card>

      {/* BOTTOM SECTION */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Top 5 sản phẩm">
            <Table
              dataSource={topProducts}
              pagination={false}
              columns={[
                { title: "Sản phẩm", dataIndex: "name" },
                { title: "Đã bán", dataIndex: "sold" },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Tồn kho thấp">
            {lowStock.map((item) => (
              <div key={item.key} style={{ marginBottom: 12 }}>
                <Text>{item.name}</Text>
                <Progress percent={(item.qty / 20) * 100} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

Bạn hãy thử xem 