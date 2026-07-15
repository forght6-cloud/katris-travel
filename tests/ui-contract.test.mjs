import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const includesAll = (source, values, label) => values.forEach((value) => assert.ok(source.includes(value), `Missing ${label}: ${value}`));

test("keeps existing visible interaction labels", async () => {
  const html = await read("index.html");
  includesAll(html, ["Start planning","Build my trip","View ready templates","Recommended path","Save current trip","Supplier checkout","Operations status","Analyze itinerary","Reset","Send prompt","Clear"], "button label");
});

test("keeps required IDs and planner fields", async () => {
  const html = await read("index.html");
  ["overview","destinations","planner","assistant","planner-form","analyze-planner","reset-planner","assistant-form","assistant-input","clear-assistant","analysis-results","destination-template","preference-gate","assistant-thread","assistant-progress","ops-monitor","liquid-plan-menu","liquid-menu-detail"].forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
  ["from","to","date","tripLength","people","budget","notes","pillars"].forEach((name) => assert.match(html, new RegExp(`name=["']${name}["']`)));
});

test("keeps navigation, action, API and storage contracts", async () => {
  const [html, script] = await Promise.all([read("index.html"), read("script.js")]);
  includesAll(html, ['href="#destinations"','href="#planner"','href="#assistant"','data-scroll-target="#planner"','data-scroll-target="#destinations"',"data-liquid-menu-toggle",'data-liquid-action="recommended"','data-liquid-action="saved"','data-liquid-action="suppliers"','data-liquid-action="monitor"','data-region="fjord"','data-region="forest"','data-region="coast"','data-region="aurora"',"style.css","taste-pass.css","script.js","hero-gsap.js"], "legacy contract");
  includesAll(script, ["/api/generate-plan","/api/amadeus","/api/google-places","/api/booking","katris-travel:last-trip-v1","DOMContentLoaded"], "script contract");
});

test("keeps the restored legacy visual files and adds feature loading separately", async () => {
  const [html, hero] = await Promise.all([read("index.html"), read("hero-gsap.js")]);
  assert.ok(html.indexOf("style.css") < html.indexOf("taste-pass.css"));
  includesAll(hero, ["features.css","features.js"], "separate feature asset");
});