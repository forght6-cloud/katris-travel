const INITIAL_ASSISTANT_MESSAGE = {
  role: "assistant",
  content:
    "I can turn your preferences into a structured itinerary with flights, places, hotels, and booking notes. Ask about seasons, atmosphere, or route ideas.",
};

const DEFAULT_PLANNER_STATE = {
  from: "",
  to: "",
  date: "",
  tripLength: "7 nights",
  people: 2,
  budget: "",
  notes: "",
  pillars: ["Scenery", "Quiet stays"],
};

const CITY_CATALOG = [
  "Amsterdam",
  "Athens",
  "Bangkok",
  "Barcelona",
  "Bergen",
  "Berlin",
  "Brussels",
  "Budapest",
  "Chicago",
  "Copenhagen",
  "Dublin",
  "Edinburgh",
  "Florence",
  "Frankfurt",
  "Geneva",
  "Helsinki",
  "Hong Kong",
  "Istanbul",
  "Kyoto",
  "Lisbon",
  "London",
  "Los Angeles",
  "Madrid",
  "Manchester",
  "Milan",
  "Munich",
  "New York",
  "Nice",
  "Oslo",
  "Paris",
  "Prague",
  "Reykjavik",
  "Rome",
  "Seoul",
  "Singapore",
  "Stockholm",
  "Tallinn",
  "Tokyo",
  "Venice",
  "Vienna",
  "Zurich",
];

const AIRPORT_CODE_MAP = {
  Amsterdam: "AMS",
  Athens: "ATH",
  Bangkok: "BKK",
  Barcelona: "BCN",
  Bergen: "BGO",
  Berlin: "BER",
  Brussels: "BRU",
  Budapest: "BUD",
  Chicago: "ORD",
  Copenhagen: "CPH",
  Dublin: "DUB",
  Edinburgh: "EDI",
  Florence: "FLR",
  Frankfurt: "FRA",
  Geneva: "GVA",
  Helsinki: "HEL",
  "Hong Kong": "HKG",
  Istanbul: "IST",
  Kyoto: "KIX",
  Lisbon: "LIS",
  London: "LHR",
  "Los Angeles": "LAX",
  Madrid: "MAD",
  Manchester: "MAN",
  Milan: "MXP",
  Munich: "MUC",
  "New York": "JFK",
  Nice: "NCE",
  Oslo: "OSL",
  Paris: "CDG",
  Prague: "PRG",
  Reykjavik: "KEF",
  Rome: "FCO",
  Seoul: "ICN",
  Singapore: "SIN",
  Stockholm: "ARN",
  Tallinn: "TLL",
  Tokyo: "HND",
  Venice: "VCE",
  Vienna: "VIE",
  Zurich: "ZRH",
};

const appState = {
  planner: { ...DEFAULT_PLANNER_STATE },
  assistant: {
    messages: [{ ...INITIAL_ASSISTANT_MESSAGE }],
  },
  aiProgressTimer: null,
  selectedRegion: "fjord",
  analysis: null,
  currentSectionIndex: 0,
};

const regionDescriptions = {
  fjord: "Reflective fjord routes, quiet ferry crossings, and architecture that blends into stone and water.",
  forest: "Slow woodland days with lakeside stays, saunas, and soft contemporary Nordic interiors.",
  coast: "Salt-air towns, easy cycling paths, sea-view dining, and understated cultural discovery.",
  aurora: "Volcanic textures, northern skies, and winter-light experiences with room for wonder.",
};

const regionTemplates = {
  fjord: {
    kicker: "Norway / 7 days",
    title: "Fjord Quiet: Bergen, Flam, and Aurlandsfjord",
    summary: "A prepared route for travelers who want scenery, slow ferry movement, compact towns, and quiet stays.",
    best: "scenery, ferry crossings, design cabins",
    base: "Bergen + Flam",
    action: "copy Bergen to Flam into the planner",
    days: [
      ["Day 1", "Bergen arrival, Bryggen walk, quiet harbor dinner."],
      ["Day 2", "Flam Railway, Aurlandsfjord viewpoint, slow evening by the water."],
      ["Day 3", "Ferry movement, cabin check-in, flexible weather buffer."],
    ],
  },
  forest: {
    kicker: "Sweden / 5-7 days",
    title: "Forest Retreat: Stockholm, Dalarna, and Lake Siljan",
    summary: "A soft inland route built around lakes, sauna culture, small towns, and low-pressure design stays.",
    best: "sauna, woodland stays, quiet food stops",
    base: "Stockholm + Tallberg",
    action: "copy Stockholm to Dalarna into the planner",
    days: [
      ["Day 1", "Stockholm arrival, waterfront walk, early dinner."],
      ["Day 2", "Train toward Dalarna, lake check-in, sauna evening."],
      ["Day 3", "Lake Siljan villages, craft stops, forest cafe route."],
    ],
  },
  coast: {
    kicker: "Denmark / 4-6 days",
    title: "Coastal Simplicity: Copenhagen, Louisiana, and North Zealand",
    summary: "A compact route for cycling, galleries, sea light, and relaxed coastal meals without heavy transfers.",
    best: "design museums, cycling, coastal towns",
    base: "Copenhagen + Humlebaek",
    action: "copy Copenhagen coast into the planner",
    days: [
      ["Day 1", "Copenhagen arrival, canals, design-led dinner."],
      ["Day 2", "Louisiana Museum, coastal train, sea-view walk."],
      ["Day 3", "North Zealand towns, slow lunch, return by evening."],
    ],
  },
  aurora: {
    kicker: "Finland / 6-8 days",
    title: "Lapland Cabin Route: Rovaniemi, Levi, and Ruka",
    summary: "A winter route built around wooden cabins, snowy forest roads, sauna rituals, and northern-light evenings.",
    best: "cabins, aurora nights, ski villages",
    base: "Rovaniemi + Levi",
    action: "copy Lapland cabin route into the planner",
    days: [
      ["Day 1", "Rovaniemi arrival, cabin check-in, sauna recovery."],
      ["Day 2", "Levi ski village, reindeer route, aurora watch."],
      ["Day 3", "Ruka forest day, snowy viewpoints, quiet dinner."],
    ],
  },
};

const VERIFIED_CITY_PLACES = {
  "new york": [
    {
      name: "The Metropolitan Museum of Art",
      category: "Museum",
      summary: "Major museum anchor for a focused culture block.",
      address: "1000 5th Ave, New York, NY 10028",
    },
    {
      name: "New York Public Library, Stephen A. Schwarzman Building",
      category: "Architecture",
      summary: "A strong Midtown architecture and reading-room stop.",
      address: "476 5th Ave, New York, NY 10018",
    },
    {
      name: "Chelsea Market",
      category: "Food",
      summary: "Practical lunch base with many vendors and easy indoor pacing.",
      address: "75 9th Ave, New York, NY 10011",
    },
    {
      name: "The High Line",
      category: "Urban walk",
      summary: "Elevated linear park that works well after Chelsea Market.",
      address: "Gansevoort St. to W 34th St, New York, NY 10011",
    },
    {
      name: "Museum of Modern Art",
      category: "Museum",
      summary: "Weather-proof art block near central Midtown routes.",
      address: "11 W 53rd St, New York, NY 10019",
    },
    {
      name: "Central Park",
      category: "Park",
      summary: "Use for daylight walking, recovery time, and flexible pacing.",
      address: "59th St to 110th St, New York, NY 10022",
    },
    {
      name: "Brooklyn Bridge Park",
      category: "Scenery",
      summary: "Waterfront views and a calmer evening route after Lower Manhattan.",
      address: "334 Furman St, Brooklyn, NY 11201",
    },
    {
      name: "Katz's Delicatessen",
      category: "Restaurant",
      summary: "Classic Lower East Side lunch stop; reserve buffer time for queues.",
      address: "205 E Houston St, New York, NY 10002",
    },
  ],
};

const SECTION_SELECTORS = ["#overview", "#destinations", "#planner", "#assistant"];

