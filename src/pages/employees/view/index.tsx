import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleFilled,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  StopFilled,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader, Loading } from "../../../components/common";
import {
  useEmployeeQuery,
  useResetEmployeePasswordMutation,
  useToggleEmployeeStatusMutation,
  useUpdateEmployeeMutation,
} from "../../../hooks/useEmployeeQuery";
import { useAuth } from "../../../hooks/useAuthQuery";
import { formatDate } from "../../../utils/helpers";

const { Text, Title } = Typography;

interface EmployeeViewContentProps {
  employeeId: number;
  isModal?: boolean;
  onClose?: () => void;
}

export const EmployeeViewContent = ({
  employeeId,
  isModal = false,
  onClose,
}: EmployeeViewContentProps) => {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useEmployeeQuery(employeeId);
  const toggleStatus = useToggleEmployeeStatusMutation();
  const updateEmployee = useUpdateEmployeeMutation();
  const resetPassword = useResetEmployeePasswordMutation();

  useEffect(() => {
    if (!employee) return;
    editForm.setFieldsValue({
      name: employee.name,
      phone: employee.phone || "",
      role: employee.role,
    });
  }, [employee, editForm]);

  const canToggle = user?.role === "ADMIN" && Number(user?.id) !== employee?.id;
  const canManage = user?.role === "ADMIN";

  const roleTag = useMemo(() => {
    if (!employee) return null;
    return employee.role === "ADMIN" ? (
      <Tag color="gold" icon={<SafetyCertificateOutlined />}>
        ADMIN
      </Tag>
    ) : (
      <Tag color="blue" icon={<UserOutlined />}>
        STAFF
      </Tag>
    );
  }, [employee]);

  const statusTag = useMemo(() => {
    if (!employee) return null;
    return employee.isActive ? (
      <Tag color="success" icon={<CheckCircleFilled />}>
        Hoạt động
      </Tag>
    ) : (
      <Tag color="error" icon={<StopFilled />}>
        Vô hiệu
      </Tag>
    );
  }, [employee]);

  if (isLoading) return <Loading />;

  if (isError || !employee) {
    return (
      <Alert
        type="error"
        message="Khong tim thay nhan vien"
        description={(error as any)?.message}
        action={onClose ? <Button onClick={onClose}>Dong</Button> : undefined}
      />
    );
  }

  const handleToggleStatus = () => {
    toggleStatus.mutate({ id: employee.id, isActive: !employee.isActive });
  };

  const handleUpdateEmployee = async () => {
    const values = await editForm.validateFields();
    await updateEmployee.mutateAsync({
      id: employee.id,
      payload: {
        name: values.name,
        phone: values.phone,
        role: values.role,
      },
    });
    setEditOpen(false);
  };

  const handleResetPassword = async () => {
    const values = await resetForm.validateFields();
    await resetPassword.mutateAsync({
      id: employee.id,
      newPassword: values.newPassword,
    });
    resetForm.resetFields();
    setResetOpen(false);
  };

  const actionButtons = (
    <Space wrap>
      {canManage && (
        <>
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
            Cập nhật thông tin
          </Button>
          <Button icon={<KeyOutlined />} onClick={() => setResetOpen(true)}>
            Đặt lại mật khẩu
          </Button>
        </>
      )}
      {canToggle && (
        <Popconfirm
          title={
            employee.isActive
              ? "Vô hiệu hóa tài khoản này?"
              : "Kích hoạt lại tài khoản này?"
          }
          onConfirm={handleToggleStatus}
          okText="Xác nhận"
          cancelText="Hủy"
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
            {employee.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </Button>
        </Popconfirm>
      )}
    </Space>
  );

  const content = (
    <>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card
          style={{
            background:
              "linear-gradient(135deg, rgba(22,119,255,0.12) 0%, rgba(19,194,194,0.08) 100%)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Avatar
                size={80}
                src={employee.avatar}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1677ff" }}
              />
            </Col>
            <Col flex="auto">
              <Space direction="vertical" size={6}>
                <Title level={4} style={{ margin: 0 }}>
                  {employee.name}
                </Title>
                <Text type="secondary">Nhan su noi bo</Text>
                <Space size={8} wrap>
                  {roleTag}
                  {statusTag}
                </Space>
              </Space>
            </Col>
            {!isModal && <Col>{actionButtons}</Col>}
          </Row>
        </Card>

        {isModal && <Card>{actionButtons}</Card>}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ background: "#fafafa" }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary">
                  <MailOutlined /> Email
                </Text>
                <Text strong>{employee.email}</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card size="small" style={{ background: "#fafafa" }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary">
                  <PhoneOutlined /> So dien thoai
                </Text>
                <Text strong>{employee.phone || "Chưa cập nhât"}</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card size="small" style={{ background: "#fafafa" }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary">
                  <CalendarOutlined /> Ngày tạo
                </Text>
                <Text strong>{formatDate(employee.createdAt)}</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal
        title="Cập nhật nhân viên"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleUpdateEmployee}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ loading: updateEmployee.isPending }}
      >
        <Form form={editForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Chọn vai trò" }]}
          >
            <Select
              options={[
                { value: "STAFF", label: "STAFF" },
                { value: "ADMIN", label: "ADMIN" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đặt lại mật khẩu"
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onOk={handleResetPassword}
        okText="Cập nhật"
        cancelText="ủy"
        okButtonProps={{ loading: resetPassword.isPending }}
      >
        <Form form={resetForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp"),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  if (isModal) {
    return content;
  }

  return (
    <div>
      <PageHeader
        title={employee.name}
        subtitle={employee.email}
        showBack
        onBack={onClose}
      />
      {content}
    </div>
  );
};

const EmployeeView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const employeeId = parseInt(id || "0", 10);

  return (
    <EmployeeViewContent
      employeeId={employeeId}
      onClose={() => navigate("/employees")}
    />
  );
};

export default EmployeeView;
