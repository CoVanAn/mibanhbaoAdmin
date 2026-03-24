import { useMemo } from "react";
import {
  Card,
  Table,
  Alert,
  Button,
  Row,
  Col,
  Input,
  Select,
  Affix,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCustomersQuery } from "../../../hooks/useCustomerQuery";
import { useListUrlFilters } from "../../../hooks/useListUrlFilters";
import { PageHeader, Loading } from "../../../components/common";
// import { getCustomerColumns } from "./utils/columns";
import { Space, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { CustomerListItem } from "../../../schema/customer.schema";
import { formatDate } from "../../../utils/helpers";

const { Option } = Select;

const CustomersList = () => {
  const navigate = useNavigate();
  const { page, limit, updateFilters, readString, readOptionalString } =
    useListUrlFilters();

  const searchTerm = readString("search");
  const isActiveFilter = readOptionalString("isActive");

  const handleReset = () => {
    updateFilters({ search: undefined, isActive: undefined, page: undefined });
  };

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      isActive?: boolean;
    } = {
      page,
      limit,
    };
    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (isActiveFilter) params.isActive = isActiveFilter === "true";
    return params;
  }, [page, limit, searchTerm, isActiveFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useCustomersQuery(queryParams);

  // const columns = useMemo(
  //   () => getCustomerColumns((id) => navigate(`/customers/${id}`)),
  //   [navigate],
  // );
  const { Text } = Typography;

  const columns = useMemo(
    () => [
      {
        title: "Tên khách hàng",
        key: "name",
        width: 200,
        render: (_: any, c: CustomerListItem) => (
          <Space direction="vertical" size={0}>
            <Text strong>{c.name}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {c.email}
            </Text>
          </Space>
        ),
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: 130,
        render: (phone: string | null) =>
          phone || <Text type="secondary">—</Text>,
      },
      {
        title: "Đơn hàng",
        dataIndex: "ordersCount",
        key: "ordersCount",
        width: 90,
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
        width: 110,
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
        render: (_: any, c: CustomerListItem) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/customers/${c.id}`);
            }}
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
        title="Khách hàng"
        subtitle={
          data?.pagination ? `${data.pagination.total} khách hàng` : undefined
        }
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

      <Affix offsetTop={0}>
        <Card
          style={{
            marginBottom: 16,
            boxShadow: isFetching ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Input.Search
                allowClear
                placeholder="Tìm theo tên, email, SĐT"
                defaultValue={searchTerm}
                onSearch={(value) =>
                  updateFilters({ search: value || undefined, page: undefined })
                }
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: "100%" }}
                value={isActiveFilter}
                onChange={(val) =>
                  updateFilters({ isActive: val || undefined, page: undefined })
                }
                disabled={isFetching}
              >
                <Option value="true">Hoạt động</Option>
                <Option value="false">Vô hiệu</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={isFetching}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>
        </Card>
      </Affix>

      {isError && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={(error as any)?.message}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.customers ?? []}
          loading={isFetching}
          scroll={{ x: 800 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: data?.pagination?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
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
            onClick: () => navigate(`/customers/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
};

export default CustomersList;