function initializeHomepage() {
  appState.currentSectionIndex = getInitialSectionIndex();
  bindScrollButtons();
  bindAnchorNavigation();
  bindSectionTracking();
  bindDestinationCards();
  bindPlannerForm();
  bindAssistant();
  applySectionVisibility();
  renderPlannerPreview();
  renderDestinationTemplate();
  renderAssistantThread();
  renderAnalysisResults(null);
  updateSectionState();
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateToSection(button.dataset.scrollTarget);
    });
  });
}

function bindAnchorNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const selector = normalizeSectionSelector(anchor.getAttribute("href"));

      if (!selector) {
        return;
      }

      event.preventDefault();
      navigateToSection(selector);
    });
  });
}

function bindSectionTracking() {
  window.addEventListener("scroll", updateSectionState, { passive: true });
  window.addEventListener("resize", updateSectionState);
  window.addEventListener("hashchange", () => {
    const selector = normalizeSectionSelector(window.location.hash);
    if (selector) {
      navigateToSection(selector, { updateHash: false });
    }
  });
}

function navigateToSection(rawSelector, options = {}) {
  const selector = normalizeSectionSelector(rawSelector);
  const { updateHash = true } = options;

  if (!selector) {
    return;
  }

  const targetIndex = SECTION_SELECTORS.indexOf(selector);

  if (isWindowNavigationMode()) {
    appState.currentSectionIndex = targetIndex;
    applySectionVisibility();
    updateSectionState();

    if (updateHash) {
      window.history.replaceState(null, "", selector);
    }

    return;
  }

  appState.currentSectionIndex = targetIndex;
  const target = document.querySelector(selector);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  updateSectionState();
}

function normalizeSectionSelector(rawSelector) {
  if (!rawSelector || rawSelector === "#top") {
    return "#overview";
  }

  return SECTION_SELECTORS.includes(rawSelector) ? rawSelector : null;
}

function getInitialSectionIndex() {
  const selector = normalizeSectionSelector(window.location.hash);
  return selector ? SECTION_SELECTORS.indexOf(selector) : 0;
}

function isWindowNavigationMode() {
  return false;
}

function applySectionVisibility() {
  SECTION_SELECTORS.forEach((selector, index) => {
    const section = document.querySelector(selector);
    if (!section) {
      return;
    }

    const isCurrent = index === appState.currentSectionIndex;
    section.classList.toggle("is-current", isCurrent);
    section.removeAttribute("hidden");
  });
}

function getCurrentSectionIndex() {
  if (isWindowNavigationMode()) {
    return appState.currentSectionIndex;
  }

  const anchor = window.scrollY + 220;
  let currentIndex = 0;

  SECTION_SELECTORS.forEach((selector, index) => {
    const section = document.querySelector(selector);
    if (section && section.offsetTop <= anchor) {
      currentIndex = index;
    }
  });

  return currentIndex;
}

function updateSectionState() {
  appState.currentSectionIndex = getCurrentSectionIndex();
}

function bindDestinationCards() {
  const cards = document.querySelectorAll(".destination-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((entry) => {
        entry.classList.remove("is-active");
        entry.setAttribute("aria-pressed", "false");
      });

      card.classList.add("is-active");
      card.setAttribute("aria-pressed", "true");
      appState.selectedRegion = card.dataset.region;
      renderDestinationTemplate();
      renderPlannerPreview();
    });
  });
}

function renderDestinationTemplate() {
  const template = regionTemplates[appState.selectedRegion];
  if (!template) {
    return;
  }

  const root = document.getElementById("destination-template");
  const kicker = document.getElementById("template-kicker");
  const title = document.getElementById("template-title");
  const summary = document.getElementById("template-summary");
  const best = document.getElementById("template-best");
  const base = document.getElementById("template-base");
  const action = document.getElementById("template-action");
  const days = document.getElementById("template-days");

  if (!root || !kicker || !title || !summary || !best || !base || !action || !days) {
    return;
  }

  root.dataset.region = appState.selectedRegion;
  kicker.textContent = template.kicker;
  title.textContent = template.title;
  summary.textContent = template.summary;
  best.textContent = template.best;
  base.textContent = template.base;
  action.textContent = template.action;
  days.innerHTML = template.days
    .map(([day, copy]) => `<article><span>${escapeHtml(day)}</span><p>${escapeHtml(copy)}</p></article>`)
    .join("");
}

function bindPlannerForm() {
  const plannerForm = document.getElementById("planner-form");
  const resetButton = document.getElementById("reset-planner");

  plannerForm.addEventListener("input", syncPlannerStateFromForm);
  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    syncPlannerStateFromForm();
    setPlannerLoadingState(true);

    try {
      const inputText = appState.planner.notes || buildFallbackItineraryText();
      const result = await analyzeTripPlan(inputText);
      appState.analysis = result;
      renderPlannerPreview();
      renderAnalysisResults(result);
      sendAssistantMessage(result.summary);
    } catch (error) {
      renderAnalysisResults({ error: "Unable to analyze the itinerary right now. Please review the itinerary text and try again." });
      console.error(error);
    } finally {
      setPlannerLoadingState(false);
    }
  });

  resetButton.addEventListener("click", () => {
    plannerForm.reset();
    resetPlannerState();
    syncPlannerFormFromState();
    appState.analysis = null;
    renderPlannerPreview();
    renderAnalysisResults(null);
  });
}

function resetPlannerState() {
  appState.planner = { ...DEFAULT_PLANNER_STATE, pillars: [...DEFAULT_PLANNER_STATE.pillars] };
}

function syncPlannerFormFromState() {
  document.getElementById("from").value = appState.planner.from;
  document.getElementById("to").value = appState.planner.to;
  document.getElementById("date").value = appState.planner.date;
  document.getElementById("tripLength").value = appState.planner.tripLength;
  document.getElementById("people").value = appState.planner.people;
  document.getElementById("budget").value = appState.planner.budget;
  document.getElementById("notes").value = appState.planner.notes;

  Array.from(document.querySelectorAll('input[name="pillars"]')).forEach((input) => {
    input.checked = appState.planner.pillars.includes(input.value);
  });
}

function syncPlannerStateFromForm() {
  const checkedPillars = Array.from(document.querySelectorAll('input[name="pillars"]:checked')).map(
    (input) => input.value,
  );

  appState.planner = {
    from: document.getElementById("from").value.trim(),
    to: document.getElementById("to").value.trim(),
    date: document.getElementById("date").value,
    tripLength: document.getElementById("tripLength").value,
    people: Number(document.getElementById("people").value) || 1,
    budget: document.getElementById("budget").value,
    notes: document.getElementById("notes").value.trim(),
    pillars: checkedPillars.length ? checkedPillars : ["Scenery"],
  };

  renderPlannerPreview();
}

function renderPlannerPreview() {
  const title = document.getElementById("preview-title");
  const summary = document.getElementById("preview-summary");
  const pillars = document.getElementById("preview-pillars");
  const timeline = document.getElementById("timeline-output");

  const { from, to, date, tripLength, people, budget, notes, pillars: priorities } = appState.planner;
  const destination = to || formatRegionName(appState.selectedRegion);
  const departureText = from ? `departing from ${from}` : "with departure details to be confirmed";
  const timingText = date ? `starting ${formatMonth(date)}` : "timed for the season that suits your pace";
  const budgetText = budget ? `with a ${budget} budget` : "with budget to be confirmed";

  title.textContent = `${tripLength} in ${destination} for ${people} traveler${people > 1 ? "s" : ""}.`;
  summary.textContent = `${departureText}, ${budgetText}, this concept is ${timingText}. ${regionDescriptions[appState.selectedRegion]}${notes ? ` Notes captured: ${notes}` : ""}`;

  pillars.innerHTML = "";
  priorities.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    pillars.appendChild(li);
  });

  const scaffold = buildPlaceholderTimeline({ destination, timingText, priorities });
  timeline.innerHTML = "";
  scaffold.forEach((entry) => {
    const article = document.createElement("article");
    article.innerHTML = `<span>${entry.day}</span><p>${entry.copy}</p>`;
    timeline.appendChild(article);
  });
}

