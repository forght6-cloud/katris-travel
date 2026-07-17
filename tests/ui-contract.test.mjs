import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const includesAll = (source, values, label) => values.forEach((value) => assert.ok(source.includes(value), `Missing ${label}: ${value}`));

test("keeps existing visible interaction labels", async () => {
  const html = await read("app.html");
  includesAll(html, ["Start planning", "Build my trip", "View ready templates", "Recommended path", "Save current trip", "Supplier checkout", "Operations status", "Analyze itinerary", "Reset", "Send prompt", "Clear"], "button label");
});

test("keeps required IDs and planner fields", async () => {
  const html = await read("app.html");
  ["overview", "destinations", "planner", "assistant", "planner-form", "analyze-planner", "reset-planner", "assistant-form", "assistant-input", "clear-assistant", "analysis-results", "destination-template", "preference-gate", "assistant-thread", "assistant-progress", "ops-monitor", "liquid-plan-menu", "liquid-menu-detail"].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
  ["from", "to", "date", "tripLength", "people", "budget", "notes", "pillars"].forEach((name) => assert.match(html, new RegExp(`name=["']${name}["']`)));
});

test("keeps navigation, action, API, storage, and static-product contracts", async () => {
  const [html, script, feature] = await Promise.all([read("app.html"), read("script.js"), read("features.js")]);
  includesAll(html, ['href="#destinations"', 'href="#planner"', 'href="#assistant"', 'data-scroll-target="#planner"', 'data-scroll-target="#destinations"', "data-liquid-menu-toggle", 'data-liquid-action="recommended"', 'data-liquid-action="saved"', 'data-liquid-action="suppliers"', 'data-liquid-action="monitor"', 'data-region="fjord"', 'data-region="forest"', 'data-region="coast"', 'data-region="aurora"', "style.css", "script.js", "features.js", "hero-gsap.js"], "product contract");
  includesAll(script, ["/api/generate-plan", "/api/amadeus", "/api/google-places", "/api/booking", "katris-travel:last-trip-v1", "DOMContentLoaded"], "script contract");
  includesAll(feature, ["katris-travel:feature-state-v2", "localStorage"], "social storage contract");
});

test("uses a single CSS system and a single delegated hero controller", async () => {
  const [html, script, hero] = await Promise.all([read("app.html"), read("script.js"), read("hero-gsap.js")]);
  assert.equal((html.match(/rel="stylesheet"/g) || []).length, 2, "Expected one font stylesheet and one product stylesheet");
  assert.doesNotMatch(html, /taste-pass\.css|features\.css/);
  includesAll(script, ["window.initSocialJourneyHero"], "hero delegation");
  includesAll(hero, ["window.initSocialJourneyHero"], "hero owner");
  assert.doesNotMatch(hero, /DOMContentLoaded/);
});
