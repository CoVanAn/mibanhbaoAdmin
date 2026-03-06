import { useState } from "react";
import { Modal, Tabs, Select, Button, Space, Typography, Divider } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import {
  useAddPromotionTargetsMutation,
  useRemovePromotionTargetsMutation,
} from "../../../hooks/usePromotionQuery";
import type { Promotion } from "../../../schema/promotion.schema";
import type { PromotionTargetPayload } from "../../../api/promotions";

const { Text } = Typography;

interface Props {
  open: boolean;
  promotion: Promotion;
  onClose: () => void;
}

type TargetKey = "categoryIds" | "productIds" | "variantIds";

const tabItems: { key: TargetKey; label: string; placeholder: string }[] = [
  { key: "categoryIds", label: "Danh mục", placeholder: "Nhập ID danh mục..." },
  { key: "productIds", label: "Sản phẩm", placeholder: "Nhập ID sản phẩm..." },
  { key: "variantIds", label: "Biến thể", placeholder: "Nhập ID biến thể..." },
];

export default function PromotionTargetModal({
  open,
  promotion,
  onClose,
}: Props) {
  const [activeKey, setActiveKey] = useState<TargetKey>("categoryIds");
  const [addIds, setAddIds] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  const addMutation = useAddPromotionTargetsMutation();
  const removeMutation = useRemovePromotionTargetsMutation();

  const parseIds = (ids: string[]): number[] =>
    ids.map(Number).filter((n) => !isNaN(n) && n > 0);

  const handleAdd = async () => {
    const ids = parseIds(addIds);
    if (!ids.length) return;
    const payload: PromotionTargetPayload = { [activeKey]: ids };
    await addMutation.mutateAsync({ id: promotion.id, data: payload });
    setAddIds([]);
  };

  const handleRemove = async () => {
    const ids = parseIds(removeIds);
    if (!ids.length) return;
    const payload: PromotionTargetPayload = { [activeKey]: ids };
    await removeMutation.mutateAsync({ id: promotion.id, data: payload });
    setRemoveIds([]);
  };

  const handleClose = () => {
    setAddIds([]);
    setRemoveIds([]);
    onClose();
  };

  const currentTab = tabItems.find((t) => t.key === activeKey)!;
  const isBusy = addMutation.isPending || removeMutation.isPending;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={promotion.name}
      width={520}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
        Nhập các ID cần thêm hoặc xóa khỏi ưu đãi này. Nhấn
        <Text keyboard>Enter</Text> sau mỗi ID để xác nhận.
      </Text>

      <Tabs
        activeKey={activeKey}
        onChange={(k) => {
          setActiveKey(k as TargetKey);
          setAddIds([]);
          setRemoveIds([]);
        }}
        items={tabItems.map((t) => ({
          key: t.key,
          label: t.label,
          children: null,
        }))}
      />

      <Divider
        orientation="left"
        plain
        style={{ fontSize: 13, margin: "8px 0 12px" }}
      >
        <PlusOutlined style={{ color: "#52c41a" }} /> Thêm{" "}
        {currentTab.label.toLowerCase()}
      </Divider>

      <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
        <Select
          mode="tags"
          style={{ flex: 1 }}
          placeholder={currentTab.placeholder}
          value={addIds}
          onChange={setAddIds}
          tokenSeparators={[",", " "]}
          open={false}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={addMutation.isPending}
          disabled={!addIds.length || isBusy}
          onClick={handleAdd}
        >
          Thêm
        </Button>
      </Space.Compact>

      <Divider
        orientation="left"
        plain
        style={{ fontSize: 13, margin: "8px 0 12px" }}
      >
        <MinusOutlined style={{ color: "#ff4d4f" }} /> Xóa{" "}
        {currentTab.label.toLowerCase()}
      </Divider>

      <Space.Compact style={{ width: "100%" }}>
        <Select
          mode="tags"
          style={{ flex: 1 }}
          placeholder={currentTab.placeholder}
          value={removeIds}
          onChange={setRemoveIds}
          tokenSeparators={[",", " "]}
          open={false}
        />
        <Button
          danger
          icon={<MinusOutlined />}
          loading={removeMutation.isPending}
          disabled={!removeIds.length || isBusy}
          onClick={handleRemove}
        >
          Xóa
        </Button>
      </Space.Compact>
    </Modal>
  );
}
