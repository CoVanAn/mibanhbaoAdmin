import { Alert, Button, Card, Col, Descriptions, Popconfirm, Row, Space, Tag, Typography } from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader, Loading } from "../../../components/common";
import {
  useEmployeeQuery,
  useToggleEmployeeStatusMutation,
} from "../../../hooks/useEmployeeQuery";
import { useAuth } from "../../../hooks/useAuthQuery";
import { formatDate } from "../../../utils/helpers";

const { Text } = Typography;

const EmployeeView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const employeeId = parseInt(id || "0", 10);

  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useEmployeeQuery(employeeId);
  const toggleStatus = useToggleEmployeeStatusMutation();

  if (isLoading) return <Loading />;

  if (isError || !employee) {
    return (
      <Alert
        type="error"
        message="Không tìm thấy nhân viên"
        description={(error as any)?.message}
        action={<Button onClick={() => navigate("/employees")}>Quay lại</Button>}
      />
    );
  }

  const canToggle = user?.role === "ADMIN" && Number(user?.id) !== employee.id;

  const handleToggleStatus = () => {
    toggleStatus.mutate({ id: employee.id, isActive: !employee.isActive });
  };

  const statusAction = canToggle ? (
    <Popconfirm
      title={
        employee.isActive
          ? "Vô hiệu hoá tài khoản này?"
          : "Kích hoạt lại tài khoản này?"
      }
      onConfirm={handleToggleStatus}
      okText="Xác nhận"
      cancelText="Huỷ"
      okButtonProps={{
        danger: employee.isActive,
        loading: toggleStatus.isPending,
      }}
    >
      <Button
        danger={employee.isActive}
        type={employee.isActive ? "default" : "primary"}
        loading={toggleStatus.isPending}
      >
        {employee.isActive ? "Vô hiệu hoá" : "Kích hoạt"}
      </Button>
    </Popconfirm>
  ) : null;

  return (
    <div>
      <PageHeader
        title={employee.name}
        subtitle={employee.email}
        showBack
        onBack={() => navigate("/employees")}
        extra={statusAction}
      />

      <Card>
        <Row gutter={24} align="top">
          <Col>
            <Avatar
              size={72}
              src={employee.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1677ff" }}
            />
          </Col>

          <Col flex={1}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Space>
                <Tag color={employee.role === "ADMIN" ? "gold" : "default"}>
                  {employee.role}
                </Tag>
                <Tag color={employee.isActive ? "success" : "error"}>
                  {employee.isActive ? "Hoạt động" : "Vô hiệu"}
                </Tag>
                {employee.linkedProviders.map((provider) => (
                  <Tag key={provider} color="blue">
                    {provider}
                  </Tag>
                ))}
              </Space>

              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                style={{ marginTop: 8 }}
              >
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <MailOutlined /> Email
                    </Space>
                  }
                >
                  {employee.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space size={4}>
                      <PhoneOutlined /> SĐT
                    </Space>
                  }
                >
                  {employee.phone || <Text type="secondary">—</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDate(employee.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Số đơn liên quan">
                  <Text strong>{employee.ordersHandledCount}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số địa chỉ">
                  <Text strong>{employee.addressesCount}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mật khẩu">
                  {employee.hasPassword ? "Đã đặt" : "Chưa đặt"}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeView;
