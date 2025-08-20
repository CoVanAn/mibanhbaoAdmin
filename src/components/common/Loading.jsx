import { Spin } from "antd";
import PropTypes from "prop-types";

const Loading = ({
  size = "default",
  tip = "Đang tải...",
  spinning = true,
  children,
}) => {
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

Loading.propTypes = {
  size: PropTypes.oneOf(["small", "default", "large"]),
  tip: PropTypes.string,
  spinning: PropTypes.bool,
  children: PropTypes.node,
};

export default Loading;