function buildPlaceholderTimeline({ destination, timingText, priorities }) {
  return [
    {
      day: "Arrival",
      copy: `Arrive in ${destination} and ease into the landscape with a low-friction first evening and quiet orientation.`,
    },
    {
      day: "Explore",
      copy: `Shape a core day around ${priorities.join(", ").toLowerCase()} while leaving room for AI-generated recommendations.`,
    },
    {
      day: "Flow",
      copy: `Placeholder routing adapts to traveler goals and ${timingText}; final parsing and logistics will connect in later steps.`,
    },
  ];
}

function parseItinerary(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const stops = [];

  lines.forEach((line) => {
    const date = extractDate(line);
    const cities = extractCities(line);

    cities.forEach((city, index) => {
      const previousStop = stops[stops.length - 1];
      if (previousStop && previousStop.city.toLowerCase() === city.toLowerCase()) {
        if (!previousStop.date && date && index === 0) {
          previousStop.date = date;
        }
        return;
      }

      stops.push({
        city,
        date: index === 0 ? date : null,
      });
    });
  });

  return { stops };
}

function extractCities(text) {
  const catalogMatches = CITY_CATALOG
    .map((city) => ({
      city,
      index: text.toLowerCase().search(new RegExp(`\\b${escapeRegExp(city.toLowerCase())}\\b`, "i")),
    }))
    .filter((match) => match.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((match) => match.city);

  if (catalogMatches.length) {
    return dedupeCities(catalogMatches);
  }

  return dedupeCities(extractCapitalizedCities(text));
}

function extractCapitalizedCities(text) {
  const candidates = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const blockedWords = new Set(["Example", "Day", "Trip", "Flight", "Hotel", "Train", "Metro", "Eur", "EUR", "Usd", "USD", "Gbp", "GBP"]);

  return candidates.filter((candidate) => !blockedWords.has(candidate));
}

function dedupeCities(cities) {
  const seen = new Set();
  return cities.filter((city) => {
    const key = city.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractDate(text) {
  const isoMatch = text.match(/\b(\d{4}[-/]\d{2}[-/]\d{2})\b/);
  if (isoMatch) {
    return normalizeDate(isoMatch[1]);
  }

  const longDateMatch = text.match(
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?/i,
  );
  if (longDateMatch) {
    return normalizeDate(longDateMatch[0]);
  }

  const reverseDateMatch = text.match(/\b\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+\d{4})?/i);
  if (reverseDateMatch) {
    return normalizeDate(reverseDateMatch[0]);
  }

  return null;
}

function normalizeDate(dateText) {
  const currentYear = new Date().getFullYear();
  const candidate = dateText.includes("/") ? dateText.replace(/\//g, "-") : dateText;
  const candidateWithYear = /\d{4}/.test(candidate) ? candidate : `${candidate} ${currentYear}`;
  const parsed = new Date(candidateWithYear);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function buildFallbackItineraryText() {
  const fallbackDestination = appState.planner.to || formatRegionName(appState.selectedRegion);
  const fallbackDate = appState.planner.date || "";
  return [fallbackDate, fallbackDestination].filter(Boolean).join(" ").trim();
}

async function searchFlights(origin, destination, date) {
  const originCode = resolveAirportCode(origin);
  const destinationCode = resolveAirportCode(destination);
  const safeDate = date || getFallbackTravelDate();
  const adults = Number(appState.planner.people) || 1;

  if (!originCode || !destinationCode) {
    return {
      status: "error",
      options: [],
      provider: "external",
      message: "Add a supported departure and destination city to search live flight data.",
    };
  }

  try {
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: originCode,
        destination: destinationCode,
        departDate: safeDate,
        adults,
      }),
    });

    if (!response.ok) {
      return {
        status: "error",
        options: [],
        provider: "external",
        message: "Live flight pricing is not connected for this request. Use the external fare search link or try a supported route/date.",
      };
    }

    const data = await response.json();
    const offers = Array.isArray(data.offers) ? data.offers : [];

    if (!offers.length) {
      return {
        status: "empty",
        options: [],
        provider: data.provider || "external",
        message: "No live flight offers returned for this route/date. Try flexible dates or external fare search.",
      };
    }

    const options = offers.map((offer) => {
      const firstItinerary = offer.itineraries?.[0] || { segments: [] };
      const firstSegment = firstItinerary.segments?.[0] || {};
      const lastSegment = firstItinerary.segments?.[firstItinerary.segments.length - 1] || firstSegment;
      const carrier = offer.carriers?.[0];

      return {
        airline: carrier?.name || carrier?.code || "Amadeus Offer",
        departure: formatTime(firstSegment.departureAt),
        arrival: formatTime(lastSegment.arrivalAt),
        price: offer.price?.total || 0,
        currency: offer.price?.currency || "EUR",
        priceLabel: offer.price?.label || formatPriceLabel(offer.price),
        bookingUrl: offer.bookingUrl || "",
        origin,
        destination,
        date: safeDate,
      };
    });

    return {
      status: "success",
      options,
      provider: data.provider || "unknown",
      message: data.warning || "",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      options: [],
      provider: "external",
      message: "Live flight pricing is not connected right now. Keep the itinerary available and use external fare search for exact tickets.",
    };
  }
}

async function searchHotels(city, date) {
  const safeDate = date || getFallbackTravelDate();

  try {
    const response = await fetch("/api/hotels/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city,
        date: safeDate,
        limit: 8,
      }),
    });

    if (!response.ok) {
      return generateExternalHotelLinks(city, safeDate, "Hotel search temporarily unavailable");
    }

    const data = await response.json();
    const hotels = Array.isArray(data.hotels) ? data.hotels : [];

    if (!hotels.length) {
      return generateExternalHotelLinks(city, safeDate, data.warning || "Hotel search returned no results");
    }

    return hotels.map((hotel) => ({
      name: hotel.name,
      rating: hotel.rating || "External rating",
      rateLabel: hotel.rateLabel || "Search live rates",
      address: hotel.address || city,
      city,
      date: hotel.date || safeDate,
      bookingUrl: hotel.bookingUrl || buildBookingSearchUrl(hotel.name, city, safeDate),
      googleHotelsUrl: hotel.googleHotelsUrl || buildGoogleHotelsUrl(hotel.name, city, safeDate),
      tripadvisorUrl: hotel.tripadvisorUrl || buildTripadvisorUrl(hotel.name, city),
      mapsUrl: hotel.mapsUrl || buildGoogleMapsSearchUrl(hotel.name, city),
      provider: data.provider || "hotel-search",
      warning: data.warning || "",
    }));
  } catch (error) {
    console.error(error);
    return generateExternalHotelLinks(city, safeDate, "Hotel search temporarily unavailable");
  }
}

function generateExternalHotelLinks(city, date, warning = "") {
  const names = [
    `${city} Central Hotel`,
    `${city} Boutique Stay`,
    `${city} Garden Residence`,
    `${city} Harbour Hotel`,
    `${city} Design Suites`,
    `${city} Station Hotel`,
    `${city} Apartment Hotel`,
    `${city} Spa Hotel`,
  ];

  return names.map((name) => ({
    name,
    rating: "External rating",
    rateLabel: "Search live rates",
    address: city,
    city,
    date,
    bookingUrl: buildBookingSearchUrl(name, city, date),
    googleHotelsUrl: buildGoogleHotelsUrl(name, city, date),
    tripadvisorUrl: buildTripadvisorUrl(name, city),
    mapsUrl: buildGoogleMapsSearchUrl(name, city),
    provider: "fallback",
    warning,
  }));
}

