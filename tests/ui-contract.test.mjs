import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function assertIncludesAll(source, values, label) {
  values.forEach((value) => {
    assert.ok(source.includes(value), `Missing ${label}: ${value}`);
  });
}

test("keeps the existing visible interaction labels", async () => {
  const html = await read("index.html");
  assertIncludesAll(
    html,
    [
      "Start planning",
      "Build my trip",
      "View ready templates",
      "Recommended path",
      "Save current trip",
      "Supplier checkout",
      "Operations status",
      "Analyze itinerary",
      "Reset",
      "Send prompt",
      "Clear",
    ],
    "button label",
  );
});

test("keeps required section and application hooks", async () => {
  const html = await read("index.html");
  const ids = [
    "overview",
    "destinations",
    "planner",
    "assistant",
    "planner-form",
    "analyze-planner",
    "reset-planner",
    "assistant-form",
    "assistant-input",
    "clear-assistant",
    "analysis-results",
    "destination-template",
    "preference-gate",
    "assistant-thread",
    "assistant-progress",
    "ops-monitor",
    "liquid-plan-menu",
    "liquid-menu-detail",
  ];

  ids.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required id: ${id}`);
  });
});

test("keeps navigation and action data hooks", async () => {
  const html = await read("index.html");
  assertIncludesAll(
    html,
    [
      'href="#destinations"',
      'href="#planner"',
      'href="#assistant"',
      'data-scroll-target="#planner"',
      'data-scroll-target="#destinations"',
      "data-liquid-menu-toggle",
      'data-liquid-action="recommended"',
      'data-liquid-action="saved"',
      'data-liquid-action="suppliers"',
      'data-liquid-action="monitor"',
      'data-region="fjord"',
      'data-region="forest"',
      'data-region="coast"',
      'data-region="aurora"',
    ],
    "navigation or data hook",
  );
});

test("keeps planner field names used by the current logic", async () => {
  const html = await read("index.html");
  ["from", "to", "date", "tripLength", "people", "budget", "notes", "pillars"].forEach((name) => {
    assert.match(html, new RegExp(`name=["']${name}["']`), `Missing planner field: ${name}`);
  });
});

test("keeps current script and serverless API contracts visible", async () => {
  const [html, script] = await Promise.all([read("index.html"), read("script.js")]);
  assertIncludesAll(html, ["script.js", "hero-gsap.js", "style.css", "taste-pass.css"], "asset reference");
  assertIncludesAll(
    script,
    [
      "/api/generate-plan",
      "/api/amadeus",
      "/api/google-places",
      "/api/booking",
      "katris-travel:last-trip-v1",
      "DOMContentLoaded",
    ],
    "script contract",
  );
});

test("records current reduced-motion and duplicate hero ownership baseline", async () => {
  const [html, css, heroMotion, script] = await Promise.all([
    read("index.html"),
    read("taste-pass.css"),
    read("hero-gsap.js"),
    read("script.js"),
  ]);

  assert.ok(html.indexOf("style.css") < html.indexOf("taste-pass.css"));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(heroMotion, /DOMContentLoaded/);
  assert.match(script, /DOMContentLoaded/);
});
