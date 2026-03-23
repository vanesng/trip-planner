import { useState } from "react";
import ItemCard from "./ItemCard";

const TABS = [
  { id: "itinerary", label: "Itinerary" },
  { id: "considering", label: "Also considering" },
  { id: "todo", label: "To do" },
];

function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-US", opts);
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-US", opts);
  return `${s} – ${e}`;
}

function formatDayHeader(date, index) {
  if (!date) return `Day ${index + 1}`;
  const d = new Date(date + "T00:00:00");
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Day ${index + 1} — ${dayName}, ${formatted}`;
}

export default function ShareView({ trip }) {
  const [activeTab, setActiveTab] = useState("itinerary");

  return (
    <div className="share-view">
      <header className="trip-header">
        <h1 className="trip-name">{trip.name}</h1>
        {trip.startDate && trip.endDate && (
          <p className="trip-dates">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        )}
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === "itinerary" && <ShareItinerary trip={trip} />}
        {activeTab === "considering" && <ShareConsidering trip={trip} />}
        {activeTab === "todo" && <ShareTodos trip={trip} />}
      </div>
    </div>
  );
}

function ShareItinerary({ trip }) {
  return (
    <div className="itinerary-view">
      {trip.days.map((day, i) => (
        <div key={day.id} className="day">
          <div className="day-header-row">
            <h2 className="day-header">
              {formatDayHeader(day.date, i)}
            </h2>
          </div>
          <div className="day-sections">
            {day.sections.map((section) => (
              <div key={section.id} className="section">
                <div className="section-header">
                  <span className="section-label">{section.label}</span>
                  {section.time && (
                    <span className="section-time">{section.time}</span>
                  )}
                </div>
                <div className="section-items">
                  {section.items.map((item) => (
                    <ItemCard key={item.id} item={item} readOnly />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareConsidering({ trip }) {
  const items = trip.unassigned || [];
  return (
    <div className="all-places-view">
      <p className="view-subtitle">
        {items.length} {items.length === 1 ? "item" : "items"} still considering
      </p>
      <div className="all-places-list">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} readOnly />
        ))}
        {items.length === 0 && (
          <p className="view-subtitle" style={{ fontStyle: "italic" }}>
            Nothing here — everything's planned!
          </p>
        )}
      </div>
    </div>
  );
}

function ShareTodos({ trip }) {
  const todos = trip.todos || [];
  return (
    <div className="todo-view">
      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.done}
              readOnly
              className="todo-checkbox"
            />
            <span className={`todo-text ${todo.done ? "todo-done" : ""}`}>
              {todo.text}
            </span>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="view-subtitle" style={{ fontStyle: "italic" }}>
            No to-dos yet.
          </p>
        )}
      </div>
    </div>
  );
}
