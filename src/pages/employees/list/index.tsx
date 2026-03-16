import { useCallback, useMemo } from "react";
import { Alert, Button, Card, Space, Table, Tag, Typography } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, Loading } from "../../../components/common";
import { useEmployeesQuery } from "../../../hooks/useEmployeeQuery";
import type { EmployeeListItem } from "../../../schema/employee.schema";
import { formatDate } from "../../../utils/helpers";

const { Text } = Typography;

const EmployeesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || undefined;
  const isActiveFilter = searchParams.get("isActive") || undefined;

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === "") {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        });
        return newParams;
      });
    },
    [setSearchParams],
  );

  const queryParams = useMemo(() => {
    const params: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };

    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (roleFilter) params.role = roleFilter;
    if (isActiveFilter) params.isActive = isActiveFilter;

    return params;
  }, [searchParams, searchTerm, roleFilter, isActiveFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEmployeesQuery(queryParams);

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
        title: "Đơn đã xử lý",
        dataIndex: "ordersHandledCount",
        key: "ordersHandledCount",
        width: 120,
        align: "center" as const,
        render: (count: number) => <Text strong>{count}</Text>,
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
          isActive ? <Tag color="success">Hoạt động</Tag> : <Tag color="error">Vô hiệu</Tag>,
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
            onClick={() => navigate(`/employees/${e.id}`)}
            size="small"
          >
            Xem
          </Button>
        ),
      },
    ],
    [navigate],
  );

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Nhân viên"
        subtitle={data?.pagination ? `${data.pagination.total} nhân sự` : undefined}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Làm mới
          </Button>
        }
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
          <Button onClick={() => updateFilters({ role: undefined })}>Tất cả vai trò</Button>
          <Button onClick={() => updateFilters({ role: "ADMIN" })}>ADMIN</Button>
          <Button onClick={() => updateFilters({ role: "STAFF" })}>STAFF</Button>
          <Button onClick={() => updateFilters({ isActive: "true" })}>Đang hoạt động</Button>
          <Button onClick={() => updateFilters({ isActive: "false" })}>Đang vô hiệu</Button>
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
            onClick: () => navigate(`/employees/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
};

export default EmployeesList;
