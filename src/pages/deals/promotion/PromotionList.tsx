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
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {
  usePromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} from "../../../hooks/usePromotionQuery";
import type { Promotion } from "../../../schema/promotion.schema";
import PromotionFormModal from "./PromotionFormModal";
import PromotionTargetModal from "./PromotionTargetModal";
import dayjs from "dayjs";

const { Search } = Input;

export default function PromotionList() {
  const [formOpen, setFormOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [targetPromotion, setTargetPromotion] = useState<Promotion | null>(
    null,
  );

  const { data: promotions = [], isLoading } = usePromotionsQuery();
  const createMutation = useCreatePromotionMutation();
  const updateMutation = useUpdatePromotionMutation();
  const deleteMutation = useDeletePromotionMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record: Promotion) => {
    setEditing(record);
    setFormOpen(true);
  };

  const openTargets = (record: Promotion) => {
    setTargetPromotion(record);
    setTargetOpen(true);
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

  const handleToggleActive = async (record: Promotion, checked: boolean) => {
    await updateMutation.mutateAsync({
      id: record.id,
      data: { isActive: checked },
    });
  };

  const formatValue = (type: string, value: number) =>
    type === "PERCENT" ? `${value}%` : `${value.toLocaleString("vi-VN")} ₫`;

  const columns: ColumnsType<Promotion> = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   width: 20,
    // },
    {
      title: "Tên ưu đãi",
      dataIndex: "name",
      align: "center",
      width: 200,
      render: (name: string, record) => (
        <div>
          <strong>{name}</strong>
          {record.isGlobal && (
            <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>
              Toàn bộ
            </Tag>
          )}
        </div>
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
          {formatValue(record.type, record.value)}
        </strong>
      ),
    },
    {
      title: "Thời gian",
      width: 100,
      align: "center",
      render: (_: any, record) => (
        <div
          style={{
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>{dayjs(record.startsAt).format("DD/MM/YY HH:mm")}</div>
          <p style={{ margin: " -2px 5px 2px 5px" }}> → </p>
          <div style={{ color: "#555555" }}>
            {dayjs(record.endsAt).format("DD/MM/YY HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Lượt dùng",
      width: 80,
      align: "center",
      render: (_: any, record) => (
        <span>
          {record.usedCount}
          {record.maxUses != null ? ` / ${record.maxUses}` : ""}
        </span>
      ),
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      width: 80,
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
      width: 150,
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
          <Tooltip title="Ưu đãi">
            <Button
              size="small"
              icon={<ApartmentOutlined />}
              onClick={() => openTargets(record)}
              disabled={record.isGlobal}
            />
          </Tooltip>
          <> </>
          <Popconfirm
            title="Xóa ưu đãi này?"
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
        <Space>
          <Search
            placeholder="Tìm tên ưu đãi..."
            style={{ width: 240 }}
            allowClear
          />
          <Select placeholder="Trạng thái" allowClear style={{ width: 140 }}>
            <Select.Option value="true">Đang hoạt động</Select.Option>
            <Select.Option value="false">Tạm ngừng</Select.Option>
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm ưu đãi
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={promotions}
        loading={isLoading}
        size="middle"
        pagination={{ pageSize: 15, showTotal: (t) => `Tổng ${t}` }}
      />

      <PromotionFormModal
        open={formOpen}
        promotion={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {targetPromotion && (
        <PromotionTargetModal
          open={targetOpen}
          promotion={targetPromotion}
          onClose={() => {
            setTargetOpen(false);
            setTargetPromotion(null);
          }}
        />
      )}
    </>
  );
}
