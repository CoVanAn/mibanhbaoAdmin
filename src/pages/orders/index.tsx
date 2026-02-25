import { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Select,
  Typography,
  Row,
  Col,
  Tooltip,
  Alert,
  Affix,
  DatePicker,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrdersQuery } from "../../hooks/useOrderQuery";
import { PageHeader, Loading } from "../../components/common";
import {
  ORDER_STATUS_CONFIG,
  FULFILLMENT_METHOD_CONFIG,
  formatCurrencyVND,
  formatDateTime,
  getCustomerName,
  getCustomerPhone,
  getAvailableStatuses,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "../../utils/orderHelpers";
import type { Order, OrderStatus } from "../../schema/order.schema";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const OrdersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    searchParams.get("status") || undefined,
  );
  const [methodFilter, setMethodFilter] = useState<string | undefined>(
    searchParams.get("method") || undefined,
  );
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate && endDate) {
      return [dayjs(startDate), dayjs(endDate)];
    }
    return null;
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (methodFilter) params.method = methodFilter;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      // Add 1 day to endDate to include all orders on the selected end date
      params.endDate = dateRange[1].add(1, "day").format("YYYY-MM-DD");
    }
    return params;
  }, [searchParams, searchTerm, statusFilter, methodFilter, dateRange]);

  // Queries
  const { data, isLoading, isFetching, error, isError, refetch } =
    useOrdersQuery(queryParams);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateUrl({ search: value, page: "1" });
  };

  const handleStatusFilter = (value: string | undefined) => {
    setStatusFilter(value);
    updateUrl({ status: value, page: "1" });
  };

  const handleMethodFilter = (value: string | undefined) => {
    setMethodFilter(value);
    updateUrl({ method: value, page: "1" });
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      updateUrl({
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
        page: "1",
      });
    } else {
      updateUrl({ startDate: undefined, endDate: undefined, page: "1" });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(undefined);
    setMethodFilter(undefined);
    setDateRange(null);
    setSearchParams({});
  };

  const handleViewOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    updateUrl({ page: page.toString(), limit: pageSize.toString() });
  };

  const updateUrl = (updates: Record<string, string | undefined>) => {
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
  };

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      width: 100,
      fixed: "left" as const,
      render: (code: string) => (
        <Text strong style={{ fontSize: "13px" }}>
          {code}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 120,
      render: (_: any, order: Order) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getCustomerName(order)}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {getCustomerPhone(order)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      width: 120,
      align: "left" as const,
      render: (method: string) => {
        const config =
          FULFILLMENT_METHOD_CONFIG[
            method as keyof typeof FULFILLMENT_METHOD_CONFIG
          ];
        return (
          <Tag color={config.color}>
            {/* {config.icon}  */}
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Số món",
      dataIndex: "items",
      key: "itemCount",
      width: 60,
      align: "center" as const,
      render: (items: any[]) => <Text strong>{items?.length || 0}</Text>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 100,
      align: "center" as const,
      render: (total: number) => (
        <Text strong style={{ color: "#cf1322" }}>
          {formatCurrencyVND(total)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: OrderStatus) => {
        const availableStatuses = getAvailableStatuses(status);

        if (availableStatuses.length === 0) {
          // Terminal status - no more transitions
          return (
            <Tag color={getOrderStatusColor(status)}>
              {getOrderStatusLabel(status)}
            </Tag>
          );
        }

        return (
          <Tag color={getOrderStatusColor(status)}>
            {getOrderStatusLabel(status)}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: "12px" }}>{formatDateTime(date)}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, order: Order) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewOrder(order.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Summary statistics
  const stats = useMemo(() => {
    if (!data?.orders) return null;

    const orders = data.orders;
    const totalOrders = data.pagination?.total || orders.length;
    const pendingCount = orders.filter(
      (o: Order) => o.status === "PENDING",
    ).length;
    const completedCount = orders.filter(
      (o: Order) => o.status === "COMPLETED",
    ).length;
    const totalRevenue = orders
      .filter((o: Order) => o.status === "COMPLETED")
      .reduce((sum: number, o: Order) => sum + Number(o.total), 0);

    return {
      totalOrders,
      pendingCount,
      completedCount,
      totalRevenue,
    };
  }, [data]);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div>
        <Alert
          message="Lỗi tải danh sách đơn hàng"
          description={
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách đơn hàng. Vui lòng thử lại."
          }
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
        }
      />

      {stats && (
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
      )}

      <Affix offsetTop={0}>
        <Card
          style={{
            marginBottom: 16,
            boxShadow: isFetching ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row gutter={16}>
              <Col span={6}>
                <Search
                  placeholder="Tìm theo mã đơn, tên, SĐT..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={handleSearch}
                  disabled={isFetching}
                />
              </Col>
              <Col span={6}>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  disabled={isFetching}
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Trạng thái"
                  allowClear
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  disabled={isFetching}
                  loading={isFetching}
                >
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Phương thức"
                  allowClear
                  style={{ width: "100%" }}
                  value={methodFilter}
                  onChange={handleMethodFilter}
                  disabled={isFetching}
                  loading={isFetching}
                >
                  {Object.entries(FULFILLMENT_METHOD_CONFIG).map(
                    ([key, config]) => (
                      <Option key={key} value={key}>
                        {config.icon} {config.label}
                      </Option>
                    ),
                  )}
                </Select>
              </Col>
              <Col span={4}>
                <Space>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={handleResetFilters}
                    disabled={isFetching}
                  >
                    Reset
                  </Button>
                  {isFetching && <Text type="secondary">Đang tải...</Text>}
                </Space>
              </Col>
            </Row>
          </Space>
        </Card>
      </Affix>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.orders || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: data?.pagination?.page || 1,
            pageSize: data?.pagination?.limit || 20,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            onChange: handlePageChange,
            pageSizeOptions: ["10", "20", "50", "100"],
            disabled: isFetching,
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersList;