function buildBookingSearchUrl(name, city, date) {
  const requestUrl = new URL("https://www.booking.com/searchresults.html");
  requestUrl.searchParams.set("ss", `${name}, ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", getCheckoutDate(date));
  requestUrl.searchParams.set("group_adults", String(Number(appState.planner.people) || 2));
  requestUrl.searchParams.set("no_rooms", "1");
  requestUrl.searchParams.set("group_children", "0");
  return requestUrl.toString();
}

function buildGoogleHotelsUrl(name, city, date) {
  const requestUrl = new URL("https://www.google.com/travel/hotels");
  requestUrl.searchParams.set("q", `${name} ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", getCheckoutDate(date));
  requestUrl.searchParams.set("adults", String(Number(appState.planner.people) || 2));
  return requestUrl.toString();
}

function buildTripadvisorUrl(name, city) {
  return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${name} ${city}`)}`;
}

function buildGoogleMapsSearchUrl(name, city) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`;
}

function getVerifiedPlaces(city) {
  return VERIFIED_CITY_PLACES[String(city || "").trim().toLowerCase()] || [];
}

function normalizeVerifiedPlace(place, city, warning = "") {
  return {
    ...place,
    mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${place.name} ${place.address}`)}`,
    provider: "verified fallback",
    warning: warning || `Verified address fallback for ${city}; live place ranking still requires the Places API.`,
  };
}

function getCheckoutDate(checkinDate) {
  const parsed = new Date(`${checkinDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return checkinDate;
  }

  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

async function searchAttractions(city) {
  try {
    const response = await fetch("/api/places/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city,
        limit: 8,
      }),
    });

    if (!response.ok) {
      return generateAttractions(city, "Places API temporarily unavailable");
    }

    const data = await response.json();
    const places = Array.isArray(data.places) ? data.places : [];

    if (!places.length) {
      return generateAttractions(city, data.warning || "Geoapify returned no places for this city");
    }

    return places.map((place) => ({
      name: place.name,
      category: place.category || "Local place",
      summary: place.summary || place.address || "Geoapify place recommendation.",
      address: place.address || "",
      mapsUrl: place.mapsUrl || "",
      provider: data.provider || "geoapify",
    }));
  } catch (error) {
    console.error(error);
    return generateAttractions(city, "Places API temporarily unavailable");
  }
}

function generateAttractions(city, warning = "") {
  const verifiedPlaces = getVerifiedPlaces(city);

  if (verifiedPlaces.length) {
    return verifiedPlaces.map((place) => normalizeVerifiedPlace(place, city, warning));
  }

  return [
    {
      name: `${city} verified place lookup required`,
      category: "Live data needed",
      summary: "Katris will not invent attraction names or addresses for this city. Connect Geoapify/Google Places or open the map search below for verified locations.",
      address: "",
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${city} attractions`)}`,
      provider: "external search",
      warning: warning || "Live places API is required for accurate names and addresses.",
    },
  ];
}

function getTripDayCount(tripLength) {
  const text = String(tripLength || "").toLowerCase();
  const weekMatch = text.match(/(\d+)\s*weeks?/);
  const dayMatch = text.match(/(\d+)\s*days?/);
  const nightMatch = text.match(/(\d+)\s*nights?/);

  if (weekMatch) {
    return Number(weekMatch[1]) * 7;
  }

  if (dayMatch) {
    return Number(dayMatch[1]);
  }

  if (nightMatch) {
    return Number(nightMatch[1]) + 1;
  }

  return 7;
}

function getStopDayCount(totalDays, stopCount, stopIndex) {
  const base = Math.floor(totalDays / stopCount);
  const remainder = totalDays % stopCount;
  return Math.max(1, base + (stopIndex < remainder ? 1 : 0));
}

function buildDailyPlan(stop, index, priorities, dayCount = 2, startDay = 1) {
  const city = stop.city;
  const verifiedPlaces = getVerifiedPlaces(city);
  const place = (index) => verifiedPlaces[index % Math.max(verifiedPlaces.length, 1)];
  const placeItem = (time, verifiedPlace, fallbackTitle, fallbackDetail) => {
    if (!verifiedPlace) {
      return {
        time,
        title: fallbackTitle,
        detail: `${fallbackDetail} Confirm the exact name and address through the live Places API or Google Maps before showing this as a booked itinerary.`,
      };
    }

    return {
      time,
      title: verifiedPlace.name,
      detail: `${verifiedPlace.address}. ${verifiedPlace.summary}`,
      address: verifiedPlace.address,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${verifiedPlace.name} ${verifiedPlace.address}`)}`,
    };
  };
  const dayTemplates = [
    {
      theme: "arrival and orientation",
      items: [
        { time: "Morning", title: "Arrival and transfer buffer", detail: "Keep this block flexible for airport, rail, or hotel transfer. No attraction address is assigned until arrival timing is known." },
        placeItem("Midday", place(7), "Verified lunch stop needed", "Use a restaurant with a confirmed address near the hotel or first attraction."),
        placeItem("Afternoon", place(1), "Verified orientation stop needed", "Use one confirmed landmark or museum address for the first sightseeing block."),
        placeItem("Evening", place(6), "Verified evening route needed", "Use a confirmed waterfront, park, or low-transfer evening area."),
      ],
    },
    {
      theme: "culture, food, and scenery",
      items: [
        placeItem("Morning", place(0), "Verified museum needed", "Use the morning for a high-quality cultural anchor with a confirmed address."),
        placeItem("Midday", place(2), "Verified food hall or restaurant needed", "Plan lunch around a confirmed address, not a generic nearby restaurant."),
        placeItem("Afternoon", place(3), "Verified walking route needed", `Shape the scenic block around ${priorities.join(", ").toLowerCase()} with a confirmed route start.`),
        { time: "Evening", title: "Reservation-led dinner near confirmed route", detail: "Choose a restaurant only after the final hotel area is known; do not display a fake address." },
      ],
    },
    {
      theme: "local texture and slower pacing",
      items: [
        placeItem("Morning", place(5), "Verified park or neighborhood anchor needed", "Start with a low-friction confirmed area before longer transfers."),
        placeItem("Midday", place(7), "Verified lunch stop needed", "Use lunch to sample local dishes at a confirmed address."),
        placeItem("Afternoon", place(4), "Verified gallery or architecture stop needed", "Pick one indoor anchor that still works in poor weather."),
        { time: "Evening", title: "Hotel reset", detail: "Protect recovery time before dinner or a short night walk near the confirmed hotel area." },
      ],
    },
    {
      theme: "nature and open-air route",
      items: [
        placeItem("Morning", place(5), "Verified park or open-air route needed", "Use the clearest daylight for a confirmed outdoor block."),
        { time: "Midday", title: "Lunch near confirmed route", detail: "Avoid a cross-city meal detour; choose the restaurant only after the route start is fixed." },
        placeItem("Afternoon", place(6), "Verified viewpoint or waterfront needed", "Leave time for weather changes, light, and rest stops."),
        { time: "Evening", title: "Dinner near return route", detail: "Stay close to the return route and avoid late transfers; exact address requires live restaurant data." },
      ],
    },
    {
      theme: "booking and logistics pass",
      items: [
        { time: "Morning", title: "Hotel shortlist review", detail: "Compare location, commute, and external live-rate links." },
        { time: "Midday", title: "Transport confirmation", detail: "Check station, airport, taxi, or rail timing before committing." },
        { time: "Afternoon", title: "Flexible experience block", detail: "Choose one activity based on weather and fatigue." },
        { time: "Evening", title: "Next-day prep", detail: "Keep bags, tickets, and route notes ready." },
      ],
    },
  ];

  return Array.from({ length: dayCount }, (_, dayIndex) => {
    const template = dayTemplates[dayIndex % dayTemplates.length];
    return {
      day: `Day ${startDay + dayIndex}`,
      theme: `${city} ${template.theme}`,
      items: template.items,
    };
  });
}

function generateTransportLinks(city) {
  const encodedCity = encodeURIComponent(city);

  return {
    metro: `https://www.google.com/maps/search/${encodedCity}+metro/`,
    uber: `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodedCity}`,
    train: `https://www.google.com/maps/search/${encodedCity}+train+station/`,
  };
}

