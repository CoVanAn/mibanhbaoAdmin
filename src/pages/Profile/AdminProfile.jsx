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
import { useAuth } from "../../context/AuthContext";
import { validationRules } from "../../utils";
import "./AdminProfile.css";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AdminProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) {
    return (
      <div className="loading-container">
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

      await updateUserProfile(formData);
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
      await updateUserProfile(values);
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
      await updateUserProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Lỗi khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <Title level={2}>Thông tin cá nhân</Title>
        <Text type="secondary">Quản lý thông tin và mật khẩu của bạn</Text>
      </div>

      <Card className="profile-card">
        <Tabs defaultActiveKey="profile" type="card" className="profile-tabs">
          <TabPane
            tab={
              <Space>
                <UserOutlined />
                Thông tin cá nhân
              </Space>
            }
            key="profile"
          >
            <Row gutter={32} className="profile-content">
              <Col xs={24} md={8} className="avatar-section">
                <div className="avatar-container">
                  <Badge
                    count={
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="small"
                        className="avatar-edit-btn"
                        onClick={() =>
                          document.getElementById("avatar-upload").click()
                        }
                      />
                    }
                    offset={[-10, 10]}
                  >
                    <Avatar
                      size={120}
                      src={user.avatar}
                      icon={<UserOutlined />}
                      className="profile-avatar"
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

                  <div className="avatar-info">
                    <Title level={4} className="user-name">
                      {user.name || "Chưa có tên"}
                    </Title>
                    <Text type="secondary">{user.email}</Text>
                    <br />
                    <Text type="secondary" className="user-role">
                      {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={16} className="form-section">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                  initialValues={{
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                  }}
                  className="profile-form"
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

                  <Form.Item className="form-actions">
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
                <div className="password-section">
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
                    className="password-form"
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
                              new Error("Mật khẩu xác nhận không khớp")
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

                    <Form.Item className="form-actions">
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
