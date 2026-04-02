import { Line } from "@ant-design/charts";

type RevenuePoint = {
  date: string;
  revenue: number;
};

interface RevenueLineChartProps {
  data: RevenuePoint[];
}

const RevenueLineChart = ({ data }: RevenueLineChartProps) => {
  return (
    <Line
      data={data}
      xField="date"
      yField="revenue"
      smooth
    />
  );
};

export default RevenueLineChart;