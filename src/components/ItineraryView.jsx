import Day from "./Day";

export default function ItineraryView({ trip }) {
  return (
    <div className="itinerary-view">
      {trip.days.map((day, i) => (
        <Day key={day.id} day={day} index={i} />
      ))}
      <button className="add-button add-day-button">+ Add day</button>
    </div>
  );
}
