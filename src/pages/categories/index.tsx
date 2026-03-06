import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCategoryHelpers,
} from "../../hooks/useCategoryQuery";
import { validationRules } from "../../utils";

const { Option } = Select;

type Category = {
  id: number;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
  parentId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const Categories = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // TanStack Query hooks
  const { data: categories = [], isLoading: loadingCategories } =
    useCategoriesQuery(true);
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const { getCategoryDisplayName, getParentOptions } = useCategoryHelpers();

  // Handle create/update category
  const handleSubmit = async (values: any) => {
    try {
      // Clean and prepare data
      const categoryData: any = {
        name: values.name?.trim(),
        position:
          typeof values.position === "number"
            ? values.position
            : parseInt(values.position, 10) || 0,
        isActive: values.isActive ?? true,
        // Always include parentId to allow removing parent (set to null)
        parentId: values.parentId ? Number(values.parentId) : null,
      };

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: categoryData,
        });
      } else {
        await createCategoryMutation.mutateAsync(categoryData);
      }

      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId: number) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Open modal for create/edit
  const openModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setModalVisible(true);

    if (category) {
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId,
        position: category.position,
        isActive: category.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên Category",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <div>
          <strong>{text}</strong>
          {record.parentId && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {getCategoryDisplayName(record)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text: string) => (
        <code
          style={{
            fontFamily: "Monaco, Menlo, Ubuntu Mono, monospace",
            backgroundColor: "#f5f5f5",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {text}
        </code>
      ),
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: number | null | undefined) => {
        if (!parentId) return <Tag color="blue">Root</Tag>;
        const parent = categories.find((cat) => cat.id === parentId);
        return parent ? (
          <Tag color="green">{parent.name}</Tag>
        ) : (
          <Tag color="red">Not found</Tag>
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm ngừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            loading={updateCategoryMutation.isPending}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa category này?"
            description="Bạn có chắc chắn muốn xóa category này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleteCategoryMutation.isPending}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
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
          Danh mục sản phẩm
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          loading={createCategoryMutation.isPending}
        >
          Thêm Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loadingCategories}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} categories`,
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingCategory ? "Chỉnh sửa Category" : "Thêm Category mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            position: 0,
            isActive: true,
          }}
        >
          <Form.Item
            label="Tên Category"
            name="name"
            rules={validationRules.name as any}
          >
            <Input placeholder="Nhập tên category" />
          </Form.Item>

          <Form.Item
            label="Category cha"
            name="parentId"
            help="Để trống hoặc chọn 'Không có' nếu đây là category gốc"
          >
            <Select
              placeholder="Chọn category cha"
              allowClear
              showSearch
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase?.().includes(input.toLowerCase())
              }
            >
              <Option key="none" value={null}>
                <em>Không có category cha (Category gốc)</em>
              </Option>
              {getParentOptions(editingCategory?.id).map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {getCategoryDisplayName(cat)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vị trí sắp xếp"
            name="position"
            help="Số thứ tự để sắp xếp (số nhỏ hơn sẽ hiển thị trước)"
            rules={[
              { type: "number", min: 0, message: "Vị trí phải là số không âm" },
            ]}
            getValueFromEvent={(e) => {
              const value = parseInt(e.target.value, 10);
              return isNaN(value) ? 0 : value;
            }}
          >
            <Input type="number" min={0} placeholder="0" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ngừng" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
