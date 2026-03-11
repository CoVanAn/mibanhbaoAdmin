import { useState, useMemo, useEffect } from "react";
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

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [isActiveFilter, setIsActiveFilter] = useState<string | undefined>(
    searchParams.get("isActive") || undefined,
  );

  // Debounce search: chỉ trigger sau 500ms dừng nhập
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      updateUrl({ search: searchTerm, page: "1" });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Build query params — dùng debouncedSearch để tránh gọi API mỗi lần gõ
  const queryParams = useMemo(() => {
    const params: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (isActiveFilter !== undefined) params.isActive = isActiveFilter;
    return params;
  }, [searchParams, debouncedSearch, isActiveFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useCustomersQuery(queryParams);

  const columns = useMemo(
    () => getCustomerColumns((id) => navigate(`/customers/${id}`)),
    [navigate],
  );

  // URL sync helper
  const updateUrl = (updates: Record<string, string | undefined>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next: Record<string, string> = { ...current };
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === "") {
        delete next[k];
      } else {
        next[k] = v;
      }
    }
    setSearchParams(next);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Khi nhấn Enter / nút search thì apply ngay, không chờ debounce
    setDebouncedSearch(value);
    updateUrl({ search: value, page: "1" });
  };

  const handleIsActiveChange = (value?: string) => {
    setIsActiveFilter(value);
    updateUrl({ isActive: value, page: "1" });
  };

  const handleReset = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setIsActiveFilter(undefined);
    setSearchParams({});
  };

  const handleTableChange = (pagination: any) => {
    updateUrl({
      page: String(pagination.current),
      limit: String(pagination.pageSize),
    });
  };

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
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
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
          onChange={handleTableChange}
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
