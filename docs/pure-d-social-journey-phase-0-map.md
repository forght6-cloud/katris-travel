# Katris Travel — Pure D Social Journey Phase 0 map

## Status

- Phase: 0 — protect current logic
- Verified: 2026-07-16
- Base branch: `main`
- Base commit: `53cfc29cebc4a1671b59cd458e4bcaced59e3f04`
- Working branch: `feat/pure-d-social-journey`
- Scope: tests, inventory, and CI branch targeting only
- Production UI changed in this phase: no

The repository has moved beyond the older handoff baseline. Current `main` already contains the squashed commit `Ship Katris V2 interactive D-led experience`, including `features.css`, `features.js`, contract tests, and an interactive hero. This Phase 0 therefore protects the real current `main`; it does not copy the obsolete mixed D/C/B branch or assume the older `fa21c0a` baseline.

## Current architecture

The product remains one static responsive website:

```text
index.html
style.css
taste-pass.css
script.js
hero-gsap.js
features.css
features.js
api/
tests/
```

`index.html` loads the legacy CSS and JavaScript files. `hero-gsap.js` currently injects `features.css` and `features.js`. No React, Next.js, or native mobile migration is present.

## Protected visible controls

The Phase 0 contract locks the current labels and their existing hooks, including:

```text
Start planning
Build my trip
View ready templates
Travel Plan
Recommended path
Save current trip
Supplier checkout
Operations status
Analyze itinerary
Reset
Send prompt
Clear
```

It also protects the current D-layer controls for route filtering, local saves, planner transfer, assistant transfer, local community notes, guidance playback, and route-board copy/clear actions. Dynamically rendered booking, flight-selection, preference, travel-assistant, and PDF controls are protected by their `data-*` hooks.

## Protected IDs

### Static shell and product IDs

```text
top
overview
destinations
destination-template
template-kicker
template-title
template-summary
template-best
template-base
template-action
template-days
planner
liquid-glass-filter
liquid-plan-menu
liquid-menu-detail
planner-form
from
budget
to
date
tripLength
people
notes
analyze-planner
reset-planner
preference-gate
preview-title
preview-summary
preview-pillars
timeline-output
analysis-results
ops-monitor
assistant
assistant-thread
assistant-progress
assistant-progress-step
assistant-progress-bar
assistant-form
assistant-input
clear-assistant
assistant-flight-summary
```

### Dynamically installed D-layer IDs

```text
discover
discovery-count
discovery-grid
guides
guidance-grid
community
community-list
community-form
community-status
route-board
route-board-grid
route-board-status
```

## Forms and fields

### Planner

`#planner-form` keeps the following field names:

```text
from
budget
to
date
tripLength
people
notes
pillars
```

It continues to use `#analyze-planner` for submit, `#reset-planner` for reset, and `#preference-gate` for preference state.

### Assistant

`#assistant-form`, `#assistant-input`, and `#clear-assistant` remain the stable assistant hooks. Results continue to render into `#assistant-thread`, with progress and flight summary in their existing output nodes.

### Browser-local community note

`#community-form` retains `name`, `route`, and `note`. Saved notes are explicitly labeled browser-local and are not presented as published community content.

## Data-action hooks

### Static navigation and destination hooks

```text
data-scroll-target
data-region
data-liquid-menu-toggle
data-liquid-action
```

### Planner, booking, assistant, and export hooks

```text
data-preference-key
data-preference-value
data-preference-submit
data-preference-reset
data-select-flight-segment
data-select-flight-offer
data-booking-action
data-booking-item-id
data-booking-confirmation-input
data-travel-assistant-action
data-travel-assistant-message-id
data-generate-final-pdf
data-download-assistant-pdf
data-result-index
```

### D-layer hooks

```text
data-filter
data-save
data-use
data-ask
data-guide-card
data-play
data-tip
data-helpful
data-open-planner
data-copy-board
data-clear-board
```

## API inventory

| Frontend path | Current handler | Current role |
| --- | --- | --- |
| `/api/generate-plan` | `api/generate-plan.js` | AI plan request with explicit structured fallback |
| `/api/amadeus` | `api/amadeus.js` | Flight search with provider/mock state |
| `/api/google-places` | `api/google-places.js` | Placeholder places response, visibly labeled |
| `/api/booking` | `api/booking.js` | Placeholder hotel response, visibly labeled |

Additional serverless entry files exist but are not currently called by the static frontend:

```text
api/tripcom.js
api/ai/plan.ts
api/flights/search.ts
api/hotels/search.ts
api/places/search.ts
```

These files are protected as repository entry points. Phase 1 must not silently replace a frontend endpoint or present a placeholder/fallback response as verified live data.

## Local-storage inventory

| Key | Owner | Stored state |
| --- | --- | --- |
| `katris-travel:last-trip-v1` | `script.js` | Planner, analysis, selected flights, booking checklist, travel assistant, PDF state, and save metadata |
| `katris-travel:feature-state-v2` | `features.js` | Saved routes, local notes, helpful state, and route-board context |

Both stores are browser-local. The product must not claim cloud synchronization unless a real cloud store is added later.

## Current behavior ownership

- `script.js`: navigation, destination switching, planner state, preference defaults/gate, API requests, provider/fallback rendering, local trip save/restore, itinerary analysis, flight choice, booking checklist, travel assistant, operations monitor, and PDF/export flows.
- `hero-gsap.js`: interactive waterfall hero plus current feature-asset injection.
- `features.js`: finite discovery routes, motion-guide controls, browser-local community preview, route board, planner/assistant context transfer, and its local storage.
- `index.html`: stable static DOM hooks, forms, and original visible controls.

## Phase 1 risks and deliberate non-contracts

The following are baseline implementation facts, not approved final Pure D design decisions:

1. Hero motion still has two owners: `initHeroGsapAnimation()` in `script.js` and `initHeroWaterfall()` in `hero-gsap.js`.
2. CSS is stacked across `style.css`, `taste-pass.css`, and dynamically injected `features.css`.
3. `features.js` is loaded through the hero controller, coupling unrelated feature and animation ownership.
4. The current font stack still loads `Instrument Serif`, while the Pure D brief requires modern sans-serif typography only.
5. The current “Short guidance surface” is not yet the required licensed, user-initiated short-video stream.
6. The final saved-collections surface and full Pure D information architecture are not yet implemented.
7. Existing D-led modules are useful baseline behavior, but the earlier mixed D/C/B design map is superseded by the Pure D brief.

Phase 1 may deliberately change visual files, asset loading, and animation ownership after updating the relevant implementation-level tests. It must keep the product contracts listed above stable.

## Baseline verification

Commands run before Phase 0 edits:

```bash
node --test tests/*.test.mjs
node --check script.js
node --check hero-gsap.js
node --check features.js
git diff --check
```

Result on base commit `53cfc29`: 15 tests passed, 0 failed; all three JavaScript syntax checks passed; `git diff --check` passed.

## Phase 0 acceptance

- New branch created from current `main`.
- Current static and dynamic UI contracts inventoried.
- API entry points and local-storage keys inventoried.
- Pure D Phase 0 contract tests added.
- CI push target changed from the obsolete mixed-direction branch to `feat/pure-d-social-journey`.
- No production UI, application logic, API implementation, or environment configuration changed.
- Phase 1 must not begin until the expanded test suite passes and the Phase 0 diff is confirmed to contain only tests, documentation, and CI targeting.
