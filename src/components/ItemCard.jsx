export default function ItemCard({ item, isDragging = false, isOverlay = false, dragHandleProps = {} }) {
  const isPlace = item.type === "place";

  return (
    <div className={`item-card${isDragging ? " item-card-ghost" : ""}${isOverlay ? " item-card-overlay" : ""}`}>
      <div className="item-drag-handle" {...dragHandleProps}>⠿</div>
      <div className="item-badge-col">
        <span className={`item-badge ${isPlace ? "badge-place" : "badge-note"}`}>
          {isPlace ? "P" : "N"}
        </span>
      </div>
      <div className="item-content">
        <div className="item-header">
          <span className="item-name">
            {isPlace ? item.name : item.text}
          </span>
          {item.time && <span className="item-time">{item.time}</span>}
        </div>
        {isPlace && (
          <div className="item-meta">
            {item.neighborhood && (
              <span className="item-neighborhood">{item.neighborhood}</span>
            )}
            {item.neighborhood && item.hours && (
              <span className="item-meta-sep"> · </span>
            )}
            {item.hours && (
              <span className="item-hours">{item.hours}</span>
            )}
          </div>
        )}
        {((isPlace && item.notes) || (!isPlace && item.notes)) && (
          <div className="item-notes">{item.notes}</div>
        )}
      </div>
    </div>
  );
}
