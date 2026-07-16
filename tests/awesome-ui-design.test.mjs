import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const includesAll = (source, values, label) => values.forEach((value) => {
  assert.ok(source.includes(value), `Missing ${label}: ${value}`);
});

test("uses one finite Pure D hero controller", async () => {
  const [html, script, hero] = await Promise.all([read("index.html"), read("script.js"), read("hero-gsap.js")]);
  includesAll(hero, ["initSocialJourneyHero", "prefers-reduced-motion: reduce", "data-hero-reveal"], "hero motion contract");
  includesAll(script, ["window.initSocialJourneyHero", "initHeroGsapAnimation"], "single hero handoff");
  includesAll(html, ["hero-story--primary", "hero-story--side", "Seasonal signal", "Saved route"], "social hero surface");
  assert.doesNotMatch(hero, /DOMContentLoaded/);
  assert.doesNotMatch(hero, /loadFeatureLayer|HERO_WATERFALL_SCENES/);
});

test("uses one bright sans-serif visual system without override stylesheets", async () => {
  const [html, css] = await Promise.all([read("index.html"), read("style.css")]);
  includesAll(css, ["--blue: #0b74e5", "--coral: #ff6b55", "--font-sans", ".discovery-grid", ".video-stream", ".mobile-nav"], "Pure D visual token");
  assert.match(html, /family=Manrope/);
  assert.doesNotMatch(html, /taste-pass\.css|features\.css|Instrument\+Serif/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("finite discovery stays image-led and connected to planning", async () => {
  const [html, feature] = await Promise.all([read("index.html"), read("features.js")]);
  includesAll(html, ['id="discover"', 'id="discovery-grid"', "All routes", "Nature", "City", "Winter"], "finite discovery shell");
  includesAll(feature, ["discovery-media", "Use in planner", "Ask assistant", "Follow", "data-share-route", "ROUTES = ["], "discovery behavior");
  assert.match(feature, /images\.unsplash\.com/);
  assert.doesNotMatch(feature, /infinite scroll/i);
});

test("licensed short videos are user-controlled and pause outside view", async () => {
  const [html, feature] = await Promise.all([read("index.html"), read("features.js")]);
  includesAll(html, ['id="guides"', 'id="guidance-grid"', "Licensed Pexels clips", "Only one video"], "video shell");
  includesAll(feature, ["www.pexels.com/download/video/", "muted playsinline", 'preload="none"', "pauseOtherVideos", "IntersectionObserver", "video.pause()", "data-video-ask", "data-save-video"], "video behavior");
  assert.doesNotMatch(feature, /autoplay/);
});

test("mobile shell and accessibility rules are explicit", async () => {
  const [html, css] = await Promise.all([read("index.html"), read("style.css")]);
  includesAll(html, ['class="mobile-nav"', 'href="#discover"', 'href="#saved"', 'href="#planner"', 'href="#assistant"', 'class="skip-link"'], "mobile navigation");
  includesAll(css, ["min-height: 44px", "font-size: 16px", "env(safe-area-inset-bottom)", ":focus-visible", "overflow-x: hidden"], "accessibility rule");
});
