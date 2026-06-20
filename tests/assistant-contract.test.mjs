import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const aiPlan = readFileSync(new URL("../api/ai/plan.ts", import.meta.url), "utf8");
const hotelApi = readFileSync(new URL("../api/hotels/search.ts", import.meta.url), "utf8");

assert.match(
  script,
  /async function handleAssistantPrompt[\s\S]*?analyzeTripPlan\(/,
  "Assistant submissions should run through analyzeTripPlan() before AI formatting.",
);

assert.match(
  script,
  /addAssistantResultMessage\(/,
  "Assistant should render structured result cards instead of only plain chat text.",
);

assert.match(
  script,
  /data-download-assistant-pdf/,
  "Assistant result cards should include a PDF download control.",
);

assert.match(
  script,
  /function buildAssistantDownloadText/,
  "Assistant should build a printable travel-plan document from the structured result.",
);

assert.match(
  aiPlan,
  /messages:\s*\[\s*\{[\s\S]*?role:\s*"system"[\s\S]*?\},\s*\{[\s\S]*?role:\s*"user"/,
  "AI provider calls should send separate system and user messages.",
);

assert.match(
  aiPlan,
  /at least 8 hotels and 8 attractions/,
  "Strong assistant template should require richer hotel and place coverage.",
);

assert.match(
  script,
  /\/api\/hotels\/search[\s\S]*?limit:\s*8/,
  "Assistant data flow should request 8 hotel options per city.",
);

assert.match(
  hotelApi,
  /manchester:\s*\{\s*lat:\s*53\.4808,\s*lon:\s*-2\.2426\s*\}/,
  "Manchester hotel searches should resolve to Manchester, UK rather than Manchester, New Hampshire.",
);

assert.match(
  script,
  /\/api\/places\/search[\s\S]*?limit:\s*8/,
  "Assistant data flow should request 8 place options per city.",
);

const context = {
  document: { addEventListener() {} },
  console,
  URL,
  Date,
  Intl,
  RegExp,
  Number,
  String,
  Array,
  Set,
};
vm.createContext(context);
vm.runInContext(script, context);

const inferred = context.inferPlannerFieldsFromMessage(
  "london to frankfurt 2weeks 1 person no thing requires 800 burks",
);

assert.deepEqual(
  {
    from: inferred.from,
    to: inferred.to,
    tripLength: inferred.tripLength,
    people: inferred.people,
    budget: inferred.budget,
  },
  {
    from: "London",
    to: "Frankfurt",
    tripLength: "2 weeks",
    people: 1,
    budget: "800 burks",
  },
  "Assistant prompt parsing should preserve the user's route, trip length, traveler count, and typo-tolerant budget.",
);

const assistantItineraryText = vm.runInContext(
  `(() => {
    appState.planner.from = "London";
    appState.planner.to = "Frankfurt";
    appState.planner.date = "";
    return buildAssistantItineraryText("london to frankfurt 2weeks 1 person no thing requires 800 burks");
  })()`,
  context,
);
const parsedStops = JSON.parse(JSON.stringify(context.parseItinerary(assistantItineraryText).stops.map((stop) => stop.city)));

assert.deepEqual(
  parsedStops,
  ["Frankfurt"],
  "Assistant itinerary text should treat the origin as flight origin, not as an itinerary stop.",
);

assert.equal(context.getTripDayCount("2 weeks"), 14, "Two-week assistant plans should expand to 14 days.");
const twoWeekDays = context.buildDailyPlan(
  { city: "Frankfurt", date: "2026-05-30" },
  0,
  ["Scenery", "Quiet stays"],
  14,
  1,
);
assert.equal(twoWeekDays.length, 14, "Fallback planner should create one daily plan per trip day.");
assert.ok(
  twoWeekDays.every((day) => day.items.length >= 3 && day.items.length <= 5),
  "Every fallback day should include 3 to 5 executable items.",
);

const newYorkPlaces = context.generateAttractions("New York", "test fallback");
assert.ok(
  newYorkPlaces.some((place) => place.name === "The Metropolitan Museum of Art" && place.address === "1000 5th Ave, New York, NY 10028"),
  "New York fallback places should use verified real addresses instead of invented generic place names.",
);
assert.ok(
  !newYorkPlaces.some((place) => /Old Quarter|nearby restaurant|neighbourhood lunch/i.test(`${place.name} ${place.summary}`)),
  "Fallback places should not invent generic old-quarter or nearby-restaurant stops.",
);

const newYorkDays = context.buildDailyPlan(
  { city: "New York", date: "2026-06-14" },
  0,
  ["Culture"],
  1,
  1,
);
assert.match(
  newYorkDays[0].items.map((item) => `${item.title} ${item.detail}`).join("\n"),
  /205 E Houston St, New York, NY 10002|476 5th Ave, New York, NY 10018/,
  "New York daily plans should include concrete verified addresses.",
);

const chicagoManchester = context.inferPlannerFieldsFromMessage(
  "chicago to Manchester 800 Eur 2weeks 1person",
);

assert.deepEqual(
  {
    from: chicagoManchester.from,
    to: chicagoManchester.to,
    tripLength: chicagoManchester.tripLength,
    people: chicagoManchester.people,
    budget: chicagoManchester.budget,
  },
  {
    from: "Chicago",
    to: "Manchester",
    tripLength: "2 weeks",
    people: 1,
    budget: "800 Eur",
  },
  "Assistant prompt parsing should not treat currency labels as destination cities.",
);

assert.equal(
  context.getDateAfterDays("2026-06-20", 14),
  "2026-07-04",
  "Two-week hotel searches should use the complete stay for checkout.",
);
const oneTravelerHotelUrl = new URL(
  context.buildBookingSearchUrl("Manchester Hotel", "Manchester", "2026-06-20", "2026-07-04", 1),
);
assert.equal(oneTravelerHotelUrl.searchParams.get("checkout"), "2026-07-04");
assert.equal(oneTravelerHotelUrl.searchParams.get("group_adults"), "1");

console.log("assistant contract ok");
