import { useState, useMemo, useEffect, useCallback } from "react";
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

  // Read filter state from URL params
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || undefined;
  const methodFilter = searchParams.get("method") || undefined;
  const dateRange = useMemo(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    return startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null;
  }, [searchParams]);

  // Update URL params when filters change
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

  const handleSearchChange = useCallback(
    (value: string) => {
      updateFilters({ search: value });
    },
    [updateFilters],
  );

  const handleStatusFilter = useCallback(
    (value: string | undefined) => {
      updateFilters({ status: value });
    },
    [updateFilters],
  );

  const handleMethodFilter = useCallback(
    (value: string | undefined) => {
      updateFilters({ method: value });
    },
    [updateFilters],
  );

  const handleDateRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        updateFilters({
          startDate: dates[0].format("YYYY-MM-DD"),
          endDate: dates[1].format("YYYY-MM-DD"),
        });
      } else {
        updateFilters({ startDate: undefined, endDate: undefined });
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
    });
  };

  const queryParams = useMemo(() => {
    const params: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };
    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (statusFilter) params.status = statusFilter;
    if (methodFilter) params.method = methodFilter;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      params.endDate = dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [searchParams, searchTerm, statusFilter, methodFilter, dateRange]);

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
