import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthQuery";
import { Form, Input, Button, Card, Typography, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminLogin = () => {
  const [form] = Form.useForm();
  const { loginAsync, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          background: "linear-gradient(135deg, #652828 0%, #391414 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            borderRadius: 12,
          }}
        >
          <Spin tip="Đang kiểm tra phiên đăng nhập..." size="large" />
        </Card>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await loginAsync({ email: values.email, password: values.password });
      // Success toast already handled in mutation
      // Redirect to intended page or dashboard using React Router
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (_error) {
      // Error toast already handled in mutation
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        background: "linear-gradient(135deg, #652828 0%, #391414 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Title level={2}>Đăng nhập Admin</Title>
          <Text type="secondary">Mi Bánh Bao - Admin Panel</Text>
        </div>

        <Form
          form={form}
          name="admin-login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email admin"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Chỉ dành cho Admin và Staff của Mi Bánh Bao
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
