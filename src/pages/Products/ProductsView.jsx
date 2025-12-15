import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Divider,
  Tag,
  Space,
  Table,
  Row,
  Col,
} from "antd";
import { Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { productsApi } from "../../api/products";

const { Title, Text } = Typography;

const ProductsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productsApi.getById(id);
        setProduct(data || null);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <Spin size="large" style={{ margin: "40px auto", display: "block" }} />
    );
  if (!product)
    return (
      <Card>
        <Text type="danger">Không tìm thấy sản phẩm!</Text>
      </Card>
    );

  return (
    <Card
      className="product-view-card"
      style={{ maxWidth: 900, margin: "0 auto", boxShadow: "0 2px 12px #eee" }}
      bodyStyle={{ padding: 32 }}
      title={
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/products")}
          >
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {product.name}
          </Title>
          {product.isFeatured && <Tag color="gold">Nổi bật</Tag>}
        </Space>
      }
    >
      <Row gutter={32}>
        <Col xs={24} md={10}>
          <div style={{ textAlign: "center" }}>
            {product.images && product.images.length > 0 ? (
              <Image.PreviewGroup>
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt || "Ảnh sản phẩm"}
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    height: 220,
                    objectFit: "cover",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px #ddd",
                  }}
                />
                <Space wrap style={{ marginTop: 16 }}>
                  {product.images.slice(1).map((img) => (
                    <Image
                      key={img.id}
                      src={img.url}
                      alt={img.alt || "Ảnh sản phẩm"}
                      width={100}
                      height={100}
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #eee",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            ) : (
              <div
                style={{
                  width: 320,
                  height: 220,
                  background: "#fafafa",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">Không có ảnh</Text>
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} md={14}>
          <Space direction="vertical" size={"middle"} style={{ width: "100%" }}>
            <Text strong>Mô tả:</Text>
            <Text>{product.description}</Text>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Danh mục:</Text>{" "}
            <Tag color="blue">
              {product.categories?.[0]?.name
                ? product.categories[0].name
                : Array.isArray(product.categoryIds) &&
                  product.categoryIds.length > 0
                ? `#${product.categoryIds.join(", #")}`
                : "Không có"}
            </Tag>
            <Text strong>Giá:</Text>{" "}
            <Tag color="green">{product.price?.toLocaleString()} VNĐ</Tag>
            <Text strong>Trạng thái:</Text>{" "}
            <Tag color={product.isActive ? "green" : "red"}>
              {product.isActive ? "Hoạt động" : "Ẩn"}
            </Tag>
          </Space>
        </Col>
      </Row>
      <Divider />
      {product.content && (
        <>
          <Title level={5}>Nội dung chi tiết</Title>
          <div
            style={{
              padding: "16px 24px",
              background: "#fafafa",
              borderRadius: "8px",
              marginBottom: 16,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              lineHeight: "1.8",
            }}
            dangerouslySetInnerHTML={{ __html: product.content }}
          />
          <Divider />
        </>
      )}

      <Title level={5} style={{ marginTop: 16 }}>
        Danh sách Variants
      </Title>
      <Table
        dataSource={product.variants || []}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          { title: "Tên", dataIndex: "name", key: "name" },
          { title: "SKU", dataIndex: "sku", key: "sku" },
          {
            title: "Giá",
            dataIndex: ["prices", 0, "amount"],
            key: "price",
            render: (_, r) =>
              //   r.prices?.[0]?.amount !== undefined && r.prices?.[0]?.amount !== null && !isNaN(r.prices[0].amount)
              //     ? Number(r.prices[0].amount).toLocaleString() + " VNĐ"
              //     : <Tag color="red">Chưa có giá</Tag>,
              r.price && r.price.length > 0 ? (
                <Text>{Number(r.price).toLocaleString()} VNĐ</Text>
              ) : (
                <Tag color="red">Chưa có giá</Tag>
              ),
          },
          {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (v) =>
              v ? (
                <Tag color="green">Hoạt động</Tag>
              ) : (
                <Tag color="red">Tạm dừng</Tag>
              ),
          },
        ]}
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default ProductsView;
