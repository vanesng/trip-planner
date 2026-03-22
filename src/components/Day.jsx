import Section from "./Section";

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function Day({ day, index }) {
  return (
    <div className="day">
      <h3 className="day-header">
        Day {index + 1}
        {day.date && <span className="day-date"> — {formatDate(day.date)}</span>}
      </h3>
      <div className="day-sections">
        {day.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
      <button className="add-button">+ Add section</button>
    </div>
  );
}
