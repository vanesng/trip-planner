# Trip planner — MVP spec

## What this is

A personal trip planning web app that replaces the Google Docs + Google Maps list workflow. The core idea: you browse Google Maps on your phone as usual, share place URLs into this tool, and it gives you a structured, drag-and-drop itinerary you can share with friends as a clean read-only link.

## Vocabulary

These are the nouns used throughout the app. Use them consistently in code, UI, and conversation.

- **Trip** — top-level container. Has a name ("Tunis trip"), date range, and contains everything below.
- **Place** — a card created from a Google Maps share URL. Has: name, neighborhood, hours, notes. The "rich" item type.
- **Note** — a freeform text entry. Not tied to a Google Maps location. Used for things like "Arrive at airport 2pm," "Check into Airbnb," "Free afternoon to wander."
- **Day** — a day in the itinerary (Day 1, Day 2, etc.). Has a date and contains sections.
- **Section** — a grouping within a day. Has an editable label (e.g. "Morning," "Medina walk," "Lunch") and an optional time or time range. Contains an ordered list of places and/or notes.
- **Unassigned** — the collection of places and notes that haven't been slotted into any day yet. Lives in the sidebar.
- **To do** — a checklist item for logistics. Separate from notes. Examples: "Book riad," "Get SIM card," "Check visa requirements."

## Data model

```
Trip {
  id: string
  name: string
  startDate: date (optional)
  endDate: date (optional)
  days: Day[]
  unassigned: Item[]  // places and notes not yet in a day
  todos: Todo[]
}

Day {
  id: string
  date: date (optional)
  sections: Section[]
}

Section {
  id: string
  label: string  // editable, e.g. "Morning", "Medina walk"
  time: string | null  // optional, flexible format: "9am", "9am – 12pm", etc.
  items: Item[]
}

Item {
  id: string
  type: "place" | "note"
  
  // Place-specific fields (when type === "place")
  name: string
  neighborhood: string | null
  hours: string | null
  googleMapsUrl: string | null
  placeData: object | null  // raw data from Google Places API
  
  // Note-specific fields (when type === "note")
  text: string

  // Shared fields
  notes: string | null  // user's personal notes (for places: "NYT rec, book ahead")
  time: string | null  // optional, e.g. "9:30am" or "2pm – 5pm"
}

Todo {
  id: string
  text: string
  done: boolean
}
```

## Features (MVP)

### 1. Add a place via Google Maps URL

User pastes a Google Maps share URL (e.g. `https://maps.app.goo.gl/...` or `https://www.google.com/maps/place/...`). The tool:

1. Extracts the place ID or enough info from the URL to identify the place
2. Calls Google Places API to fetch: name, address/neighborhood, hours
3. Creates a place card and adds it to Unassigned

**Fallback:** if URL parsing fails or Places API isn't available, let the user manually enter name + neighborhood.

**API note:** This requires a Google Places API key. For MVP, this can be a simple serverless function (e.g. Vercel/Netlify function) that proxies the request to keep the key secret. Free tier is 10K calls/month which is more than enough.

### 2. Add a note

User clicks "+ Add a note" and types freeform text. Note is added to Unassigned (or directly into a section if adding from within a day).

### 3. Itinerary view

The main view. Structure:

```
Trip name + date range
─────────────────────────────
Day 1 — Sat, Apr 12
  Section: "Medina walk" · 9am – 12pm
    [drag] [P] Zitouna Mosque · 9:30am
                Medina · Open 8am–12pm
                Oldest mosque in Tunis, dress modestly
    [drag] [N] Walk through souk — enter from Bab el Bhar gate
  Section: "Lunch" · 12:30pm
    [drag] [P] Dar El Jeld
                Medina · Closes 10pm
                NYT rec — book ahead
  Section: "Downtime"
    [drag] [N] Free time — nap at riad · 2pm – 5pm
    [drag] [P] Café M'Rabet · 5pm
                Medina · Open til midnight
  [+ Add section]

Day 2 — Sun, Apr 13
  ...

[+ Add day]
```

Key interactions:
- **Drag and drop** places/notes between sections, between days, and back to unassigned
- **Drag and drop** to reorder within a section
- **Click to edit** section labels
- **Optional time** on sections and individual items
- **Small type badges** distinguish places (blue "P") from notes (gray "N")
- **Left border line** on sections for visual grouping
- **Drag handle** (six-dot grip) on every item

### 4. All places view

A flat list of every place added to the trip, regardless of whether it's assigned to a day or not. Useful as an overview / reference. Shows the same place cards as the itinerary. Filterable/searchable is nice-to-have for MVP.

### 5. To do

Simple checklist in the sidebar. Add items, check them off, checked items get strikethrough. That's it.

### 6. Shared read-only view

A clean, shareable URL that shows:
- The itinerary (days, sections, places, notes — no drag handles, no edit affordances)
- All places list appended below as a "Also considering" or similar section

Should look like a nicely formatted document. No sidebar, no editing UI. Just the content.

**For MVP:** this can be achieved by encoding trip data in the URL (base64 or compressed JSON) to avoid needing a database. If the data gets too large, we can move to a simple backend later.

## Layout

Two-column layout:

**Left (main area):** the active tab content — Itinerary, All places, or To do
- Tabs at the top to switch between views

**Right (sidebar, ~260px):**
- "Paste Google Maps link" input
- "+ Add a note" button
- Unassigned items (places and notes not in any day)
- To do checklist

The sidebar is always visible regardless of which tab is active, so you can always add items and see your unassigned pool.

## Design direction

Clean, minimal, document-like. Think of it as a nicely formatted Google Doc that happens to have drag-and-drop. Not a flashy app — a tool that gets out of the way.

- Flat, no shadows or gradients
- Generous whitespace
- Small, subtle type badges for place vs note
- Dashed borders for drop zones and add buttons
- Section grouping via left border line
- Editable labels indicated by dashed underline

The shared view should feel like a travel doc you'd actually want to read — clean typography, good hierarchy, easy to scan.

## Tech stack (suggested)

- **React** (Vite) — component model fits the nested structure well
- **dnd-kit** or similar — for drag and drop between sections/days/unassigned
- **Local storage** for MVP persistence (no backend needed except for Places API proxy)
- **Google Places API** — for resolving Maps URLs into place data. Proxied through a serverless function.
- **URL-encoded sharing** — for read-only links without a database

## Deferred (post-MVP, but design for extensibility)

- **AI itinerary suggestions** — "I have 12 places, organize them into 3 days with logical routing." Data model already supports this since places have coordinates.
- **Collaborative editing** — comments, shared editing. Would require a real backend + auth.
- **Research clipping** — paste a NYT article URL, extract recommendations as candidate places.
- **KML import** — bulk import from Google My Maps if user has one.
- **Multiple trips** — trip list / dashboard. For MVP, one trip at a time is fine.

## Wireframe reference

The wireframes were iterated in conversation and the final version (v3) shows:
- Two-column layout with itinerary on left, sidebar on right
- Sections within days with editable labels and optional times
- Mixed place and note cards with drag handles and type badges
- Unassigned pool in sidebar with drag handles
- To do checklist in sidebar below unassigned
- Tabs for Itinerary / All places / To do

Use the wireframe as directional — exact spacing, metadata placement, and visual details should be iterated in code where it's easier to judge.
