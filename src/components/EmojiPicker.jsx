import { useState, useRef, useEffect } from "react";

const EMOJI_OPTIONS = [
  "📍", "📝", "✈️", "🍽️", "🏛️", "🏖️", "☕", "🛍️",
  "🌅", "🕌", "🏺", "🎭", "🚕", "🚆", "🏨", "🎒",
  "🗺️", "📸", "🍷", "🧆", "🥐", "🫖", "🌿", "⛲",
  "🎵", "🏊", "⭐", "💡", "🔖", "❤️",
];

export default function EmojiPicker({ value, onChange, defaultEmoji }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const display = value || defaultEmoji;

  return (
    <div className="emoji-picker-wrap" ref={ref}>
      <button
        className="emoji-badge"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        title="Click to change icon"
      >
        {display}
      </button>
      {open && (
        <div className="emoji-picker-popup">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-option ${emoji === display ? "emoji-option-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
