import { useState, useMemo } from "react";
import { Card, Table, Button, Alert } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrdersQuery } from "../../../hooks/useOrderQuery";
import { PageHeader, Loading } from "../../../components/common";
import FilterBar from "./components/FilterBar";
import Stats from "./components/Stats";
import { getOrderColumns, calculateOrderStats } from "./utils";

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

  // Data fetching
  const { data, isLoading, isFetching, error, isError, refetch } =
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
          style={{ margin: 0, color: "#1f2937", fontSize: 24, fontWeight: 600 }}
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
        dateRange={dateRange}
        isFetching={isFetching}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
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