function buildExternalFlightSearchUrl(origin, destination) {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`${origin} to ${destination} flights`)}`;
}

async function analyzeTripPlan(inputText) {
  const parsed = parseItinerary(inputText);
  let stops = parsed.stops;

  if (!stops.length) {
    const fallbackCity = appState.planner.to || formatRegionName(appState.selectedRegion);
    stops = [{ city: fallbackCity, date: getFallbackTravelDate() }];
  }

  const normalizedStops = stops.map((stop, index) => ({
    city: stop.city,
    date: stop.date || deriveStopDate(index),
  }));

  const flights = [];
  const hotels = [];
  const attractions = [];
  const dailyPlans = [];
  const transport = [];
  const totalDays = getTripDayCount(appState.planner.tripLength);
  let dayCursor = 1;

  for (let index = 0; index < normalizedStops.length; index += 1) {
    const stop = normalizedStops[index];
    const hotelOptions = await searchHotels(stop.city, stop.date);
    const attractionOptions = await searchAttractions(stop.city);
    const stopDayCount = getStopDayCount(totalDays, normalizedStops.length, index);
    const dayPlanOptions = buildDailyPlan(stop, index, appState.planner.pillars, stopDayCount, dayCursor);
    const transportLinks = generateTransportLinks(stop.city);
    dayCursor += stopDayCount;

    hotels.push({
      city: stop.city,
      date: stop.date,
      options: hotelOptions,
    });

    attractions.push({
      city: stop.city,
      options: attractionOptions,
    });

    dailyPlans.push({
      city: stop.city,
      days: dayPlanOptions,
    });

    transport.push({
      city: stop.city,
      links: transportLinks,
    });

    const origin = index === 0 ? appState.planner.from : normalizedStops[index - 1]?.city;
    if (origin && origin !== stop.city) {
      const flightResult = await searchFlights(origin, stop.city, stop.date);
      flights.push({
        origin,
        destination: stop.city,
        date: stop.date,
        status: flightResult.status,
        message: flightResult.message,
        provider: flightResult.provider,
        options: flightResult.options,
      });
    }
  }

  const result = {
    stops: normalizedStops,
    flights,
    hotels,
    attractions,
    dailyPlans,
    transport,
  };

  result.summary = buildTripSummary(result);
  return result;
}

function deriveStopDate(index) {
  const baseDate = getFallbackTravelDate();
  const candidate = new Date(baseDate);
  candidate.setDate(candidate.getDate() + index * 2);
  return candidate.toISOString().slice(0, 10);
}

function getFallbackTravelDate() {
  if (appState.planner.date) {
    return appState.planner.date;
  }

  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function buildTripSummary(result) {
  const route = result.stops.map((stop) => `${stop.city}${stop.date ? ` (${stop.date})` : ""}`).join(" → ");
  const hotelCount = result.hotels.reduce((total, entry) => total + entry.options.length, 0);
  const attractionCount = result.attractions.reduce((total, entry) => total + entry.options.length, 0);
  const dayCount = result.dailyPlans.reduce((total, entry) => total + entry.days.length, 0);
  return `Planner update: ${result.stops.length} stop${result.stops.length > 1 ? "s" : ""} analyzed. Route: ${route}. ${result.flights.length} flight segment${result.flights.length !== 1 ? "s" : ""}, ${hotelCount} hotel options, ${attractionCount} attractions, ${dayCount} day plan${dayCount !== 1 ? "s" : ""}, and local transport links are ready.`;
}

function renderAnalysisResults(result) {
  const container = document.getElementById("analysis-results");

  if (!result) {
    container.innerHTML = '<p class="analysis-empty">Analyze an itinerary to see flights, hotels, transport, and summary.</p>';
    return;
  }

  if (result.error) {
    container.innerHTML = `<p class="analysis-empty">${escapeHtml(result.error)}</p>`;
    return;
  }

  const summaryList = result.stops
    .map((stop) => `<li><strong>${escapeHtml(stop.city)}</strong><span>${escapeHtml(stop.date || "Date flexible")}</span></li>`)
    .join("");

  const flightsMarkup = result.flights.length
    ? result.flights
        .map((segment) => {
          if (segment.status === "error") {
            return `
              <div class="analysis-block">
                <h5>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</h5>
                ${renderProviderNotice(segment)}
                <p class="analysis-empty">${escapeHtml(segment.message || "Live flight pricing is not connected for this route yet.")}</p>
                <a class="analysis-link" href="${escapeHtml(buildExternalFlightSearchUrl(segment.origin, segment.destination))}" target="_blank" rel="noreferrer">Search externally</a>
              </div>
            `;
          }

          if (segment.status === "empty") {
            return `
              <div class="analysis-block">
                <h5>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</h5>
                ${renderProviderNotice(segment)}
                <p class="analysis-empty">${escapeHtml(segment.message || "No live flight offers returned for this route/date.")}</p>
                <a class="analysis-link" href="${escapeHtml(buildExternalFlightSearchUrl(segment.origin, segment.destination))}" target="_blank" rel="noreferrer">Search externally</a>
              </div>
            `;
          }

          return `
            <div class="analysis-block">
              <h5>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</h5>
              ${renderProviderNotice(segment)}
              ${segment.options
                .map(
                  (flight) => `
                    <article class="analysis-item">
                  <div>
                    <strong>${escapeHtml(flight.airline)}</strong>
                    <p>${escapeHtml(flight.departure)} – ${escapeHtml(flight.arrival)} · ${escapeHtml(flight.date)}</p>
                  </div>
                      <span>${escapeHtml(flight.priceLabel || `${flight.price} ${flight.currency}`)}</span>
                      ${flight.bookingUrl ? `<a class="analysis-link" href="${escapeHtml(flight.bookingUrl)}" target="_blank" rel="noreferrer">Search fare</a>` : ""}
                    </article>
                  `,
                )
                .join("")}
            </div>
          `;
        })
        .join("")
    : '<p class="analysis-empty">No flight segment was required for this itinerary.</p>';

  const hotelsMarkup = result.hotels
    .map(
      (entry) => `
        <div class="analysis-block">
          <h5>${escapeHtml(entry.city)}</h5>
          ${entry.options
            .map(
              (hotel) => `
                <article class="analysis-item hotel-item">
                  <div>
                    <strong>${escapeHtml(hotel.name)}</strong>
                    <p>${escapeHtml(hotel.rating)} · ${escapeHtml(hotel.date)}${hotel.address ? ` · ${escapeHtml(hotel.address)}` : ""}${hotel.warning ? ` · ${escapeHtml(hotel.warning)}` : ""}</p>
                  </div>
                  <span>${escapeHtml(hotel.rateLabel || "Search live rates")}</span>
                  <div class="analysis-actions">
                    ${hotel.bookingUrl ? `<a class="analysis-link" href="${escapeHtml(hotel.bookingUrl)}" target="_blank" rel="noreferrer">Book externally</a>` : ""}
                    ${hotel.googleHotelsUrl ? `<a class="analysis-link" href="${escapeHtml(hotel.googleHotelsUrl)}" target="_blank" rel="noreferrer">Google Hotels</a>` : ""}
                    ${hotel.mapsUrl ? `<a class="analysis-link" href="${escapeHtml(hotel.mapsUrl)}" target="_blank" rel="noreferrer">Map</a>` : ""}
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      `,
    )
    .join("");

  const attractionsMarkup = result.attractions
    .map(
      (entry) => `
        <div class="analysis-block">
          <h5>${escapeHtml(entry.city)}</h5>
          ${entry.options
            .map(
              (attraction) => `
                <article class="analysis-item">
                  <div>
                    <strong>${escapeHtml(attraction.name)}</strong>
                    <p>${escapeHtml(attraction.category)}${attraction.address ? ` · ${escapeHtml(attraction.address)}` : ""} · ${escapeHtml(attraction.summary)}${attraction.warning ? ` · ${escapeHtml(attraction.warning)}` : ""}</p>
                  </div>
                  ${attraction.mapsUrl ? `<a class="analysis-link" href="${escapeHtml(attraction.mapsUrl)}" target="_blank" rel="noreferrer">Map</a>` : ""}
                </article>
              `,
            )
            .join("")}
        </div>
      `,
    )
    .join("");

  const dailyPlansMarkup = result.dailyPlans
    .map(
      (entry) => `
        <div class="analysis-block">
          <h5>${escapeHtml(entry.city)}</h5>
          ${entry.days
            .map(
              (day) => `
                <article class="day-plan">
                  <strong>${escapeHtml(day.day)} · ${escapeHtml(day.theme)}</strong>
                  <ol>
                    ${day.items
                      .map(
                        (item) => `
                          <li>
                            <span>${escapeHtml(item.time)}</span>
                            <p><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.detail)}</p>
                          </li>
                        `,
                      )
                      .join("")}
                  </ol>
                </article>
              `,
            )
            .join("")}
        </div>
      `,
    )
    .join("");

  const transportMarkup = result.transport
    .map(
      (entry) => `
        <div class="analysis-block">
          <h5>${escapeHtml(entry.city)}</h5>
          <div class="transport-links">
            <a href="${escapeHtml(entry.links.metro)}" target="_blank" rel="noreferrer">Metro</a>
            <a href="${escapeHtml(entry.links.uber)}" target="_blank" rel="noreferrer">Uber</a>
            <a href="${escapeHtml(entry.links.train)}" target="_blank" rel="noreferrer">Train</a>
          </div>
        </div>
      `,
    )
    .join("");

  container.innerHTML = `
    <section class="analysis-section">
      <h4>Summary</h4>
      <p>${escapeHtml(result.summary)}</p>
      <ul class="summary-stops">${summaryList}</ul>
    </section>
    <section class="analysis-section">
      <h4>Flights</h4>
      ${flightsMarkup}
    </section>
    <section class="analysis-section">
      <h4>Hotels</h4>
      ${hotelsMarkup}
    </section>
    <section class="analysis-section">
      <h4>Attractions</h4>
      ${attractionsMarkup}
    </section>
    <section class="analysis-section">
      <h4>Daily Plan</h4>
      ${dailyPlansMarkup}
    </section>
    <section class="analysis-section">
      <h4>Transport</h4>
      ${transportMarkup}
    </section>
  `;
}

