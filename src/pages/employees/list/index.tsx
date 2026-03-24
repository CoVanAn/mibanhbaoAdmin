import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { ReloadOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader, Loading } from "../../../components/common";
import { useListUrlFilters } from "../../../hooks/useListUrlFilters";
import { EmployeeViewContent } from "../view/index";
import {
  useCreateEmployeeMutation,
  useEmployeesQuery,
} from "../../../hooks/useEmployeeQuery";
import { useAuth } from "../../../hooks/useAuthQuery";
import type { EmployeeListItem } from "../../../schema/employee.schema";
import { formatDate } from "../../../utils/helpers";
import type { EmployeeListParams } from "../../../api/employees";

const { Text } = Typography;

const EmployeesList = () => {
  const { user } = useAuth();
  const { page, limit, updateFilters, readString, readOptionalString } =
    useListUrlFilters();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [createForm] = Form.useForm();
  const createMutation = useCreateEmployeeMutation();

  const searchTerm = readString("search");
  const roleFilter = readOptionalString("role");
  const isActiveFilter = readOptionalString("isActive");

  const queryParams = useMemo(() => {
    const params: EmployeeListParams = {
      page,
      limit,
    };

    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (roleFilter === "ADMIN" || roleFilter === "STAFF") {
      params.role = roleFilter;
    }
    if (isActiveFilter) params.isActive = isActiveFilter === "true";

    return params;
  }, [page, limit, searchTerm, roleFilter, isActiveFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEmployeesQuery(queryParams);

  const canManage = user?.role === "ADMIN";

  const handleOpenView = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleCreateEmployee = async () => {
    const values = await createForm.validateFields();
    await createMutation.mutateAsync({
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      password: values.password,
    });
    createForm.resetFields();
    setCreateOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        title: "Nhân sự",
        key: "name",
        width: 220,
        render: (_: unknown, e: EmployeeListItem) => (
          <Space direction="vertical" size={0}>
            <Text strong>{e.name}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {e.email}
            </Text>
          </Space>
        ),
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
        width: 120,
        render: (role: string) =>
          role === "ADMIN" ? <Tag color="gold">ADMIN</Tag> : <Tag>STAFF</Tag>,
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: 140,
        render: (phone: string | null) =>
          phone || <Text type="secondary">—</Text>,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) => (
          <Text style={{ fontSize: "13px" }}>{formatDate(date)}</Text>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "isActive",
        key: "isActive",
        width: 120,
        align: "center" as const,
        render: (isActive: boolean) =>
          isActive ? (
            <Tag color="success">Hoạt động</Tag>
          ) : (
            <Tag color="error">Vô hiệu</Tag>
          ),
      },
      {
        title: "Hành động",
        key: "action",
        width: 90,
        align: "center" as const,
        fixed: "right" as const,
        render: (_: unknown, e: EmployeeListItem) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              handleOpenView(e.id);
            }}
            size="small"
          >
            Xem
          </Button>
        ),
      },
    ],
    [handleOpenView],
  );

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Nhân viên"
        subtitle={
          data?.pagination ? `${data.pagination.total} nhân sự` : undefined
        }
        extra={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Làm mới
          </Button>,
          ...(canManage
            ? [
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateOpen(true)}
                >
                  Thêm nhân sự
                </Button>,
              ]
            : []),
        ]}
      />

      {isError && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={(error as any)?.message}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Tìm theo tên, email, SĐT"
            defaultValue={searchTerm}
            style={{ width: 280 }}
            onSearch={(value) =>
              updateFilters({ search: value || undefined, page: undefined })
            }
          />
          <Select
            style={{ width: 160 }}
            value={roleFilter}
            onChange={(value) =>
              updateFilters({ role: value || undefined, page: undefined })
            }
          >
            <Select.Option value="">Tất cả vai trò</Select.Option>
            <Select.Option value="ADMIN">ADMIN</Select.Option>
            <Select.Option value="STAFF">STAFF</Select.Option>
          </Select>
          <Select
            style={{ width: 160 }}
            value={isActiveFilter}
            onChange={(value) =>
              updateFilters({ isActive: value || undefined, page: undefined })
            }
          >
            <Select.Option value="">Tất cả trạng thái</Select.Option>
            <Select.Option value="true">Đang hoạt động</Select.Option>
            <Select.Option value="false">Đang vô hiệu</Select.Option>
          </Select>
          <Button
            onClick={() =>
              updateFilters({
                search: undefined,
                role: undefined,
                isActive: undefined,
                page: undefined,
              })
            }
          >
            Đặt lại
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.employees ?? []}
          loading={isFetching}
          scroll={{ x: 900 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: data?.pagination?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân sự`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={(pagination) =>
            updateFilters({
              page: String(pagination.current),
              limit: String(pagination.pageSize),
            })
          }
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => handleOpenView(record.id),
          })}
        />
      </Card>

      <Modal
        title={null}
        open={viewOpen}
        footer={null}
        onCancel={handleCloseView}
        width={980}
        centered
      >
        {selectedEmployeeId ? (
          <EmployeeViewContent
            employeeId={selectedEmployeeId}
            isModal
            onClose={handleCloseView}
          />
        ) : null}
      </Modal>

      <Modal
        title="Thêm nhân sự"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreateEmployee}
        okText="Tạo tài khoản"
        cancelText="Huỷ"
        okButtonProps={{ loading: createMutation.isPending }}
      >
        <Form form={createForm} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="staff@example.com" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="098xxxxxxx" />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            initialValue="STAFF"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select
              options={[
                { value: "STAFF", label: "STAFF" },
                { value: "ADMIN", label: "ADMIN" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu tạm"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password placeholder="******" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesList;
