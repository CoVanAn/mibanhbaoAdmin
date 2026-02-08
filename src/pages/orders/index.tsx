import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Card,
  Table,
  Select,
  Tag,
  Typography,
  Space,
  Badge,
  Descriptions,
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data) {
        setOrders(response.data.data);
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      toast.error("Lỗi khi tải đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (status, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId: orderId,
        status: status,
      });
      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchAllOrders();
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật: " + error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Food Processing":
        return "processing";
      case "Out for delivery":
        return "warning";
      case "Delivered":
        return "success";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Món ăn",
      dataIndex: "items",
      key: "items",
      width: "30%",
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <div key={index}>
              <Text>
                {item.name} x {item.quantity}
              </Text>
              {index < items.length - 1 && <br />}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "address",
      key: "customer",
      render: (address) => (
        <Space direction="vertical" size="small">
          <Text strong>
            <UserOutlined /> {address.firstName} {address.lastName}
          </Text>
          <Text type="secondary">
            <PhoneOutlined /> {address.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <Space direction="vertical" size="small">
          <Text>{address.street}</Text>
          <Text type="secondary">
            {address.city}, {address.state}, {address.country} -{" "}
            {address.zipcode}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Text>
          <CalendarOutlined /> {date}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "items",
      key: "itemCount",
      align: "center",
      render: (items) => <Badge count={items.length} showZero color="blue" />,
    },
    {
      title: "Tổng tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => <Text strong>${amount}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => statusHandler(value, record._id)}
          style={{ width: 180 }}
        >
          <Option value="Food Processing">
            <Tag color="processing">Đang xử lý</Tag>
          </Option>
          <Option value="Out for delivery">
            <Tag color="warning">Đang giao</Tag>
          </Option>
          <Option value="Delivered">
            <Tag color="success">Đã giao</Tag>
          </Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="orders-container">
      <Card>
        <Title level={3}>
          <ShoppingOutlined /> Quản lý đơn hàng
        </Title>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </Card>
    </div>
  );
};

Orders.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Orders;
