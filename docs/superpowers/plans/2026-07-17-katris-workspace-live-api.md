# Katris Workspace and Live API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the cinematic Katris homepage while turning planning and trip results into route-addressable workspaces backed by normalized provider APIs.

**Architecture:** `index.html` remains the only frontend document. `?view=home`, `?view=plan`, and `?view=trip` set a `data-katris-view` attribute on `<body>` so CSS presents the correct workspace without a router or duplicated application. Existing data-loading functions move from the root-level placeholder API routes to the normalized `/api/*/search` and `/api/ai/plan` endpoints.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Vercel serverless functions, Node assertion tests, gstack browser QA.

---

## File Structure

- Modify `index.html`: add durable view hooks to existing homepage, planner, result, and assistant areas; preserve all existing button labels.
- Modify `style.css`: add a sky/clay/ink palette, pure sans-serif UI type, route-view visibility rules, targeted destination-card styles, and Travel Plan duplicate-text fix.
- Modify `script.js`: add query-parameter view navigation; replace old placeholder endpoint calls with normalized endpoints; render provider-state copy without provider internals.
- Modify `tests/assistant-contract.test.mjs`: assert that the browser script uses normalized routes and preserves the view hooks.
- Modify `tests/vercel-api-routes.test.mjs`: assert the new route source files exist and preserve their public request contract.

### Task 1: Lock the new frontend contract in tests

**Files:**
- Modify: `tests/assistant-contract.test.mjs:7-11, 163-208`
- Modify: `tests/vercel-api-routes.test.mjs:1-10, 38-137`

- [ ] **Step 1: Replace the old endpoint contract assertions with normalized-route assertions**

  In `tests/assistant-contract.test.mjs`, replace the five legacy checks that require `/api/booking`, `/api/google-places`, `/api/amadeus`, and `/api/generate-plan` with:

  ```js
  assert.match(script, /fetch\("\/api\/flights\/search"/, "Flight searches should use the normalized flight endpoint.");
  assert.match(script, /fetch\("\/api\/hotels\/search"/, "Hotel searches should use the normalized hotel endpoint.");
  assert.match(script, /fetch\("\/api\/places\/search"/, "Place searches should use the normalized places endpoint.");
  assert.match(script, /fetch\("\/api\/ai\/plan"/, "Assistant generation should use the normalized AI endpoint.");
  assert.match(indexHtml, /data-katris-view/, "The page should declare route-addressable workspace view hooks.");
  assert.match(script, /function setKatrisView\(/, "The browser should manage Home, Plan, and Trip views.");
  assert.doesNotMatch(script, /fetch\("\/api\/(?:amadeus|booking|google-places|generate-plan)"/, "The browser should not call placeholder API routes.");
  ```

- [ ] **Step 2: Run the test to verify the old browser code fails the new contract**

  Run:

  ```powershell
  node tests\assistant-contract.test.mjs
  ```

  Expected: failure reporting that the normalized flight endpoint or `setKatrisView` is missing.

- [ ] **Step 3: Add source existence assertions for the Vercel TypeScript endpoints**

  In `tests/vercel-api-routes.test.mjs`, add `existsSync` to the top-level imports and append the loop after the existing API checks:

  ```js
  import { existsSync } from "node:fs";

  for (const route of [
    "../api/flights/search.ts",
    "../api/hotels/search.ts",
    "../api/places/search.ts",
    "../api/ai/plan.ts",
  ]) {
    assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist for the normalized browser data flow.`);
  }
  ```

- [ ] **Step 4: Commit the contract-first test change**

  ```powershell
  git add tests/assistant-contract.test.mjs tests/vercel-api-routes.test.mjs
  git commit -m "test: require normalized Katris provider routes"
  ```

### Task 2: Add view hooks without moving or renaming current controls

**Files:**
- Modify: `index.html:51-246`
- Modify: `index.html:248-460`

- [ ] **Step 1: Mark the existing cinematic content as the Home workspace**

  Add `data-katris-view-surface="home"` to these existing sections without changing their nested content:

  ```html
  <section class="hero-section lumora-hero" id="overview" data-hero-scene="0" data-katris-view-surface="home">
  <section class="inspiration-strip" aria-label="Travel atmosphere highlights" data-katris-view-surface="home">
  <section class="destinations-section" id="destinations" data-katris-view-surface="home">
  ```

- [ ] **Step 2: Mark planner and generated-result sections for focused workspaces**

  Add `data-katris-view-surface="plan"` to the existing `#planner` section and `data-katris-view-surface="trip"` to the existing generated results and assistant section wrappers. Do not rename `#planner`, `#assistant`, form IDs, or button IDs. The existing heading remains `Build the trip step by step.`

- [ ] **Step 3: Make the existing primary entry links explicit workspace links**

  Keep visible labels unchanged, but change the existing homepage `Start`, header planning action, and email-form submit path to use `data-katris-view-link="plan"`. The element form stays a normal form and JavaScript handles navigation after saving the email:

  ```html
  <a href="?view=plan" class="lumora-pill-cta" data-katris-view-link="plan">Start</a>
  ```

