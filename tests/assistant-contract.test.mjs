import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const heroAnimation = readFileSync(new URL("../hero-gsap.js", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../app.html", import.meta.url), "utf8");
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
  /const TRIP_PREFERENCE_QUESTIONS = \[/,
  "Planner should define explicit confirmation questions before generation.",
);

assert.doesNotMatch(
  script,
  /openPreferenceGate\("assistant", value\)/,
  "Assistant requests should not be blocked behind a manual preference gate.",
);

assert.doesNotMatch(
  script,
  /openPreferenceGate\("planner"\)[\s\S]{0,120}return;/,
  "Planner analysis should not stop and wait for manual preference choices before generating.",
);

assert.match(
  script,
  /ensureDefaultPreferenceAnswers\(\)/,
  "Planner and assistant should apply balanced default preferences when the user does not choose them.",
);

assert.match(
  script,
  /confirmedPreferences:/,
  "Planner payload should include the user's confirmed preference choices.",
);

assert.match(
  script,
  /data-download-assistant-pdf/,
  "Assistant result cards should include a PDF download control.",
);

assert.doesNotMatch(
  script,
  />\s*(?:requestAiPlan|parseItineraryDraft|prepareBookingPayload|OpenRouter \/ Mistral|AI请求钩子|解析器钩子|预订钩子)\s*</,
  "User-facing markup must not expose internal AI/provider hook names.",
);

assert.doesNotMatch(
  script,
  /Calling OpenRouter|Trying fallback provider if needed|OpenRouter \/ Mistral|Mistral \/ Groq \/ Gemini/,
  "Loading/progress copy should not expose internal AI provider routing.",
);

assert.doesNotMatch(
  script,
  /openrouter:\s*"OpenRouter"|mistral:\s*"Mistral"|groq:\s*"Groq"|gemini:\s*"Gemini"/,
  "AI provider labels should be customer-safe in assistant messages and downloads.",
);

assert.doesNotMatch(
  indexHtml,
  /live,\s*mock,\s*or\s*fallback\s*status/i,
  "Landing page copy should not describe provider state with mock/fallback jargon.",
);

assert.doesNotMatch(
  indexHtml,
  /cdnjs\.cloudflare\.com\/ajax\/libs\/gsap/,
  "Homepage animation should not block initialization on a third-party script.",
);

assert.match(
  heroAnimation,
  /Element\.prototype\.animate/,
  "Homepage should use the browser animation API for the finite hero sequence.",
);

assert.match(
  script,
  /function initHeroGsapAnimation/,
  "Homepage should hand off to the single hero animation controller.",
);

assert.match(
  indexHtml,
  /id="liquid-glass-filter"[\s\S]*feDisplacementMap/,
  "Planner page should include an SVG displacement filter for the liquid-glass menu.",
);

assert.match(
  indexHtml,
  /class="liquid-glass-nav"[\s\S]*data-liquid-menu-toggle[\s\S]*data-liquid-action/,
  "Planner page should expose a real clickable Liquid Glass navigation dropdown.",
);

assert.match(
  script,
  /function bindLiquidGlassMenu/,
  "Planner should bind real click interactions for the Liquid Glass menu.",
);

assert.match(
  script,
  /function saveTripStateToStorage[\s\S]*localStorage/,
  "Trip state should persist locally so refresh does not erase the latest plan.",
);

assert.match(
  script,
  /function restoreTripStateFromStorage[\s\S]*localStorage/,
  "Trip state should restore locally on page load.",
);

assert.match(
  indexHtml,
  /id="ops-monitor"/,
  "A small operations monitor panel should be present for provider/storage status.",
);

assert.match(
  script,
  /function renderOperationsMonitor/,
  "Operations monitor should render provider, save, and plan status.",
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
  generatePlanApi,
  /confirmedPreferences/,
  "Server-side planning prompt should respect confirmed user preferences when they are provided.",
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

const flightDecisionSample = [
  {
    origin: "Los Angeles",
    destination: "New York",
    date: "2026-07-01",
    status: "success",
    provider: "amadeus",
    message: "",
    options: [
      {
        offerId: "red-eye-budget",
        carrierCode: "AA",
        flightNumber: "AA101",
        airline: "American Airlines",
        from: "LAX",
        to: "JFK",
        departAt: "2026-07-01T23:45:00-07:00",
        arriveAt: "2026-07-02T08:15:00-04:00",
        departure: "23:45",
        arrival: "08:15",
        duration: "8h 30m",
        durationMinutes: 510,
        stops: 1,
        stopLabel: "1 stop",
        price: 189,
        currency: "USD",
        priceLabel: "USD 189",
        bookingUrl: "https://example.com/red-eye",
        isRedEye: true,
      },
      {
        offerId: "daytime-balance",
        carrierCode: "DL",
        flightNumber: "DL404",
        airline: "Delta",
        from: "LAX",
        to: "JFK",
        departAt: "2026-07-01T09:20:00-07:00",
        arriveAt: "2026-07-01T17:45:00-04:00",
        departure: "09:20",
        arrival: "17:45",
        duration: "5h 25m",
        durationMinutes: 325,
        stops: 0,
        stopLabel: "Direct",
        price: 278,
        currency: "USD",
        priceLabel: "USD 278",
        bookingUrl: "https://example.com/daytime",
        isRedEye: false,
      },
      {
        offerId: "comfort-midday",
        carrierCode: "UA",
        flightNumber: "UA520",
        airline: "United",
        from: "LAX",
        to: "JFK",
        departAt: "2026-07-01T12:15:00-07:00",
        arriveAt: "2026-07-01T20:35:00-04:00",
        departure: "12:15",
        arrival: "20:35",
        duration: "5h 20m",
        durationMinutes: 320,
        stops: 0,
        stopLabel: "Direct",
        price: 339,
        currency: "USD",
        priceLabel: "USD 339",
        bookingUrl: "https://example.com/comfort",
        isRedEye: false,
      },
    ],
  },
];

const flightDecisionsNoBudget = JSON.parse(
  JSON.stringify(context.deriveFlightDecisions(flightDecisionSample, "")),
);

assert.equal(flightDecisionsNoBudget.length, 1, "Flight decision derivation should preserve one decision group per flight segment.");
assert.equal(
  flightDecisionsNoBudget[0].recommendedOfferId,
  "daytime-balance",
  "Recommended flight should favor non-red-eye, direct daytime arrival over the cheapest red-eye option.",
);
assert.equal(
  flightDecisionsNoBudget[0].offers.filter((offer) => offer.isRecommended).length,
  1,
  "Each segment should expose at most one recommended offer.",
);

const redEyeOffer = flightDecisionsNoBudget[0].offers.find((offer) => offer.offerId === "red-eye-budget");
const daytimeOffer = flightDecisionsNoBudget[0].offers.find((offer) => offer.offerId === "daytime-balance");

assert.ok(
  daytimeOffer.riskScore > redEyeOffer.riskScore,
  "riskScore should increase as operational risk gets lower; direct daytime flights should score above red-eyes with stops.",
);
assert.ok(
  redEyeOffer.label === "预算优先" || redEyeOffer.label === "平衡方案",
  "The cheapest red-eye should never be mislabeled as Recommended when it is materially worse on timing and comfort.",
);
assert.ok(
  redEyeOffer.budgetScore >= 1 && daytimeOffer.budgetScore >= 1,
  "Budget scoring should still resolve when the planner budget is blank.",
);

const flightDecisionsWithBudget = JSON.parse(
  JSON.stringify(context.deriveFlightDecisions(flightDecisionSample, "300 USD")),
);
const budgetDaytimeOffer = flightDecisionsWithBudget[0].offers.find((offer) => offer.offerId === "daytime-balance");
const overBudgetOffer = flightDecisionsWithBudget[0].offers.find((offer) => offer.offerId === "comfort-midday");

assert.ok(
  budgetDaytimeOffer.budgetScore > overBudgetOffer.budgetScore,
  "When a planner budget exists, in-budget flights should score above over-budget flights.",
);

const selectedFlights = {
  [flightDecisionsWithBudget[0].segmentId]: {
    segmentId: flightDecisionsWithBudget[0].segmentId,
    from: flightDecisionsWithBudget[0].from,
    to: flightDecisionsWithBudget[0].to,
    departDate: flightDecisionsWithBudget[0].departDate,
    selectedFlightOffer: budgetDaytimeOffer,
  },
};

const selectionSummary = JSON.parse(
  JSON.stringify(context.getFlightSelectionSummary(flightDecisionsWithBudget, selectedFlights)),
);

assert.deepEqual(
  selectionSummary,
  {
    selectedCount: 1,
    totalCount: 1,
    summaryLabel: "已选择航班：1 / 1 段",
    warning: "",
  },
  "Selection summaries should count confirmed segments and clear the warning when every flight segment is chosen.",
);

const assistantFlightSummary = context.renderAssistantFlights(flightDecisionsWithBudget, selectedFlights);

assert.match(
  assistantFlightSummary,
  /你已选择该航班，下一步可确认酒店或生成执行单。/,
  "Assistant flight summaries should reflect selected segments instead of prompting for another selection.",
);
assert.doesNotMatch(
  assistantFlightSummary,
  /选择此航班|Select fare|Choose this flight/,
  "Assistant flight summaries must not expose formal selection controls.",
);

const budgetFeasibility = JSON.parse(
  JSON.stringify(
    context.deriveBudgetFeasibility(
      {
        flightDecisions: flightDecisionsWithBudget,
        hotels: [
          {
            city: "New York",
            options: [
              {
                name: "Central test hotel",
                totalRate: 900,
                currency: "USD",
                provider: "apify-booking",
              },
            ],
          },
        ],
      },
      { budget: "1000 USD" },
    ),
  ),
);

assert.equal(
  budgetFeasibility.status,
  "over_budget",
  "Budget feasibility should flag the trip when the cheapest flight plus hotel exceeds the user's budget.",
);
assert.equal(
  budgetFeasibility.minimumTotal,
  1089,
  "Budget feasibility should add the cheapest flight and cheapest hotel total.",
);
assert.match(
  budgetFeasibility.primaryMessage,
  /exceeds|超出|over/i,
  "Budget feasibility should produce a direct over-budget explanation.",
);

const budgetFeasibilityMarkup = context.renderBudgetFeasibilityCard(budgetFeasibility);
assert.match(
  budgetFeasibilityMarkup,
  /预算|Budget|1000|1089|调整/i,
  "Budget feasibility should render as a visible user-facing card.",
);

assert.doesNotMatch(
  budgetFeasibilityMarkup,
  /requestAiPlan|parseItineraryDraft|prepareBookingPayload|OpenRouter|Mistral|Groq|Gemini/i,
  "Budget feasibility UI must not leak internal hooks or provider implementation names.",
);

assert.match(
  context.formatDataStatus("apify-booking", "success", ""),
  /真实|Live|酒店|provider/i,
  "Live hotel provider labels should be customer-safe and not expose raw provider names.",
);

assert.doesNotMatch(
  context.formatDataStatus("openrouter", "success", ""),
  /openrouter/i,
  "Provider labels should not show internal AI routing provider names to users.",
);

const recommendedExecutionAnalysis = {
  stops: [{ city: "New York", date: "2026-07-01" }],
  flightDecisions: flightDecisionsWithBudget,
  hotels: [
    {
      city: "New York",
      options: [
        {
          name: "Central test hotel",
          rating: "4.2",
          address: "10 Test Ave, New York, NY",
          totalRate: 900,
          currency: "USD",
          rateLabel: "USD 900 total",
          provider: "apify-booking",
          bookingUrl: "https://example.com/hotel",
          mapsUrl: "https://example.com/map",
        },
      ],
    },
  ],
  attractions: [
    {
      city: "New York",
      options: [
        { name: "Museum of Modern Art", category: "Museum", address: "11 W 53rd St, New York, NY", mapsUrl: "https://example.com/moma" },
        { name: "Bryant Park", category: "Park", address: "New York, NY 10018", mapsUrl: "https://example.com/park" },
      ],
    },
  ],
  dailyPlans: [
    {
      city: "New York",
      days: [
        {
          day: "Day 1",
          theme: "Arrival and verified midtown route",
          items: [
            { time: "09:30", title: "Arrival transfer", detail: "Transfer to the selected hotel.", mapsUrl: "https://example.com/transfer" },
            { time: "11:45", title: "Central test hotel", detail: "10 Test Ave, New York, NY.", mapsUrl: "https://example.com/map" },
            { time: "14:00", title: "Museum of Modern Art", detail: "11 W 53rd St, New York, NY.", mapsUrl: "https://example.com/moma" },
          ],
        },
      ],
    },
  ],
  budgetFeasibility,
};

const recommendedExecutionPath = JSON.parse(
  JSON.stringify(context.deriveRecommendedExecutionPath(recommendedExecutionAnalysis, { budget: "1000 USD" }, {})),
);

assert.equal(
  recommendedExecutionPath.flightSelections[0].selectedOffer.offerId,
  "daytime-balance",
  "Recommended execution path should pick the recommended flight when the user has not selected one.",
);
assert.equal(
  recommendedExecutionPath.hotelSelections[0].hotel.name,
  "Central test hotel",
  "Recommended execution path should pick a concrete hotel option per city.",
);
assert.equal(
  recommendedExecutionPath.dayAnchors.length,
  3,
  "Recommended execution path should include concrete day anchors instead of asking the user to choose.",
);

const recommendedExecutionMarkup = context.renderRecommendedExecutionPath(recommendedExecutionPath);
assert.match(
  recommendedExecutionMarkup,
  /推荐执行方案|Central test hotel|Museum of Modern Art|原平台确认\/支付|预算/i,
  "Recommended execution path should render a decisive user-facing summary card.",
);
assert.doesNotMatch(
  recommendedExecutionMarkup,
  /requestAiPlan|parseItineraryDraft|prepareBookingPayload|OpenRouter|Mistral|Groq|Gemini/i,
  "Recommended execution path must not leak internal hooks or provider names.",
);

const plannerSignature = context.createPlannerSignature({
  from: "Los Angeles",
  to: "New York",
  date: "2026-07-01",
  tripLength: "3 nights",
  people: 1,
  budget: "1000 USD",
});
assert.equal(
  context.isAnalysisStaleForPlanner({ plannerSignature }, { from: "Los Angeles", to: "New York", date: "2026-07-01", tripLength: "3 nights", people: 1, budget: "1200 USD" }),
  true,
  "Changing route, dates, travelers, or budget should mark previous recommendations as stale.",
);

const resolvedStaleExecutionPath = JSON.parse(
  JSON.stringify(
    context.resolveRecommendedExecutionPathForRender(
      {
        ...recommendedExecutionAnalysis,
        plannerSignature,
        recommendedExecutionPath,
      },
      { from: "Los Angeles", to: "New York", date: "2026-07-01", tripLength: "3 nights", people: 1, budget: "1200 USD" },
      {},
    ),
  ),
);
assert.equal(
  resolvedStaleExecutionPath.status,
  "stale",
  "Rendering should re-check the current planner signature and mark stored recommendations stale.",
);

const recommendedChecklist = JSON.parse(
  JSON.stringify(
    context.deriveBookingChecklist(
      {
        ...recommendedExecutionAnalysis,
        recommendedExecutionPath,
      },
      {},
      { items: [] },
    ),
  ),
);
const recommendedHotelItem = recommendedChecklist.items.find((item) => item.type === "hotel");
assert.equal(
  recommendedHotelItem.status,
  "selected",
  "Recommended hotels should enter the booking checklist as selected items, not unresolved placeholders.",
);
assert.match(
  `${recommendedHotelItem.title} ${recommendedHotelItem.subtitle} ${recommendedHotelItem.purchaseUrl}`,
  /New York stay|Central test hotel|example\.com\/hotel/i,
  "Recommended hotel checklist items should preserve the concrete hotel and supplier checkout link.",
);

vm.runInContext('appState.planner.from = ""', context);
const groundSegmentDecisions = JSON.parse(
  JSON.stringify(
    context.deriveFlightDecisions(
      [],
      "",
      [
        { city: "Tokyo", date: "2026-07-05" },
        { city: "Kyoto", date: "2026-07-07" },
      ],
    ),
  ),
);

assert.deepEqual(
  groundSegmentDecisions.map((segment) => ({
    from: segment.from,
    to: segment.to,
    isGroundSegment: segment.isGroundSegment,
    offers: segment.offers.length,
  })),
  [
    {
      from: "Tokyo",
      to: "Kyoto",
      isGroundSegment: true,
      offers: 0,
    },
  ],
  "Rail-first routes such as Tokyo to Kyoto should be marked as ground segments and should not generate flight cards.",
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

const effortAnalysisBase = {
  stops: [{ city: "New York", date: "2026-08-12" }],
  flightDecisions: flightDecisionsWithBudget,
  selectedFlights: {},
  dailyPlans: [
    {
      city: "New York",
      days: [
        {
          day: "Day 1",
          theme: "New York arrival and orientation",
          items: [
            { time: "09:30", title: "Arrival transfer", detail: "Airport transfer into Manhattan." },
            { time: "11:45", title: "Hotel drop-off and route setup", detail: "Check in and keep the evening light." },
            { time: "14:00", title: "Museum of Modern Art", detail: "Indoor museum stop." },
          ],
        },
      ],
    },
  ],
};

const plannerEffortBase = {
  from: "Los Angeles",
  to: "New York",
  date: "2026-08-12",
  tripLength: "3 nights",
  people: 1,
  budget: "",
  notes: "",
  pillars: ["Scenery", "Quiet stays"],
};

const effortStandard = JSON.parse(
  JSON.stringify(
    context.deriveTripEffort(
      effortAnalysisBase,
      {
        ...plannerEffortBase,
        budget: "1000 USD",
        notes: "不要红眼航班",
      },
      {},
    ),
  ),
);

assert.equal(
  effortStandard.overall.energyLevel,
  "标准",
  "A normal daytime single-segment trip should resolve to a standard overall effort level.",
);
assert.ok(
  ["轻松", "标准", "高强度"].includes(effortStandard.days[0].energyLevel),
  "Daily energy labels must stay within the approved three-level structure.",
);

const weakTravelerEffort = JSON.parse(
  JSON.stringify(
    context.deriveTripEffort(
      effortAnalysisBase,
      {
        ...plannerEffortBase,
        budget: "1500 USD",
        notes: "带父母，体力一般，不想太累",
      },
      {},
    ),
  ),
);

assert.match(
  `${weakTravelerEffort.overall.summary} ${weakTravelerEffort.days[0].adjustmentSuggestion}`,
  /parent|older|keep|reduce|lighter|rest/i,
  "Weak-traveler notes should make the effort copy more conservative.",
);

const redEyeSelectedEffort = JSON.parse(
  JSON.stringify(
    context.deriveTripEffort(
      effortAnalysisBase,
      {
        ...plannerEffortBase,
        budget: "500 USD",
        notes: "预算优先，可以接受转机",
      },
      {
        [flightDecisionsWithBudget[0].segmentId]: {
          segmentId: flightDecisionsWithBudget[0].segmentId,
          from: flightDecisionsWithBudget[0].from,
          to: flightDecisionsWithBudget[0].to,
          departDate: flightDecisionsWithBudget[0].departDate,
          selectedFlightOffer: flightDecisionsWithBudget[0].offers.find((offer) => offer.offerId === "red-eye-budget"),
        },
      },
    ),
  ),
);

assert.ok(
  redEyeSelectedEffort.days[0].energyScore < effortStandard.days[0].energyScore,
  "Selecting a red-eye flight should lower the arrival day's energy score.",
);
assert.ok(
  redEyeSelectedEffort.days[0].riskLevel < effortStandard.days[0].riskLevel,
  "Selecting a red-eye flight should lower the arrival day's risk score.",
);
assert.match(
  redEyeSelectedEffort.days[0].reasons.join(" "),
  /red-eye|late|transfer|budget/i,
  "Budget-priority red-eye selections should explain the fatigue and risk tradeoff.",
);

const assistantEffortSummary = context.renderAssistantTripEffortSummary(redEyeSelectedEffort);
assert.match(
  assistantEffortSummary,
  /旅行强度摘要|整体：|Day 1/i,
  "Assistant sidebar should expose a synchronized trip-effort summary card.",
);

const derivedChecklist = JSON.parse(
  JSON.stringify(
    context.deriveBookingChecklist(
      {
        flightDecisions: flightDecisionsWithBudget,
        tripEffort: redEyeSelectedEffort,
      },
      selectedFlights,
      { items: [] },
    ),
  ),
);

assert.equal(
  derivedChecklist.items.filter((item) => item.type === "flight").length,
  1,
  "Selecting a flight should generate one booking checklist item for that segment.",
);
assert.deepEqual(
  derivedChecklist.items.filter((item) => item.type !== "flight").map((item) => item.type).sort(),
  ["hotel", "local_transport", "ticket"],
  "The checklist should always include stable placeholder items for hotel, ticket, and local transport.",
);

const derivedFlightItem = derivedChecklist.items.find((item) => item.type === "flight");
assert.equal(derivedFlightItem.status, "selected");
assert.match(
  `${derivedFlightItem.title} ${derivedFlightItem.subtitle}`,
  /Los Angeles|New York|LAX|JFK|Delta|DL/i,
  "Flight checklist items should include the route and carrier context.",
);

const purchasedChecklist = JSON.parse(
  JSON.stringify(context.updateBookingChecklistItemStatus(derivedChecklist, derivedFlightItem.itemId, "purchased")),
);
assert.equal(
  purchasedChecklist.items.find((item) => item.itemId === derivedFlightItem.itemId).status,
  "purchased",
  "Users should be able to mark a checklist item as purchased.",
);

const confirmedChecklist = JSON.parse(
  JSON.stringify(context.setBookingChecklistConfirmationCode(purchasedChecklist, derivedFlightItem.itemId, "ABC123")),
);
const confirmedItem = confirmedChecklist.items.find((item) => item.itemId === derivedFlightItem.itemId);
assert.equal(confirmedItem.confirmationCode, "ABC123");
assert.equal(
  confirmedItem.status,
  "confirmed",
  "Saving a confirmation code should promote the purchased item to confirmed.",
);

const needsChangeChecklist = JSON.parse(
  JSON.stringify(context.updateBookingChecklistItemStatus(confirmedChecklist, derivedFlightItem.itemId, "needs_change")),
);
assert.equal(
  needsChangeChecklist.items.find((item) => item.itemId === derivedFlightItem.itemId).status,
  "needs_change",
  "Users should be able to flag a booking item for re-selection.",
);

const checklistSummary = JSON.parse(
  JSON.stringify(context.getBookingChecklistSummary(needsChangeChecklist)),
);
assert.equal(checklistSummary.totalCount, 4);
assert.equal(checklistSummary.confirmedCount, 0);
assert.ok(
  checklistSummary.needsChangeCount >= 1,
  "Checklist summary should track items that need re-selection.",
);

const bookingSectionMarkup = context.renderBookingChecklistSection(needsChangeChecklist);
assert.match(
  bookingSectionMarkup,
  /预订清单|已确认：|仍需处理：|需要重选|我已购买/i,
  "The main-results booking checklist should render summary counts and item actions.",
);

const bookingAssistantSummary = context.renderAssistantBookingChecklistSummary(needsChangeChecklist, selectedFlights);
assert.match(
  bookingAssistantSummary,
  /预订进度|需要重选|已选航班段数/i,
  "The assistant sidebar should summarize booking progress and re-selection warnings.",
);

const printableRecommendedExecutionPath = JSON.parse(
  JSON.stringify(context.deriveRecommendedExecutionPath({
    stops: [{ city: "New York", date: "2026-08-12" }],
    dailyPlans: effortAnalysisBase.dailyPlans,
    tripEffort: redEyeSelectedEffort,
    bookingChecklist: confirmedChecklist,
    flightDecisions: flightDecisionsWithBudget,
  }, {
    from: "Los Angeles",
    to: "New York",
    date: "2026-08-12",
    people: 1,
    budget: "1000 USD",
    notes: "不要红眼航班",
  }, selectedFlights)),
);
assert.equal(printableRecommendedExecutionPath.status, "ready");
assert.equal(printableRecommendedExecutionPath.statusLabel, "等待确认");
assert.match(
  printableRecommendedExecutionPath.summary,
  /尚未完成购买确认|等待用户确认/i,
  "Recommended execution path should be explicitly framed as pending user confirmation.",
);
const executionPathMarkup = context.renderRecommendedExecutionPath(printableRecommendedExecutionPath);
assert.match(
  executionPathMarkup,
  /推荐执行方案|等待确认|尚未完成购买确认/i,
  "Recommended execution path UI should not imply the system has already confirmed or purchased items.",
);

const derivedTravelAssistant = JSON.parse(
  JSON.stringify(
    context.deriveTravelAssistantState(
      {
        stops: [{ city: "New York", date: "2026-08-12" }],
        dailyPlans: effortAnalysisBase.dailyPlans,
        tripEffort: redEyeSelectedEffort,
        bookingChecklist: confirmedChecklist,
        flightDecisions: flightDecisionsWithBudget,
      },
      {
        from: "Los Angeles",
        to: "New York",
        date: "2026-08-12",
        people: 2,
        budget: "1500 USD",
        notes: "带父母，体力一般，不想太累",
      },
      selectedFlights,
      needsChangeChecklist,
      {
        enabled: true,
        mode: "important",
        messages: [],
      },
    ),
  ),
);

assert.equal(derivedTravelAssistant.enabled, true);
assert.equal(derivedTravelAssistant.mode, "important");
assert.ok(
  derivedTravelAssistant.messages.some((message) => /航班提醒/.test(message.title)),
  "Travel assistant should generate flight reminders from selected flights.",
);
assert.ok(
  derivedTravelAssistant.messages.some((message) => /需要重选/.test(message.body)),
  "Travel assistant should generate high-priority warnings for checklist items that need re-selection.",
);
assert.ok(
  derivedTravelAssistant.messages.some((message) => /体力更敏感|休息时间/.test(message.body)),
  "Travel assistant should adapt reminders for older travelers or lower-energy notes.",
);

const importantTravelMessages = JSON.parse(
  JSON.stringify(context.getVisibleTravelAssistantMessages(derivedTravelAssistant)),
);
assert.ok(
  importantTravelMessages.length >= 2 && importantTravelMessages.every((message) => message.priority === "high"),
  "Important mode should only surface high-priority travel-assistant reminders.",
);

const dismissedTravelAssistant = JSON.parse(
  JSON.stringify({
    ...derivedTravelAssistant,
    messages: derivedTravelAssistant.messages.map((message, index) =>
      index === 0
        ? {
          ...message,
          status: "dismissed",
        }
        : message),
  }),
);
const renderedTravelAssistantSection = context.renderTravelAssistantSection(dismissedTravelAssistant);
assert.match(
  renderedTravelAssistantSection,
  /旅行中助手|只看重要提醒|标准提醒|关闭提醒|忽略此提醒/i,
  "The main-results travel assistant module should render controls and reminder cards.",
);
assert.doesNotMatch(
  renderedTravelAssistantSection,
  new RegExp(dismissedTravelAssistant.messages[0].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  "Dismissed travel-assistant reminders should no longer render in the visible list.",
);

const travelAssistantSidebarSummary = context.renderAssistantTravelAssistantSummary(derivedTravelAssistant);
assert.match(
  travelAssistantSidebarSummary,
  /旅行中助手|状态：重要提醒|当前需要注意：/i,
  "The assistant sidebar should mirror travel-assistant status and top reminders.",
);

const printableAnalysis = {
  stops: [{ city: "New York", date: "2026-08-12" }],
  dailyPlans: effortAnalysisBase.dailyPlans,
  tripEffort: redEyeSelectedEffort,
  bookingChecklist: confirmedChecklist,
  flightDecisions: flightDecisionsWithBudget,
};

const draftStatusConfirmed = JSON.parse(
  JSON.stringify(context.getExecutionPlanDraftStatus(printableAnalysis, selectedFlights, confirmedChecklist)),
);
assert.equal(
  draftStatusConfirmed.isDraft,
  true,
  "A plan should still be Draft when placeholder checklist items remain unconfirmed.",
);

const completedChecklist = JSON.parse(
  JSON.stringify({
    items: confirmedChecklist.items.map((item) => ({
      ...item,
      status: item.type === "flight" ? "confirmed" : "confirmed",
      confirmationCode: item.type === "flight" ? "ABC123" : item.confirmationCode,
    })),
  }),
);
const nonDraftStatus = JSON.parse(
  JSON.stringify(context.getExecutionPlanDraftStatus(printableAnalysis, selectedFlights, completedChecklist)),
);
assert.equal(
  nonDraftStatus.isDraft,
  false,
  "A fully confirmed checklist with selected flights should clear the Draft flag.",
);

const printDocumentHtml = context.renderFinalTravelPrintDocument({
  planner: {
    from: "Los Angeles",
    to: "New York",
    date: "2026-08-12",
    people: 1,
    budget: "1000 USD",
  },
  analysis: printableAnalysis,
  selectedFlights,
  bookingChecklist: confirmedChecklist,
  draftStatus: draftStatusConfirmed,
});

assert.match(
  printDocumentHtml,
  /Katris Merrio AI Trip Studio|Final Travel Execution Plan|Draft|每日行程|推荐执行方案|已选择航班|预订清单|旅行消耗力分析|重要提醒/i,
  "The print document should include the required execution-plan sections and Draft marker.",
);
assert.match(
  printDocumentHtml,
  /ABC123|Day 1|Museum of Modern Art|需要重选|分数越高代表风险越低/i,
  "The print document should include confirmation codes, daily plan text, booking status, and trip-effort details.",
);

const bookingChecklistMarkupWithPdf = context.renderBookingChecklistSection(confirmedChecklist);
assert.match(
  bookingChecklistMarkupWithPdf,
  /Generate Final Travel PDF|生成最终旅行执行单/i,
  "The booking checklist section should expose the final travel PDF entry button.",
);

const pdfAssistantSummary = context.renderAssistantPdfSummary(true);
assert.match(
  pdfAssistantSummary,
  /最终旅行执行单已生成|草稿 \/ Draft|Draft/i,
  "The assistant sidebar should summarize PDF generation status and Draft state.",
);

console.log("assistant contract ok");
