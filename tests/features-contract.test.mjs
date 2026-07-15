import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function includesAll(source, values, label) {
  values.forEach((value) => assert.ok(source.includes(value), `Missing ${label}: ${value}`));
}

test("loads the feature layer without replacing legacy assets", async () => {
  const [hero, html] = await Promise.all([read("hero-gsap.js"), read("index.html")]);
  includesAll(hero, ["features.css", "features.js", "DOMContentLoaded"], "feature loader");
  includesAll(html, ["style.css", "taste-pass.css", "script.js", "hero-gsap.js"], "legacy asset");
});

test("implements the planned D-led functional modules", async () => {
  const feature = await read("features.js");
  includesAll(
    feature,
    [
      'id="discover"',
      'id="guides"',
      'id="community"',
      'id="route-board"',
      "Use in planner",
      "Ask assistant",
      "Save local note",
      "Copy route board",
      "katris-travel:feature-state-v2",
    ],
    "planned feature",
  );
});

test("feature modules feed existing planner and assistant hooks", async () => {
  const feature = await read("features.js");
  includesAll(feature, ["#to", "#tripLength", "#budget", "#notes", 'input[name="pillars"]', "#assistant-input", "#planner", "#assistant"], "integration hook");
});

test("community preview is explicitly browser-local", async () => {
  const feature = await read("features.js");
  assert.match(feature, /Saved in this browser/);
  assert.match(feature, /It was not published online/);
  assert.doesNotMatch(feature, /fetch\s*\([^)]*community/i);
});

test("feature styling retains reduced-motion support", async () => {
  const css = await read("features.css");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes guideProgress/);
});