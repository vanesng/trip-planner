import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { mockTrip } from "./data/mockData";
import ItineraryView from "./components/ItineraryView";
import AllPlacesView from "./components/AllPlacesView";
import TodoView from "./components/TodoView";
import Sidebar from "./components/Sidebar";
import ItemCard from "./components/ItemCard";

const TABS = [
  { id: "itinerary", label: "Itinerary" },
  { id: "places", label: "All places" },
  { id: "todo", label: "To do" },
];

function formatDateRange(start, end) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-US", opts);
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-US", opts);
  return `${s} – ${e}`;
}

// ─── Trip state helpers ───

function findContainer(trip, id) {
  if (trip.unassigned.find((i) => i.id === id)) return "unassigned";
  for (const day of trip.days) {
    for (const section of day.sections) {
      if (section.items.find((i) => i.id === id)) return section.id;
    }
  }
  return null;
}

function isContainerId(trip, id) {
  if (id === "unassigned") return true;
  return trip.days.some((d) => d.sections.some((s) => s.id === id));
}

function getItems(trip, containerId) {
  if (containerId === "unassigned") return trip.unassigned;
  for (const day of trip.days) {
    for (const section of day.sections) {
      if (section.id === containerId) return section.items;
    }
  }
  return [];
}

function setItems(trip, containerId, newItems) {
  if (containerId === "unassigned") {
    return { ...trip, unassigned: newItems };
  }
  return {
    ...trip,
    days: trip.days.map((day) => ({
      ...day,
      sections: day.sections.map((section) =>
        section.id === containerId ? { ...section, items: newItems } : section
      ),
    })),
  };
}

// ─── App ───

export default function App() {
  const [trip, setTrip] = useState(mockTrip);
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart({ active }) {
    const containerId = findContainer(trip, active.id);
    if (!containerId) return;
    const item = getItems(trip, containerId).find((i) => i.id === active.id);
    setActiveItem(item);
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    setTrip((current) => {
      const sourceId = findContainer(current, activeId);
      const destId =
        findContainer(current, overId) ??
        (isContainerId(current, overId) ? overId : null);

      // Skip if same container or can't resolve either end
      if (!sourceId || !destId || sourceId === destId) return current;

      const sourceItems = getItems(current, sourceId);
      const destItems = getItems(current, destId);
      const item = sourceItems.find((i) => i.id === activeId);
      if (!item) return current;

      // Insert before the item we're hovering over, or at the end
      const overIndex = destItems.findIndex((i) => i.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : destItems.length;

      const newSource = sourceItems.filter((i) => i.id !== activeId);
      const newDest = [
        ...destItems.slice(0, insertAt),
        item,
        ...destItems.slice(insertAt),
      ];

      return setItems(setItems(current, sourceId, newSource), destId, newDest);
    });
  }

  function handleDragEnd({ active, over }) {
    setActiveItem(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setTrip((current) => {
      const sourceId = findContainer(current, activeId);
      if (!sourceId) return current;

      const destId =
        findContainer(current, overId) ??
        (isContainerId(current, overId) ? overId : null);

      // Cross-container moves were already handled in onDragOver
      if (!destId || sourceId !== destId) return current;

      // Same-container reorder
      const items = getItems(current, sourceId);
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);
      if (oldIndex === newIndex) return current;

      return setItems(current, sourceId, arrayMove(items, oldIndex, newIndex));
    });
  }

  function handleDragCancel() {
    setActiveItem(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="app">
        <div className="main-area">
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
            {activeTab === "itinerary" && <ItineraryView trip={trip} />}
            {activeTab === "places" && <AllPlacesView trip={trip} />}
            {activeTab === "todo" && <TodoView todos={trip.todos} />}
          </div>
        </div>

        <Sidebar trip={trip} />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem && <ItemCard item={activeItem} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
