import { useState, useRef, useEffect } from "react";

export default function EditableText({
  value,
  onChange,
  placeholder = "—",
  className = "",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraft(value ?? "");
    setEditing(true);
  }

  function save() {
    onChange(draft.trim() || null);
    setEditing(false);
  }

  function cancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className={`editable-input ${className}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") cancel();
        }}
      />
    );
  }

  return (
    <span
      className={`editable-text ${className} ${!value ? "editable-placeholder" : ""}`}
      onClick={startEditing}
    >
      {value || placeholder}
    </span>
  );
}
