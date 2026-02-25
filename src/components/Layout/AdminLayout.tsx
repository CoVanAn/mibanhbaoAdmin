import { useState } from "react";
import {
  // DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  // TeamOutlined,
  // UserOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  DribbbleOutlined,
} from "@ant-design/icons";
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
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthQuery";
import "./AdminLayout.css";
// import { assets } from "../../assets/assets";

const { Header, Content, Sider } = Layout;

function getItem(label: any, key: string, icon: any, children: any = null) {
  return {
    key,
    icon,
    children,
    label,
  };
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
  getItem(<Link to="/orders">Đơn hàng</Link>, "6", <FileOutlined />),
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { user, logout } = useAuth();

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
      </Layout>
    </Layout>
  );
};
export default AdminLayout;
