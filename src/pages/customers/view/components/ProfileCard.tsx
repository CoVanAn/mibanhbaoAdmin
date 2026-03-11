import {
  Descriptions,
  Tag,
  Avatar,
  Card,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import type { CustomerDetail } from "../../../../schema/customer.schema";
import { formatDate } from "../../../../utils/helpers";

const { Text } = Typography;

interface ProfileCardProps {
  customer: CustomerDetail;
  extra?: React.ReactNode;
}

const ProfileCard = ({ customer, extra }: ProfileCardProps) => {
  return (
    <Card>
      <Row gutter={24} align="top">
        <Col>
          <Avatar
            size={72}
            src={customer.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1677ff" }}
          />
        </Col>
        <Col flex={1}>
          <Row justify="space-between" align="top">
            <Col>
              <Space direction="vertical" size={2}>
                <Text strong style={{ fontSize: "18px" }}>
                  {customer.name}
                </Text>
                <Space>
                  <Tag color={customer.isActive ? "success" : "error"}>
                    {customer.isActive ? "Hoạt động" : "Vô hiệu"}
                  </Tag>
                  {customer.linkedProviders.map((p) => (
                    <Tag key={p} color="blue">
                      {p}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Col>
            {extra && <Col>{extra}</Col>}
          </Row>

          <Descriptions
            style={{ marginTop: 16 }}
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
          >
            <Descriptions.Item
              label={
                <Space size={4}>
                  <MailOutlined /> Email
                </Space>
              }
            >
              {customer.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space size={4}>
                  <PhoneOutlined /> SĐT
                </Space>
              }
            >
              {customer.phone || <Text type="secondary">—</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(customer.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng đơn hàng">
              <Text strong>{customer.orders.length}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mật khẩu">
              {customer.hasPassword ? "Đã đặt" : "Chưa đặt"}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default ProfileCard;
