import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const generatePlanApi = readFileSync(new URL("../api/generate-plan.js", import.meta.url), "utf8");
const amadeusApi = readFileSync(new URL("../api/amadeus.js", import.meta.url), "utf8");
const googlePlacesApi = readFileSync(new URL("../api/google-places.js", import.meta.url), "utf8");
const bookingApi = readFileSync(new URL("../api/booking.js", import.meta.url), "utf8");
const tripcomApi = readFileSync(new URL("../api/tripcom.js", import.meta.url), "utf8");

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
  generatePlanApi,
  /role:\s*"system"[\s\S]*role:\s*"user"/,
  "Generate-plan should send separate system and user messages to OpenAI.",
);

assert.match(
  generatePlanApi,
  /at least 8 hotels and 8 attractions/,
  "Strong assistant template should require richer hotel and place coverage.",
);

assert.match(
  script,
  /fetch\("\/api\/booking"[\s\S]*?limit:\s*8/,
  "Assistant data flow should request 8 hotel options per city from the relative booking endpoint.",
);

assert.match(
  bookingApi,
  /placeholder/i,
  "Booking route should currently be a placeholder route.",
);

assert.match(
  tripcomApi,
  /placeholder/i,
  "Trip.com route should currently be a placeholder route.",
);

assert.match(
  script,
  /fetch\("\/api\/google-places"[\s\S]*?limit:\s*8/,
  "Assistant data flow should request 8 place options per city from the local backend.",
);

assert.match(
  script,
  /fetch\("\/api\/amadeus"/,
  "Flight searches should go through the relative Amadeus endpoint.",
);

assert.match(
  script,
  /fetch\("\/api\/generate-plan"/,
  "AI plan generation should go through the relative generate-plan endpoint.",
);

assert.match(
  script,
  /addEventListener\("dblclick"[\s\S]*?navigateToSection\("#planner"/,
  "The landing page should support a double-click path into the planner section.",
);

assert.match(
  googlePlacesApi,
  /placeholder/i,
  "Google places route should currently be a placeholder route.",
);

assert.match(
  amadeusApi,
  /oauth2\/token/,
  "Amadeus route should request an OAuth token before searching flights.",
);

assert.match(
  amadeusApi,
  /flight-offers/,
  "Amadeus route should call Flight Offers Search.",
);

assert.match(
  generatePlanApi,
  /api\.openai\.com/,
  "Generate-plan route should call OpenAI from the server.",
);

assert.ok(
  existsSync(new URL("../api/generate-plan.js", import.meta.url)),
  "generate-plan.js should exist in the api root.",
);
assert.ok(existsSync(new URL("../api/amadeus.js", import.meta.url)), "amadeus.js should exist in the api root.");
assert.ok(
  existsSync(new URL("../api/google-places.js", import.meta.url)),
  "google-places.js should exist in the api root.",
);
assert.ok(existsSync(new URL("../api/booking.js", import.meta.url)), "booking.js should exist in the api root.");
assert.ok(existsSync(new URL("../api/tripcom.js", import.meta.url)), "tripcom.js should exist in the api root.");

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
