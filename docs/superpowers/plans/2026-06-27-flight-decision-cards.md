# Flight Decision Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-segment flight decision cards with recommendation scoring, explicit user selection, and synchronized assistant summaries without changing the existing page structure.

**Architecture:** Keep the current single-file frontend structure, but insert a derived `flightDecisions` layer between raw analysis results and UI rendering. Main results consume the full decision model for formal selection, while the assistant sidebar consumes the same model for compact synchronized summaries.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Vercel serverless APIs, Node VM-based contract tests.

---

### Task 1: Lock the decision model with failing tests

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the Node contract test and verify the new assertions fail**
- [ ] **Step 3: Add the minimum helper functions and state required by the failing assertions**
- [ ] **Step 4: Run the same test file until it passes**

### Task 2: Build the derived flight decision layer

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] **Step 1: Normalize richer flight offer fields in `searchFlights()`**
- [ ] **Step 2: Add helpers to derive `analysis.flightDecisions` from `analysis.flights`**
- [ ] **Step 3: Add helpers to compute five-force scores, labels, and a single `recommendedOfferId`**
- [ ] **Step 4: Re-run the contract tests**

### Task 3: Add multi-segment selection state

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] **Step 1: Add `selectedFlights` to `appState`**
- [ ] **Step 2: Add helpers to set, clear, and summarize selected segments**
- [ ] **Step 3: Re-render analysis results and assistant summaries on selection**
- [ ] **Step 4: Re-run the contract tests**

### Task 4: Render decision cards in the main results area

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\style.css`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] **Step 1: Replace the plain flight list markup with segment-level decision-card markup**
- [ ] **Step 2: Add a status strip for selected/total segment count and incomplete warning**
- [ ] **Step 3: Style decision cards, score bars, badges, and selected state to match the existing visual language**
- [ ] **Step 4: Re-run tests and a syntax check**

### Task 5: Render synchronized assistant summaries

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js`
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\style.css`
- Test: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\tests\assistant-contract.test.mjs`

- [ ] **Step 1: Replace assistant flight mini-cards with recommendation summaries**
- [ ] **Step 2: Ensure no selection button appears in assistant output**
- [ ] **Step 3: Reflect selected state in assistant summaries**
- [ ] **Step 4: Re-run tests**

### Task 6: Verify end-to-end behavior

**Files:**
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\script.js` (if needed after QA)
- Modify: `C:\Users\ertui\Documents\Codex\2026-05-16\chat-gpt\katris-travel-html-redesign\style.css` (if needed after QA)

- [ ] **Step 1: Run `node --check` on `script.js`**
- [ ] **Step 2: Run `node tests/assistant-contract.test.mjs`**
- [ ] **Step 3: Spot-check a single-segment route such as `LAX -> JFK`**
- [ ] **Step 4: Spot-check a multi-segment itinerary such as `LAX -> JFK -> London`**

