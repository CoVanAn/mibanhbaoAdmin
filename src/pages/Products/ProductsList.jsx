import { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Popconfirm,
  Select,
  Typography,
  Row,
  Col,
  Tooltip,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../hooks";
import { useCategories } from "../../hooks";
import { PageHeader, Loading } from "../../components/common";
import { formatCurrency } from "../../utils";
import "./ProductsList.css";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const ProductsList = () => {
  const navigate = useNavigate();
  const { products, loadingProducts, deleting, deleteProduct } = useProducts();
  const { categories, loadingCategories } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) =>
        product.categoryIds?.includes(selectedCategory)
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleView = (product) => {
    navigate(`/products/view/${product.id}`);
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (imageUrl) => {
        return imageUrl ? (
          <Avatar
            size={64}
            src={imageUrl}
            shape="square"
            style={{ borderRadius: 8 }}
          />
        ) : (
          <Avatar
            size={64}
            shape="square"
            style={{
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text type="secondary">No Image</Text>
          </Avatar>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 460,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                {record.description.length > 50
                  ? `${record.description.substring(0, 50)}...`
                  : record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryIds",
      key: "categories",
      render: (categoryIds) => (
        <Space direction="vertical" size={2}>
          {categoryIds && categoryIds.length > 0 ? (
            categoryIds.map((categoryId) => {
              const category = categories.find((cat) => cat.id === categoryId);
              return (
                <Tag key={categoryId} color="blue" size="small">
                  <Text>{category?.name || "Unknown"}</Text>
                </Tag>
              );
            })
          ) : (
            <Text type="secondary">Chưa có danh mục</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Biến thể",
      key: "variants",
      width: 200,
      render: (_, record) => {
        const variants = Array.isArray(record.variants) ? record.variants : [];
        // 0 variant
        if (variants.length === 0) {
          return (
            <Space direction="vertical" size="small">
              <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                {formatCurrency(record.price || 0)}
              </Text>
              <Tag color="gray" style={{ fontSize: "11px" }}>
                Không có variant
              </Tag>
            </Space>
          );
        }
        // 1 variant
        if (variants.length === 1) {
          const variant = variants[0];
          const currentPrice = variant.price || record.price || 0;
          return (
            <Space direction="vertical" size="small">
              <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                {formatCurrency(currentPrice)}
              </Text>
              <Space>
                <Tag color="blue" style={{ fontSize: "11px" }}>
                  {variant.name || "Default"}
                </Tag>
                {!variant.isActive && (
                  <Tag color="red" style={{ fontSize: "10px" }}>
                    Tạm dừng
                  </Tag>
                )}
              </Space>
              {/* {variant.sku && (
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  SKU: {variant.sku}
                </Text>
              )} */}
            </Space>
          );
        }
        // Nhiều variant
        return (
          <Space direction="vertical" size="small">
            <div>
              {variants.slice(0, 2).map((variant, index) => {
                const currentPrice = variant.price || 0;
                return (
                  <div
                    key={variant.id || index}
                    style={{ marginBottom: "4px" }}
                  >
                    <Space size="small">
                      <Text
                        strong
                        style={{ color: "#1890ff", fontSize: "14px" }}
                      >
                        {formatCurrency(currentPrice)}
                      </Text>
                      <Tag color="blue" style={{ fontSize: "10px" }}>
                        {variant.name || `Variant ${index + 1}`}
                      </Tag>
                      {!variant.isActive && (
                        <Tag color="red" style={{ fontSize: "9px" }}>
                          Dừng
                        </Tag>
                      )}
                    </Space>
                  </div>
                );
              })}
              {variants.length > 2 && (
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  +{variants.length - 2} variant khác
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured) => (
        <Tag color={isFeatured ? "gold" : "default"}>
          {isFeatured ? "Nổi bật" : "Thường"}
        </Tag>
      ),
    },

    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa sản phẩm"
              description="Bạn có chắc chắn muốn xóa sản phẩm này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
              okButtonProps={{ danger: true, loading: deleting }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deleting}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loadingProducts) {
    return <Loading />;
  }

  return (
    <div className="products-list">
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle="Danh sách tất cả sản phẩm trong hệ thống"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/products/add")}
          >
            Thêm sản phẩm
          </Button>
        }
      />

      <Card className="products-card">
        <div className="products-filters">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                size="large"
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Chọn danh mục"
                allowClear
                size="large"
                style={{ width: "100%" }}
                value={selectedCategory}
                onChange={setSelectedCategory}
                loading={loadingCategories}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={12}>
              <div className="products-stats">
                <Text type="secondary">
                  Hiển thị {filteredProducts.length} / {products.length} sản
                  phẩm
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            total: filteredProducts.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1200 }}
          className="products-table"
        />
      </Card>
    </div>
  );
};

export default ProductsList;