function setPlannerLoadingState(isLoading) {
  const button = document.getElementById("analyze-planner");
  const container = document.getElementById("analysis-results");

  button.disabled = isLoading;
  button.textContent = isLoading ? "Analyzing..." : "Analyze itinerary";
  container.setAttribute("aria-busy", String(isLoading));

  if (isLoading) {
    container.innerHTML = '<p class="analysis-empty">Analyzing itinerary, searching travel options, and preparing transport links...</p>';
  }
}

function renderProviderNotice(segment) {
  if (!segment.provider && !segment.message) {
    return "";
  }

  const providerLabel = segment.provider ? `Provider: ${segment.provider}` : "Provider status";
  const message = segment.message || "";

  return `<p class="analysis-empty">${escapeHtml(providerLabel)}${message ? ` · ${escapeHtml(message)}` : ""}</p>`;
}

function bindAssistant() {
  const assistantForm = document.getElementById("assistant-form");
  const assistantInput = document.getElementById("assistant-input");
  const clearAssistantButton = document.getElementById("clear-assistant");
  const assistantThread = document.getElementById("assistant-thread");

  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = assistantInput.value.trim();

    if (!value) {
      return;
    }

    addAssistantMessage("user", value);
    assistantInput.value = "";
    setAssistantLoadingState(true);

    try {
      const response = await handleAssistantPrompt(value);
      addAssistantResultMessage(response);
    } catch (error) {
      console.error(error);
      addAssistantMessage("assistant", "I could not generate a full plan right now. Please try again with a destination, date, and trip length.");
    } finally {
      setAssistantLoadingState(false);
    }
  });

  clearAssistantButton.addEventListener("click", () => {
    appState.assistant.messages = [{ ...INITIAL_ASSISTANT_MESSAGE }];
    renderAssistantThread();
  });

  assistantThread.addEventListener("click", (event) => {
    const button = event.target.closest("[data-download-assistant-pdf]");
    if (!button) {
      return;
    }

    const resultIndex = Number(button.dataset.resultIndex);
    const result = appState.assistant.messages[resultIndex]?.result;
    if (result) {
      downloadAssistantResultPdf(result);
    }
  });
}

function sendAssistantMessage(summary) {
  const lastMessage = appState.assistant.messages[appState.assistant.messages.length - 1];
  if (lastMessage && lastMessage.role === "system" && lastMessage.content === summary) {
    return;
  }

  addAssistantMessage("system", summary);
}

function addAssistantMessage(role, content) {
  appState.assistant.messages.push({ role, content });
  renderAssistantThread();
}

function addAssistantResultMessage(result) {
  appState.assistant.messages.push({
    role: "assistant",
    content: result.message,
    result,
  });
  renderAssistantThread();
}

function renderAssistantThread() {
  const thread = document.getElementById("assistant-thread");
  thread.innerHTML = "";

  appState.assistant.messages.forEach((message, index) => {
    const article = document.createElement("article");
    article.className = `message ${message.role}`;
    article.innerHTML = `
      <p class="message-label">${getMessageLabel(message.role)}</p>
      ${message.result ? renderAssistantResult(message.result, index) : `<p>${formatMessageContent(message.content)}</p>`}
    `;
    thread.appendChild(article);
  });

  thread.scrollTop = thread.scrollHeight;
}

function getMessageLabel(role) {
  if (role === "assistant") return "Katris Assistant";
  if (role === "system") return "Planner Summary";
  return "You";
}

async function handleAssistantPrompt(userMessage) {
  syncPlannerStateFromForm();
  applyAssistantPromptToPlanner(userMessage);
  syncPlannerFormFromState();
  renderPlannerPreview();

  const analysis = await analyzeTripPlan(buildAssistantItineraryText(userMessage));
  appState.analysis = analysis;
  renderAnalysisResults(analysis);

  const plannerState = getPlannerPayload();
  const aiResponse = await requestAiPlan({
    planner: plannerState,
    message: userMessage,
    analysis,
  });
  const parsed = parseItineraryDraft(aiResponse);

  if (parsed.plan) {
    return {
      message: formatAiPlanMessage(parsed.plan, parsed.provider, parsed.warning),
      plan: parsed.plan,
      provider: parsed.provider,
      warning: parsed.warning,
      analysis,
    };
  }

  return {
    message: "I captured your request, but the AI planning service did not return a usable plan. I prepared the live search cards from the trip data instead.",
    plan: null,
    provider: parsed.provider,
    warning: parsed.warning,
    analysis,
  };
}

function applyAssistantPromptToPlanner(userMessage) {
  const inferred = inferPlannerFieldsFromMessage(userMessage);
  appState.planner = {
    ...appState.planner,
    from: inferred.from || appState.planner.from,
    to: inferred.to || appState.planner.to,
    date: inferred.date || appState.planner.date,
    tripLength: inferred.tripLength || appState.planner.tripLength,
    people: inferred.people || appState.planner.people,
    budget: inferred.budget || appState.planner.budget,
    notes: mergePlannerNotes(appState.planner.notes, userMessage),
  };
}

function inferPlannerFieldsFromMessage(message) {
  const cities = extractCities(message);
  const routeMatch = message.match(/\bfrom\s+([A-Za-z\s]+?)\s+(?:to|→|-)\s+([A-Za-z\s]+?)(?:\s+(?:for|on|from|with|\d|no\b|$)|[,.]|$)/i)
    || message.match(/\b([A-Za-z\s]+?)\s+(?:to|→|-)\s+([A-Za-z\s]+?)(?:\s+(?:for|on|from|with|\d|no\b|$)|[,.]|$)/i);
  const peopleMatch = message.match(/\b(\d+)\s*(?:person|people|traveler|travelers|adult|adults)\b/i);
  const budgetMatch = message.match(/\b(?:budget\s*)?(\d[\d,]*(?:\.\d+)?)\s*(?:bucks?|burks?|usd|eur|gbp|rmb|cny|dollars?|euros?)\b/i);
  const tripLengthMatch = message.match(/\b(\d+)\s*(?:weeks?|wks?)\b/i) || message.match(/\b(\d+)\s*(?:days?|nights?)\b/i);
  const date = extractDate(message);

  const routeFrom = routeMatch ? findKnownCity(routeMatch[1]) : "";
  const routeTo = routeMatch ? findKnownCity(routeMatch[2]) : "";
  const from = routeFrom || (cities.length > 1 ? cities[0] : "");
  const to = routeTo || (cities.length > 1 ? cities[1] : cities[0] || "");

  return {
    from,
    to,
    date,
    tripLength: tripLengthMatch ? `${tripLengthMatch[1]} ${/week/i.test(tripLengthMatch[0]) ? "weeks" : "nights"}` : "",
    people: peopleMatch ? Number(peopleMatch[1]) : null,
    budget: budgetMatch ? budgetMatch[0].replace(/^budget\s*/i, "").trim() : "",
  };
}

