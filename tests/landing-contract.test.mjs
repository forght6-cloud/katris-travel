import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("root page is the Ke cinematic shell that enters the Katris app", async () => {
  const [html, css, js] = await Promise.all([read("index.html"), read("landing.css"), read("landing.js")]);

  assert.match(html, /<title>Ke \| Katris Travel AI<\/title>/);
  assert.match(html, /class="wordmark"[\s\S]*>Ke</);
  assert.match(css, /font-family:\s*"Times New Roman"/);
  assert.match(html, /href="app\.html(?:#[a-z-]+)?"/);
  assert.match(html, /landing\.css/);
  assert.match(html, /landing\.js/);

  assert.equal((html.match(/class="scene-video/g) || []).length, 4);
  assert.equal((html.match(/class="motion-card/g) || []).length, 0);
  assert.equal((html.match(/data-scene="/g) || []).length, 4);
  assert.match(html, /Golden Hour/);
  assert.match(html, /Contact/);
  assert.doesNotMatch(html, /https:\/\/www\.pexels\.com\/download\/video/);

  assert.match(css, /\.scene-video\.is-active/);
  assert.match(css, /\.train-overlay/);
  assert.match(css, /\.scene-switcher/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

  assert.match(js, /querySelectorAll\("\[data-scene\]"\)/);
  assert.match(js, /setInterval/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /video\.play\(\)\.catch/);
  assert.match(js, /video\.pause\(\)/);
  assert.doesNotMatch(html, /\bautoplay\b/);
});
