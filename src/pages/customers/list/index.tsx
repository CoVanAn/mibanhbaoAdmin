import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, Table, Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomersQuery } from "../../../hooks/useCustomerQuery";
import { PageHeader, Loading } from "../../../components/common";
import FilterBar from "./components/FilterBar";
import { getCustomerColumns } from "./utils/columns";

const CustomersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter state from URL params
  const searchTerm = searchParams.get("search") || "";
  const isActiveFilter = searchParams.get("isActive") || undefined;

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

  const handleIsActiveChange = useCallback(
    (value?: string) => {
      updateFilters({ isActive: value });
    },
    [updateFilters],
  );

  const handleReset = () => {
    updateFilters({ search: undefined, isActive: undefined });
  };

  const queryParams = useMemo(() => {
    const params: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };
    if (searchTerm) params.search = searchTerm.trim().replace(/\s+/g, " ");
    if (isActiveFilter) params.isActive = isActiveFilter;
    return params;
  }, [searchParams, searchTerm, isActiveFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useCustomersQuery(queryParams);

  const columns = useMemo(
    () => getCustomerColumns((id) => navigate(`/customers/${id}`)),
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

      <FilterBar
        searchTerm={searchTerm}
        isActiveFilter={isActiveFilter}
        isFetching={isFetching}
        onSearch={handleSearchChange}
        onSearchChange={handleSearchChange}
        onIsActiveChange={handleIsActiveChange}
        onReset={handleReset}
      />

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
