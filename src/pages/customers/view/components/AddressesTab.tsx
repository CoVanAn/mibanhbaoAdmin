import { Table, Typography } from "antd";
import type { CustomerAddress } from "../../../../schema/customer.schema";

const { Text } = Typography;

interface AddressesTabProps {
  addresses: CustomerAddress[];
}

const AddressesTab = ({ addresses }: AddressesTabProps) => {
  const columns = [
    {
      title: "Người nhận",
      key: "recipient",
      render: (_: any, a: CustomerAddress) => (
        <div>
          <Text strong>{a.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {a.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_: any, a: CustomerAddress) => (
        <Text>
          {a.addressLine}, {a.ward}, {a.district}, {a.province}
        </Text>
      ),
    },
    {
      title: "Công ty",
      dataIndex: "company",
      key: "company",
      render: (company: string | null) =>
        company || <Text type="secondary">—</Text>,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={addresses}
      pagination={false}
      locale={{ emptyText: "Chưa có địa chỉ nào" }}
    />
  );
};

export default AddressesTab;
