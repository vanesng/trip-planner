import ItemCard from "./ItemCard";

export default function AllPlacesView({ trip }) {
  const allPlaces = [];

  trip.days.forEach((day) => {
    day.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === "place") allPlaces.push(item);
      });
    });
  });

  trip.unassigned.forEach((item) => {
    if (item.type === "place") allPlaces.push(item);
  });

  return (
    <div className="all-places-view">
      <p className="view-subtitle">{allPlaces.length} places saved</p>
      <div className="all-places-list">
        {allPlaces.map((place) => (
          <ItemCard key={place.id} item={place} />
        ))}
      </div>
    </div>
  );
}
