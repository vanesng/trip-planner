import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useTripActions } from "../context/TripContext";
import { resolveGoogleMapsUrl, isGoogleMapsUrl } from "../utils/placeResolver";

export default function Sidebar({ trip }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });
  const actions = useTripActions();
  const [newTodo, setNewTodo] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [urlError, setUrlError] = useState(null);
  const [resolving, setResolving] = useState(false);

  async function handleAddPlace(url) {
    if (!isGoogleMapsUrl(url)) {
      setUrlError("Not a recognized Google Maps link");
      return;
    }
    setResolving(true);
    setUrlError(null);
    try {
      const parsed = await resolveGoogleMapsUrl(url);
      if (parsed) {
        actions.addPlace(parsed);
        setMapsUrl("");
      } else {
        setUrlError("Couldn't parse that link");
      }
    } catch {
      setUrlError("Something went wrong");
    } finally {
      setResolving(false);
    }
  }

  function handleUrlPaste(e) {
    const pasted = e.clipboardData.getData("text");
    if (isGoogleMapsUrl(pasted)) {
      e.preventDefault();
      handleAddPlace(pasted);
    }
  }

  function handleUrlKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (mapsUrl.trim()) handleAddPlace(mapsUrl);
    }
  }

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
          placeholder={resolving ? "Resolving link…" : "Paste Google Maps link"}
          className={`sidebar-input${resolving ? " sidebar-input-loading" : ""}`}
          value={mapsUrl}
          disabled={resolving}
          onChange={(e) => {
            setMapsUrl(e.target.value);
            setUrlError(null);
          }}
          onPaste={handleUrlPaste}
          onKeyDown={handleUrlKeyDown}
        />
        {urlError && <p className="input-error">{urlError}</p>}
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
