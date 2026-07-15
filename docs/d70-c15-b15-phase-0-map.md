# Katris Travel — Phase 0 implementation map

## Scope

This phase protects the existing product contract and inventories the current implementation. It does not change production UI.

## Baseline

- Base branch: `main`
- Verified base commit: `fa21c0abeb3b8da12bce2b0850e86a9724ea4e20`
- Working branch: `feat/d70-c15-b15-unified`
- Frontend: static `index.html`, `style.css`, `taste-pass.css`, `script.js`, `hero-gsap.js`
- Serverless endpoints: `/api/generate-plan`, `/api/amadeus`, `/api/google-places`, `/api/booking`

## Protected product contract

The new Node test locks:

- Existing visible button labels.
- Required section, planner, assistant, result, menu, and status IDs.
- Existing anchor targets and `data-*` action hooks.
- Planner field names.
- Current script, stylesheet, API-route, local-storage, and load-event contracts.

## Current DOM and behavior ownership

### `index.html`

Owns the complete page structure and all stable public hooks. Current order is header, hero, inspiration strip, destinations, planner, assistant. Phase 2 will reorganize this structure without renaming existing IDs or controls.

### `script.js`

Monolithic product controller. It currently owns:

- Planner state and preference gate.
- Destination-template switching.
- Local-storage persistence.
- Itinerary analysis and rendering.
- Flight selection and booking checklist state.
- Hotel, place, route-map, and provider fallback behavior.
- Assistant submission, progress, clear, and result rendering.
- PDF/text export state.
- Operations-status rendering.
- Main `DOMContentLoaded` initialization.

This file must not be split while visual behavior is still unprotected. Modularization should be mechanical and follow the unified UI pass.

### `hero-gsap.js`

Owns a separate `DOMContentLoaded` hero animation for masonry cards and hero copy.

### `style.css`

Base visual and component system. It remains the source beneath the current experimental override.

### `taste-pass.css`

Large editorial override loaded after `style.css`. It is not the final design. Replace it cleanly in Phase 1 rather than adding another override layer.

## Confirmed conflicts and risks

1. Hero motion is initialized from both the main application lifecycle and a separate `hero-gsap.js` lifecycle. Phase 1 should establish one motion controller and one reduced-motion path.
2. `style.css` plus `taste-pass.css` creates broad cascade ownership and makes regressions difficult to isolate.
3. `script.js` is large and mixes state, provider integration, rendering, and interaction logic.
4. Placeholder provider responses exist. The UI must keep them visibly marked and must never present them as live inventory or verified pricing.
5. PR #5 contains useful contract-test work but its Apple-inspired visual changes remain rejected and must not be merged wholesale.
6. A framework migration during this redesign would combine product risk, rendering risk, and visual risk in one change set.

## Unified D/C/B implementation map

### Direction D — 70%: primary information architecture

Use D for the page sequence and the visual energy of the product:

1. Header and compact discovery navigation.
2. Cinematic hero.
3. Finite discovery stream.
4. Ready-made route directions.
5. Short-video guidance surface.
6. Lightweight community preview.
7. Route board.
8. Planner.
9. Assistant.
10. Provider and booking operations state.

Social and video modules must feed the planner or assistant through explicit actions. They must not become independent fake feeds.

### Direction C — 15%: app shell and state visibility

Use C for:

- Sticky or compact app navigation.
- Reusable destination, route, video, community, provider, and assistant cards.
- A route board showing destination, saved stay, selected transport, priority, provider status, fallback note, and export state.
- Mobile full-height sections and app-like navigation without making desktop resemble a phone mockup.

### Direction B — 15%: opening experience only

Use B for:

- One coherent travel image language in the hero.
- A 900–1200 ms opening sequence.
- Route trace or brand mark reveal, image resolution, then headline and actions.
- Motion that ends quickly and leaves the interface still.

No site-wide cinematic theme and no animation on every card.

## Phase 1 file strategy

First visual-stabilization commit:

- Keep `index.html` hooks stable.
- Consolidate hero motion into one controller.
- Replace `taste-pass.css` with a token-based visual layer.
- Avoid logic rewrites.

Only after the visual contract is stable, split toward:

```text
styles/
  tokens.css
  base.css
  layout.css
  components.css
  hero.css
  social.css
  planner.css
  assistant.css
  motion.css
  responsive.css

js/
  main.js
  state.js
  navigation.js
  destinations.js
  planner.js
  assistant.js
  api.js
  motion.js
```

## Phase 0 acceptance status

- New branch created.
- Contract test added and extended.
- DOM, API, state, asset, and visual conflict inventory documented.
- Production UI unchanged.
- No deployment requested for this documentation-and-test-only phase.

## Required next action

Run the baseline commands in a Git-capable environment:

```bash
node --test tests/ui-contract.test.mjs
node --check script.js
node --check hero-gsap.js
git diff --check
```

Do not begin Phase 1 until the exact outputs are recorded. If the baseline fails, repair the test or document the pre-existing contract mismatch without changing the production UI.
