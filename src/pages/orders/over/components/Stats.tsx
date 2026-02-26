import { Row, Col, Card, Typography } from "antd";
import { formatCurrencyVND } from "../../../../utils/orderHelpers";
import type { OrderStats } from "../utils/stats";

const { Text, Title } = Typography;

interface StatsProps {
  stats: OrderStats | null;
}

/**
 * Order statistics cards component
 * Displays: Total orders, Pending, Completed, Revenue
 */
const Stats = ({ stats }: StatsProps) => {
  if (!stats) return null;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              {stats.totalOrders}
            </Title>
            <Text type="secondary">Tổng đơn hàng</Text>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#faad14" }}>
              {stats.pendingCount}
            </Title>
            <Text type="secondary">Chờ xác nhận</Text>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
              {stats.completedCount}
            </Title>
            <Text type="secondary">Hoàn thành</Text>
          </div>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#cf1322" }}>
              {formatCurrencyVND(stats.totalRevenue)}
            </Title>
            <Text type="secondary">Doanh thu</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Stats;
