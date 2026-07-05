# Flight Decision Cards Design

**Date:** 2026-06-27

**Project:** Katris Merrio AI Travel Assistant MVP

**Scope:** Task 1.2 only. This design covers the flight decision model, recommendation logic, full decision cards in the main results area, synchronized flight summaries in the assistant sidebar, and multi-segment selection state. It does not include PDF generation, hotel booking flows, ticketing, app notifications, travel-in-progress reminders, auth, or persistence.

## Goal

Upgrade the current flight list into a multi-segment decision system that helps the user compare options, understand tradeoffs, and explicitly choose a flight per flight-required segment without changing the overall page structure or visual direction.

## Constraints

- The main results area is the only formal selection entry point.
- Assistant summaries must never expose a select button.
- `recommendedOfferId` is a recommendation marker only. It never means selected.
- `selectedFlights` is written only after the user clicks `Choose this flight`.
- Ground segments are identified but do not render flight cards.
- Current homepage, planner page, and results layout must remain intact.
- API keys remain server-side only.

## Data Model

### Raw data

Keep `analysis.flights` as the unmodified result list produced by itinerary analysis and Amadeus/external fallback search.

### Derived decision layer

Add `analysis.flightDecisions`, an array of segment-level decision models:

```js
{
  segmentId,
  from,
  to,
  departDate,
  isGroundSegment,
  provider,
  status,
  message,
  recommendedOfferId,
  offers: [...]
}
```

Each offer in `offers` contains:

```js
{
  offerId,
  carrierCode,
  flightNumber,
  airline,
  from,
  to,
  departAt,
  arriveAt,
  departure,
  arrival,
  duration,
  durationMinutes,
  stops,
  stopLabel,
  price,
  currency,
  priceLabel,
  bookingUrl,
  isRedEye,
  arrivalQuality,
  timeScore,
  energyScore,
  budgetScore,
  riskScore,
  comfortScore,
  label,
  recommendationReason,
  tradeoffReason,
  isRecommended
}
```

### Selected state

Use a keyed object instead of a single selected flight:

```js
selectedFlights = {
  [segmentId]: {
    segmentId,
    from,
    to,
    departDate,
    selectedFlightOffer
  }
}
```

## Recommendation Rules

The recommendation pipeline is two-stage:

1. Score every offer on five axes:
   - `timeScore`: better daytime departure/arrival and shorter total journey
   - `energyScore`: less fatigue, especially non-red-eye and simpler routing
   - `budgetScore`: within budget when provided; otherwise rank by relative price
   - `riskScore`: higher score means lower operational risk
   - `comfortScore`: less punishing timing and fewer disruptions
2. Resolve one `recommendedOfferId` per segment using these priorities:
   - non-red-eye first
   - arrival time suitable for same-day check-in / dinner next
   - fewer stops next
   - shorter duration next
   - in-budget pricing next
   - lower-risk routing next
   - higher comfort next

Additional rules:

- A cheapest flight with red-eye timing, long connection pain, or poor arrival timing may receive `Budget priority` but must not receive `Recommended`.
- If scores tie, break ties by: non-red-eye, fewer stops, better arrival window.
- Every segment has at most one recommended offer.

## Labels

- Best balanced option: `Recommended`
- Cheapest but not well-balanced: `Budget priority`
- Best timing/arrival profile: `Time priority`
- Best low-fatigue experience: `Comfort priority`
- Everything else: `Balanced option`

## UI Behavior

### Main results area

- Add a flight status strip above the flight segments:
  - `Selected flights: X / Y segments`
  - If incomplete: `There are still unconfirmed flight segments. Confirm them before generating the final execution sheet.`
- Render one block per segment.
- For flight segments:
  - show 3+ candidate decision cards when available
  - each card includes flight facts, five-force scores, recommendation/tradeoff copy, and `Choose this flight`
  - selected card shows `Selected`
- For ground segments:
  - show: `Ground transport segment. Rail / Bus / Maps can be connected later.`

### Assistant sidebar

- Show synchronized summaries derived from the same `analysis.flightDecisions`.
- Never show full cards or selection buttons.
- Per segment:
  - recommended flight summary
  - recommendation reason
  - five-force summary
  - prompt to confirm in main results
- If a segment is already selected, replace the prompt with:
  - `You have selected this flight. Next you can confirm hotels or generate the execution sheet.`
- Update in place instead of spamming the chat thread.

## Error Handling

- If a route has no usable offers, keep fallback external search links and a clear provider/status message.
- Missing user budget must not break scoring.
- Unsupported airports keep the segment visible and degrade to external-search fallback.

## Testing

- Add test coverage for:
  - decision-model derivation
  - single recommendation per segment
  - budget scoring with and without planner budget
  - `riskScore` directionality
  - selection summary counts
  - assistant sidebar rendering without selection buttons