function findKnownCity(value) {
  const text = value.trim().toLowerCase();
  return CITY_CATALOG.find((city) => text.includes(city.toLowerCase())) || "";
}

function mergePlannerNotes(existingNotes, userMessage) {
  if (!existingNotes) {
    return userMessage;
  }

  return existingNotes.includes(userMessage) ? existingNotes : `${existingNotes}\n${userMessage}`;
}

function buildAssistantItineraryText(userMessage) {
  const origin = (appState.planner.from || "").toLowerCase();
  const messageCities = extractCities(userMessage).filter((city) => city.toLowerCase() !== origin);
  const destinationStops = messageCities.length ? messageCities : [appState.planner.to].filter(Boolean);

  if (destinationStops.length) {
    return destinationStops
      .map((city, index) => (index === 0 ? [appState.planner.date, city].filter(Boolean).join(" ") : city))
      .join("\n");
  }

  return userMessage;
}

function getPlannerPayload() {
  return {
    ...appState.planner,
    region: appState.selectedRegion,
    analysis: appState.analysis,
    assistantMessages: [...appState.assistant.messages],
  };
}

async function requestAiPlan(state) {
  const response = await fetch("/api/ai/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    throw new Error("AI planning request failed");
  }

  return response.json();
}

function parseItineraryDraft(response) {
  return {
    provider: response.provider || "unknown",
    warning: response.warning || "",
    plan: response.plan || null,
  };
}

function formatAiPlanMessage(plan, provider, warning) {
  const citySummaries = (plan.cities || [])
    .map((city) => {
      const hotelCount = city.hotels?.length || 0;
      const attractionCount = city.attractions?.length || 0;
      const dayCount = city.days?.length || 0;
      return `${city.city}: ${hotelCount} hotels, ${attractionCount} attractions, ${dayCount} planned days`;
    })
    .join(" | ");

  const bookingNotes = (plan.bookingNotes || []).slice(0, 3).join(" ");
  const providerLabels = {
    openrouter: "OpenRouter",
    mistral: "Mistral",
    groq: "Groq",
    gemini: "Gemini",
    fallback: "structured fallback",
  };
  const providerText = providerLabels[provider] || provider || "structured fallback";
  const warningText = warning ? ` ${warning}` : "";
  const sections = formatAiSections(plan.uiSections);

  if (sections) {
    return `${plan.title || "Travel plan"} (${providerText}).\n${plan.summary || ""}\n\n${sections}${warningText ? `\n\n${warningText}` : ""}`;
  }

  return `${plan.title || "Travel plan"} (${providerText}). ${plan.summary || ""} ${citySummaries}. ${bookingNotes}${warningText}`;
}

function formatAiSections(sections) {
  if (!sections || typeof sections !== "object") {
    return "";
  }

  const orderedKeys = [
    "travelOverview",
    "dailyPlan",
    "budgetAdvice",
    "transportAndHotels",
    "internalSearchParams",
    "shortVideoKeywords",
    "ticketTextParsing",
    "risks",
  ];

  return orderedKeys
    .map((key) => sections[key])
    .filter(Boolean)
    .join("\n\n");
}

function renderAssistantResult(result, resultIndex = 0) {
  const plan = result.plan || {};
  const analysis = result.analysis || {};
  const providerLabel = getAiProviderLabel(result.provider);
  const statusItems = buildAssistantStatusItems(result);

  return `
    <div class="assistant-result">
      <div class="assistant-result-head">
        <div>
          <strong>${escapeHtml(plan.title || "Travel execution plan")}</strong>
          <p>${escapeHtml(plan.summary || "Structured itinerary, live-search context, and booking paths are ready.")}</p>
        </div>
        <div class="assistant-result-actions">
          <span>${escapeHtml(providerLabel)}</span>
          <button type="button" data-download-assistant-pdf data-result-index="${resultIndex}">Download PDF</button>
        </div>
      </div>
      ${result.warning ? `<p class="assistant-warning">${escapeHtml(result.warning)}</p>` : ""}
      <div class="assistant-status-grid">
        ${statusItems.map((item) => `<span><strong>${escapeHtml(item.label)}</strong>${escapeHtml(item.value)}</span>`).join("")}
      </div>
      ${renderAssistantPlanSections(plan.uiSections)}
      ${renderAssistantBookingCards(analysis)}
    </div>
  `;
}

