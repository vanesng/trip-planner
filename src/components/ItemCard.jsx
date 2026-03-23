import EditableText from "./EditableText";
import EmojiPicker from "./EmojiPicker";
import { useTripActions } from "../context/TripContext";

export default function ItemCard({
  item,
  isDragging = false,
  isOverlay = false,
  dragHandleProps = {},
  readOnly = false,
}) {
  const actions = useTripActions();
  const isPlace = item.type === "place";
  const editable = !readOnly && !isOverlay;
  const defaultEmoji = isPlace ? "📍" : "📝";

  return (
    <div
      className={`item-card${isDragging ? " item-card-ghost" : ""}${isOverlay ? " item-card-overlay" : ""}`}
    >
      {!readOnly && (
        <div className="item-drag-handle" {...dragHandleProps}>
          ⠿
        </div>
      )}
      <div className="item-badge-col">
        {editable ? (
          <EmojiPicker
            value={item.emoji}
            defaultEmoji={defaultEmoji}
            onChange={(emoji) => actions.updateItem(item.id, { emoji })}
          />
        ) : (
          <span className="emoji-badge emoji-badge-readonly">
            {item.emoji || defaultEmoji}
          </span>
        )}
      </div>
      <div className="item-content">
        <div className="item-header">
          {isPlace && editable ? (
            <EditableText
              value={item.name}
              onChange={(val) => actions.updateItem(item.id, { name: val })}
              placeholder="Enter place name"
              className="item-name"
            />
          ) : isPlace ? (
            <span className="item-name">{item.name || "New place"}</span>
          ) : editable ? (
            <EditableText
              value={item.text}
              onChange={(val) =>
                actions.updateItem(item.id, { text: val || "New note" })
              }
              className="item-name"
            />
          ) : (
            <span className="item-name">{item.text}</span>
          )}
          {editable ? (
            <EditableText
              value={item.time}
              onChange={(val) => actions.updateItem(item.id, { time: val })}
              placeholder="time"
              className="item-time"
            />
          ) : (
            item.time && <span className="item-time">{item.time}</span>
          )}
        </div>
        {isPlace && (
          <div className="item-meta">
            {editable ? (
              <>
                <EditableText
                  value={item.neighborhood}
                  onChange={(val) =>
                    actions.updateItem(item.id, { neighborhood: val })
                  }
                  placeholder="neighborhood"
                  className="item-neighborhood"
                />
                <span className="item-meta-sep"> · </span>
                <EditableText
                  value={item.hours}
                  onChange={(val) =>
                    actions.updateItem(item.id, { hours: val })
                  }
                  placeholder="hours"
                  className="item-hours"
                />
              </>
            ) : (
              <>
                {item.neighborhood && (
                  <span className="item-neighborhood">{item.neighborhood}</span>
                )}
                {item.neighborhood && item.hours && (
                  <span className="item-meta-sep"> · </span>
                )}
                {item.hours && (
                  <span className="item-hours">{item.hours}</span>
                )}
              </>
            )}
          </div>
        )}
        {isPlace && item.googleMapsUrl && (
          <a
            href={item.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="item-maps-link"
          >
            View on Google Maps ↗
          </a>
        )}
        {isPlace && editable ? (
          <EditableText
            value={item.notes}
            onChange={(val) => actions.updateItem(item.id, { notes: val })}
            placeholder="add notes"
            className="item-notes"
          />
        ) : (
          item.notes && <div className="item-notes">{item.notes}</div>
        )}
      </div>
      {editable && (
        <button
          className="remove-btn remove-btn-card"
          onClick={() => actions.removeItem(item.id)}
          title="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}
