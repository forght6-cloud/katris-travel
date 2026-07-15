import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("keeps the existing primary interaction contract", async () => {
  const html = await read("index.html");
  const requiredLabels = [
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
    "Clear"
  ];

  requiredLabels.forEach((label) => {
    assert.ok(html.includes(`>${label}<`), `Missing button label: ${label}`);
  });
});

test("keeps planner and assistant hooks used by script.js", async () => {
  const html = await read("index.html");
  const requiredIds = [
    "planner-form",
    "analyze-planner",
    "reset-planner",
    "assistant-form",
    "assistant-input",
    "clear-assistant",
    "analysis-results",
    "destination-template"
  ];

  requiredIds.forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
});

test("loads the visual pass after the base stylesheet and respects reduced motion", async () => {
  const [html, css, motion] = await Promise.all([
    read("index.html"),
    read("taste-pass.css"),
    read("hero-gsap.js")
  ]);

  assert.ok(html.indexOf("style.css") < html.indexOf("taste-pass.css"));
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);
});
