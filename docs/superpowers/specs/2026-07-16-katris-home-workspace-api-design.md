# Katris Home, Workspace, and Live Data Integration

## Goal

Keep the existing cinematic Katris homepage in `index.html` as the entry point, while making the planning experience behave like a normal product flow rather than a long editorial poster. Preserve existing controls and their labels. Replace the current placeholder-facing data path with the normalized API routes already present in the repository.

## User-visible flow

1. `Home` remains the existing hero and destination-card entry page.
2. `Start` and the existing planning entry move the user to `?view=plan`, a focused Travel Plan workspace.
3. `Analyze itinerary` keeps its label and generates the same planning content, then makes the Trip Result workspace active at `?view=trip`.
4. The assistant remains available in the Trip Result workspace and uses the same normalized analysis state.
5. Browser back and direct links restore Home, Plan, or Trip Result views without a separate framework or a second application.

## Visual direction

- No structural redesign of Home. Keep its existing placement, hero, cards, and buttons.
- Replace only the Forest Retreat image with a real, externally sourced photograph. Do not use AI-generated imagery.
- Use a non-white paper palette with sky blue, clay, warm sand, and ink accents. Remove dark forest-green text from user-facing surfaces.
- Use a sans-serif type family for interface and card copy. Preserve the liked mockup's restrained scale, line length, and hierarchy through weight and spacing rather than retaining its serif font.
- Apply the targeted card refinements requested by the user: sans-serif Pine Lake copy, a distinct color for the destination-card explanatory line, no Travel Plan duplicate text, and a richer page background that still belongs with the existing homepage.

## Implementation boundary

- `index.html`, `style.css`, and `script.js` remain the only frontend files changed for this iteration.
- Existing button labels and the planner, assistant, PDF, and result logic remain in place.
- Route-style view state is implemented through query parameters in the existing static page. This avoids adding a router, framework, or duplicate page code.
- Homepage content stays visible only in Home view. Plan and Trip views display a persistent compact header plus their relevant workspace; no numeric pagination or forced long-scroll poster flow.

## API data flow

The browser-side functions will call the normalized server routes:

| User need | Endpoint | Required UI behavior |
| --- | --- | --- |
| Flight choices | `POST /api/flights/search` | Render carrier, time, price only when returned by a real price provider, booking link, and provider status. |
| Hotel candidates | `POST /api/hotels/search` | Render hotel name, address, source, map/external booking links, and never label a fallback as inventory. |
| Verified places | `POST /api/places/search` | Render named places and addresses plus Maps links. |
| Structured assistant plan | `POST /api/ai/plan` | Send system and user state through the existing endpoint, render card-friendly sections, and label fallback when no live model succeeds. |

The former placeholder endpoints will not be used by the frontend after this change. A provider status line will distinguish `real data`, `external booking link`, and `fallback`.

## Error handling

- A failed individual provider returns a useful state card and leaves other provider results usable.
- No mock price, invented address, or placeholder hotel is presented as live.
- AI fallback remains structured and visibly marked rather than silently posing as a live AI answer.

## Verification

1. Existing assistant-contract and Vercel API route tests pass.
2. A browser test confirms Home, `?view=plan`, and `?view=trip` render with intact controls and no console errors.
3. A Chicago to Manchester, one traveler, 800 EUR, two-week request proves that the browser calls all four normalized endpoints and exposes provider state.
4. Production smoke check confirms the same flow on the Vercel alias.

## Non-goals

- No account system, database, payment collection, or Katris-owned hotel inventory.
- No claim that an external booking click completes a purchase.
- No complete replacement of the current homepage or a framework migration.
