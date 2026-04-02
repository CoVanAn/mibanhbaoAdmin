import { useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Popconfirm,
  Tooltip,
  Input,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import {
  useCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../../../hooks/useCouponQuery";
import type { CouponPayload } from "../../../api/coupons";
import type { Coupon } from "../../../schema/coupon.schema";
import CouponFormModal, { type CouponModalSubmitPayload } from "./CouponFormModal";
import CouponRedemptionDrawer from "./CouponRedemptionDrawer";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import useStore from "../../../store/useStore";

const { Search } = Input;
const { Text } = Typography;

export default function CouponList() {
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [redemptionCoupon, setRedemptionCoupon] = useState<Coupon | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const userRole = useStore((state) => state.user?.role);
  const isStaff = userRole?.toUpperCase() === "STAFF";

  const { data: coupons = [], isLoading } = useCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

  const filteredCoupons = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return coupons;

    return coupons.filter((coupon) => coupon.code.toLowerCase().includes(keyword));
  }, [coupons, searchValue]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record: Coupon) => {
    setEditing(record);
    setFormOpen(true);
  };

  const openRedemptions = (record: Coupon) => {
    setRedemptionCoupon(record);
    setDrawerOpen(true);
  };

  const isCreatePayload = (
    payload: CouponModalSubmitPayload,
  ): payload is CouponPayload => {
    const candidate = payload as Partial<CouponPayload>;
    return (
      typeof candidate.code === "string" &&
      !!candidate.code &&
      (candidate.type === "PERCENT" || candidate.type === "FIXED") &&
      typeof candidate.value === "number"
    );
  };

  const handleSubmit = async (values: CouponModalSubmitPayload) => {
    if (editing) {
      const updateData: Partial<Omit<CouponPayload, "code">> = {
        type: values.type,
        value: values.value,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        minSubtotal: values.minSubtotal,
        maxRedemptions: values.maxRedemptions,
        perUserLimit: values.perUserLimit,
        isActive: values.isActive,
      };

      await updateMutation.mutateAsync({
        id: editing.id,
        data: updateData,
      });
    } else {
      if (!isCreatePayload(values)) {
        return;
      }
      await createMutation.mutateAsync(values);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleActive = async (record: Coupon, checked: boolean) => {
    await updateMutation.mutateAsync({
      id: record.id,
      data: { isActive: checked },
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.info(`Đã sao chép mã: ${code}`);
  };

  const formatExpiry = (coupon: Coupon) => {
    if (!coupon.endsAt) return <Text type="secondary">Không hết hạn</Text>;
    const expired = dayjs(coupon.endsAt).isBefore(dayjs());
    return (
      <Text type={expired ? "danger" : undefined} style={{ fontSize: 14 }}>
        {expired && "Hết hạn: "}
        {dayjs(coupon.endsAt).format("DD/MM/YYYY HH:mm")}
      </Text>
    );
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: "Mã coupon",
      dataIndex: "code",
      width: 100,
      align: "center",
      render: (code: string) => (
        <Space>
          <Tag
            color="geekblue"
            style={{ fontFamily: "monospace", fontSize: 13, cursor: "pointer" }}
            onClick={() => copyCode(code)}
          >
            {code}
          </Tag>
          <Tooltip title="Sao chép">
            <CopyOutlined
              style={{ color: "#999", cursor: "pointer" }}
              onClick={() => copyCode(code)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      width: 80,
      align: "center",
      render: (type: string) => (
        <Tag color={type === "PERCENT" ? "purple" : "orange"}>
          {type === "PERCENT" ? "%" : "VND cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      width: 80,
      align: "center",

      render: (_: unknown, record) => (
        <strong style={{ color: "#f5222d" }}>
          {record.type === "PERCENT"
            ? `${record.value}%`
            : `${record.value.toLocaleString("vi-VN")} ₫`}
        </strong>
      ),
    },
    {
      title: "Hết hạn",
      width: 100,
      align: "center",
      render: (_: unknown, record) => formatExpiry(record),
    },
    {
      title: "Lượt dùng",
      width: 80,
      align: "center",
      render: (_: unknown, record) => (
        <span>
          {record.usedCount}
          {record.maxRedemptions != null ? ` / ${record.maxRedemptions}` : ""}
        </span>
      ),
    },
    {
      title: "Mỗi người",
      dataIndex: "perUserLimit",
      width: 80,
      align: "center",
      render: (v: number | null | undefined) =>
        v != null ? `${v} lượt` : <Text type="secondary">—</Text>,
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      width: 100,
      align: "center",
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          size="small"
          loading={updateMutation.isPending}
          disabled={isStaff}
          onChange={(checked) => handleToggleActive(record, checked)}
        />
      ),
    },
    {
      title: "Thao tác",
      width: 200,

      render: (_: unknown, record) =>
        isStaff ? (
          <Tag>Chỉ xem</Tag>
        ) : (
          <Space size={4}>
            <Tooltip title="Sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
              />
            </Tooltip>
            <> </>
            <Tooltip title="Lịch sử đổi">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => openRedemptions(record)}
              />
            </Tooltip>
            <> </>
            <Popconfirm
              title="Xóa coupon này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Tìm mã coupon..."
          style={{ width: 240 }}
          allowClear
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo coupon
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredCoupons}
        loading={isLoading}
        size="middle"
        pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t}` }}
      />

      <CouponFormModal
        open={formOpen}
        coupon={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {redemptionCoupon && (
        <CouponRedemptionDrawer
          open={drawerOpen}
          coupon={redemptionCoupon}
          onClose={() => {
            setDrawerOpen(false);
            setRedemptionCoupon(null);
          }}
        />
      )}
    </>
  );
}
