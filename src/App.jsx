import { useState, useEffect, useMemo, useCallback } from "react";
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
import TripContext from "./context/TripContext";
import ItineraryView from "./components/ItineraryView";
import AllPlacesView from "./components/AllPlacesView";
import TodoView from "./components/TodoView";
import Sidebar from "./components/Sidebar";
import ItemCard from "./components/ItemCard";
import ShareView from "./components/ShareView";
import { generateShareUrl, getSharedTrip } from "./utils/shareUtils";

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

// ─── Persistence ───

const STORAGE_KEY = "trip-planner-data";

function loadTrip() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveTrip(trip) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  } catch {}
}

function exportTrip(trip) {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trip.name || "trip"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importTrip(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// ─── Trip state helpers ───

let nextId = 100;
function genId(prefix) {
  return `${prefix}-${++nextId}`;
}

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
  // Check for shared view first
  const [sharedTrip] = useState(() => getSharedTrip());
  if (sharedTrip) {
    return <ShareView trip={sharedTrip} />;
  }

  return <TripEditor />;
}

function TripEditor() {
  const [trip, setTrip] = useState(() => loadTrip() || mockTrip);
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [shareCopied, setShareCopied] = useState(false);

  // Auto-save to localStorage on every change
  useEffect(() => {
    saveTrip(trip);
  }, [trip]);

  const handleExport = useCallback(() => exportTrip(trip), [trip]);

  const handleShare = useCallback(() => {
    const url = generateShareUrl(trip);
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [trip]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data = await importTrip(file);
        setTrip(data);
      } catch {
        alert("Couldn't load that file — make sure it's a valid trip JSON.");
      }
    };
    input.click();
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm("Reset to original mock data? Your changes will be lost.")) {
      localStorage.removeItem(STORAGE_KEY);
      setTrip(mockTrip);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── CRUD actions ───

  const actions = useMemo(
    () => ({
      updateSection: (sectionId, updates) => {
        setTrip((t) => ({
          ...t,
          days: t.days.map((d) => ({
            ...d,
            sections: d.sections.map((s) =>
              s.id === sectionId ? { ...s, ...updates } : s
            ),
          })),
        }));
      },

      removeSection: (sectionId) => {
        setTrip((t) => {
          let orphaned = [];
          const days = t.days.map((d) => ({
            ...d,
            sections: d.sections.filter((s) => {
              if (s.id === sectionId) {
                orphaned = s.items;
                return false;
              }
              return true;
            }),
          }));
          return { ...t, days, unassigned: [...t.unassigned, ...orphaned] };
        });
      },

      addSection: (dayId) => {
        setTrip((t) => ({
          ...t,
          days: t.days.map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  sections: [
                    ...d.sections,
                    { id: genId("sec"), label: "New section", time: null, items: [] },
                  ],
                }
              : d
          ),
        }));
      },

      updateItem: (itemId, updates) => {
        setTrip((t) => {
          if (t.unassigned.find((i) => i.id === itemId)) {
            return {
              ...t,
              unassigned: t.unassigned.map((i) =>
                i.id === itemId ? { ...i, ...updates } : i
              ),
            };
          }
          return {
            ...t,
            days: t.days.map((d) => ({
              ...d,
              sections: d.sections.map((s) => ({
                ...s,
                items: s.items.map((i) =>
                  i.id === itemId ? { ...i, ...updates } : i
                ),
              })),
            })),
          };
        });
      },

      removeItem: (itemId) => {
        setTrip((t) => ({
          ...t,
          unassigned: t.unassigned.filter((i) => i.id !== itemId),
          days: t.days.map((d) => ({
            ...d,
            sections: d.sections.map((s) => ({
              ...s,
              items: s.items.filter((i) => i.id !== itemId),
            })),
          })),
        }));
      },

      addPlace: ({ name, neighborhood, hours, googleMapsUrl }) => {
        const place = {
          id: genId("item"),
          type: "place",
          name: name || null,
          neighborhood: neighborhood || null,
          hours: hours || null,
          googleMapsUrl: googleMapsUrl || null,
          placeData: null,
          notes: null,
          time: null,
        };
        setTrip((t) => ({ ...t, unassigned: [...t.unassigned, place] }));
      },

      addNote: (containerId) => {
        const note = {
          id: genId("item"),
          type: "note",
          text: "New note",
          notes: null,
          time: null,
        };
        setTrip((t) => {
          if (containerId === "unassigned") {
            return { ...t, unassigned: [...t.unassigned, note] };
          }
          return {
            ...t,
            days: t.days.map((d) => ({
              ...d,
              sections: d.sections.map((s) =>
                s.id === containerId
                  ? { ...s, items: [...s.items, note] }
                  : s
              ),
            })),
          };
        });
      },

      addDay: () => {
        setTrip((t) => ({
          ...t,
          days: [
            ...t.days,
            {
              id: genId("day"),
              date: null,
              sections: [
                { id: genId("sec"), label: "Morning", time: null, items: [] },
              ],
            },
          ],
        }));
      },

      removeDay: (dayId) => {
        setTrip((t) => {
          const day = t.days.find((d) => d.id === dayId);
          const orphaned = day ? day.sections.flatMap((s) => s.items) : [];
          return {
            ...t,
            days: t.days.filter((d) => d.id !== dayId),
            unassigned: [...t.unassigned, ...orphaned],
          };
        });
      },

      addTodo: (text) => {
        setTrip((t) => ({
          ...t,
          todos: [...t.todos, { id: genId("todo"), text, done: false }],
        }));
      },

      removeTodo: (todoId) => {
        setTrip((t) => ({
          ...t,
          todos: t.todos.filter((td) => td.id !== todoId),
        }));
      },

      toggleTodo: (todoId) => {
        setTrip((t) => ({
          ...t,
          todos: t.todos.map((td) =>
            td.id === todoId ? { ...td, done: !td.done } : td
          ),
        }));
      },
    }),
    []
  );

  // ─── DnD handlers ───

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

      if (!sourceId || !destId || sourceId === destId) return current;

      const sourceItems = getItems(current, sourceId);
      const destItems = getItems(current, destId);
      const item = sourceItems.find((i) => i.id === activeId);
      if (!item) return current;

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

      if (!destId || sourceId !== destId) return current;

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
    <TripContext.Provider value={actions}>
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
              <div className="trip-header-top">
                <div>
                  <h1 className="trip-name">{trip.name}</h1>
                  {trip.startDate && trip.endDate && (
                    <p className="trip-dates">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  )}
                </div>
                <div className="trip-actions">
                  <button className="btn-subtle btn-share" onClick={handleShare} title="Copy shareable link">
                    {shareCopied ? "Copied!" : "Share"}
                  </button>
                  <button className="btn-subtle" onClick={handleExport} title="Download trip as JSON">Export</button>
                  <button className="btn-subtle" onClick={handleImport} title="Load trip from JSON file">Import</button>
                  <button className="btn-subtle btn-danger" onClick={handleReset} title="Reset to original data">Reset</button>
                </div>
              </div>
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
              {activeTab === "considering" && <AllPlacesView trip={trip} />}
              {activeTab === "todo" && <TodoView todos={trip.todos} />}
            </div>
          </div>

          <Sidebar trip={trip} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem && <ItemCard item={activeItem} isOverlay />}
        </DragOverlay>
      </DndContext>
    </TripContext.Provider>
  );
}
