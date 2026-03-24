import { Card, Tabs, Alert, Popconfirm, Button, Badge } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCustomerQuery,
  useToggleCustomerStatusMutation,
} from "../../../hooks/useCustomerQuery";
import { PageHeader, Loading } from "../../../components/common";
import ProfileCard from "./components/ProfileCard";
import AddressesTab from "./components/AddressesTab";
import OrderHistoryTab from "./components/OrderHistoryTab";
import CouponUsageTab from "./components/CouponUsageTab";

const CustomerView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || "0", 10);

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useCustomerQuery(customerId);
  const toggleStatus = useToggleCustomerStatusMutation();

  if (isLoading) return <Loading />;

  if (isError || !customer) {
    return (
      <Alert
        type="error"
        message="Không tìm thấy khách hàng"
        description={(error as any)?.message}
        action={
          <Button onClick={() => navigate("/customers")}>Quay lại</Button>
        }
      />
    );
  }

  const handleToggleStatus = () => {
    toggleStatus.mutate({ id: customer.id, isActive: !customer.isActive });
  };

  const statusAction = (
    <Popconfirm
      title={
        customer.isActive
          ? "Vô hiệu hoá tài khoản này?"
          : "Kích hoạt lại tài khoản này?"
      }
      onConfirm={handleToggleStatus}
      okText="Xác nhận"
      cancelText="Huỷ"
      okButtonProps={{
        danger: customer.isActive,
        loading: toggleStatus.isPending,
      }}
    >
      <Button
        danger={customer.isActive}
        type={customer.isActive ? "default" : "primary"}
        loading={toggleStatus.isPending}
      >
        {customer.isActive ? "Vô hiệu hoá" : "Kích hoạt"}
      </Button>
    </Popconfirm>
  );

  const tabItems = [
    {
      key: "addresses",
      label: (
        <Badge count={customer.addresses.length} size="small" offset={[6, 0]}>
          Địa chỉ
        </Badge>
      ),
      children: <AddressesTab addresses={customer.addresses} />,
    },
    {
      key: "orders",
      label: (
        <Badge count={customer.orders.length} size="small" offset={[6, 0]}>
          Đơn hàng
        </Badge>
      ),
      children: <OrderHistoryTab orders={customer.orders} />,
    },
    {
      key: "coupons",
      label: (
        <Badge
          count={customer.couponRedemptions.length}
          size="small"
          offset={[6, 0]}
        >
          Coupon
        </Badge>
      ),
      children: <CouponUsageTab redemptions={customer.couponRedemptions} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.email}
        showBack
        onBack={() => navigate(-1)}
        extra={statusAction}
      />

      <div style={{ marginBottom: 16 }}>
        <ProfileCard customer={customer} />
      </div>

      <Card>
        <Tabs defaultActiveKey="orders" items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerView;
