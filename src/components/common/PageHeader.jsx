import { Button, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const PageHeader = ({
  title,
  subtitle,
  onBack,
  showBack = false,
  extra,
  breadcrumb,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`page-header ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-md">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              size="large"
            />
          )}
          <div>
            <h1 className="m-0">{title}</h1>
            {subtitle && <p className="text-muted m-0 mt-xs">{subtitle}</p>}
          </div>
        </div>

        {extra && (
          <Space>
            {Array.isArray(extra)
              ? extra.map((item, index) => <span key={index}>{item}</span>)
              : extra}
          </Space>
        )}
      </div>

      {breadcrumb && <div className="mt-sm">{breadcrumb}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onBack: PropTypes.func,
  showBack: PropTypes.bool,
  extra: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  breadcrumb: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
