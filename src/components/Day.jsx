import Section from "./Section";
import { useTripActions } from "../context/TripContext";

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function Day({ day, index }) {
  const actions = useTripActions();

  return (
    <div className="day">
      <div className="day-header-row">
        <h3 className="day-header">
          Day {index + 1}
          {day.date && <span className="day-date"> — {formatDate(day.date)}</span>}
        </h3>
        <button
          className="remove-btn"
          onClick={() => actions.removeDay(day.id)}
          title="Remove day"
        >
          ×
        </button>
      </div>
      <div className="day-sections">
        {day.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
      <button
        className="add-button"
        onClick={() => actions.addSection(day.id)}
      >
        + Add section
      </button>
    </div>
  );
}
