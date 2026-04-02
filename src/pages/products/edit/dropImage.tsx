import { Button, Image, Tooltip } from "antd";
import { DeleteOutlined, DragOutlined, EyeOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProductImage } from "../../../schema/product.schema";

interface SortableImageItemProps {
  id: number;
  image: ProductImage;
  index: number;
  onRemove: (id: number) => void;
  onPreview: (image: ProductImage) => void;
}

export const SortableImageItem = ({
  id,
  image,
  index,
  onRemove,
  onPreview,
}: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    borderRadius: 12,
    overflow: "hidden",
    border: "2px solid",
    borderColor: isDragging ? "#1890ff" : "#f0f0f0",
    boxShadow: isDragging
      ? "0 8px 16px rgba(0,0,0,0.2)"
      : "0 2px 8px rgba(0,0,0,0.1)",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div>
        <Image
          src={image.url}
          alt={image.alt || `Product image ${index + 1}`}
          style={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            opacity: 0,
            transition: "opacity 0.2s",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              padding: 8,
            }}
          >
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onPreview(image)}
                className="action-btn preview-btn"
              />
            </Tooltip>
            <Tooltip title="Xóa ảnh">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(image.id)}
              />
            </Tooltip>
          </div>

          <div
            style={{
              padding: 8,
              cursor: "move",
              display: "flex",
              justifyContent: "center",
              color: "white",
            }}
            {...attributes}
            {...listeners}
          >
            <DragOutlined />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "#1890ff",
            color: "white",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>

        {index === 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#faad14",
              color: "white",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Ảnh chính
          </div>
        )}
      </div>
    </div>
  );
};
