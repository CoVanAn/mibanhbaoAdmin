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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCategories } from "../../hooks";
import { validationRules } from "../../utils";
import "./Categories.css";

const { Option } = Select;

const Categories = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const {
    categories,
    loadingCategories,
    creating,
    updating,
    deleting,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryDisplayName,
    getParentOptions,
  } = useCategories();

  // Handle create/update category
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
      } else {
        await createCategory(values);
      }

      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Open modal for create/edit
  const openModal = (category = null) => {
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

  const columns = [
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
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.parentId && (
            <div className="category-hierarchy">
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
      render: (text) => <code className="category-slug">{text}</code>,
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId) => {
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
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"} className="category-status-tag">
          {isActive ? "Hoạt động" : "Tạm ngừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space className="category-actions">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            loading={updating}
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
              loading={deleting}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h2>Quản lý Categories</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          loading={creating}
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
        className="category-modal"
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
            rules={validationRules.name}
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
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
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
                loading={creating || updating}
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
