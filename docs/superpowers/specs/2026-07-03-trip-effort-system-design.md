# Trip Effort System Design

**Date:** 2026-07-03

**Scope:** Task 1.3 only. Add a derived `analysis.tripEffort` layer, an overview + per-day effort module in the main results area, and a synchronized effort summary in the assistant sidebar. Reuse `analysis.flightDecisions` and `selectedFlights`. No PDF, ticketing, login, persistence, or real ground-transport APIs.

## Goal

Help the user judge whether the itinerary is easy, standard, or high-intensity overall and by day, with particular attention to arrival fatigue, walking burden, transfer complexity, budget pressure, and execution risk.

## Data Shape

```js
analysis.tripEffort = {
  overall: {
    energyLevel: "轻松" | "标准" | "高强度",
    energyScore: 1-5,
    walkingLoad: 1-5,
    transitComplexity: 1-5,
    budgetPressure: 1-5,
    riskLevel: 1-5,
    summary: string
  },
  days: [
    {
      dayId: string,
      dayLabel: string,
      date: string,
      title: string,
      energyLevel: "轻松" | "标准" | "高强度",
      energyScore: 1-5,
      walkingLoad: 1-5,
      transitComplexity: 1-5,
      budgetPressure: 1-5,
      riskLevel: 1-5,
      reasons: string[],
      adjustmentSuggestion: string
    }
  ]
}
```

## Core Rules

- Higher scores mean easier / safer execution.
- If a flight is selected, use the selected offer. Otherwise, use the recommended offer.
- Red-eye, early departure, late arrival, long duration, and stop count reduce Day 1 or the matching arrival day.
- Conservative notes such as `带父母`, `体力一般`, `不想太累`, `轻松` make scoring more sensitive and adjustment advice more conservative.
- Budget pressure is estimated even without a budget, but the copy must say budget still needs confirmation.
- `energyLevel` fields remain strictly three-state; nuance stays in `summary`, `reasons`, and `adjustmentSuggestion`.

## UI

- Add a new main-results module after `Daily Plan`: `Trip Effort Analysis`
- The module contains:
  - overall overview
  - ordered per-day effort cards
- The assistant sidebar gets a compact effort summary only, not the full daily cards.

