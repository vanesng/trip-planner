import Day from "./Day";
import { useTripActions } from "../context/TripContext";

export default function ItineraryView({ trip }) {
  const actions = useTripActions();

  return (
    <div className="itinerary-view">
      {trip.days.map((day, i) => (
        <Day key={day.id} day={day} index={i} />
      ))}
      <button className="add-button add-day-button" onClick={actions.addDay}>
        + Add day
      </button>
    </div>
  );
}
