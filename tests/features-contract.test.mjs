import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function includesAll(source, values, label) {
  values.forEach((value) => assert.ok(source.includes(value), `Missing ${label}: ${value}`));
}

test("loads the Pure D feature layer directly inside the static product", async () => {
  const [html, hero] = await Promise.all([read("index.html"), read("hero-gsap.js")]);
  includesAll(html, ["style.css", "script.js", "features.js", "hero-gsap.js"], "static asset");
  assert.doesNotMatch(html, /taste-pass\.css|features\.css/);
  assert.doesNotMatch(hero, /createElement\(["'](?:link|script)["']\)|append\(feature/);
});

test("implements the required Pure D information architecture", async () => {
  const html = await read("index.html");
  const orderedIds = ["overview", "discover", "guides", "destinations", "community", "saved", "planner", "assistant", "booking-status"];
  orderedIds.reduce((lastIndex, id) => {
    const index = html.indexOf(`id="${id}"`);
    assert.ok(index > lastIndex, `${id} must appear after the previous Pure D section`);
    return index;
  }, -1);
  includesAll(html, ["site-header", "site-footer", "mobile-nav"], "product shell");
});

test("feature modules feed existing planner and assistant hooks", async () => {
  const feature = await read("features.js");
  includesAll(feature, ["#to", "#tripLength", "#budget", "#notes", 'input[name="pillars"]', "#assistant-input", "#planner", "#assistant", "setContext"], "integration hook");
});

test("saved and community content remain explicitly browser-local", async () => {
  const [html, feature] = await Promise.all([read("index.html"), read("features.js")]);
  includesAll(html, ["Local-only storage", "not cloud-synced", 'id="saved-grid"', 'id="saved-video-grid"', 'id="followed-topic-list"'], "local save disclosure");
  includesAll(feature, ["katris-travel:feature-state-v2", "Saved in this browser. It was not published online.", "state.savedVideos", "state.followedTopics"], "local state");
  assert.doesNotMatch(feature, /fetch\s*\([^)]*community/i);
});

test("all social content has a useful plan, assistant, save, share, or follow action", async () => {
  const feature = await read("features.js");
  includesAll(feature, ["data-use", "data-ask", "data-save", "data-share-route", "data-follow-topic", "data-tip", "data-video-ask", "data-share-post"], "social action");
});
