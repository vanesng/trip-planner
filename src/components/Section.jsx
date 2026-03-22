import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import EditableText from "./EditableText";
import { useTripActions } from "../context/TripContext";

export default function Section({ section }) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });
  const actions = useTripActions();

  return (
    <div className="section">
      <div className="section-header">
        <EditableText
          value={section.label}
          onChange={(val) =>
            actions.updateSection(section.id, { label: val || "Untitled" })
          }
          className="section-label"
        />
        <EditableText
          value={section.time}
          onChange={(val) => actions.updateSection(section.id, { time: val })}
          placeholder="add time"
          className="section-time"
        />
        <button
          className="remove-btn"
          onClick={() => actions.removeSection(section.id)}
          title="Remove section"
        >
          ×
        </button>
      </div>
      <SortableContext
        items={section.items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`section-items${section.items.length === 0 ? " section-items-empty" : ""}${isOver && section.items.length === 0 ? " section-items-over" : ""}`}
        >
          {section.items.map((item) => (
            <SortableItem key={item.id} item={item} containerId={section.id} />
          ))}
        </div>
      </SortableContext>
      <button
        className="add-button section-add-note"
        onClick={() => actions.addNote(section.id)}
      >
        + Note
      </button>
    </div>
  );
}
