import { useState } from "react";
import {
  PieChartOutlined,
  TeamOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  DribbbleOutlined,
  TagOutlined,
  ContainerOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import {
  // Breadcrumb,
  Layout,
  Menu,
  theme,
  Dropdown,
  Avatar,
  Space,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthQuery";
import "./AdminLayout.css";
// import { assets } from "../../assets/assets";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: ReactNode,
  key: string,
  icon: ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items = [
  getItem(<Link to="/dashboard">Dashboard</Link>, "1", <PieChartOutlined />),
  getItem("Sản phẩm", "sub1", <DribbbleOutlined />, [
    getItem(
      <Link to="/products">Danh sách</Link>,
      "products-list",
      <UnorderedListOutlined />,
    ),
    getItem(
      <Link to="/products/add">Thêm mới</Link>,
      "products-add",
      <AppstoreAddOutlined />,
    ),
  ]),
  getItem(<Link to="/categories">Phân loại</Link>, "5", <AppstoreOutlined />),
  getItem(<Link to="/orders">Đơn hàng</Link>, "6", <ContainerOutlined />),
  getItem(<Link to="/deals">Ưu đãi</Link>, "7", <TagOutlined />),
  getItem(
    <Link to="/customers">Khách hàng</Link>,
    "customers",
    <UserOutlined />,
  ),
  getItem(<Link to="/employees">Nhân sự</Link>, "8", <TeamOutlined />),
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { user, logout } = useAuth();

  const selectedMenuKey = (() => {
    if (pathname.startsWith("/products/add")) return "products-add";
    if (pathname.startsWith("/products")) return "products-list";
    if (pathname.startsWith("/categories")) return "5";
    if (pathname.startsWith("/orders")) return "6";
    if (pathname.startsWith("/deals")) return "7";
    if (pathname.startsWith("/customers")) return "customers";
    if (pathname.startsWith("/employees")) return "8";
    if (pathname.startsWith("/dashboard") || pathname === "/") return "1";
    return "";
  })();

  const userMenuItems = [
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: "logout",
      label: "Đăng xuất",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
    }
  };

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
        <div className="demo-logo-vertical">MI</div>
        <Menu
          theme="dark"
          selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
          defaultOpenKeys={["sub1"]}
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
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.id}`
                  }
                />
                <Typography.Text strong style={{ fontSize: "16px" }}>
                  {user?.name}
                </Typography.Text>
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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
