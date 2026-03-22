import { createContext, useContext } from "react";

const TripContext = createContext(null);

export function useTripActions() {
  return useContext(TripContext);
}

export default TripContext;
