import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function Section({ section }) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  return (
    <div className="section">
      <div className="section-header">
        <span className="section-label">{section.label}</span>
        {section.time && <span className="section-time">{section.time}</span>}
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
    </div>
  );
}
