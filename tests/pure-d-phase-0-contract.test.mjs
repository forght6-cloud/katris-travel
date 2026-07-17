import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function includesAll(source, values, label) {
  values.forEach((value) => assert.ok(source.includes(value), `Missing ${label}: ${value}`));
}

function hasId(source, id) {
  assert.match(source, new RegExp(`id=["']${id}["']`), `Missing ID: ${id}`);
}

test("protects every current static ID and mandatory visible control", async () => {
  const html = await read("app.html");

  [
    "top",
    "overview",
    "destinations",
    "destination-template",
    "template-kicker",
    "template-title",
    "template-summary",
    "template-best",
    "template-base",
    "template-action",
    "template-days",
    "planner",
    "liquid-glass-filter",
    "liquid-plan-menu",
    "liquid-menu-detail",
    "planner-form",
    "from",
    "budget",
    "to",
    "date",
    "tripLength",
    "people",
    "notes",
    "analyze-planner",
    "reset-planner",
    "preference-gate",
    "preview-title",
    "preview-summary",
    "preview-pillars",
    "timeline-output",
    "analysis-results",
    "ops-monitor",
    "assistant",
    "assistant-thread",
    "assistant-progress",
    "assistant-progress-step",
    "assistant-progress-bar",
    "assistant-form",
    "assistant-input",
    "clear-assistant",
    "assistant-flight-summary",
  ].forEach((id) => hasId(html, id));

  includesAll(
    html,
    [
      "Start planning",
      "Build my trip",
      "View ready templates",
      "Travel Plan",
      "Recommended path",
      "Save current trip",
      "Supplier checkout",
      "Operations status",
      "Analyze itinerary",
      "Reset",
      "Send prompt",
      "Clear",
    ],
    "static control label",
  );
});

test("protects planner, assistant, and local-community form contracts", async () => {
  const html = await read("app.html");

  ["from", "budget", "to", "date", "tripLength", "people", "notes", "pillars"].forEach((name) => {
    assert.match(html, new RegExp(`name=["']${name}["']`), `Missing planner field: ${name}`);
  });
  includesAll(
    html,
    [
      'id="planner-form"',
      'id="analyze-planner" type="submit"',
      'id="reset-planner"',
      'id="assistant-form"',
      'id="assistant-input"',
      'id="clear-assistant"',
    ],
    "form contract",
  );
  includesAll(
    html,
    ['id="community-form"', 'name="name"', 'name="route"', 'name="note"', "maxlength=\"30\"", "maxlength=\"220\"", "required"],
    "local-community form contract",
  );
});

test("protects current D-layer modules, actions, and navigation targets", async () => {
  const [html, feature] = await Promise.all([read("app.html"), read("features.js")]);

  [
    "discover",
    "discovery-count",
    "discovery-grid",
    "guides",
    "guidance-grid",
    "community",
    "community-list",
    "community-form",
    "community-status",
    "route-board",
    "route-board-grid",
    "route-board-status",
  ].forEach((id) => hasId(html, id));

  includesAll(
    `${html}\n${feature}`,
    [
      'href="#discover"',
      'href="#guides"',
      'href="#community"',
      'id="route-board"',
      "All routes",
      "Nature",
      "City",
      "Winter",
      "Save local note",
      "Open planner",
      "Copy route board",
      "Clear route board",
      "Use in planner",
      "Ask assistant",
      "Play",
      "Pause",
      "Use in my trip",
      "Ask assistant about this",
      "Use this route",
    ],
    "D-layer control",
  );
});

test("protects static and dynamically rendered data hooks", async () => {
  const [html, script, feature] = await Promise.all([read("app.html"), read("script.js"), read("features.js")]);

  includesAll(
    html,
    [
      "data-scroll-target",
      "data-region",
      "data-liquid-menu-toggle",
      "data-liquid-action",
    ],
    "static data hook",
  );
  includesAll(
    script,
    [
      "data-preference-key",
      "data-preference-value",
      "data-preference-submit",
      "data-preference-reset",
      "data-select-flight-segment",
      "data-select-flight-offer",
      "data-booking-action",
      "data-booking-item-id",
      "data-booking-confirmation-input",
      "data-travel-assistant-action",
      "data-travel-assistant-message-id",
      "data-generate-final-pdf",
      "data-download-assistant-pdf",
      "data-result-index",
    ],
    "planner and assistant data hook",
  );
  includesAll(
    feature,
    [
      "data-filter",
      "data-save",
      "data-use",
      "data-ask",
      "data-guide-card",
      "data-play",
      "data-tip",
      "data-helpful",
      "data-open-planner",
      "data-copy-board",
      "data-clear-board",
    ],
    "D-layer data hook",
  );
});

test("protects API paths, serverless entry files, and local-storage keys", async () => {
  const [script, feature] = await Promise.all([read("script.js"), read("features.js")]);

  includesAll(script, ["/api/generate-plan", "/api/amadeus", "/api/google-places", "/api/booking"], "frontend API path");
  includesAll(script, ["katris-travel:last-trip-v1", "localStorage.setItem", "localStorage.getItem", "localStorage.removeItem"], "trip storage contract");
  includesAll(feature, ["katris-travel:feature-state-v2", "localStorage.setItem", "localStorage.getItem"], "feature storage contract");

  await Promise.all(
    [
      "api/generate-plan.js",
      "api/amadeus.js",
      "api/google-places.js",
      "api/booking.js",
      "api/tripcom.js",
      "api/ai/plan.ts",
      "api/flights/search.ts",
      "api/hotels/search.ts",
      "api/places/search.ts",
    ].map((path) => access(new URL(`../${path}`, import.meta.url))),
  );
});

test("protects existing navigation, planner, assistant, booking, and export behavior ownership", async () => {
  const [html, script, hero, feature] = await Promise.all([
    read("app.html"),
    read("script.js"),
    read("hero-gsap.js"),
    read("features.js"),
  ]);

  includesAll(html, ['href="#destinations"', 'href="#planner"', 'href="#assistant"', "style.css", "script.js", "features.js", "hero-gsap.js"], "static product shell");
  includesAll(
    script,
    [
      "bindScrollButtons",
      "bindOverviewDoubleClick",
      "bindAnchorNavigation",
      "bindDestinationCards",
      "bindPlannerForm",
      "bindPreferenceGate",
      "saveTripStateToStorage",
      "restoreTripStateFromStorage",
      "renderAnalysisResults",
      "bindAssistant",
      "handleAssistantPrompt",
      "buildExternalFlightSearchUrl",
      "buildBookingSearchUrl",
      "renderOperationsMonitor",
      "downloadAssistantResultPdf",
      "generateFinalTravelPdf",
    ],
    "behavior owner",
  );
  includesAll(hero, ["initSocialJourneyHero", "window.initSocialJourneyHero", "prefers-reduced-motion: reduce"], "single hero controller");
  includesAll(feature, ["useRoute", "syncBoard", "navigator.clipboard.writeText", "Saved in this browser. It was not published online."], "D-layer behavior");
});

test("keeps placeholder, fallback, and external data visibly distinguishable", async () => {
  const [script, booking, places, generatePlan] = await Promise.all([
    read("script.js"),
    read("api/booking.js"),
    read("api/google-places.js"),
    read("api/generate-plan.js"),
  ]);

  includesAll(script, ["external", "fallback", "placeholder", "formatDataStatus", "formatProviderName"], "provider state handling");
  assert.match(booking, /placeholder/i);
  assert.match(places, /placeholder/i);
  assert.match(generatePlan, /fallback/i);
});