- [ ] **Step 4: Commit the HTML hooks**

  ```powershell
  git add index.html
  git commit -m "feat: add Katris workspace view hooks"
  ```

### Task 3: Apply the targeted visual refinement and remove poster-like workspace styling

**Files:**
- Modify: `index.html:11-15`
- Modify: `style.css:1-180, 880-1210, 2840-2960`

- [ ] **Step 1: Switch the document to a sans-serif-only UI family**

  Replace the font request with Inter and Manrope, then make the global type stack unambiguous:

  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
  ```

  ```css
  :root {
    --ink: #202a38;
    --ink-muted: #596777;
    --sky: #b9dbe4;
    --clay: #d98262;
    --sand: #ead9bd;
    --paper: #f3efe8;
    --line: rgba(32, 42, 56, 0.16);
  }

  body,
  button,
  input,
  select,
  textarea {
    font-family: "Manrope", "Inter", ui-sans-serif, system-ui, sans-serif;
  }
  ```

- [ ] **Step 2: Replace the Forest Retreat artwork with a real photograph and target only the requested copy**

  Replace `.destination-visual.forest` with a real Unsplash forest-lake image and apply the requested non-serif copy hierarchy:

  ```css
  .destination-visual.forest {
    background-image: url("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85");
    background-position: center 58%;
  }

  .destination-card[data-region="forest"] .destination-copy > span:last-child {
    color: #4f6f7c;
    font-family: "Manrope", "Inter", ui-sans-serif, system-ui, sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.55;
  }
  ```

- [ ] **Step 3: Remove the duplicate Travel Plan glyph and add workspace view rules**

  Hide the decorative clone rather than showing a duplicate label, replace dark green text rules with `var(--ink)`, and make each query view behave as a normal application screen:

  ```css
  .liquid-trigger-clone { display: none; }
  .liquid-trigger, .liquid-menu, .liquid-menu button { color: var(--ink); }
  .section-heading > p:last-child { color: #476a7d; }

  body[data-katris-view="plan"] [data-katris-view-surface="home"],
  body[data-katris-view="trip"] [data-katris-view-surface="home"],
  body[data-katris-view="home"] [data-katris-view-surface="plan"],
  body[data-katris-view="home"] [data-katris-view-surface="trip"],
  body[data-katris-view="plan"] [data-katris-view-surface="trip"] {
    display: none;
  }

  body[data-katris-view="plan"], body[data-katris-view="trip"] {
    background: linear-gradient(145deg, #cce5e7 0%, #f3efe8 46%, #edd4bc 100%);
  }
  ```

- [ ] **Step 4: Verify the visual-only change locally and commit it**

  Run:

  ```powershell
  git diff --check
  ```

  Expected: exit code `0` with no whitespace errors.

  Then commit:

  ```powershell
  git add index.html style.css
  git commit -m "style: refine Katris workspace palette and destination cards"
  ```

### Task 4: Add browser history-safe Home, Plan, and Trip view navigation

**Files:**
- Modify: `script.js:420-560`
- Modify: `script.js:1197-1235`
- Modify: `script.js:4543-4585`

- [ ] **Step 1: Add the smallest query-parameter view controller**

  Add these functions before existing event binding calls:

  ```js
  const KATRIS_VIEWS = new Set(["home", "plan", "trip"]);

  function getKatrisView() {
    const view = new URLSearchParams(window.location.search).get("view");
    return KATRIS_VIEWS.has(view) ? view : "home";
  }

  function setKatrisView(view, { replace = false } = {}) {
    const nextView = KATRIS_VIEWS.has(view) ? view : "home";
    const url = new URL(window.location.href);
    nextView === "home" ? url.searchParams.delete("view") : url.searchParams.set("view", nextView);
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
    document.body.dataset.katrisView = nextView;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function bindKatrisViewLinks() {
    document.querySelectorAll("[data-katris-view-link]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        setKatrisView(element.dataset.katrisViewLink);
      });
    });
    window.addEventListener("popstate", () => setKatrisView(getKatrisView(), { replace: true }));
  }
  ```

- [ ] **Step 2: Initialize the controller before planner rendering and preserve the existing local-email action**

  In the existing DOM-content initialization, add:

  ```js
  document.body.dataset.katrisView = getKatrisView();
  bindKatrisViewLinks();
  ```

  In `bindHomeLoginForm`, replace `navigateToSection("#planner")` with `setKatrisView("plan")` after `localStorage.setItem`.

- [ ] **Step 3: Send successful planner and assistant output to the Trip workspace**

  After `runPlannerAnalysis()` has rendered a valid analysis, call:

  ```js
  setKatrisView("trip");
  ```

  Preserve error rendering in Plan view by calling it only after a successful result is written. In `handleAssistantPrompt`, keep the existing `analyzeTripPlan()` call and call `setKatrisView("trip")` only after a structured assistant message is rendered.

- [ ] **Step 4: Run the contract test and commit navigation**

  Run:

  ```powershell
  node tests\assistant-contract.test.mjs
  ```

  Expected: `assistant contract ok`.

  Then commit:

  ```powershell
  git add script.js tests/assistant-contract.test.mjs
  git commit -m "feat: add Katris workspace navigation"
  ```

### Task 5: Migrate browser data loading to normalized provider endpoints

**Files:**
- Modify: `script.js:1471-1710`
- Modify: `script.js:4680-4735`
- Modify: `tests/assistant-contract.test.mjs:163-208`
- Modify: `tests/vercel-api-routes.test.mjs:1-140`

- [ ] **Step 1: Replace the old flight request without changing the caller contract**

  In `searchFlights`, replace the `/api/amadeus` request with:

  ```js
  const response = await fetch("/api/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination, departDate: date, adults: Number(appState.planner.people) || 1 }),
  });
  ```

  Preserve the existing returned object shape. Store `data.provider`, `data.warning`, and `data.environment` alongside `offers` so result cards can state whether the response is real provider data or fallback.

- [ ] **Step 2: Replace hotel and place placeholder calls with normalized requests**

  In `searchHotels`, use:

  ```js
  const response = await fetch("/api/hotels/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, date, checkoutDate, adults, limit: 8 }),
  });
  ```

  In `searchAttractions`, use:

  ```js
  const response = await fetch("/api/places/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, limit: 8 }),
  });
  ```

  Normalize each response only at these boundaries. Retain names, addresses, Google Maps links, and external booking links returned by the server; never construct a fake address or price in the browser.

- [ ] **Step 3: Replace the legacy AI endpoint and introduce customer-safe provider status text**

  In `requestAiPlan`, use:

  ```js
  const response = await fetch("/api/ai/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planner: state.planner, analysis: state.analysis, confirmedPreferences: state.confirmedPreferences }),
  });
  ```

  Add one formatter used by the existing status card:

  ```js
  function getCustomerSafeDataStatus(provider, warning) {
    if (provider === "amadeus" || provider === "hasdata" || provider === "geoapify" || provider === "verified + geoapify") return "Live provider data";
    if (provider === "fallback" || provider === "mock") return "Planning fallback";
    return warning ? "External search link available" : "External provider result";
  }
  ```

  Do not show API vendor routing labels, keys, internal hooks, or raw upstream errors to users. Keep raw warnings only in `console.warn` for debugging.

- [ ] **Step 4: Update tests, run both suites, and commit API migration**

  Run:

  ```powershell
  node tests\assistant-contract.test.mjs
  node tests\vercel-api-routes.test.mjs
  ```

  Expected:

  ```text
  assistant contract ok
  vercel api routes ok
  ```

  Commit:

  ```powershell
  git add script.js tests/assistant-contract.test.mjs tests/vercel-api-routes.test.mjs
  git commit -m "feat: connect Katris UI to normalized provider APIs"
  ```

### Task 6: Verify the full flow, publish, and validate production

**Files:**
- Modify only if verification exposes a scoped defect: `index.html`, `style.css`, `script.js`, or the directly related test file.

- [ ] **Step 1: Run all static and contract verification**

  ```powershell
  git diff --check
  node tests\assistant-contract.test.mjs
  node tests\vercel-api-routes.test.mjs
  ```

  Expected: exit code `0`, `assistant contract ok`, and `vercel api routes ok`.

- [ ] **Step 2: Browser-test all three view URLs and the requested trip fixture**

  Open `index.html` through a local static server or Vercel preview. Verify:

  ```text
  /                         -> Home hero and destination cards visible
  /?view=plan               -> planner visible; Home surfaces hidden
  /?view=trip               -> result/assistant workspace visible after a generated result
  Chicago -> Manchester      -> 2026-08-01, 2 weeks, 1 traveler, 800 EUR
  ```

  Confirm the form calls `/api/flights/search`, `/api/hotels/search`, `/api/places/search`, and `/api/ai/plan`, provider status is readable, the Forest Retreat image is a real photo, and the console has no errors.

- [ ] **Step 3: Commit the final verified diff and push the feature branch**

  ```powershell
  git add index.html style.css script.js tests/assistant-contract.test.mjs tests/vercel-api-routes.test.mjs
  git commit -m "feat: ship Katris workspace and live data flow"
  git push origin html-template-redesign
  ```

- [ ] **Step 4: Deploy production and smoke-test the alias**

  ```powershell
  $env:NODE_USE_ENV_PROXY='1'
  npx --yes vercel deploy --prod --yes
  ```

  Confirm the deployment reports `READY`, the alias is `https://katris-travel-pearl.vercel.app`, an HTTP request returns `200`, Home loads without a Vercel login wall, and the browser inspection shows the live provider-status UI.
