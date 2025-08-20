import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./Categories.css";

const { Option } = Select;

const Categories = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories list
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/api/category/list?includeInactive=1`
      );
      setCategories(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (apiUrl) {
      fetchCategories();
    }
  }, [fetchCategories, apiUrl]);

  // Handle create/update category
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Update existing category
        await axios.patch(
          `${apiUrl}/api/category/${editingCategory.id}`,
          values
        );
        message.success("Cập nhật category thành công!");
      } else {
        // Create new category
        await axios.post(`${apiUrl}/api/category/add`, values);
        message.success("Thêm category thành công!");
      }

      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra";
      message.error(errorMsg);
      console.error(error);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`${apiUrl}/api/category/${categoryId}`);
      message.success("Xóa category thành công!");
      fetchCategories();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Không thể xóa category";
      message.error(errorMsg);
      console.error(error);
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

  // Get parent categories for dropdown (exclude current category and its children)
  const getParentOptions = () => {
    if (!editingCategory) return categories;

    // For editing, exclude the category itself and its descendants
    const excludeIds = [editingCategory.id];
    const addDescendants = (parentId) => {
      categories.forEach((cat) => {
        if (cat.parentId === parentId && !excludeIds.includes(cat.id)) {
          excludeIds.push(cat.id);
          addDescendants(cat.id);
        }
      });
    };
    addDescendants(editingCategory.id);

    return categories.filter((cat) => !excludeIds.includes(cat.id));
  };

  // Build hierarchical display name
  const getCategoryDisplayName = (category, allCategories = categories) => {
    if (!category.parentId) return category.name;

    const parent = allCategories.find((cat) => cat.id === category.parentId);
    if (!parent) return category.name;

    return `${getCategoryDisplayName(parent, allCategories)} > ${
      category.name
    }`;
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
        >
          Thêm Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
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
            rules={[
              { required: true, message: "Vui lòng nhập tên category!" },
              { min: 2, message: "Tên category phải có ít nhất 2 ký tự!" },
            ]}
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
                <em>Không có</em>
              </Option>
              {getParentOptions().map((cat) => (
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
              <Button type="primary" htmlType="submit">
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
