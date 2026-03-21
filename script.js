const INITIAL_ASSISTANT_MESSAGE = {
  role: "assistant",
  content:
    "I can collect your preferences and prepare for future AI itinerary generation. Ask about seasons, atmosphere, or route ideas.",
};

const DEFAULT_PLANNER_STATE = {
  from: "",
  to: "",
  date: "",
  tripLength: "7 nights",
  people: 2,
  budget: "Balanced",
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
  "Copenhagen",
  "Dublin",
  "Edinburgh",
  "Florence",
  "Geneva",
  "Helsinki",
  "Hong Kong",
  "Istanbul",
  "Kyoto",
  "Lisbon",
  "London",
  "Los Angeles",
  "Madrid",
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
  Copenhagen: "CPH",
  Dublin: "DUB",
  Edinburgh: "EDI",
  Florence: "FLR",
  Geneva: "GVA",
  Helsinki: "HEL",
  "Hong Kong": "HKG",
  Istanbul: "IST",
  Kyoto: "KIX",
  Lisbon: "LIS",
  London: "LON",
  "Los Angeles": "LAX",
  Madrid: "MAD",
  Milan: "MIL",
  Munich: "MUC",
  "New York": "NYC",
  Nice: "NCE",
  Oslo: "OSL",
  Paris: "PAR",
  Prague: "PRG",
  Reykjavik: "KEF",
  Rome: "ROM",
  Seoul: "SEL",
  Singapore: "SIN",
  Stockholm: "STO",
  Tallinn: "TLL",
  Tokyo: "TYO",
  Venice: "VCE",
  Vienna: "VIE",
  Zurich: "ZRH",
};

const appState = {
  planner: { ...DEFAULT_PLANNER_STATE },
  assistant: {
    messages: [{ ...INITIAL_ASSISTANT_MESSAGE }],
  },
  selectedRegion: "fjord",
  analysis: null,
};

const regionDescriptions = {
  fjord: "Reflective fjord routes, quiet ferry crossings, and architecture that blends into stone and water.",
  forest: "Slow woodland days with lakeside stays, saunas, and soft contemporary Nordic interiors.",
  coast: "Salt-air towns, easy cycling paths, sea-view dining, and understated cultural discovery.",
  aurora: "Volcanic textures, northern skies, and winter-light experiences with room for wonder.",
};

const SECTION_SELECTORS = ["#overview", "#destinations", "#planner", "#assistant"];

function initializeHomepage() {
  bindScrollButtons();
  bindPaginationNavigation();
  bindDestinationCards();
  bindPlannerForm();
  bindAssistant();
  renderPlannerPreview();
  renderAssistantThread();
  renderAnalysisResults(null);
  updatePaginationState();
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindPaginationNavigation() {
  const sectionButtons = document.querySelectorAll(".pagination-link");
  const previousButton = document.getElementById("pagination-prev");
  const nextButton = document.getElementById("pagination-next");

  sectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scrollToSection(button.dataset.sectionTarget);
    });
  });

  previousButton.addEventListener("click", () => {
    const currentIndex = getCurrentSectionIndex();
    scrollToSection(SECTION_SELECTORS[Math.max(0, currentIndex - 1)]);
  });

  nextButton.addEventListener("click", () => {
    const currentIndex = getCurrentSectionIndex();
    scrollToSection(SECTION_SELECTORS[Math.min(SECTION_SELECTORS.length - 1, currentIndex + 1)]);
  });

  window.addEventListener("scroll", updatePaginationState, { passive: true });
  window.addEventListener("resize", updatePaginationState);
}

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getCurrentSectionIndex() {
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

function updatePaginationState() {
  const currentIndex = getCurrentSectionIndex();
  const sectionButtons = document.querySelectorAll(".pagination-link");
  const previousButton = document.getElementById("pagination-prev");
  const nextButton = document.getElementById("pagination-next");

  sectionButtons.forEach((button, index) => {
    const isActive = index === currentIndex;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  previousButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === SECTION_SELECTORS.length - 1;
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
      renderPlannerPreview();
    });
  });
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

  title.textContent = `${tripLength} in ${destination} for ${people} traveler${people > 1 ? "s" : ""}.`;
  summary.textContent = `${departureText}, this ${budget.toLowerCase()} concept is ${timingText}. ${regionDescriptions[appState.selectedRegion]}${notes ? ` Notes captured: ${notes}` : ""}`;

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
      copy: `Shape a core day around ${priorities.join(", ").toLowerCase()} while leaving room for future AI-generated recommendations.`,
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
  const blockedWords = new Set(["Example", "Day", "Trip", "Flight", "Hotel", "Train", "Metro"]);

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
      message: "Flight search temporarily unavailable",
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
        message: "Flight search temporarily unavailable",
      };
    }

    const data = await response.json();
    const offers = Array.isArray(data.offers) ? data.offers : [];

    if (!offers.length) {
      return {
        status: "empty",
        options: [],
        message: "No flights found for this route",
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
        origin,
        destination,
        date: safeDate,
      };
    });

    return {
      status: "success",
      options,
      message: "",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      options: [],
      message: "Flight search temporarily unavailable",
    };
  }
}

