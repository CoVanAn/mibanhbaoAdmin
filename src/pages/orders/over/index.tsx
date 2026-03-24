import { useMemo, useCallback } from "react";
import { Card, Table, Button, Alert } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useOrdersQuery } from "../../../hooks/useOrderQuery";
import { useListUrlFilters } from "../../../hooks/useListUrlFilters";
import { Loading } from "../../../components/common";
import FilterBar from "./components/FilterBar";
import Stats from "./components/Stats";
import { getOrderColumns, calculateOrderStats } from "./utils";

const OrdersList = () => {
  const navigate = useNavigate();
  const {
    searchParams,
    page,
    limit,
    updateFilters,
    readString,
    readOptionalString,
  } = useListUrlFilters();

  // Read filter state from URL params
  const searchTerm = readString("search");
  const statusFilter = readOptionalString("status");
  const methodFilter = readOptionalString("method");
  const dateRange = useMemo(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    return startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null;
  }, [searchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      updateFilters({ search: value, page: undefined });
    },
    [updateFilters],
  );

  const handleStatusFilter = useCallback(
    (value: string | undefined) => {
      updateFilters({ status: value, page: undefined });
    },
    [updateFilters],
  );

  const handleMethodFilter = useCallback(
    (value: string | undefined) => {
      updateFilters({ method: value, page: undefined });
    },
    [updateFilters],
  );

  const handleDateRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        updateFilters({
          startDate: dates[0].format("YYYY-MM-DD"),
          endDate: dates[1].format("YYYY-MM-DD"),
          page: undefined,
        });
      } else {
        updateFilters({
          startDate: undefined,
          endDate: undefined,
          page: undefined,
        });
      }
    },
    [updateFilters],
  );

  const handleResetFilters = () => {
    updateFilters({
      search: undefined,
      status: undefined,
      method: undefined,
      startDate: undefined,
      endDate: undefined,
      page: undefined,
    });
  };

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
    } = {
      page,
      limit,
    };
    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (statusFilter) params.status = statusFilter;
    if (methodFilter) params.method = methodFilter;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      params.endDate = dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [page, limit, searchTerm, statusFilter, methodFilter, dateRange]);

  // Data fetching
  const { data, isLoading, isFetching, isError, error, refetch } =
    useOrdersQuery(queryParams);

  // Stats calculation
  const stats = useMemo(
    () => calculateOrderStats(data?.orders, data?.pagination?.total),
    [data],
  );

  // Table columns
  const columns = useMemo(
    () => getOrderColumns((id) => navigate(`/orders/${id}`)),
    [navigate],
  );

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
    <div style={{ padding: 16 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1f2937",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Quản lý đơn hàng
        </h2>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      <Stats stats={stats} />

      <FilterBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        methodFilter={methodFilter}
        dateRange={dateRange as [Dayjs | null, Dayjs | null] | null}
        isFetching={isFetching}
        onSearch={handleSearchChange}
        onSearchTermChange={handleSearchChange}
        onStatusChange={handleStatusFilter}
        onMethodChange={handleMethodFilter}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleResetFilters}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={data?.orders || []}
          rowKey="id"
          loading={isFetching}
          scroll={{ x: 1400 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.limit,
            total: data?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            onChange: (page, pageSize) =>
              updateFilters({
                page: page.toString(),
                limit: pageSize.toString(),
              }),
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersList;
