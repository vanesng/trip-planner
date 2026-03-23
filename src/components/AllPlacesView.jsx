import ItemCard from "./ItemCard";

export default function AllPlacesView({ trip }) {
  const items = trip.unassigned || [];

  return (
    <div className="all-places-view">
      <p className="view-subtitle">
        {items.length} {items.length === 1 ? "item" : "items"} still considering
      </p>
      <div className="all-places-list">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="view-subtitle" style={{ fontStyle: "italic" }}>
            Nothing here — everything&apos;s planned!
          </p>
        )}
      </div>
    </div>
  );
}
