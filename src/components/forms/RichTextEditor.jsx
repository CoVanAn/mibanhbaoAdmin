import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./RichTextEditor.css";

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);

  // Sync external value into the editable div
  useEffect(() => {
    if (!ref.current) return;
    const html = value || "";
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    onChange?.(html);
  };

  return (
    <div
      ref={ref}
      className="rte"
      contentEditable
      data-placeholder={placeholder || "Nhập nội dung chi tiết (hỗ trợ đậm/ nghiêng/ danh sách)"}
      onInput={handleInput}
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default RichTextEditor;
