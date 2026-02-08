import { useState } from "react";
import {
  Card,
  Tabs,
  Avatar,
  Upload,
  Form,
  Input,
  Button,
  message,
  Divider,
  Row,
  Col,
  Typography,
  Space,
  Badge,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  CameraOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuthQuery";
import { validationRules } from "../../utils";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AdminProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading profile...</div>
      </div>
    );
  }

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await updateProfile(formData);
      message.success("Cập nhật avatar thành công!");
    } catch (error) {
      message.error("Lỗi khi upload avatar");
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload
  };

  // Handle profile update
  const handleProfileUpdate = async (values) => {
    setUpdating(true);
    try {
      await updateProfile(values);
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      message.error("Lỗi khi cập nhật thông tin");
    } finally {
      setUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    setChangingPassword(true);
    try {
      // Call API to change password
      await changePassword(values.currentPassword, values.newPassword);
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Lỗi khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={2}>Thông tin cá nhân</Title>
        <Text type="secondary">Quản lý thông tin và mật khẩu của bạn</Text>
      </div>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <Tabs defaultActiveKey="profile" type="card">
          <TabPane
            tab={
              <Space>
                <UserOutlined />
                Thông tin cá nhân
              </Space>
            }
            key="profile"
          >
            <Row gutter={32} style={{ padding: "24px 0" }}>
              <Col
                xs={24}
                md={8}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 24,
                  background:
                    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  borderRadius: 12,
                  marginBottom: 24,
                }}
              >
                <div className="avatar-container">
                  <Badge
                    count={
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="small"
                        style={{
                          background: "#1890ff",
                          border: "2px solid #fff",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                        onClick={() =>
                          document.getElementById("avatar-upload").click()
                        }
                      />
                    }
                    offset={[-10, 10]}
                  >
                    <Avatar
                      size={180}
                      src={user.avatar}
                      icon={<UserOutlined />}
                      style={{
                        border: "4px solid #fff",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                  </Badge>

                  <Upload
                    id="avatar-upload"
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleAvatarUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  >
                    <input type="file" style={{ display: "none" }} />
                  </Upload>

                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {user.name || "Chưa có tên"}
                    </Title>
                    <Text type="secondary">{user.email}</Text>
                    <br />
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontWeight: 500,
                        color: "#1890ff",
                      }}
                    >
                      {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={16} style={{ padding: 24 }}>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                  initialValues={{
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={validationRules.name}
                      >
                        <Input
                          placeholder="Nhập họ và tên"
                          prefix={<UserOutlined />}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Số điện thoại" name="phone">
                        <Input placeholder="Nhập số điện thoại" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={validationRules.email}
                  >
                    <Input placeholder="Nhập email" disabled size="large" />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 32, textAlign: "right" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updating}
                      size="large"
                      icon={<EditOutlined />}
                    >
                      Cập nhật thông tin
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <Space>
                <LockOutlined />
                Đổi mật khẩu
              </Space>
            }
            key="password"
          >
            <Row justify="center">
              <Col xs={24} md={12} lg={10}>
                <div
                  style={{
                    padding: 32,
                    background: "#fafafa",
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Title level={4}>Thay đổi mật khẩu</Title>
                  <Text type="secondary">
                    Đảm bảo mật khẩu mới có ít nhất 6 ký tự và khác với mật khẩu
                    cũ
                  </Text>

                  <Divider />

                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      rules={validationRules.password}
                    >
                      <Input.Password
                        placeholder="Nhập mật khẩu hiện tại"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={validationRules.password}
                    >
                      <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Xác nhận mật khẩu mới"
                      name="confirmPassword"
                      dependencies={["newPassword"]}
                      rules={[
                        validationRules.required,
                        ({ getFieldValue }) => ({
                          validator: (_, value) => {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Mật khẩu xác nhận không khớp"),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder="Nhập lại mật khẩu mới"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={changingPassword}
                        size="large"
                        danger
                        icon={<LockOutlined />}
                        block
                      >
                        Đổi mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminProfile;
