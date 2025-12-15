import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichTextEditor.css";

const DEFAULT_MAX_LENGTH = 2000;

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "indent",
  "blockquote",
  "link",
];

const RichTextEditor = ({ value, onChange, placeholder, maxLength }) => {
  const limit = useMemo(
    () => (Number.isFinite(maxLength) && maxLength > 0 ? maxLength : DEFAULT_MAX_LENGTH),
    [maxLength]
  );

  const initialCount = useMemo(() => {
    if (!value) return 0;
    const tmp = document.createElement("div");
    tmp.innerHTML = value;
    return Math.max(0, (tmp.innerText || "").length);
  }, [value]);

  const [count, setCount] = useState(initialCount);
  const lastHtmlRef = useRef(value || "");
  const quillRef = useRef(null);

  const handleChange = (content, _delta, _source, editor) => {
    const html = editor?.root?.innerHTML ?? content ?? "";
    lastHtmlRef.current = html;
    onChange?.(html);
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const onTextChange = (_delta, _old, source) => {
      if (source !== "user") return;
      const text = quill.getText() || "";
      let len = Math.max(0, text.length - 1);
      if (len > limit) {
        quill.deleteText(limit, len);
        quill.setSelection(limit, limit);
        len = limit;
      }
      setCount(len);
      lastHtmlRef.current = quill.root.innerHTML;
    };
    quill.on("text-change", onTextChange);
    return () => {
      quill.off("text-change", onTextChange);
    };
  }, [limit]);

  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        readOnly={false}
        placeholder={placeholder || `Nhập nội dung (tối đa ${limit} ký tự)`}
      />
      <div style={{ textAlign: "right", marginTop: 6, color: "#888", fontSize: 12 }}>
        {count}/{limit} ký tự
      </div>
    </>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
};

export default RichTextEditor;
