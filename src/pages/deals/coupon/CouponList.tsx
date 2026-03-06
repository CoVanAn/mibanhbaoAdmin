import { useState } from "react";
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
} from "../../../hooks/usePromotionQuery";
import type { Coupon } from "../../../schema/coupon.schema";
import CouponFormModal from "./CouponFormModal";
import CouponRedemptionDrawer from "./CouponRedemptionDrawer";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Search } = Input;
const { Text } = Typography;

export default function CouponList() {
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [redemptionCoupon, setRedemptionCoupon] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

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

  const handleSubmit = async (values: any) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
    } else {
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

      render: (_: any, record) => (
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
      render: (_: any, record) => formatExpiry(record),
    },
    {
      title: "Lượt dùng",
      width: 80,
      align: "center",
      render: (_: any, record) => (
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
          onChange={(checked) => handleToggleActive(record, checked)}
        />
      ),
    },
    {
      title: "Thao tác",
      width: 200,

      render: (_: any, record) => (
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
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo coupon
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={coupons}
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