async function searchHotels(city, date) {
  const safeDate = date || getFallbackTravelDate();
  const basePrice = 120 + city.length * 6;

  return [
    {
      name: `${city} Harbour Hotel`,
      rating: 4.6,
      price: basePrice,
      currency: "EUR",
      city,
      date: safeDate,
    },
    {
      name: `${city} Light Stay`,
      rating: 4.4,
      price: basePrice + 28,
      currency: "EUR",
      city,
      date: safeDate,
    },
  ];
}

function generateTransportLinks(city) {
  const encodedCity = encodeURIComponent(city);

  return {
    metro: `https://www.google.com/maps/search/${encodedCity}+metro/`,
    uber: `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodedCity}`,
    train: `https://www.google.com/maps/search/${encodedCity}+train+station/`,
  };
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
  const transport = [];

  for (let index = 0; index < normalizedStops.length; index += 1) {
    const stop = normalizedStops[index];
    const hotelOptions = await searchHotels(stop.city, stop.date);
    const transportLinks = generateTransportLinks(stop.city);

    hotels.push({
      city: stop.city,
      date: stop.date,
      options: hotelOptions,
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
        options: flightResult.options,
      });
    }
  }

  const result = {
    stops: normalizedStops,
    flights,
    hotels,
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
  return `Planner update: ${result.stops.length} stop${result.stops.length > 1 ? "s" : ""} analyzed. Route: ${route}. ${result.flights.length} flight segment${result.flights.length !== 1 ? "s" : ""}, ${result.hotels.length} hotel lookup${result.hotels.length !== 1 ? "s" : ""}, and local transport links are ready.`;
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
                <p class="analysis-empty">Flight search temporarily unavailable</p>
              </div>
            `;
          }

          if (segment.status === "empty") {
            return `
              <div class="analysis-block">
                <h5>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</h5>
                <p class="analysis-empty">No flights found for this route</p>
              </div>
            `;
          }

          return `
            <div class="analysis-block">
              <h5>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</h5>
              ${segment.options
                .map(
                  (flight) => `
                    <article class="analysis-item">
                      <div>
                        <strong>${escapeHtml(flight.airline)}</strong>
                        <p>${escapeHtml(flight.departure)} – ${escapeHtml(flight.arrival)} · ${escapeHtml(flight.date)}</p>
                      </div>
                      <span>${flight.price} ${escapeHtml(flight.currency)}</span>
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
                <article class="analysis-item">
                  <div>
                    <strong>${escapeHtml(hotel.name)}</strong>
                    <p>Rating ${hotel.rating} · ${escapeHtml(hotel.date)}</p>
                  </div>
                  <span>${hotel.price} ${escapeHtml(hotel.currency)}</span>
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

function bindAssistant() {
  const assistantForm = document.getElementById("assistant-form");
  const assistantInput = document.getElementById("assistant-input");
  const clearAssistantButton = document.getElementById("clear-assistant");

  assistantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = assistantInput.value.trim();

    if (!value) {
      return;
    }

    addAssistantMessage("user", value);
    assistantInput.value = "";

    const placeholderResponse = handleAssistantPlaceholder(value);
    addAssistantMessage("assistant", placeholderResponse);
  });

  clearAssistantButton.addEventListener("click", () => {
    appState.assistant.messages = [{ ...INITIAL_ASSISTANT_MESSAGE }];
    renderAssistantThread();
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

function renderAssistantThread() {
  const thread = document.getElementById("assistant-thread");
  thread.innerHTML = "";

  appState.assistant.messages.forEach((message) => {
    const article = document.createElement("article");
    article.className = `message ${message.role}`;
    article.innerHTML = `
      <p class="message-label">${getMessageLabel(message.role)}</p>
      <p>${escapeHtml(message.content)}</p>
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

function handleAssistantPlaceholder(userMessage) {
  const plannerState = getPlannerPayload();
  requestAiPlan(plannerState);

  return `Placeholder response: I noted your request about "${userMessage}" and will be ready to turn it into itinerary suggestions once AI integration is connected. Right now I can preserve preferences, destination tone, and planning context.`;
}

function getPlannerPayload() {
  return {
    ...appState.planner,
    region: appState.selectedRegion,
    analysis: appState.analysis,
    assistantMessages: [...appState.assistant.messages],
  };
}

function requestAiPlan(state) {
  console.info("AI request placeholder", state);
  return Promise.resolve({ status: "placeholder" });
}

function parseItineraryDraft(response) {
  console.info("Itinerary parser placeholder", response);
  return { segments: [] };
}

function prepareBookingPayload(plan) {
  console.info("Booking orchestration placeholder", plan);
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

document.addEventListener("DOMContentLoaded", initializeHomepage);
