import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const includesAll = (source, values, label) => values.forEach((value) => {
  assert.ok(source.includes(value), `Missing ${label}: ${value}`);
});

test("hero uses one coherent scene across interactive waterfall slices", async () => {
  const hero = await read("hero-gsap.js");
  includesAll(
    hero,
    [
      "HERO_WATERFALL_SCENES",
      "masonry-scene",
      "syncSceneGeometry",
      "pointermove",
      "pointerleave",
      "showNextScene",
      'setAttribute("role", "button")',
      'setAttribute("tabindex", "0")',
      "prefers-reduced-motion: reduce",
    ],
    "interactive waterfall contract",
  );
  assert.match(hero, /sceneLayer\.style\.width/);
  assert.match(hero, /sceneLayer\.style\.left/);
});

test("D-led visual hierarchy keeps imagery dominant and copy subordinate", async () => {
  const css = await read("features.css");
  includesAll(
    css,
    [
      '.hero-masonry[data-waterfall="interactive"]',
      ".masonry-scene",
      ".destination-card",
      ".destination-visual",
      ".destination-copy",
      ".discovery-media",
      ".feature-heading h2",
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
    ],
    "D-led visual rule",
  );
  assert.match(css, /min-height:\s*clamp\(360px/);
  assert.match(css, /background-size:\s*cover/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("finite discovery cards use real image surfaces without losing planner actions", async () => {
  const features = await read("features.js");
  includesAll(
    features,
    [
      "discovery-media",
      "--route-image",
      "Use in planner",
      "Ask assistant",
      "Save local note",
      "Copy route board",
      "Saved in this browser. It was not published online.",
    ],
    "image-led functional card",
  );
  assert.match(features, /images\.unsplash\.com/);
  assert.doesNotMatch(features, /infinite scroll/i);
});

test("existing product controls remain the source of actions", async () => {
  const html = await read("index.html");
  includesAll(
    html,
    [
      "Start planning",
      "Build my trip",
      "View ready templates",
      "Analyze itinerary",
      "Send prompt",
      'id="planner-form"',
      'id="assistant-form"',
    ],
    "legacy control",
  );
});
