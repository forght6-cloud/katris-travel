import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const aiPlan = readFileSync(new URL("../api/ai/plan.ts", import.meta.url), "utf8");

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
  aiPlan,
  /messages:\s*\[\s*\{[\s\S]*?role:\s*"system"[\s\S]*?\},\s*\{[\s\S]*?role:\s*"user"/,
  "AI provider calls should send separate system and user messages.",
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

console.log("assistant contract ok");
