import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useTripActions } from "../context/TripContext";

export default function Sidebar({ trip }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });
  const actions = useTripActions();
  const [newTodo, setNewTodo] = useState("");

  function handleAddTodo(e) {
    e.preventDefault();
    const text = newTodo.trim();
    if (!text) return;
    actions.addTodo(text);
    setNewTodo("");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <input
          type="text"
          placeholder="Paste Google Maps link"
          className="sidebar-input"
          readOnly
        />
        <button
          className="add-button sidebar-add-note"
          onClick={() => actions.addNote("unassigned")}
        >
          + Add a note
        </button>
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
              <SortableItem
                key={item.id}
                item={item}
                containerId="unassigned"
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-heading">To do</h4>
        <div className="todo-list">
          {trip.todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => actions.toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span
                className={`todo-text ${todo.done ? "todo-done" : ""}`}
              >
                {todo.text}
              </span>
              <button
                className="remove-btn remove-btn-todo"
                onClick={() => actions.removeTodo(todo.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddTodo} className="todo-add-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a to do…"
            className="sidebar-input todo-input"
          />
        </form>
      </div>
    </aside>
  );
}
