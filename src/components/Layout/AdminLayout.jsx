import { useState } from "react";
import {
  // DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  // TeamOutlined,
  // UserOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  // Breadcrumb,
  Layout,
  Menu,
  theme,
  Dropdown,
  Avatar,
  Space,
} from "antd";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";
// import { assets } from "../../assets/assets";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem(<Link to="/dashboard">Dashboard</Link>, "1", <PieChartOutlined />),
  getItem("Sản phẩm", "sub1", <ShoppingCartOutlined />, [
    getItem(
      <Link to="/products">Danh sách</Link>,
      "products-list",
      <UnorderedListOutlined />
    ),
    getItem(
      <Link to="/products/add">Thêm mới</Link>,
      "products-add",
      <AppstoreAddOutlined />
    ),
  ]),
  getItem(<Link to="/categories">Phân loại</Link>, "5", <AppstoreOutlined />),
  getItem(<Link to="/orders">Đơn hàng</Link>, "6", <FileOutlined />),
  // Legacy menu items (to be removed later)
  getItem("Legacy Products", "sub2", <ShoppingCartOutlined />, [
    getItem(
      <Link to="/add">Add Product (Old)</Link>,
      "3",
      <AppstoreAddOutlined />
    ),
    getItem(
      <Link to="/list">Product List (Old)</Link>,
      "4",
      <UnorderedListOutlined />
    ),
  ]),
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          position: "fixed",
          height: "100vh",
        }}
      >
        <div className="demo-logo-vertical">
          {/* <img src={assets.logo} alt="Logo" /> */}
          MI BÁNH BAO
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            position: "fixed",
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            right: 0,
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.id}`
                  }
                />
                {user?.name}
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "16px",
            position: "absolute",
            top: 64,
            left: collapsed ? 80 : 200,
            right: 0,
            bottom: 0,
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            position: "absolute",
            left: collapsed ? 80 : 200,
            bottom: 0,
            right: 0,
            background: colorBgContainer,
          }}
        >
          Mi Banh Bao Admin Panel ©{new Date().getFullYear()} Created by CoVanAn
        </Footer>
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
