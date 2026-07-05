# Trip Effort System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stable derived trip-effort layer plus main-results and assistant-summary UI that react to selected flights.

**Architecture:** Reuse the existing `analysis.flightDecisions`, `selectedFlights`, and `dailyPlans` structures to compute `analysis.tripEffort` on the client. Render a separate effort module after `Daily Plan`, and keep the assistant sidebar limited to synchronized summary cards.

**Tech Stack:** Vanilla JavaScript, existing HTML/CSS, Node contract tests.

---

### Task 1: Lock trip-effort behavior with failing tests

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] Write failing assertions for normal effort, conservative-traveler notes, and red-eye selected-flight recalculation.
- [ ] Run `node tests/assistant-contract.test.mjs` and confirm failure.
- [ ] Implement the minimum trip-effort helpers.
- [ ] Re-run the contract test until it passes.

### Task 2: Build `analysis.tripEffort`

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`

- [ ] Add profile parsing for conservative vs high-intensity notes.
- [ ] Add score derivation for energy, walking, transit, budget, and risk.
- [ ] Attach `tripEffort` during itinerary analysis and refresh it after flight selection changes.

### Task 3: Render main-results effort UI

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\style.css`

- [ ] Add a `Trip Effort Analysis` section after `Daily Plan`.
- [ ] Render an overview block and ordered day cards.
- [ ] Keep the existing page structure and visual direction intact.

### Task 4: Render assistant effort summary

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`

- [ ] Add a compact effort summary to the existing synchronized sidebar area.
- [ ] Reflect selected red-eye / fatigue changes without adding chat-thread noise.

