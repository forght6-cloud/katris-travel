# CEO REVIEW SUMMARY

Project: Katris Travel AI
Date: 2026-07-04
Mode: SELECTIVE EXPANSION
Selected approach: Lightweight commercial execution layer

## Strongest Challenges

1. The product currently has provider integrations, but not a fully trusted user decision layer. Flights, hotels, and places can return data, yet the UI must clearly convert live / fallback / external data into a user-safe recommendation.
2. Budget feasibility is not explicit enough. A route such as Chicago to Manchester with 800 EUR for two weeks can return real flights and hotels while still being financially impossible. The user needs to see that immediately.
3. Slow or partial upstream APIs can make the assistant look broken. The user needs staged progress, named statuses, and visible fallback behavior.

## Recommended Path

Proceed with a scoped commercial execution layer:

- Add a budget feasibility layer after flights and hotels are returned.
- Default to a chosen plan rather than asking the user to select every unresolved item.
- Keep provider status visible, but replace technical provider names with customer-safe labels.
- Keep external booking/payment as the first commercial path.
- Improve assistant progress states for slow hotel and AI calls.
- Keep PDF generation as a user-facing execution artifact.

## Accepted Scope

- User-facing budget viability summary.
- Provider transparency without internal implementation names.
- Card-based assistant output connected to the same `analyzeTripPlan()` data flow.
- External booking links for hotels/flights/maps where direct booking is not owned by Katris.
- Better fallback copy when a provider is unavailable.
- Tests for budget feasibility, provider status copy, and assistant card/PDF surfaces.

## Deferred

- Direct payment processing inside Katris.
- Real-time bookable hotel inventory guarantee.
- User accounts and saved trips.
- Full provider orchestration service with persistent cache and monitoring dashboard.
- New design rewrite beyond minor UX corrections.

## NOT In Scope

- Replacing all providers at once.
- Pretending fallback data is live inventory.
- Showing internal hooks such as `requestAiPlan`, `parseItineraryDraft`, or `prepareBookingPayload` to users.
- Asking users to make decisions the assistant can reasonably make by default.

## Review Sections

### 1. Architecture Review

Current architecture is usable because `analyzeTripPlan()` already fans out to hotels, places, flights, daily plans, transport, flight decisions, trip effort, and booking checklist. The missing layer is a post-analysis commercial decision model that summarizes feasibility and default selections.

### 2. Error & Rescue Map

Named failures that must be visible:

- `hotel_provider_timeout`: show partial hotel/external results.
- `flight_provider_empty`: show external fare cards and mark as external.
- `places_provider_empty`: use verified city fallback when available.
- `budget_infeasible`: show total estimate exceeds budget and give a default adjustment.
- `ai_provider_unavailable`: use structured fallback and label it honestly.

### 3. Security & Threat Model

Secrets must stay server-side in Vercel env vars. User-facing UI must never reveal tokens, raw provider errors with keys, or internal API hook names. External links must use safe URL construction and `rel="noreferrer"`.

### 4. Data Flow & Interaction Edge Cases

Happy path: user input -> `analyzeTripPlan()` -> providers -> normalized options -> budget decision -> assistant cards/PDF.

Shadow paths:

- Empty route: use planner destination fallback.
- Empty budget: show budget as unconfirmed, do not score feasibility as pass/fail.
- Upstream error: return partial data with named status.
- Slow upstream: progress state must stay active and specific.

### 5. Code Quality Review

The current `script.js` is large and carries many responsibilities. Do not add a broad rewrite now. Add narrowly scoped helper functions for budget feasibility and customer-safe labels, then cover them with contract tests.

### 6. Test Review

Existing `tests/assistant-contract.test.mjs` is the right place for this iteration. Add tests that assert:

- Internal hook names are not rendered to the user.
- Budget infeasibility is calculated when flight + hotel minimum exceeds budget.
- Provider statuses are customer-safe.
- Assistant cards still include flights, hotels, places, and PDF actions.

### 7. Observability & Monitoring

For this stage, client-visible status is the minimum observability layer. Deferred production observability should include provider latency, fallback rate, empty result rate, and API error rate.

### 8. Database & State Management

No database changes. State remains in browser memory for now. This is acceptable for free/light development, but trips will need persistence before real customer accounts.

### 9. API Design & Contract

Keep existing API routes. Do not break `/api/flights/search`, `/api/hotels/search`, `/api/places/search`, or `/api/generate-plan`. Add client-side normalization before adding new server endpoints.

### 10. Performance & Scalability

Current bottleneck is upstream provider latency, especially hotels. The immediate mitigation is better progress UI and partial result handling. Later mitigation is caching and provider parallelization.

### 11. Design & UX

The UX must feel decisive. Avoid copy like "needs confirmation" when Katris can choose a reasonable real place. Use "Recommended", "Live provider result", "External booking", "Estimated", and "Budget warning" instead of engineering labels.

## Next Implementation Checklist

1. Add `deriveBudgetFeasibility()` from planner budget, flight options, and hotel options.
2. Render budget warning/fit card near summary and assistant sync.
3. Replace internal provider/hook labels with customer-safe labels.
4. Add staged progress copy for flights, hotels, places, AI, and final plan shaping.
5. Extend contract tests.
6. Run tests and gstack production-like QA before claiming completion.
