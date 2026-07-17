import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("loads the site-wide image motion controller", async () => {
  const html = await read("app.html");
  assert.match(html, /<script src="image-motion\.js" defer><\/script>/);
});

test("connects every image surface, including dynamic content", async () => {
  const motion = await read("image-motion.js");
  [
    ".hero-story img",
    ".hero-story .motion-media",
    ".discovery-media img",
    ".destination-visual img",
    ".destination-visual video",
    ".template-media",
    ".saved-card img",
    ".video-frame video",
  ].forEach((selector) => assert.ok(motion.includes(selector), `Missing animated surface: ${selector}`));
  assert.match(motion, /MutationObserver/);
  assert.match(motion, /prepareMotion\(node\)/);
});

test("lets viewport state own ambient video playback", async () => {
  const [html, motion] = await Promise.all([read("app.html"), read("image-motion.js")]);
  assert.doesNotMatch(html, /\bautoplay\b/);
  assert.match(motion, /node\.matches\("\.motion-media, \.destination-visual video"\)/);
  assert.match(motion, /node\.play\(\)\.catch/);
  assert.match(motion, /node\.pause\(\)/);
});

test("runs image motion only near the viewport", async () => {
  const motion = await read("image-motion.js");
  assert.match(motion, /IntersectionObserver/);
  assert.match(motion, /entry\.isIntersecting/);
  assert.match(motion, /visibilitychange/);
  assert.match(motion, /is-image-motion-active/);
});

test("uses one reusable cinematic keyframe system with a reduced-motion stop", async () => {
  const [motion, css] = await Promise.all([read("image-motion.js"), read("style.css")]);
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(css, /@keyframes katris-image-drift/);
  assert.match(css, /@keyframes katris-background-drift/);
  assert.match(css, /animation-play-state: paused/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important/);
});