function downloadAssistantResultPdf(result) {
  const title = result.plan?.title || "Katris Travel Plan";
  const printableText = buildAssistantDownloadText(result);
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");

  if (!printWindow) {
    downloadAssistantResultTextFallback(title, printableText);
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 40px;
            color: #18201f;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.55;
          }
          h1 {
            margin: 0 0 12px;
            color: #c46f32;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 30px;
            line-height: 1.08;
          }
          pre {
            white-space: pre-wrap;
            word-break: break-word;
            font: inherit;
          }
          @media print {
            body { margin: 24mm; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <pre>${escapeHtml(printableText)}</pre>
        <script>
          window.addEventListener("load", () => {
            window.focus();
            window.print();
          });
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function downloadAssistantResultTextFallback(title, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugifyFileName(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function buildAssistantDownloadText(result) {
  const plan = result.plan || {};
  const analysis = result.analysis || {};
  const sections = plan.uiSections || {};
  const lines = [
    plan.title || "Katris Travel Plan",
    plan.summary || "",
    "",
    `AI: ${getAiProviderLabel(result.provider)}`,
    result.warning ? `Notice: ${result.warning}` : "",
    "",
    sections.travelOverview || "",
    sections.dailyPlan || "",
    sections.budgetAdvice || "",
    sections.transportAndHotels || "",
    sections.risks || "",
    "",
    "Flights",
    ...buildDownloadFlightLines(analysis.flights || []),
    "",
    "Hotels",
    ...buildDownloadHotelLines(analysis.hotels || []),
    "",
    "Places",
    ...buildDownloadPlaceLines(analysis.attractions || []),
  ];

  return lines.filter((line) => line !== "").join("\n");
}

function buildDownloadFlightLines(flights) {
  if (!flights.length) {
    return ["No flight segment was required or origin is still missing."];
  }

  return flights.flatMap((segment) => [
    `${segment.origin} -> ${segment.destination}: ${formatDataStatus(segment.provider, segment.status, segment.message)}`,
    ...(segment.options || []).slice(0, 5).map((flight) => `- ${flight.airline}: ${flight.departure} - ${flight.arrival}, ${flight.priceLabel || `${flight.price} ${flight.currency}`}${flight.bookingUrl ? ` (${flight.bookingUrl})` : ""}`),
  ]);
}

function buildDownloadHotelLines(hotels) {
  const hotelOptions = hotels.flatMap((entry) => entry.options || []).slice(0, 8);
  if (!hotelOptions.length) {
    return ["No hotel options returned."];
  }

  return hotelOptions.map((hotel) => `- ${hotel.name}: ${hotel.rateLabel || "Search live rates"}${hotel.bookingUrl ? ` (${hotel.bookingUrl})` : ""}`);
}

function buildDownloadPlaceLines(attractions) {
  const placeOptions = attractions.flatMap((entry) => entry.options || []).slice(0, 8);
  if (!placeOptions.length) {
    return ["No place options returned."];
  }

  return placeOptions.map((place) => `- ${place.name}: ${place.category}${place.mapsUrl ? ` (${place.mapsUrl})` : ""}`);
}

function slugifyFileName(value) {
  return String(value || "katris-travel-plan")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "katris-travel-plan";
}

function renderAssistantPlanSections(sections) {
  if (!sections || typeof sections !== "object") {
    return "";
  }

  const coreSections = [
    ["travelOverview", "旅行总览"],
    ["dailyPlan", "每日计划"],
    ["budgetAdvice", "预算"],
    ["transportAndHotels", "交通住宿"],
    ["risks", "风险提醒"],
  ];

  return `
    <div class="assistant-plan-sections">
      ${coreSections
        .map(([key, label]) => {
          const text = sections[key];
          return text ? `<section><h4>${escapeHtml(label)}</h4><p>${formatMessageContent(text)}</p></section>` : "";
        })
        .join("")}
    </div>
  `;
}

function renderAssistantBookingCards(analysis) {
  if (!analysis || !analysis.stops) {
    return "";
  }

  return `
    <div class="assistant-booking-grid">
      ${renderAssistantFlights(analysis.flights || [])}
      ${renderAssistantHotels(analysis.hotels || [])}
      ${renderAssistantAttractions(analysis.attractions || [])}
    </div>
  `;
}

function renderAssistantFlights(flights) {
  const segments = flights.length ? flights : [];
  if (!segments.length) {
    return `<section class="assistant-booking-card"><h4>Flights</h4><p>No flight segment was required or origin is still missing.</p></section>`;
  }

  return `
    <section class="assistant-booking-card">
      <h4>Flights</h4>
      ${segments
        .map((segment) => {
          const options = (segment.options || []).slice(0, 3);
          return `
            <div class="assistant-provider-row">
              <strong>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</strong>
              <span>${escapeHtml(formatDataStatus(segment.provider, segment.status, segment.message))}</span>
            </div>
            ${options.length
              ? options
                  .map(
                    (flight) => `
                      <article class="assistant-mini-item">
                        <div>
                          <strong>${escapeHtml(flight.airline)}</strong>
                          <p>${escapeHtml(flight.departure)} – ${escapeHtml(flight.arrival)} · ${escapeHtml(flight.priceLabel || `${flight.price} ${flight.currency}`)}</p>
                        </div>
                        ${flight.bookingUrl ? `<a href="${escapeHtml(flight.bookingUrl)}" target="_blank" rel="noreferrer">Search fare</a>` : ""}
                      </article>
                    `,
                  )
                  .join("")
              : `<p>${escapeHtml(segment.message || "No flight offers returned; use external search or adjust route/date.")}</p>`}
          `;
        })
        .join("")}
    </section>
  `;
}

function renderAssistantHotels(hotels) {
  const hotelOptions = hotels.flatMap((entry) => entry.options || []).slice(0, 8);

  return `
    <section class="assistant-booking-card">
      <h4>Hotels</h4>
      ${hotelOptions
        .map(
          (hotel) => `
            <article class="assistant-mini-item">
              <div>
                <strong>${escapeHtml(hotel.name)}</strong>
                <p>${escapeHtml(formatDataStatus(hotel.provider, "success", hotel.warning))}</p>
              </div>
              <div class="assistant-link-row">
                ${hotel.bookingUrl ? `<a href="${escapeHtml(hotel.bookingUrl)}" target="_blank" rel="noreferrer">Book</a>` : ""}
                ${hotel.googleHotelsUrl ? `<a href="${escapeHtml(hotel.googleHotelsUrl)}" target="_blank" rel="noreferrer">Rates</a>` : ""}
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderAssistantAttractions(attractions) {
  const placeOptions = attractions.flatMap((entry) => entry.options || []).slice(0, 8);

  return `
    <section class="assistant-booking-card">
      <h4>Places</h4>
      ${placeOptions
        .map(
          (place) => `
            <article class="assistant-mini-item">
              <div>
                <strong>${escapeHtml(place.name)}</strong>
                <p>${escapeHtml(place.category)}${place.address ? ` · ${escapeHtml(place.address)}` : ""} · ${escapeHtml(place.warning || place.summary || "Place lookup ready")}</p>
              </div>
              ${place.mapsUrl ? `<a href="${escapeHtml(place.mapsUrl)}" target="_blank" rel="noreferrer">Map</a>` : ""}
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function buildAssistantStatusItems(result) {
  const analysis = result.analysis || {};
  const flights = analysis.flights || [];
  const hotels = analysis.hotels || [];
  const attractions = analysis.attractions || [];

  return [
    { label: "AI", value: getAiProviderLabel(result.provider) },
    { label: "Flights", value: summarizeProviderSet(flights.map((segment) => segment.provider || segment.status || "pending")) },
    { label: "Hotels", value: summarizeProviderSet(hotels.flatMap((entry) => (entry.options || []).map((hotel) => hotel.provider || "external"))) },
    { label: "Places", value: summarizeProviderSet(attractions.flatMap((entry) => (entry.options || []).map((place) => place.provider || "fallback"))) },
  ];
}

function summarizeProviderSet(values) {
  const filtered = values.filter(Boolean);
  if (!filtered.length) {
    return "not requested";
  }

  return Array.from(new Set(filtered)).slice(0, 3).join(" / ");
}

function getAiProviderLabel(provider) {
  const labels = {
    openrouter: "OpenRouter",
    mistral: "Mistral",
    groq: "Groq",
    gemini: "Gemini",
    fallback: "structured fallback",
  };

  return labels[provider] || provider || "structured fallback";
}

function formatDataStatus(provider, status, message = "") {
  const providerText = provider || status || "external";
  const normalized = providerText.toLowerCase();
  const truthLabel = ["mock", "fallback", "external"].some((item) => normalized.includes(item))
    ? "fallback / external"
    : "provider data";
  return message ? `${truthLabel}: ${providerText} · ${message}` : `${truthLabel}: ${providerText}`;
}

function setAssistantLoadingState(isLoading) {
  const assistantForm = document.getElementById("assistant-form");
  const button = assistantForm.querySelector(".primary-button");
  const progress = document.getElementById("assistant-progress");
  const progressBar = document.getElementById("assistant-progress-bar");
  const progressStep = document.getElementById("assistant-progress-step");

  button.disabled = isLoading;
  button.textContent = isLoading ? "Planning..." : "Send prompt";

  if (!progress || !progressBar || !progressStep) {
    return;
  }

  if (appState.aiProgressTimer) {
    window.clearInterval(appState.aiProgressTimer);
    appState.aiProgressTimer = null;
  }

  if (!isLoading) {
    progress.classList.remove("is-active");
    progress.setAttribute("aria-hidden", "true");
    progressBar.style.width = "0%";
    progressStep.textContent = "Calling AI provider";
    return;
  }

  const steps = [
    "Calling OpenRouter",
    "Waiting for structured JSON",
    "Trying fallback provider if needed",
    "Shaping hotels, routes, and booking notes",
  ];
  let progressValue = 12;
  let stepIndex = 0;

  progress.classList.add("is-active");
  progress.setAttribute("aria-hidden", "false");
  progressBar.style.width = `${progressValue}%`;
  progressStep.textContent = steps[stepIndex];

  appState.aiProgressTimer = window.setInterval(() => {
    progressValue = Math.min(progressValue + 11, 92);
    stepIndex = Math.min(stepIndex + 1, steps.length - 1);
    progressBar.style.width = `${progressValue}%`;
    progressStep.textContent = steps[stepIndex];
  }, 1100);
}

function prepareBookingPayload(plan) {
  console.info("Booking orchestration payload", plan);
  return { bookingItems: [] };
}

function formatRegionName(region) {
  const labels = {
    fjord: "Fjord Quiet",
    forest: "Forest Retreat",
    coast: "Coastal Simplicity",
    aurora: "Aurora Horizon",
  };

  return labels[region] || "Nordic journey";
}

function formatMonth(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessageContent(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function resolveAirportCode(value) {
  if (!value) return null;

  const trimmedValue = value.trim();
  const directMatch = Object.entries(AIRPORT_CODE_MAP).find(
    ([city]) => city.toLowerCase() === trimmedValue.toLowerCase(),
  );

  if (directMatch) {
    return directMatch[1];
  }

  if (/^[A-Za-z]{3}$/.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  return null;
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function formatPriceLabel(price) {
  if (price?.label) {
    return price.label;
  }

  if (price?.currency === "STATUS") {
    return "Live status";
  }

  return `${price?.total || 0} ${price?.currency || "EUR"}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

document.addEventListener("DOMContentLoaded", initializeHomepage);
