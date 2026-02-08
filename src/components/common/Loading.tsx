import { Spin } from "antd";
import { ReactNode } from "react";

interface LoadingProps {
  size?: "small" | "default" | "large";
  tip?: string;
  spinning?: boolean;
  children?: ReactNode;
}

const Loading = ({
  size = "default",
  tip = "Đang tải...",
  spinning = true,
  children,
}: LoadingProps) => {
  if (children) {
    return (
      <Spin spinning={spinning} tip={tip} size={size}>
        {children}
      </Spin>
    );
  }

  return (
    <div className="loading-container">
      <Spin size={size} />
      {tip && <div className="loading-text">{tip}</div>}
    </div>
  );
};

export default Loading;
