import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function Sidebar({ trip }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <input
          type="text"
          placeholder="Paste Google Maps link"
          className="sidebar-input"
          readOnly
        />
        <button className="add-button sidebar-add-note">+ Add a note</button>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-heading">
          Unassigned
          <span className="sidebar-count">{trip.unassigned.length}</span>
        </h4>
        <SortableContext
          items={trip.unassigned.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`unassigned-list${trip.unassigned.length === 0 ? " unassigned-list-empty" : ""}${isOver && trip.unassigned.length === 0 ? " section-items-over" : ""}`}
          >
            {trip.unassigned.map((item) => (
              <SortableItem key={item.id} item={item} containerId="unassigned" />
            ))}
          </div>
        </SortableContext>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-heading">To do</h4>
        <div className="todo-list">
          {trip.todos.map((todo) => (
            <label key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={todo.done}
                readOnly
                className="todo-checkbox"
              />
              <span className={`todo-text ${todo.done ? "todo-done" : ""}`}>
                {todo.text}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
