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

const TRIP_PREFERENCE_QUESTIONS = [
  {
    key: "flightTime",
    title: "Flight time preference",
    prompt: "Choose the departure and arrival rhythm before Katris compares routes.",
    options: [
      { value: "morning_depart_afternoon_arrive", label: "Morning departure, afternoon arrival", description: "Keeps the first evening usable without a late landing." },
      { value: "midday_depart_evening_arrive", label: "Midday departure, evening arrival", description: "Balances the morning with an easier same-day transfer." },
      { value: "red_eye_price_first", label: "Night or red-eye, price first", description: "Accepts late or overnight timing to protect budget." },
    ],
  },
  {
    key: "flightTolerance",
    title: "Flight flexibility",
    prompt: "Tell Katris how much connection risk is acceptable.",
    options: [
      { value: "direct_only", label: "Direct flights only", description: "Best when time certainty matters more than price." },
      { value: "one_stop_ok", label: "One stop is acceptable", description: "Allows one connection without opening the route too wide." },
      { value: "lowest_price_first", label: "Lowest price first", description: "Open to longer or more complex routings for savings." },
    ],
  },
  {
    key: "stayPreference",
    title: "Stay priority",
    prompt: "Pick the main hotel selection rule before shortlists are ranked.",
    options: [
      { value: "city_center", label: "City center", description: "Optimizes for walkable core areas and first-time convenience." },
      { value: "easy_transit", label: "Easy transit", description: "Prioritizes station, metro, or airport transfer efficiency." },
      { value: "safe_quiet", label: "Safe and quiet", description: "Pushes calmer neighborhoods ahead of busy central zones." },
      { value: "lowest_price", label: "Lowest price", description: "Accepts tradeoffs in location for cheaper stays." },
    ],
  },
  {
    key: "pace",
    title: "Trip intensity",
    prompt: "Set the default pace before Katris distributes each day.",
    options: [
      { value: "relaxed", label: "Relaxed", description: "Fewer anchors, easier transfers, and more recovery room." },
      { value: "standard", label: "Standard", description: "Balanced city pacing without packing every slot." },
      { value: "high_intensity", label: "High intensity", description: "Denser routing with more movement and coverage." },
    ],
  },
];

const DEFAULT_PREFERENCE_ANSWERS = {
  flightTime: "midday_depart_evening_arrive",
  flightTolerance: "one_stop_ok",
  stayPreference: "easy_transit",
  pace: "standard",
};

const TRIP_STORAGE_KEY = "katris-travel:last-trip-v1";

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
  "Las Vegas",
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
  "Las Vegas": "LAS",
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

const CITY_COUNTRY_MAP = {
  Amsterdam: "Netherlands",
  Athens: "Greece",
  Bangkok: "Thailand",
  Barcelona: "Spain",
  Bergen: "Norway",
  Berlin: "Germany",
  Brussels: "Belgium",
  Budapest: "Hungary",
  Chicago: "United States",
  Copenhagen: "Denmark",
  Dublin: "Ireland",
  Edinburgh: "United Kingdom",
  Florence: "Italy",
  Frankfurt: "Germany",
  Geneva: "Switzerland",
  Helsinki: "Finland",
  "Hong Kong": "Hong Kong",
  Istanbul: "Turkey",
  Kyoto: "Japan",
  "Las Vegas": "United States",
  Lisbon: "Portugal",
  London: "United Kingdom",
  "Los Angeles": "United States",
  Madrid: "Spain",
  Manchester: "United Kingdom",
  Milan: "Italy",
  Munich: "Germany",
  "New York": "United States",
  Nice: "France",
  Oslo: "Norway",
  Paris: "France",
  Prague: "Czech Republic",
  Reykjavik: "Iceland",
  Rome: "Italy",
  Seoul: "South Korea",
  Singapore: "Singapore",
  Stockholm: "Sweden",
  Tallinn: "Estonia",
  Tokyo: "Japan",
  Venice: "Italy",
  Vienna: "Austria",
  Zurich: "Switzerland",
};

const GROUND_SEGMENT_HINTS = new Set([
  "tokyo::kyoto",
  "kyoto::tokyo",
  "london::manchester",
  "manchester::london",
  "paris::brussels",
  "brussels::paris",
  "rome::florence",
  "florence::rome",
  "milan::venice",
  "venice::milan",
]);

const appState = {
  planner: { ...DEFAULT_PLANNER_STATE },
  preferences: {
    answers: createEmptyPreferenceAnswers(),
    isVisible: false,
    pendingSource: null,
    pendingAssistantPrompt: "",
  },
  assistant: {
    messages: [{ ...INITIAL_ASSISTANT_MESSAGE }],
  },
  aiProgressTimer: null,
  selectedRegion: "fjord",
  selectedFlights: {},
  bookingChecklist: {
    items: [],
  },
  travelAssistant: createDefaultTravelAssistantState(),
  pdfExport: {
    lastGeneratedAt: "",
    wasDraft: false,
  },
  savedState: {
    status: "not_saved",
    savedAt: "",
    restoredAt: "",
    error: "",
  },
  analysis: null,
  currentSectionIndex: 0,
};

function createDefaultTravelAssistantState() {
  return {
    enabled: false,
    mode: "important",
    messages: [],
  };
}

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
  "las vegas": [
    {
      name: "Harry Reid International Airport",
      category: "Airport",
      summary: "Arrival anchor for airport transfer timing.",
      address: "5757 Wayne Newton Blvd, Las Vegas, NV 89119",
    },
    {
      name: "Bellagio Conservatory & Botanical Gardens",
      category: "Sight",
      summary: "High-impact indoor garden stop on the Strip.",
      address: "3600 S Las Vegas Blvd, Las Vegas, NV 89109",
    },
    {
      name: "The Venetian Resort Las Vegas",
      category: "Architecture",
      summary: "Indoor architecture, canals, dining, and low-friction walking.",
      address: "3355 S Las Vegas Blvd, Las Vegas, NV 89109",
    },
    {
      name: "The Mob Museum",
      category: "Museum",
      summary: "Clear cultural anchor for Downtown Las Vegas.",
      address: "300 Stewart Ave, Las Vegas, NV 89101",
    },
    {
      name: "Peppermill Restaurant and Fireside Lounge",
      category: "Restaurant",
      summary: "Classic Las Vegas lunch or late breakfast stop on the Strip.",
      address: "2985 S Las Vegas Blvd, Las Vegas, NV 89109",
    },
    {
      name: "High Roller",
      category: "Viewpoint",
      summary: "Simple timed viewpoint with strong evening skyline value.",
      address: "3545 S Las Vegas Blvd, Las Vegas, NV 89109",
    },
    {
      name: "MGM Grand Monorail Station",
      category: "Transit",
      summary: "Useful Las Vegas Monorail connection point for Strip movement.",
      address: "3799 S Las Vegas Blvd, Las Vegas, NV 89109",
    },
    {
      name: "Fremont Street Experience",
      category: "Evening route",
      summary: "Downtown evening walk with clear route boundaries.",
      address: "425 Fremont St, Las Vegas, NV 89101",
    },
  ],
};

const SECTION_SELECTORS = ["#overview", "#destinations", "#planner", "#assistant"];
const KATRIS_VIEWS = new Set(["home", "plan", "trip"]);

function getKatrisView() {
  const view = new URLSearchParams(window.location.search).get("view");
  return KATRIS_VIEWS.has(view) ? view : "home";
}

function setKatrisView(view, { replace = false } = {}) {
  const nextView = KATRIS_VIEWS.has(view) ? view : "home";
  const url = new URL(window.location.href);

  if (nextView === "home") {
    url.searchParams.delete("view");
  } else {
    url.searchParams.set("view", nextView);
  }

  window.history[replace ? "replaceState" : "pushState"]({}, "", url);
  document.body.dataset.katrisView = nextView;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function bindKatrisViewLinks() {
  document.querySelectorAll("[data-katris-view-link]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      setKatrisView(element.dataset.katrisViewLink);
    });
  });

  window.addEventListener("popstate", () => {
    setKatrisView(getKatrisView(), { replace: true });
  });
}

function initializeHomepage() {
  document.body.dataset.katrisView = getKatrisView();
  appState.currentSectionIndex = getInitialSectionIndex();
  restoreTripStateFromStorage();
  bindKatrisViewLinks();
  bindScrollButtons();
  bindOverviewDoubleClick();
  bindAnchorNavigation();
  bindSectionTracking();
  bindDestinationCards();
  bindHeroVideoTabs();
  bindHomeLoginForm();
  bindPlannerForm();
  bindPreferenceGate();
  bindAssistant();
  bindLiquidGlassMenu();
  initHeroGsapAnimation();
  applySectionVisibility();
  syncPlannerFormFromState();
  renderPlannerPreview();
  renderDestinationTemplate();
  renderPreferenceGate();
  renderAssistantThread();
  renderAssistantSyncSummary();
  renderAnalysisResults(appState.analysis);
  renderOperationsMonitor();
  updateSectionState();
}

function initHeroGsapAnimation() {
  if (typeof window === "undefined" || !window.gsap) {
    return;
  }

  const hero = document.querySelector(".hero-section");
  if (!hero) {
    return;
  }

  const gsap = window.gsap;
  const media = gsap.matchMedia();

  media.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 900px)",
    },
    (context) => {
      const { reduceMotion, desktop } = context.conditions;
      if (reduceMotion) {
        gsap.set([".lumora-kicker", ".lumora-center h1", ".lumora-center > p", ".katris-login-entry", ".lumora-video-tabs button", ".lumora-stats div"], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      const timeline = gsap.timeline({ defaults: { duration: 0.72, ease: "power3.out" } });
      timeline
        .from(".lumora-kicker", { autoAlpha: 0, y: 14 })
        .from(".lumora-center h1", { autoAlpha: 0, y: 24 }, "<0.1")
        .from(".lumora-center > p", { autoAlpha: 0, y: 16 }, "<0.12")
        .from(".katris-login-entry", { autoAlpha: 0, y: 12 }, "<0.12")
        .from(".lumora-video-tabs button", { autoAlpha: 0, y: 10, stagger: 0.06 }, "<0.12")
        .from(".lumora-stats div", { autoAlpha: 0, y: 8, stagger: 0.05 }, "<0.08");
    },
  );
}

function bindHeroVideoTabs() {
  const tabs = Array.from(document.querySelectorAll("[data-hero-video-tab]"));
  const videos = Array.from(document.querySelectorAll("[data-hero-video]"));

  if (!tabs.length || !videos.length) {
    return;
  }

  videos.forEach((video) => {
    if (video.readyState >= 2) {
      video.classList.add("is-ready");
      return;
    }

    video.addEventListener("loadeddata", () => {
      video.classList.add("is-ready");
    }, { once: true });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetIndex = tab.dataset.heroVideoTab;
      document.querySelector(".lumora-hero")?.setAttribute("data-hero-scene", targetIndex);
      tabs.forEach((entry) => entry.classList.toggle("is-active", entry === tab));
      videos.forEach((video) => {
        const isActive = video.dataset.heroVideo === targetIndex;
        video.classList.toggle("is-active", isActive);
        if (isActive) {
          video.play?.().catch(() => {});
        }
      });
    });
  });
}

function bindHomeLoginForm() {
  const form = document.querySelector("[data-home-login-form]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector('input[name="email"]');
    const email = String(input?.value || "").trim();

    if (!email) {
      return;
    }

    try {
      localStorage.setItem("katris-travel:login-email", email);
    } catch {
      // Local storage can be unavailable in private contexts; navigation still works.
    }

    setKatrisView("plan");
  });
}

function buildTripStoragePayload(reason = "auto") {
  return {
    version: 1,
    reason,
    savedAt: new Date().toISOString(),
    planner: appState.planner,
    preferences: appState.preferences.answers,
    selectedRegion: appState.selectedRegion,
    selectedFlights: appState.selectedFlights,
    bookingChecklist: appState.bookingChecklist,
    travelAssistant: appState.travelAssistant,
    pdfExport: appState.pdfExport,
    analysis: appState.analysis,
  };
}

function saveTripStateToStorage(reason = "auto") {
  if (typeof localStorage === "undefined") {
    return false;
  }

  try {
    const payload = buildTripStoragePayload(reason);
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(payload));
    appState.savedState = {
      status: "saved",
      savedAt: payload.savedAt,
      restoredAt: appState.savedState?.restoredAt || "",
      error: "",
    };
    renderOperationsMonitor();
    return true;
  } catch (error) {
    appState.savedState = {
      status: "error",
      savedAt: appState.savedState?.savedAt || "",
      restoredAt: appState.savedState?.restoredAt || "",
      error: error.message,
    };
    renderOperationsMonitor();
    return false;
  }
}

function restoreTripStateFromStorage() {
  if (typeof localStorage === "undefined") {
    return false;
  }

  try {
    const raw = localStorage.getItem(TRIP_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const payload = JSON.parse(raw);
    if (!payload || payload.version !== 1) {
      return false;
    }

    appState.planner = {
      ...DEFAULT_PLANNER_STATE,
      ...(payload.planner || {}),
      pillars: Array.isArray(payload.planner?.pillars) && payload.planner.pillars.length
        ? payload.planner.pillars
        : [...DEFAULT_PLANNER_STATE.pillars],
    };
    appState.preferences.answers = {
      ...createEmptyPreferenceAnswers(),
      ...(payload.preferences || {}),
    };
    appState.selectedRegion = payload.selectedRegion || appState.selectedRegion;
    appState.selectedFlights = payload.selectedFlights || {};
    appState.bookingChecklist = payload.bookingChecklist || { items: [] };
    appState.travelAssistant = payload.travelAssistant || createDefaultTravelAssistantState();
    appState.pdfExport = payload.pdfExport || { lastGeneratedAt: "", wasDraft: false };
    appState.analysis = payload.analysis || null;
    appState.savedState = {
      status: "restored",
      savedAt: payload.savedAt || "",
      restoredAt: new Date().toISOString(),
      error: "",
    };
    return true;
  } catch (error) {
    appState.savedState = {
      status: "error",
      savedAt: "",
      restoredAt: "",
      error: error.message,
    };
    return false;
  }
}

function clearTripStateStorage() {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(TRIP_STORAGE_KEY);
    appState.savedState = {
      status: "cleared",
      savedAt: "",
      restoredAt: "",
      error: "",
    };
  } catch (error) {
    appState.savedState = {
      status: "error",
      savedAt: "",
      restoredAt: "",
      error: error.message,
    };
  }
  renderOperationsMonitor();
}

function bindLiquidGlassMenu() {
  const nav = document.querySelector(".liquid-glass-nav");
  const toggle = document.querySelector("[data-liquid-menu-toggle]");
  const menu = document.getElementById("liquid-plan-menu");

  if (!nav || !toggle || !menu) {
    return;
  }

  const setOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.hidden = !isOpen;
    nav.classList.toggle("is-open", isOpen);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-liquid-action]");
    if (!actionButton) {
      return;
    }

    handleLiquidMenuAction(actionButton.dataset.liquidAction);
    setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      toggle.focus();
    }
  });
}

function handleLiquidMenuAction(action) {
  const detail = document.getElementById("liquid-menu-detail");
  const messages = {
    recommended: {
      title: "Recommended path",
      body: "Jumping to the generated route, selected flight, selected hotel, day anchors, and external checkout steps.",
    },
    saved: {
      title: "Trip saved locally",
      body: "The latest route, selected providers, checklist, and assistant context are stored in this browser for refresh recovery.",
    },
    suppliers: {
      title: "Supplier checkout",
      body: "Hotels remain Katris recommendations. Final room availability, terms, and payment are confirmed on the original supplier platform.",
    },
    monitor: {
      title: "Operations status",
      body: "Review provider availability, local-save state, and whether the current route is ready or still waiting for generation.",
    },
  };
  const selected = messages[action] || messages.recommended;

  if (action === "saved") {
    saveTripStateToStorage("liquid_menu");
  }

  if (detail) {
    detail.innerHTML = `
      <p class="eyebrow">Liquid glass control</p>
      <h3>${escapeHtml(selected.title)}</h3>
      <p>${escapeHtml(selected.body)}</p>
    `;
  }

  if (action === "recommended") {
    document.querySelector(".recommended-execution-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (action === "monitor") {
    document.getElementById("ops-monitor")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateToSection(button.dataset.scrollTarget);
    });
  });
}

function bindOverviewDoubleClick() {
  const overview = document.getElementById("overview");

  overview?.addEventListener("dblclick", () => {
    navigateToSection("#planner");
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
  const analysisResults = document.getElementById("analysis-results");

  plannerForm.addEventListener("input", syncPlannerStateFromForm);
  analysisResults?.addEventListener("click", handleAnalysisResultClick);
  analysisResults?.addEventListener("input", handleAnalysisResultInput);
  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    syncPlannerStateFromForm();
    ensureDefaultPreferenceAnswers();
    await runPlannerAnalysis();
  });

  resetButton.addEventListener("click", () => {
    plannerForm.reset();
    resetPlannerState();
    clearTripStateStorage();
    syncPlannerFormFromState();
    appState.analysis = null;
    appState.selectedFlights = {};
    appState.bookingChecklist = { items: [] };
    appState.travelAssistant = createDefaultTravelAssistantState();
    appState.pdfExport = { lastGeneratedAt: "", wasDraft: false };
    renderPlannerPreview();
    resetPreferenceGate();
    renderPreferenceGate();
    renderAnalysisResults(null);
    renderAssistantSyncSummary();
    renderOperationsMonitor();
  });
}

function resetPlannerState() {
  appState.planner = { ...DEFAULT_PLANNER_STATE, pillars: [...DEFAULT_PLANNER_STATE.pillars] };
  appState.selectedFlights = {};
  appState.bookingChecklist = { items: [] };
  appState.travelAssistant = createDefaultTravelAssistantState();
  appState.pdfExport = { lastGeneratedAt: "", wasDraft: false };
}

function createEmptyPreferenceAnswers() {
  return TRIP_PREFERENCE_QUESTIONS.reduce((answers, question) => {
    answers[question.key] = "";
    return answers;
  }, {});
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
  const previousSignature = createPlannerSignature(appState.planner);
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

  invalidateAnalysisIfPlannerChanged(previousSignature, appState.planner);
  renderPlannerPreview();
  saveTripStateToStorage("planner_draft");
}

function bindPreferenceGate() {
  const gate = document.getElementById("preference-gate");
  if (!gate) {
    return;
  }

  gate.addEventListener("click", async (event) => {
    const option = event.target.closest("[data-preference-key][data-preference-value]");
    if (option) {
      appState.preferences.answers[option.dataset.preferenceKey] = option.dataset.preferenceValue;
      renderPreferenceGate();
      return;
    }

    const submitButton = event.target.closest("[data-preference-submit]");
    if (submitButton) {
      ensureDefaultPreferenceAnswers();

      if (appState.preferences.pendingSource === "assistant" && appState.preferences.pendingAssistantPrompt) {
        setAssistantLoadingState(true);
        try {
          const response = await handleAssistantPrompt(appState.preferences.pendingAssistantPrompt);
          addAssistantResultMessage(response);
          clearPendingPreferenceRequest();
          renderPreferenceGate();
        } catch (error) {
          console.error(error);
          addAssistantMessage("assistant", "I captured your preferences, but I could not generate the plan right now. Please try again.");
        } finally {
          setAssistantLoadingState(false);
        }
        return;
      }

      await runPlannerAnalysis();
      clearPendingPreferenceRequest();
      renderPreferenceGate();
      return;
    }

    const resetButton = event.target.closest("[data-preference-reset]");
    if (resetButton) {
      appState.preferences.answers = createEmptyPreferenceAnswers();
      clearPendingPreferenceRequest();
      renderPreferenceGate();
    }
  });
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

function renderPreferenceGate() {
  const gate = document.getElementById("preference-gate");
  if (!gate) {
    return;
  }

  if (!appState.preferences.isVisible) {
    gate.hidden = true;
    gate.innerHTML = "";
    return;
  }

  const answeredCount = Object.values(appState.preferences.answers).filter(Boolean).length;
  const totalCount = TRIP_PREFERENCE_QUESTIONS.length;
  const sourceLabel = appState.preferences.pendingSource === "assistant"
    ? "Katris can use balanced defaults now, or you can override the planning rules here."
    : "Katris can generate with balanced defaults. Use this panel only when you want to override the route rules.";
  const helperLabel = hasCompletePreferenceAnswers()
    ? "Preferences are locked in. You can generate now or change any answer first."
    : "No manual choice is required. Missing answers will use balanced defaults.";
  const actionLabel = appState.preferences.pendingSource === "assistant" && appState.preferences.pendingAssistantPrompt
    ? "Generate confirmed assistant plan"
    : "Generate confirmed itinerary";

  gate.hidden = false;
  gate.innerHTML = `
    <div class="preference-gate-head">
      <p class="eyebrow">Confirmation gate</p>
      <h3>Confirm the key travel preferences first.</h3>
      <p>${escapeHtml(sourceLabel)}</p>
      <p class="preference-gate-summary">${answeredCount} / ${totalCount} required decisions confirmed</p>
    </div>
    <div class="preference-gate-grid">
      ${TRIP_PREFERENCE_QUESTIONS.map((question) => {
        const selectedValue = appState.preferences.answers[question.key];
        return `
          <section class="preference-question">
            <div>
              <strong>${escapeHtml(question.title)}</strong>
              <p class="preference-question-copy">${escapeHtml(question.prompt)}</p>
            </div>
            <div class="preference-options">
              ${question.options.map((option) => `
                <button
                  class="preference-option${selectedValue === option.value ? " is-active" : ""}"
                  type="button"
                  data-preference-key="${escapeHtml(question.key)}"
                  data-preference-value="${escapeHtml(option.value)}"
                  aria-pressed="${selectedValue === option.value ? "true" : "false"}"
                >
                  <strong>${escapeHtml(option.label)}</strong>
                  <span>${escapeHtml(option.description)}</span>
                </button>
              `).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </div>
    <div class="preference-gate-actions">
      <p>${escapeHtml(helperLabel)}</p>
      <div class="preference-gate-buttons">
        <button class="primary-button" type="button" data-preference-submit>${escapeHtml(actionLabel)}</button>
        <button class="ghost-button" type="button" data-preference-reset>Clear choices</button>
      </div>
    </div>
  `;
}

function hasCompletePreferenceAnswers() {
  return TRIP_PREFERENCE_QUESTIONS.every((question) => appState.preferences.answers[question.key]);
}

function ensureDefaultPreferenceAnswers() {
  appState.preferences.answers = TRIP_PREFERENCE_QUESTIONS.reduce((answers, question) => ({
    ...answers,
    [question.key]: appState.preferences.answers[question.key] || DEFAULT_PREFERENCE_ANSWERS[question.key] || question.options[0]?.value || "",
  }), {});
  return appState.preferences.answers;
}

function openPreferenceGate(source, assistantPrompt = "") {
  appState.preferences.isVisible = true;
  appState.preferences.pendingSource = source;
  appState.preferences.pendingAssistantPrompt = source === "assistant" ? assistantPrompt : "";
  renderPreferenceGate();
  navigateToSection("#planner");
}

function clearPendingPreferenceRequest() {
  appState.preferences.pendingSource = null;
  appState.preferences.pendingAssistantPrompt = "";
}

function resetPreferenceGate() {
  appState.preferences = {
    answers: createEmptyPreferenceAnswers(),
    isVisible: false,
    pendingSource: null,
    pendingAssistantPrompt: "",
  };
}

async function runPlannerAnalysis() {
  setPlannerLoadingState(true);
  appState.selectedFlights = {};
  appState.bookingChecklist = { items: [] };
  appState.travelAssistant = createDefaultTravelAssistantState();
  appState.pdfExport = { lastGeneratedAt: "", wasDraft: false };

  try {
    const inputText = appState.planner.notes || buildFallbackItineraryText();
    const result = await analyzeTripPlan(inputText);
    appState.analysis = result;
    renderPlannerPreview();
    renderAnalysisResults(result);
    sendAssistantMessage(result.summary);
    saveTripStateToStorage("analysis_complete");
    setKatrisView("trip");
  } catch (error) {
    renderAnalysisResults({ error: "Unable to analyze the itinerary right now. Please review the itinerary text and try again." });
    console.error(error);
  } finally {
    setPlannerLoadingState(false);
    renderOperationsMonitor();
  }
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

function buildFlightOfferId(origin, destination, date, index = 0) {
  return `${String(origin || "origin").toLowerCase().replace(/\s+/g, "-")}--${String(destination || "destination").toLowerCase().replace(/\s+/g, "-")}--${date || "date"}--${index + 1}`;
}

function parseIsoDurationToMinutes(value) {
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!match) {
    return 0;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return hours * 60 + minutes;
}

function formatDurationMinutes(totalMinutes) {
  const safeMinutes = Math.max(Number(totalMinutes) || 0, 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getLocalHour(value) {
  const timeMatch = String(value || "").match(/T(\d{2}):(\d{2})/);
  if (timeMatch) {
    return Number(timeMatch[1]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getHours();
}

function isRedEyeFlight(departAt, arriveAt) {
  const departureHour = getLocalHour(departAt);
  const arrivalHour = getLocalHour(arriveAt);

  if (departureHour == null || arrivalHour == null) {
    return false;
  }

  return departureHour >= 21 || departureHour <= 5 || arrivalHour <= 6;
}

function normalizeFlightOption(option, fallbackContext = {}, index = 0) {
  const fallbackOrigin = fallbackContext.origin || option.origin || option.from || "";
  const fallbackDestination = fallbackContext.destination || option.destination || option.to || "";
  const fallbackDate = fallbackContext.date || option.date || getFallbackTravelDate();
  const segments = option.itineraries?.[0]?.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;
  const carrier = option.carriers?.[0] || {};
  const carrierCode = option.carrierCode || carrier.code || "";
  const rawFlightNumber = option.flightNumber || firstSegment.flightNumber || option.offerId || option.id || "";
  const departAt = option.departAt || firstSegment.departureAt || "";
  const arriveAt = option.arriveAt || lastSegment.arrivalAt || "";
  const durationMinutes = Number(option.durationMinutes) || parseIsoDurationToMinutes(option.duration || option.itineraries?.[0]?.duration);
  const stopCount = Number.isFinite(option.stops) ? Number(option.stops) : Math.max(segments.length - 1, 0);
  const numericPrice = typeof option.price === "object" ? Number(option.price?.total || 0) : Number(option.price || 0);
  const currency = option.currency || option.price?.currency || "EUR";
  const formattedFlightNumber = carrierCode && !String(rawFlightNumber).startsWith(carrierCode)
    ? `${carrierCode} ${rawFlightNumber}`
    : String(rawFlightNumber || carrierCode || "").trim();

  return {
    offerId: option.offerId || option.id || buildFlightOfferId(fallbackOrigin, fallbackDestination, fallbackDate, index),
    carrierCode,
    flightNumber: formattedFlightNumber,
    airline: option.airline || carrier.name || carrierCode || "Flight option",
    from: option.from || firstSegment.from || fallbackOrigin,
    to: option.to || lastSegment.to || fallbackDestination,
    departAt,
    arriveAt,
    departure: option.departure || formatTime(departAt),
    arrival: option.arrival || formatTime(arriveAt),
    date: option.date || fallbackDate,
    duration: option.duration || formatDurationMinutes(durationMinutes),
    durationMinutes,
    stops: stopCount,
    stopLabel: option.stopLabel || (stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`),
    price: numericPrice,
    currency,
    priceLabel: option.priceLabel || formatPriceLabel({ total: numericPrice, currency }),
    bookingUrl: option.bookingUrl || "",
    isRedEye: typeof option.isRedEye === "boolean" ? option.isRedEye : isRedEyeFlight(departAt, arriveAt),
  };
}

function generateExternalFlightOptions(origin, destination, date) {
  const searchUrl = buildExternalFlightSearchUrl(origin, destination);
  const baseDate = date || getFallbackTravelDate();
  const fallbackTimes = [
    ["08:30", "12:05"],
    ["13:10", "16:45"],
    ["19:20", "22:55"],
  ];

  return fallbackTimes.map(([departure, arrival], index) =>
    normalizeFlightOption(
      {
        airline: `External fare option ${String.fromCharCode(65 + index)}`,
        carrierCode: "EXT",
        flightNumber: `EXT ${index + 1}`,
        from: resolveAirportCode(origin) || origin,
        to: resolveAirportCode(destination) || destination,
        departAt: `${baseDate}T${departure}:00`,
        arriveAt: `${baseDate}T${arrival}:00`,
        departure,
        arrival,
        date: baseDate,
        durationMinutes: 215,
        price: 0,
        currency: "STATUS",
        priceLabel: "Open live fare",
        bookingUrl: searchUrl,
        stops: index === 2 ? 1 : 0,
        isRedEye: false,
      },
      { origin, destination, date: baseDate },
      index,
    ),
  );
}

async function searchFlights(origin, destination, date) {
  const originCode = resolveAirportCode(origin);
  const destinationCode = resolveAirportCode(destination);
  const safeDate = date || getFallbackTravelDate();
  const adults = Number(appState.planner.people) || 1;

  if (!originCode || !destinationCode) {
    return {
      status: "error",
      options: generateExternalFlightOptions(origin, destination, safeDate),
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
        options: generateExternalFlightOptions(origin, destination, safeDate),
        provider: "external",
        message: "Live flight pricing is not connected for this request. Use the external fare search link or try a supported route/date.",
      };
    }

    const data = await response.json();
    const offers = Array.isArray(data.offers) ? data.offers : [];

    if (!offers.length) {
      return {
        status: "empty",
        options: generateExternalFlightOptions(origin, destination, safeDate),
        provider: data.provider || "external",
        message: "No live flight offers returned for this route/date. Try flexible dates or external fare search.",
      };
    }

    const options = offers.map((offer, index) =>
      normalizeFlightOption(offer, { origin, destination, date: safeDate }, index),
    );

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
      options: generateExternalFlightOptions(origin, destination, safeDate),
      provider: "external",
      message: "Live flight pricing is not connected right now. Keep the itinerary available and use external fare search for exact tickets.",
    };
  }
}

async function searchHotels(city, date, checkoutDate = getCheckoutDate(date), adults = Number(appState.planner.people) || 1) {
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
        checkoutDate,
        adults,
        limit: 8,
      }),
    });

    if (!response.ok) {
      return generateExternalHotelLinks(city, safeDate, checkoutDate, adults, "Hotel search temporarily unavailable");
    }

    const data = await response.json();
    const hotels = Array.isArray(data.hotels) ? data.hotels : [];

    if (!hotels.length) {
      return generateExternalHotelLinks(city, safeDate, checkoutDate, adults, data.warning || "Hotel search returned no results");
    }

    return hotels.map((hotel) => ({
      name: hotel.name,
      rating: hotel.rating || "External rating",
      rateLabel: hotel.rateLabel || "Search live rates",
      address: hotel.address || city,
      city,
      date: hotel.date || safeDate,
      checkoutDate: hotel.checkoutDate || checkoutDate,
      bookingUrl: hotel.bookingUrl || buildBookingSearchUrl(hotel.name, city, safeDate, checkoutDate, adults),
      googleHotelsUrl: hotel.googleHotelsUrl || buildGoogleHotelsUrl(hotel.name, city, safeDate, checkoutDate, adults),
      tripadvisorUrl: hotel.tripadvisorUrl || buildTripadvisorUrl(hotel.name, city),
      mapsUrl: hotel.mapsUrl || buildGoogleMapsSearchUrl(hotel.name, city),
      totalRate: Number(hotel.totalRate || hotel.total || hotel.price || 0),
      currency: hotel.currency || "EUR",
      provider: data.provider || "hotel-search",
      warning: data.warning || "",
    }));
  } catch (error) {
    console.error(error);
    return generateExternalHotelLinks(city, safeDate, checkoutDate, adults, "Hotel search temporarily unavailable");
  }
}

function generateExternalHotelLinks(city, date, checkoutDate = getCheckoutDate(date), adults = Number(appState.planner.people) || 1, warning = "") {
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
    checkoutDate,
    bookingUrl: buildBookingSearchUrl(name, city, date, checkoutDate, adults),
    googleHotelsUrl: buildGoogleHotelsUrl(name, city, date, checkoutDate, adults),
    tripadvisorUrl: buildTripadvisorUrl(name, city),
    mapsUrl: buildGoogleMapsSearchUrl(name, city),
    totalRate: 0,
    currency: "",
    provider: "fallback",
    warning,
  }));
}

function buildBookingSearchUrl(name, city, date, checkoutDate = getCheckoutDate(date), adults = Number(appState.planner.people) || 1) {
  const requestUrl = new URL("https://www.booking.com/searchresults.html");
  requestUrl.searchParams.set("ss", `${name}, ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("group_adults", String(adults));
  requestUrl.searchParams.set("no_rooms", "1");
  requestUrl.searchParams.set("group_children", "0");
  return requestUrl.toString();
}

function buildGoogleHotelsUrl(name, city, date, checkoutDate = getCheckoutDate(date), adults = Number(appState.planner.people) || 1) {
  const requestUrl = new URL("https://www.google.com/travel/hotels");
  requestUrl.searchParams.set("q", `${name} ${city}`);
  requestUrl.searchParams.set("checkin", date);
  requestUrl.searchParams.set("checkout", checkoutDate);
  requestUrl.searchParams.set("adults", String(adults));
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
  return getDateAfterDays(checkinDate, 1);
}

function getDateAfterDays(date, days) {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  parsed.setUTCDate(parsed.getUTCDate() + Math.max(Number(days) || 1, 1));
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

function selectPlaceByCategory(places, preferredCategories, fallbackIndex = 0) {
  const normalizedCategories = preferredCategories.map((category) => category.toLowerCase());
  const matched = normalizedCategories
    .map((category) =>
      places.find((place) => `${place.category || ""} ${place.name || ""} ${place.summary || ""}`.toLowerCase().includes(category)),
    )
    .find(Boolean);

  return matched || places[fallbackIndex % Math.max(places.length, 1)];
}

function createTimedPlaceItem(time, place, fallbackTitle, fallbackDetail) {
  if (!place) {
    return {
      time,
      title: fallbackTitle,
      detail: fallbackDetail,
      mapsUrl: "",
    };
  }

  return {
    time,
    title: place.name,
    detail: `${place.address ? `${place.address}. ` : ""}${place.summary || "Confirmed stop for this route."}`,
    address: place.address || "",
    mapsUrl: place.mapsUrl || buildGoogleMapsSearchUrl(place.name, place.address || ""),
  };
}

function buildDailyPlan(stop, index, priorities, dayCount = 2, startDay = 1, placeOptions = [], hotelOptions = []) {
  const city = stop.city;
  const confirmedPlaces = (placeOptions.length ? placeOptions : generateAttractions(city)).filter((place) => place.name);
  const hotelBase = hotelOptions.find((hotel) => hotel.name) || null;
  const arrivalAnchor = selectPlaceByCategory(confirmedPlaces, ["airport", "station", "transit"], 0);
  const lunchAnchor = selectPlaceByCategory(confirmedPlaces, ["restaurant", "food", "market"], 2);
  const cultureAnchor = selectPlaceByCategory(confirmedPlaces, ["architecture", "sight", "museum"], 1);
  const walkAnchor = selectPlaceByCategory(confirmedPlaces, ["walk", "park", "viewpoint", "scenery", "waterfront"], 3);
  const eveningAnchor = selectPlaceByCategory(confirmedPlaces, ["evening", "viewpoint", "scenery", "park"], 5);
  const transitAnchor = selectPlaceByCategory(confirmedPlaces, ["transit", "metro", "monorail", "station"], 6);
  const hotelDetail = hotelBase
    ? `${hotelBase.name}${hotelBase.address ? `, ${hotelBase.address}` : ""}. Use this as the default stay base unless the user changes hotels.`
    : `Stay base: central ${city}. Use the first confirmed hotel once the user selects one.`;

  const dayTemplates = [
    {
      theme: "arrival and orientation",
      items: [
        createTimedPlaceItem("09:30", arrivalAnchor, "Arrival transfer", `Arrive and transfer toward the stay base. ${hotelDetail}`),
        { time: "11:45", title: "Hotel drop-off and route setup", detail: hotelDetail, mapsUrl: hotelBase?.mapsUrl || "" },
        createTimedPlaceItem("14:00", cultureAnchor, "First confirmed landmark", `Start with a confirmed landmark in ${city}.`),
        createTimedPlaceItem("16:15", lunchAnchor, "Confirmed meal stop", `Use a confirmed restaurant or food hall in ${city}.`),
        createTimedPlaceItem("18:30", eveningAnchor, "Confirmed evening route", `End with a confirmed evening area in ${city}.`),
      ],
    },
    {
      theme: "culture, food, and scenery",
      items: [
        createTimedPlaceItem("09:15", cultureAnchor, "Confirmed museum or cultural anchor", `Use the morning for a high-quality cultural anchor in ${city}.`),
        createTimedPlaceItem("11:30", lunchAnchor, "Confirmed lunch stop", "Lunch is fixed to a named, mappable place."),
        createTimedPlaceItem("13:45", walkAnchor, "Confirmed walking route", `Build the scenic block around ${priorities.join(", ").toLowerCase()}.`),
        createTimedPlaceItem("16:00", transitAnchor, "Transit check point", "Confirm the easiest return or next transfer point."),
        createTimedPlaceItem("18:15", eveningAnchor, "Dinner and evening area", "Dinner follows the confirmed evening route."),
      ],
    },
    {
      theme: "local texture and slower pacing",
      items: [
        createTimedPlaceItem("09:30", walkAnchor, "Confirmed open-air anchor", "Start with a low-friction confirmed area."),
        createTimedPlaceItem("11:45", lunchAnchor, "Confirmed lunch stop", "Lunch is assigned to a named place to reduce user decisions."),
        createTimedPlaceItem("14:00", cultureAnchor, "Confirmed indoor anchor", "Use one indoor stop that still works in poor weather."),
        { time: "16:15", title: "Hotel reset", detail: `Recovery block near stay base. ${hotelDetail}`, mapsUrl: hotelBase?.mapsUrl || "" },
        createTimedPlaceItem("18:30", eveningAnchor, "Short evening route", "Keep the night route short and mappable."),
      ],
    },
    {
      theme: "nature and open-air route",
      items: [
        createTimedPlaceItem("09:15", walkAnchor, "Confirmed outdoor route", "Use the clearest daylight for the outdoor block."),
        createTimedPlaceItem("11:30", lunchAnchor, "Confirmed lunch stop", "Lunch stays near the route to avoid wasted transfers."),
        createTimedPlaceItem("13:45", eveningAnchor, "Confirmed viewpoint", "Leave time for weather, light, and rest."),
        createTimedPlaceItem("16:00", transitAnchor, "Return transit point", "Use this as the route return anchor."),
        { time: "18:15", title: "Dinner near return route", detail: "Dinner is kept close to the return path; update with selected restaurant if user changes hotel.", mapsUrl: transitAnchor?.mapsUrl || "" },
      ],
    },
    {
      theme: "booking and logistics pass",
      items: [
        { time: "09:30", title: "Hotel selection lock", detail: hotelDetail, mapsUrl: hotelBase?.mapsUrl || "" },
        createTimedPlaceItem("11:45", transitAnchor, "Confirmed transit anchor", "Check rail, metro, monorail, or taxi timing."),
        createTimedPlaceItem("14:00", cultureAnchor, "Confirmed final experience", "Use a selected attraction rather than a vague flexible block."),
        createTimedPlaceItem("16:15", lunchAnchor, "Confirmed food stop", "Keep the late afternoon stop practical and mappable."),
        { time: "18:30", title: "Next-day prep", detail: "Keep bags, tickets, route notes, and booking links ready.", mapsUrl: "" },
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

function buildRouteMapUrl(city, hotelOptions = [], placeOptions = []) {
  const hotel = hotelOptions.find((option) => option.address || option.name);
  const anchors = [
    hotel ? `${hotel.name} ${hotel.address || city}` : "",
    ...placeOptions
      .filter((place) => place.address || place.name)
      .slice(0, 6)
      .map((place) => `${place.name} ${place.address || city}`),
    `${city} metro station`,
  ].filter(Boolean);

  if (anchors.length < 2) {
    return `https://www.google.com/maps/search/${encodeURIComponent(`${city} hotels attractions metro station`)}`;
  }

  const origin = anchors[0];
  const destination = anchors[anchors.length - 1];
  const waypoints = anchors.slice(1, -1).join("|");
  const requestUrl = new URL("https://www.google.com/maps/dir/");
  requestUrl.searchParams.set("api", "1");
  requestUrl.searchParams.set("origin", origin);
  requestUrl.searchParams.set("destination", destination);
  if (waypoints) {
    requestUrl.searchParams.set("waypoints", waypoints);
  }
  requestUrl.searchParams.set("travelmode", "transit");
  return requestUrl.toString();
}

function buildExternalFlightSearchUrl(origin, destination) {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`${origin} to ${destination} flights`)}`;
}

function buildSegmentId(from, to, departDate, index = 0) {
  return `${String(from || "from").toLowerCase().replace(/\s+/g, "-")}__${String(to || "to").toLowerCase().replace(/\s+/g, "-")}__${departDate || "date"}__${index + 1}`;
}

function getTransportSegments(stops, initialOrigin = "") {
  const segments = [];

  for (let index = 0; index < stops.length; index += 1) {
    const currentStop = stops[index];
    const from = index === 0 ? initialOrigin : stops[index - 1]?.city;
    if (!from || from === currentStop.city) {
      continue;
    }

    segments.push({
      segmentId: buildSegmentId(from, currentStop.city, currentStop.date, index),
      from,
      to: currentStop.city,
      departDate: currentStop.date,
      isGroundSegment: shouldTreatAsGroundSegment(from, currentStop.city),
    });
  }

  return segments;
}

function shouldTreatAsGroundSegment(from, to) {
  const key = `${String(from || "").trim().toLowerCase()}::${String(to || "").trim().toLowerCase()}`;
  if (GROUND_SEGMENT_HINTS.has(key)) {
    return true;
  }

  const fromCountry = CITY_COUNTRY_MAP[from];
  const toCountry = CITY_COUNTRY_MAP[to];
  if (!fromCountry || !toCountry || fromCountry !== toCountry) {
    return false;
  }

  return ["Japan", "United Kingdom", "Italy", "Germany", "France", "Spain"].includes(fromCountry);
}

function parseBudgetAmount(budgetText) {
  const match = String(budgetText || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function parseMoneyAmount(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }

  if (typeof value === "object" && value) {
    return parseMoneyAmount(value.total || value.amount || value.value);
  }

  const match = String(value || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function inferBudgetCurrency(budgetText, fallbackCurrency = "EUR") {
  const normalized = String(budgetText || "").toUpperCase();
  if (/USD|\$|BUCK|DOLLAR/.test(normalized)) return "USD";
  if (/EUR|EURO|€/.test(normalized)) return "EUR";
  if (/GBP|£/.test(normalized)) return "GBP";
  if (/CNY|RMB|¥/.test(normalized)) return "CNY";
  return fallbackCurrency || "EUR";
}

function getCheapestFlightAmount(flightDecisions = []) {
  const prices = flightDecisions
    .flatMap((segment) => segment.offers || segment.options || [])
    .map((offer) => parseMoneyAmount(offer.price || offer.priceLabel))
    .filter((price) => Number.isFinite(price) && price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

function getCheapestHotelAmount(hotels = []) {
  const prices = hotels
    .flatMap((entry) => entry.options || [])
    .map((hotel) => parseMoneyAmount(hotel.totalRate || hotel.total || hotel.price || hotel.rateLabel))
    .filter((price) => Number.isFinite(price) && price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

function deriveBudgetFeasibility(analysis = {}, plannerState = appState.planner) {
  const budgetAmount = parseBudgetAmount(plannerState.budget);
  const currency = inferBudgetCurrency(plannerState.budget);
  const cheapestFlight = getCheapestFlightAmount(analysis.flightDecisions || deriveFlightDecisions(analysis.flights || [], plannerState.budget, analysis.stops || []));
  const cheapestHotel = getCheapestHotelAmount(analysis.hotels || []);
  const minimumTotal = Math.round((cheapestFlight || 0) + (cheapestHotel || 0));
  const missingParts = [
    cheapestFlight ? "" : "flight",
    cheapestHotel ? "" : "hotel",
  ].filter(Boolean);

  if (!budgetAmount) {
    return {
      status: "unknown_budget",
      budgetAmount: 0,
      currency,
      cheapestFlight,
      cheapestHotel,
      minimumTotal,
      missingParts,
      primaryMessage: "预算未填写，Katris 会继续给出可执行路线，但不会把价格判断成可负担。",
      recommendation: "补充预算后，系统会自动判断航班与住宿是否超过预算。",
    };
  }

  if (!minimumTotal) {
    return {
      status: "insufficient_price_data",
      budgetAmount,
      currency,
      cheapestFlight,
      cheapestHotel,
      minimumTotal,
      missingParts,
      primaryMessage: `预算 ${budgetAmount} ${currency} 已记录，但当前供应商没有返回可比较的航班或酒店价格。`,
      recommendation: "先使用外部查询链接锁定价格，再回到执行单保存确认号。",
    };
  }

  const delta = Math.round(minimumTotal - budgetAmount);
  const status = delta > 0 ? "over_budget" : "within_budget";

  return {
    status,
    budgetAmount,
    currency,
    cheapestFlight,
    cheapestHotel,
    minimumTotal,
    delta,
    missingParts,
    primaryMessage: status === "over_budget"
      ? `当前最低可比成本 ${minimumTotal} ${currency} 已超出预算 ${budgetAmount} ${currency}，至少超出 ${delta} ${currency}。`
      : `当前最低可比成本 ${minimumTotal} ${currency} 在预算 ${budgetAmount} ${currency} 内。`,
    recommendation: status === "over_budget"
      ? "建议默认缩短天数、改住外圈交通便利区域，或把预算上调后再生成最终执行单。"
      : "可以继续选择航班、酒店并生成最终执行单。",
  };
}

function createPlannerSignature(plannerState = appState.planner) {
  return JSON.stringify({
    from: String(plannerState.from || "").trim().toLowerCase(),
    to: String(plannerState.to || "").trim().toLowerCase(),
    date: String(plannerState.date || "").trim(),
    tripLength: String(plannerState.tripLength || "").trim().toLowerCase(),
    people: Number(plannerState.people || 1),
    budget: String(plannerState.budget || "").trim().toLowerCase(),
  });
}

function isAnalysisStaleForPlanner(analysis = appState.analysis, plannerState = appState.planner) {
  if (!analysis?.plannerSignature) {
    return false;
  }

  return analysis.plannerSignature !== createPlannerSignature(plannerState);
}

function invalidateAnalysisIfPlannerChanged(previousSignature, plannerState = appState.planner) {
  if (!appState.analysis?.plannerSignature) {
    return;
  }

  const nextSignature = createPlannerSignature(plannerState);
  if (previousSignature === nextSignature || appState.analysis.plannerSignature === nextSignature) {
    return;
  }

  appState.analysis.isStale = true;
  appState.analysis.staleMessage = "当前推荐已过期，请重新分析后再继续确认。";
  appState.selectedFlights = {};
  appState.bookingChecklist = { items: [] };
  appState.travelAssistant = createDefaultTravelAssistantState();
  appState.analysis.selectedFlights = {};
  appState.analysis.bookingChecklist = appState.bookingChecklist;
  appState.analysis.travelAssistant = appState.travelAssistant;
  appState.analysis.tripEffort = null;
  appState.analysis.recommendedExecutionPath = {
    ...(appState.analysis.recommendedExecutionPath || deriveRecommendedExecutionPath(appState.analysis, plannerState, appState.selectedFlights)),
    status: "stale",
  };
  appState.pdfExport = { lastGeneratedAt: "", wasDraft: false };
  syncTravelAssistantState();
  renderAnalysisResults(appState.analysis);
}

function selectExecutionFlightOffer(segment, selectedFlights = appState.selectedFlights) {
  const selectedOffer = selectedFlights?.[segment.segmentId]?.selectedFlightOffer;
  if (selectedOffer) {
    return selectedOffer;
  }

  return segment.offers?.find((offer) => offer.offerId === segment.recommendedOfferId)
    || segment.offers?.find((offer) => offer.isRecommended)
    || segment.offers?.[0]
    || null;
}

function selectExecutionHotel(entry, plannerState = appState.planner) {
  const options = entry.options || [];
  if (!options.length) {
    return null;
  }

  const stayPreference = plannerState.confirmedPreferences?.stayPreference || appState.preferences?.answers?.stayPreference || "";
  if (stayPreference === "lowest_price") {
    return [...options].sort((a, b) => (parseMoneyAmount(a.totalRate || a.rateLabel) || Number.MAX_SAFE_INTEGER)
      - (parseMoneyAmount(b.totalRate || b.rateLabel) || Number.MAX_SAFE_INTEGER))[0];
  }

  return options.find((hotel) => hotel.bookingUrl || hotel.googleHotelsUrl || hotel.mapsUrl) || options[0];
}

function deriveRecommendedExecutionPath(analysis = {}, plannerState = appState.planner, selectedFlights = appState.selectedFlights) {
  const flightSelections = (analysis.flightDecisions || [])
    .filter((segment) => !segment.isGroundSegment && (segment.offers || []).length)
    .map((segment) => ({
      segmentId: segment.segmentId,
      from: segment.from,
      to: segment.to,
      departDate: segment.departDate,
      provider: formatProviderName(segment.provider),
      selectedOffer: selectExecutionFlightOffer(segment, selectedFlights),
      source: selectedFlights?.[segment.segmentId] ? "user_selected" : "katris_recommended",
    }))
    .filter((selection) => selection.selectedOffer);

  const hotelSelections = (analysis.hotels || [])
    .map((entry) => ({
      city: entry.city,
      hotel: selectExecutionHotel(entry, plannerState),
    }))
    .filter((selection) => selection.hotel);

  const dayAnchors = (analysis.dailyPlans || [])
    .flatMap((entry) => (entry.days || []).flatMap((day) => (day.items || []).map((item) => ({
      city: entry.city,
      day: day.day,
      time: item.time,
      title: item.title,
      detail: item.detail,
      mapsUrl: item.mapsUrl || "",
    }))))
    .filter((item) => item.title && item.time)
    .slice(0, 5);

  const fallbackPlaceAnchors = dayAnchors.length >= 3
    ? []
    : (analysis.attractions || [])
      .flatMap((entry) => (entry.options || []).map((place) => ({
        city: entry.city,
        day: "Route anchor",
        time: "Flexible",
        title: place.name,
        detail: place.address || place.summary || "Verified route anchor.",
        mapsUrl: place.mapsUrl || "",
      })))
      .slice(0, 3 - dayAnchors.length);

  const budgetFeasibility = analysis.budgetFeasibility || deriveBudgetFeasibility(analysis, plannerState);

  return {
    status: isAnalysisStaleForPlanner(analysis, plannerState) || analysis.isStale ? "stale" : "ready",
    title: "推荐执行方案",
    statusLabel: isAnalysisStaleForPlanner(analysis, plannerState) || analysis.isStale ? "已过期，需要重新分析" : "等待确认",
    summary: isAnalysisStaleForPlanner(analysis, plannerState) || analysis.isStale
      ? "行程条件已变化，旧推荐路径已失效。"
      : "系统推荐，尚未完成购买确认。",
    plannerSignature: analysis.plannerSignature || createPlannerSignature(plannerState),
    budgetFeasibility,
    flightSelections,
    hotelSelections,
    dayAnchors: [...dayAnchors, ...fallbackPlaceAnchors].slice(0, 5),
    supplierNote: "航班和酒店最终价格、库存与付款均需在原平台确认/支付。",
  };
}

function resolveRecommendedExecutionPathForRender(analysis = {}, plannerState = appState.planner, selectedFlights = appState.selectedFlights) {
  const path = analysis.recommendedExecutionPath
    ? { ...analysis.recommendedExecutionPath }
    : deriveRecommendedExecutionPath(analysis, plannerState, selectedFlights);

  if (isAnalysisStaleForPlanner(analysis, plannerState) || analysis.isStale) {
    return {
      ...path,
      status: "stale",
      statusLabel: "已过期，需要重新分析",
      summary: "行程条件已变化，旧推荐路径已失效。",
    };
  }

  return path;
}

function normalizeScore(value) {
  return Math.max(1, Math.min(5, Math.round(Number(value) || 0)));
}

function getArrivalSuitability(offer) {
  const hour = getLocalHour(offer.arriveAt);
  if (hour == null) return 3;
  if (hour >= 12 && hour <= 18) return 5;
  if (hour >= 19 && hour <= 21) return 4;
  if (hour >= 9 && hour < 12) return 4;
  if (hour >= 6 && hour < 9) return 3;
  if (hour > 21 && hour <= 23) return 2;
  return 1;
}

function getDepartureEnergy(offer) {
  const hour = getLocalHour(offer.departAt);
  if (hour == null) return 3;
  if (hour >= 8 && hour <= 16) return 5;
  if (hour >= 6 && hour < 8) return 4;
  if (hour > 16 && hour <= 20) return 4;
  if (hour > 20 || hour < 6) return 2;
  return 3;
}

function buildRelativePriceScores(offers, budgetAmount = null) {
  const numericPrices = offers.map((offer) => Number(offer.price || 0)).filter((price) => price > 0);
  const minPrice = numericPrices.length ? Math.min(...numericPrices) : 0;
  const maxPrice = numericPrices.length ? Math.max(...numericPrices) : minPrice;

  return offers.reduce((scores, offer) => {
    const price = Number(offer.price || 0);

    if (budgetAmount) {
      const isInBudget = price <= budgetAmount;
      const distance = budgetAmount ? Math.max((price - budgetAmount) / budgetAmount, 0) : 0;
      scores[offer.offerId] = isInBudget ? 5 : normalizeScore(3 - distance * 6);
      return scores;
    }

    if (!price || maxPrice === minPrice) {
      scores[offer.offerId] = 4;
      return scores;
    }

    const ratio = (price - minPrice) / (maxPrice - minPrice);
    scores[offer.offerId] = normalizeScore(5 - ratio * 4);
    return scores;
  }, {});
}

function scoreFlightOffer(offer, budgetScores) {
  const arrivalSuitability = getArrivalSuitability(offer);
  const departureEnergy = getDepartureEnergy(offer);
  const durationHours = (Number(offer.durationMinutes) || 0) / 60;
  const stopPenalty = Math.min(Number(offer.stops) || 0, 2);
  const lateArrival = getLocalHour(offer.arriveAt) >= 22;

  const timeScore = normalizeScore(arrivalSuitability + (durationHours <= 6 ? 1 : 0) - stopPenalty);
  const energyScore = normalizeScore(departureEnergy + (offer.isRedEye ? -2 : 0) + (stopPenalty === 0 ? 1 : 0));
  const budgetScore = normalizeScore(budgetScores[offer.offerId] || 3);
  const riskScore = normalizeScore(5 - stopPenalty - (offer.isRedEye ? 2 : 0) - (lateArrival ? 1 : 0));
  const comfortScore = normalizeScore(4 + (offer.isRedEye ? -2 : 1) + (stopPenalty === 0 ? 1 : 0) - (lateArrival ? 1 : 0));

  return {
    ...offer,
    arrivalQuality: arrivalSuitability,
    timeScore,
    energyScore,
    budgetScore,
    riskScore,
    comfortScore,
  };
}

function buildRecommendationReason(offer, budgetAmount) {
  const reasons = [];

  if (!offer.isRedEye) {
    reasons.push("avoids a red-eye schedule");
  }
  if (offer.arrivalQuality >= 4) {
    reasons.push("arrives at a usable time for check-in and dinner");
  }
  if ((offer.stops || 0) === 0) {
    reasons.push("keeps the routing direct");
  } else if ((offer.stops || 0) === 1) {
    reasons.push("limits the route to one stop");
  }
  if (budgetAmount && Number(offer.price || 0) <= budgetAmount) {
    reasons.push("still fits the current budget");
  }

  return `推荐理由：${reasons.join("，")}。`;
}

function buildTradeoffReason(offer, budgetAmount) {
  const tradeoffs = [];

  if (offer.isRedEye) {
    tradeoffs.push("overnight timing raises fatigue");
  }
  if ((offer.stops || 0) > 0) {
    tradeoffs.push(`${offer.stopLabel.toLowerCase()} adds connection risk`);
  }
  if (offer.arrivalQuality <= 2) {
    tradeoffs.push("arrival timing compresses the first evening");
  }
  if (budgetAmount && Number(offer.price || 0) > budgetAmount) {
    tradeoffs.push("price is above the current budget");
  }

  return tradeoffs.length ? `权衡点：${tradeoffs.join("；")}。` : "权衡点：这班航班可用，但不是综合最优方案。";
}

function compareRecommendationPriority(a, b, budgetAmount) {
  const aInBudget = budgetAmount ? Number(a.price || 0) <= budgetAmount : true;
  const bInBudget = budgetAmount ? Number(b.price || 0) <= budgetAmount : true;

  return (
    Number(b.isRedEye === false) - Number(a.isRedEye === false)
    || (b.arrivalQuality - a.arrivalQuality)
    || ((a.stops || 0) - (b.stops || 0))
    || ((a.durationMinutes || 0) - (b.durationMinutes || 0))
    || (Number(bInBudget) - Number(aInBudget))
    || (b.riskScore - a.riskScore)
    || (b.comfortScore - a.comfortScore)
    || ((a.price || 0) - (b.price || 0))
  );
}

function selectRecommendedOffer(scoredOffers, budgetAmount) {
  if (!scoredOffers.length) {
    return "";
  }

  const scoredByTotal = [...scoredOffers].sort((a, b) =>
    (b.timeScore + b.energyScore + b.budgetScore + b.riskScore + b.comfortScore)
    - (a.timeScore + a.energyScore + a.budgetScore + a.riskScore + a.comfortScore)
    || compareRecommendationPriority(a, b, budgetAmount),
  );

  const topCandidate = scoredByTotal[0];
  const cheapestOffer = [...scoredOffers].sort((a, b) => (a.price || 0) - (b.price || 0))[0];

  if (
    cheapestOffer
    && cheapestOffer.offerId === topCandidate.offerId
    && (cheapestOffer.isRedEye || (cheapestOffer.stops || 0) > 0 || cheapestOffer.arrivalQuality <= 2)
  ) {
    return scoredByTotal.find((offer) => offer.offerId !== cheapestOffer.offerId && !offer.isRedEye)?.offerId || topCandidate.offerId;
  }

  return topCandidate.offerId;
}

function assignFlightLabels(scoredOffers, recommendedOfferId) {
  if (!scoredOffers.length) {
    return [];
  }

  const cheapestOfferId = [...scoredOffers].sort((a, b) => (a.price || 0) - (b.price || 0))[0]?.offerId;
  const bestTimeOfferId = [...scoredOffers].sort((a, b) => b.timeScore - a.timeScore || compareRecommendationPriority(a, b))[0]?.offerId;
  const bestComfortOfferId = [...scoredOffers].sort((a, b) => b.comfortScore - a.comfortScore || b.energyScore - a.energyScore)[0]?.offerId;

  return scoredOffers.map((offer) => {
    let label = "平衡方案";
    if (offer.offerId === recommendedOfferId) {
      label = "推荐";
    } else if (offer.offerId === cheapestOfferId && (offer.isRedEye || (offer.stops || 0) > 0 || offer.arrivalQuality <= 2)) {
      label = "预算优先";
    } else if (offer.offerId === bestTimeOfferId) {
      label = "时间优先";
    } else if (offer.offerId === bestComfortOfferId) {
      label = "舒适优先";
    }

    return {
      ...offer,
      label,
      isRecommended: offer.offerId === recommendedOfferId,
    };
  });
}

function deriveFlightDecisions(flights, budgetText = "", stops = []) {
  const budgetAmount = parseBudgetAmount(budgetText);
  const transportSegments = stops.length ? getTransportSegments(stops, appState.planner.from) : flights.map((segment, index) => ({
    segmentId: buildSegmentId(segment.origin, segment.destination, segment.date, index),
    from: segment.origin,
    to: segment.destination,
    departDate: segment.date,
    isGroundSegment: false,
  }));

  return transportSegments.map((segment, index) => {
    const rawFlightSegment = flights.find((flight) =>
      flight.origin === segment.from
      && flight.destination === segment.to
      && (flight.date || segment.departDate) === segment.departDate,
    );

    if (segment.isGroundSegment) {
      return {
        ...segment,
        provider: "ground",
        status: "ground",
        message: "Ground transport segment. Rail / Bus / Maps can be connected later.",
        recommendedOfferId: "",
        offers: [],
      };
    }

    const normalizedOffers = (rawFlightSegment?.options || []).map((offer, offerIndex) =>
      normalizeFlightOption(offer, { origin: segment.from, destination: segment.to, date: segment.departDate }, offerIndex),
    );
    const budgetScores = buildRelativePriceScores(normalizedOffers, budgetAmount);
    const scoredOffers = normalizedOffers.map((offer) => scoreFlightOffer(offer, budgetScores));
    const recommendedOfferId = selectRecommendedOffer(scoredOffers, budgetAmount);
    const labeledOffers = assignFlightLabels(scoredOffers, recommendedOfferId).map((offer) => ({
      ...offer,
      recommendationReason: offer.offerId === recommendedOfferId ? buildRecommendationReason(offer, budgetAmount) : "",
      tradeoffReason: buildTradeoffReason(offer, budgetAmount),
    }));

    return {
      segmentId: rawFlightSegment?.segmentId || segment.segmentId || buildSegmentId(segment.from, segment.to, segment.departDate, index),
      from: segment.from,
      to: segment.to,
      departDate: segment.departDate,
      isGroundSegment: false,
      provider: rawFlightSegment?.provider || "external",
      status: rawFlightSegment?.status || "success",
      message: rawFlightSegment?.message || "",
      recommendedOfferId,
      offers: labeledOffers,
    };
  });
}

function getFlightSelectionSummary(flightDecisions, selectedFlights = appState.selectedFlights) {
  const selectableSegments = (flightDecisions || []).filter((segment) => !segment.isGroundSegment);
  const totalCount = selectableSegments.length;
  const selectedCount = selectableSegments.filter((segment) => selectedFlights?.[segment.segmentId]).length;

  return {
    selectedCount,
    totalCount,
    summaryLabel: `已选择航班：${selectedCount} / ${totalCount} 段`,
    warning: selectedCount < totalCount
      ? "仍有未确认航班段，生成最终执行单前需要确认。"
      : "",
  };
}

function parseEffortTravelerProfile(notes = "", pacePreference = "") {
  const normalized = `${notes} ${pacePreference}`.toLowerCase();
  const conservative = /(老人|父母|小孩|亲子|体力差|不想累|轻松|relaxed|parents?|kids?|child|family|tired|easy)/i.test(normalized);
  const highIntensity = /(高强度|多玩|徒步|赶时间|预算优先|high intensity|hiking|rush|budget first)/i.test(normalized);

  return {
    conservative,
    highIntensity,
    prefersRelaxed: /轻松|relaxed|不想累/i.test(normalized),
    budgetFirst: /预算优先|budget first/i.test(normalized),
  };
}

function getSelectedOrRecommendedOffer(segment, selectedFlights = appState.selectedFlights) {
  if (!segment || segment.isGroundSegment) {
    return null;
  }

  return selectedFlights?.[segment.segmentId]?.selectedFlightOffer
    || segment.offers.find((offer) => offer.offerId === segment.recommendedOfferId)
    || segment.offers[0]
    || null;
}

function estimateWalkingAdjustment(day, plannerState, profile) {
  const corpus = day.items.map((item) => `${item.title} ${item.detail}`).join(" ").toLowerCase();
  let delta = 0;

  if (/walk|park|waterfront|market|museum|architecture|beach|scenery/.test(corpus)) {
    delta -= 1;
  }
  if (/hike|trail|mountain|trek|stairs|viewpoint/.test(corpus)) {
    delta -= 2;
  }
  if ((day.items || []).length >= 5) {
    delta -= 1;
  }
  if (profile.prefersRelaxed) {
    delta -= 1;
  }

  return delta;
}

function estimateTransitAdjustment(day, transportSegment, chosenOffer) {
  const corpus = day.items.map((item) => `${item.title} ${item.detail}`).join(" ").toLowerCase();
  let delta = 0;

  if (/arrival transfer|airport|station|transit|transfer/.test(corpus)) {
    delta -= 1;
  }
  if (transportSegment?.isGroundSegment) {
    delta -= 1;
  }
  if (chosenOffer && (chosenOffer.stops || 0) > 0) {
    delta -= Math.min(chosenOffer.stops || 0, 2);
  }

  return delta;
}

function getEffortLevelFromScores(scores) {
  const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
  if (average >= 4) return "轻松";
  if (average >= 3) return "标准";
  return "高强度";
}

function buildEffortSummaryCopy(overall, flaggedDays) {
  const nuance = overall.energyScore >= 3.7
    ? "standard but close to easy"
    : overall.energyScore >= 3.1
      ? "standard with a slightly elevated workload"
      : overall.energyScore >= 2.6
        ? "high but still manageable with pacing control"
        : "high intensity and needs active simplification";
  const flaggedLabel = flaggedDays.length ? flaggedDays.map((day) => day.dayLabel).join(" / ") : "No single day stands out as overloaded";

  return `Overall effort is ${overall.energyLevel}. This route is ${nuance}. Watch ${flaggedLabel}, especially if arrival transfers or walking blocks run long.`;
}

function buildDayAdjustmentSuggestion(dayState, profile) {
  if (profile.conservative) {
    return "Keep one major anchor only, preserve dinner, and leave buffer time for rest or a direct taxi back.";
  }

  if (dayState.energyLevel === "高强度") {
    return "Do not add extra night activities. Reduce one stop or replace a walk-heavy block with a shorter indoor anchor.";
  }

  if (dayState.transitComplexity <= 2) {
    return "Keep the route simple after the main transfer and avoid stacking another timed reservation.";
  }

  return "This day is workable as planned, but keep one flexible slot open in case the first half runs late.";
}

function deriveTripEffort(analysis, plannerState = appState.planner, selectedFlights = appState.selectedFlights) {
  const flightDecisions = analysis.flightDecisions || deriveFlightDecisions(analysis.flights || [], plannerState.budget, analysis.stops || []);
  const profile = parseEffortTravelerProfile(
    plannerState.notes || "",
    plannerState.confirmedPreferences?.pace || appState.preferences?.answers?.pace || "",
  );
  const budgetAmount = parseBudgetAmount(plannerState.budget);
  const days = [];

  (analysis.dailyPlans || []).forEach((entry, entryIndex) => {
    const stop = analysis.stops?.[entryIndex];
    const stopDate = stop?.date || getFallbackTravelDate();
    const incomingSegment = flightDecisions.find((segment) => segment.to === entry.city && segment.departDate === stopDate)
      || flightDecisions.find((segment) => segment.to === entry.city);
    const chosenOffer = getSelectedOrRecommendedOffer(incomingSegment, selectedFlights);

    (entry.days || []).forEach((day, dayIndex) => {
      const date = dayIndex === 0 ? stopDate : getDateAfterDays(stopDate, dayIndex);
      const reasons = [];
      let energyScore = 4;
      let walkingLoad = 4;
      let transitComplexity = 4;
      let budgetPressure = budgetAmount ? 4 : 3;
      let riskLevel = 4;

      if (dayIndex === 0 && incomingSegment?.isGroundSegment) {
        transitComplexity -= 1;
        riskLevel -= 1;
        reasons.push("Ground transport still needs manual confirmation for transfer timing.");
      }

      if (dayIndex === 0 && chosenOffer) {
        const departureHour = getLocalHour(chosenOffer.departAt);
        const arrivalHour = getLocalHour(chosenOffer.arriveAt);

        if (chosenOffer.isRedEye) {
          energyScore -= 2;
          riskLevel -= 2;
          reasons.push("A red-eye arrival raises fatigue on the first day.");
        }
        if (departureHour != null && departureHour <= 7) {
          energyScore -= 1;
          reasons.push("Early departure compresses recovery time.");
        }
        if (arrivalHour != null && arrivalHour >= 22) {
          energyScore -= 1;
          riskLevel -= 1;
          reasons.push("Late arrival increases execution risk for the first evening.");
        }
        if ((chosenOffer.stops || 0) > 0) {
          transitComplexity -= Math.min(chosenOffer.stops || 0, 2);
          energyScore -= 1;
          riskLevel -= 1;
          reasons.push(`${chosenOffer.stopLabel} adds transfer complexity.`);
        }
        if ((chosenOffer.durationMinutes || 0) >= 420) {
          energyScore -= 1;
          reasons.push("Long flight time reduces arrival-day stamina.");
        }
      }

      walkingLoad += estimateWalkingAdjustment(day, plannerState, profile);
      transitComplexity += estimateTransitAdjustment(day, incomingSegment, chosenOffer);

      if ((day.items || []).length >= 5) {
        energyScore -= 1;
        riskLevel -= 1;
        reasons.push("The day stacks several anchors and may feel full by late afternoon.");
      } else if ((day.items || []).length <= 3) {
        reasons.push("The day keeps a lighter number of fixed stops.");
      }

      if (profile.conservative) {
        energyScore -= 1;
        walkingLoad -= 1;
        transitComplexity -= 1;
        reasons.push("The notes suggest older travelers, kids, or a lower-energy preference, so the pacing is scored more conservatively.");
      } else if (profile.highIntensity) {
        reasons.push("The notes accept a faster pace, but fatigue and risk are still surfaced explicitly.");
      }

      if (budgetAmount) {
        const flightSpend = Number(chosenOffer?.price || 0);
        const perFlightRatio = budgetAmount ? flightSpend / budgetAmount : 0;
        if (perFlightRatio >= 0.6) {
          budgetPressure = 2;
          reasons.push("Flight cost takes a large share of the current budget.");
        } else if (perFlightRatio >= 0.35) {
          budgetPressure = 3;
          reasons.push("Flight spend is meaningful enough to tighten the rest of the day.");
        } else {
          budgetPressure = 4;
        }
        if (profile.budgetFirst && budgetPressure <= 3) {
          reasons.push("Budget-first notes make the cost tradeoff more visible.");
        }
      } else {
        reasons.push("Budget pressure still needs confirmation because no trip budget is filled in.");
      }

      energyScore = normalizeScore(energyScore);
      walkingLoad = normalizeScore(walkingLoad);
      transitComplexity = normalizeScore(transitComplexity);
      budgetPressure = normalizeScore(budgetPressure);
      riskLevel = normalizeScore(riskLevel);

      const energyLevel = getEffortLevelFromScores([
        energyScore,
        walkingLoad,
        transitComplexity,
        riskLevel,
      ]);
      const adjustmentSuggestion = buildDayAdjustmentSuggestion(
        {
          energyLevel,
          energyScore,
          transitComplexity,
        },
        profile,
      );

      days.push({
        dayId: `${entry.city}-${day.day}-${date}`.toLowerCase().replace(/\s+/g, "-"),
        dayLabel: day.day,
        date,
        title: day.theme,
        energyLevel,
        energyScore,
        walkingLoad,
        transitComplexity,
        budgetPressure,
        riskLevel,
        reasons,
        adjustmentSuggestion,
      });
    });
  });

  const overall = {
    energyScore: normalizeScore(days.reduce((sum, day) => sum + day.energyScore, 0) / Math.max(days.length, 1)),
    walkingLoad: normalizeScore(days.reduce((sum, day) => sum + day.walkingLoad, 0) / Math.max(days.length, 1)),
    transitComplexity: normalizeScore(days.reduce((sum, day) => sum + day.transitComplexity, 0) / Math.max(days.length, 1)),
    budgetPressure: normalizeScore(days.reduce((sum, day) => sum + day.budgetPressure, 0) / Math.max(days.length, 1)),
    riskLevel: normalizeScore(days.reduce((sum, day) => sum + day.riskLevel, 0) / Math.max(days.length, 1)),
  };
  overall.energyLevel = getEffortLevelFromScores([
    overall.energyScore,
    overall.walkingLoad,
    overall.transitComplexity,
    overall.riskLevel,
  ]);

  const flaggedDays = days.filter((day) => day.energyLevel === "高强度" || day.transitComplexity <= 2 || day.riskLevel <= 2).slice(0, 3);
  overall.summary = buildEffortSummaryCopy(overall, flaggedDays);

  return {
    overall,
    days,
  };
}

function createChecklistItemId(type, suffix) {
  return `${type}--${String(suffix || "item").toLowerCase().replace(/\s+/g, "-")}`;
}

function buildFlightChecklistPurchaseUrl(segment, offer) {
  return offer?.bookingUrl || buildExternalFlightSearchUrl(segment?.from || offer?.from || "", segment?.to || offer?.to || "");
}

function buildFlightChecklistItem(segment, offer, existingItem = null) {
  return {
    itemId: existingItem?.itemId || createChecklistItemId("flight", segment.segmentId),
    type: "flight",
    title: `${segment.from} → ${segment.to}`,
    subtitle: `${offer.airline || offer.carrierCode || "Flight"} · ${offer.flightNumber || offer.carrierCode || "Pending"} · ${offer.departure} – ${offer.arrival}`,
    segmentId: segment.segmentId,
    dayId: "",
    provider: segment.provider || offer.airline || "flight",
    price: String(offer.priceLabel || `${offer.price} ${offer.currency}`),
    currency: offer.currency || "",
    purchaseUrl: buildFlightChecklistPurchaseUrl(segment, offer),
    status: "selected",
    confirmationCode: "",
    notes: offer.label === "Budget priority" ? "Budget-priority flight. Review fatigue and timing tradeoffs before purchase." : "",
  };
}

function buildPlaceholderChecklistItems(existingItems = []) {
  const placeholderSpecs = [
    {
      type: "hotel",
      title: "Hotel booking",
      subtitle: "Hotel recommendations will connect in the next stage via Booking / Trip.com.",
      notes: "Placeholder item for upcoming hotel integration.",
    },
    {
      type: "ticket",
      title: "Main attraction tickets",
      subtitle: "Ticket checklist will be generated after the daily plan becomes more structured.",
      notes: "Placeholder item for future ticket integration.",
    },
    {
      type: "local_transport",
      title: "Local transport / transfers",
      subtitle: "Airport transfer, metro pass, Rail / Bus options will connect later.",
      notes: "Placeholder item for city transport setup.",
    },
  ];

  return placeholderSpecs.map((spec) => {
    const existing = existingItems.find((item) => item.type === spec.type);
    return {
      itemId: existing?.itemId || createChecklistItemId(spec.type, spec.type),
      type: spec.type,
      title: spec.title,
      subtitle: spec.subtitle,
      segmentId: "",
      dayId: "",
      provider: "",
      price: "",
      currency: "",
      purchaseUrl: "",
      status: existing?.status || "not_selected",
      confirmationCode: existing?.confirmationCode || "",
      notes: existing?.notes || spec.notes,
    };
  });
}

function buildHotelChecklistItem(selection, existingItem = null) {
  const hotel = selection.hotel || {};
  return {
    itemId: existingItem?.itemId || createChecklistItemId("hotel", selection.city || hotel.name),
    type: "hotel",
    title: `${selection.city || hotel.city || "Hotel"} stay`,
    subtitle: `${hotel.name || "Recommended hotel"}${hotel.address ? ` · ${hotel.address}` : ""}`,
    segmentId: "",
    dayId: "",
    provider: formatProviderName(hotel.provider || "external"),
    price: hotel.rateLabel || (hotel.totalRate ? `${hotel.totalRate} ${hotel.currency || ""}` : ""),
    currency: hotel.currency || "",
    purchaseUrl: hotel.bookingUrl || hotel.googleHotelsUrl || hotel.mapsUrl || "",
    status: existingItem?.status || "selected",
    confirmationCode: existingItem?.confirmationCode || "",
    notes: "Katris recommended this stay base. Final inventory, taxes, cancellation rules, and payment must be confirmed on the original supplier.",
  };
}

function deriveBookingChecklist(analysis = {}, selectedFlights = appState.selectedFlights, currentChecklist = appState.bookingChecklist) {
  const flightDecisions = analysis.flightDecisions || [];
  const existingItems = currentChecklist?.items || [];
  const flightItems = Object.values(selectedFlights || {}).map((entry) => {
    const segment = flightDecisions.find((item) => item.segmentId === entry.segmentId) || {
      segmentId: entry.segmentId,
      from: entry.from,
      to: entry.to,
      provider: "flight",
    };
    const existingItem = existingItems.find((item) => item.segmentId === entry.segmentId && item.type === "flight");
    return buildFlightChecklistItem(segment, entry.selectedFlightOffer, existingItem);
  });
  const recommendedExecutionPath = analysis.recommendedExecutionPath || deriveRecommendedExecutionPath(analysis, appState.planner, selectedFlights);
  const hotelItems = (recommendedExecutionPath.hotelSelections || []).map((selection) => {
    const existingItem = existingItems.find((item) => item.type === "hotel" && item.title === `${selection.city || selection.hotel?.city || "Hotel"} stay`);
    return buildHotelChecklistItem(selection, existingItem);
  });

  return {
    items: [
      ...flightItems,
      ...hotelItems,
      ...buildPlaceholderChecklistItems(existingItems).filter((item) => item.type !== "hotel" || !hotelItems.length),
    ],
  };
}

function getBookingChecklistSummary(bookingChecklist = appState.bookingChecklist) {
  const items = bookingChecklist?.items || [];
  const totalCount = items.length;
  const confirmedCount = items.filter((item) => item.status === "confirmed").length;
  const needsChangeCount = items.filter((item) => item.status === "needs_change").length;
  const pendingCount = totalCount - confirmedCount;

  return {
    totalCount,
    confirmedCount,
    pendingCount,
    needsChangeCount,
  };
}

function updateBookingChecklistItemStatus(bookingChecklist, itemId, nextStatus) {
  return {
    items: (bookingChecklist?.items || []).map((item) =>
      item.itemId === itemId
        ? {
          ...item,
          status: nextStatus,
        }
        : item),
  };
}

function setBookingChecklistConfirmationCode(bookingChecklist, itemId, confirmationCode) {
  const trimmedCode = String(confirmationCode || "").trim();
  return {
    items: (bookingChecklist?.items || []).map((item) =>
      item.itemId === itemId
        ? {
          ...item,
          confirmationCode: trimmedCode,
          status: trimmedCode ? "confirmed" : item.status,
        }
        : item),
  };
}

function renderBookingChecklistSection(bookingChecklist = appState.bookingChecklist) {
  const items = bookingChecklist?.items || [];
  if (!items.length) {
    return '<p class="analysis-empty">预订清单会在行程分析完成后显示。</p>';
  }

  const summary = getBookingChecklistSummary(bookingChecklist);
  return `
    <div class="booking-section-head">
      <strong>预订清单</strong>
      <p>用这份清单把已选方案推进到已购买、已确认的可执行状态。</p>
    </div>
    <div class="booking-summary-card">
      <strong>已确认：${summary.confirmedCount} / ${summary.totalCount} 项</strong>
      <p>仍需处理：${summary.pendingCount} 项</p>
      ${summary.needsChangeCount ? "<p>有项目需要重新选择。</p>" : ""}
    </div>
    <div class="booking-pdf-actions">
      <button class="analysis-link booking-action-button" type="button" data-generate-final-pdf>生成最终旅行执行单</button>
    </div>
    <div class="booking-checklist-grid">
      ${items.map((item) => renderBookingChecklistItem(item)).join("")}
    </div>
  `;
}

function renderBookingChecklistItem(item) {
  return `
    <article class="booking-item-card">
      <div class="booking-item-head">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.subtitle || item.notes || "预订项目")}</p>
        </div>
        <span class="flight-badge">${escapeHtml(formatBookingStatusLabel(item.status))}</span>
      </div>
      <p class="booking-item-meta">${escapeHtml([item.price, item.provider].filter(Boolean).join(" · ") || item.notes || "等待选择")}</p>
      <div class="booking-item-actions">
        ${item.purchaseUrl ? `<a class="analysis-link" href="${escapeHtml(item.purchaseUrl)}" target="_blank" rel="noreferrer">打开购买链接</a>` : ""}
        <button class="analysis-link booking-action-button" type="button" data-booking-action="purchased" data-booking-item-id="${escapeHtml(item.itemId)}">我已购买</button>
        <button class="analysis-link booking-action-button" type="button" data-booking-action="needs_change" data-booking-item-id="${escapeHtml(item.itemId)}">需要重选</button>
      </div>
      <div class="booking-item-confirm">
        <label>
          <span>确认号</span>
          <input type="text" value="${escapeHtml(item.confirmationCode || "")}" data-booking-confirmation-input="${escapeHtml(item.itemId)}" placeholder="ABC123" />
        </label>
        <button class="analysis-link booking-action-button" type="button" data-booking-action="save_confirmation" data-booking-item-id="${escapeHtml(item.itemId)}">保存确认号</button>
      </div>
    </article>
  `;
}

function formatBookingStatusLabel(status) {
  const labels = {
    not_selected: "未选择",
    selected: "已选择",
    purchased: "已购买",
    confirmed: "已确认",
    needs_change: "需要重选",
  };
  return labels[status] || status || "未选择";
}

function getTravelAssistantModeLabel(mode) {
  const labels = {
    off: "关闭",
    important: "重要提醒",
    standard: "标准提醒",
  };
  return labels[mode] || "重要提醒";
}

function buildTravelAssistantMessageId(type, key) {
  return `${type}:${key}`;
}

function formatTravelAssistantPriorityLabel(priority) {
  const labels = {
    low: "低",
    medium: "中",
    high: "高",
  };
  return labels[priority] || "中";
}

function createTravelAssistantMessage({
  messageId,
  type,
  title,
  body,
  relatedDayId = "",
  relatedSegmentId = "",
  priority = "medium",
}) {
  return {
    messageId,
    type,
    title,
    body,
    relatedDayId,
    relatedSegmentId,
    priority,
    status: "active",
    createdAt: "",
  };
}

function deriveTravelAssistantMessages({
  planner = appState.planner,
  analysis = appState.analysis,
  selectedFlights = appState.selectedFlights,
  bookingChecklist = appState.bookingChecklist,
} = {}) {
  const messages = [];
  const tripEffort = analysis?.tripEffort || null;
  const dailyPlans = analysis?.dailyPlans || [];
  const recommendedExecutionPath = analysis?.recommendedExecutionPath || (analysis ? deriveRecommendedExecutionPath(analysis, planner, selectedFlights) : null);
  const travelerProfile = parseEffortTravelerProfile(planner?.notes || "", planner?.confirmedPreferences?.pace || appState.preferences?.answers?.pace || "");
  const pushMessage = (message) => {
    if (!message?.messageId || messages.some((item) => item.messageId === message.messageId)) {
      return;
    }
    messages.push(message);
  };

  if (recommendedExecutionPath?.status === "stale") {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("warning", "stale-route"),
      type: "warning",
      title: "旧推荐路径已失效",
      body: "行程条件已变化，旧推荐路径已失效。请重新分析后再继续确认或购买。",
      priority: "high",
    }));
  } else if (recommendedExecutionPath) {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("reminder", "recommended-path-pending"),
      type: "reminder",
      title: "推荐路径等待确认",
      body: "系统已给出推荐执行方案，但这些项目仍需你确认或购买后才算完成。",
      priority: "medium",
    }));
  }

  Object.values(selectedFlights || {}).forEach((entry) => {
    const offer = entry?.selectedFlightOffer;
    if (!offer) {
      return;
    }

    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("flight", `${entry.segmentId}:airport`),
      type: "flight",
      title: `航班提醒：${entry.from} → ${entry.to}`,
      body: `建议至少提前 3 小时到达机场。请确认证件、登机信息、托运行李和出发时间。${offer.departure ? ` 当前出发时间为 ${offer.departure}。` : ""}`,
      relatedSegmentId: entry.segmentId,
      priority: "high",
    }));

    if (offer.isRedEye) {
      pushMessage(createTravelAssistantMessage({
        messageId: buildTravelAssistantMessageId("warning", `${entry.segmentId}:red-eye`),
        type: "warning",
        title: `红眼航班体力提醒：${entry.from} → ${entry.to}`,
        body: "你选择的是红眼航班。抵达当天建议降低行程强度，优先安排入住、休息和轻量晚餐。",
        relatedSegmentId: entry.segmentId,
        priority: "high",
      }));
    }

    if ((offer.stops || 0) > 0 || Number(offer.riskScore || 0) <= 2) {
      pushMessage(createTravelAssistantMessage({
        messageId: buildTravelAssistantMessageId("warning", `${entry.segmentId}:connection`),
        type: "warning",
        title: `转机与行程风险提醒：${entry.from} → ${entry.to}`,
        body: `当前航班为${offer.stopLabel || `${offer.stops} 次转机`}，建议预留更充足的换乘和落地缓冲时间，避免当天继续追加紧凑行程。`,
        relatedSegmentId: entry.segmentId,
        priority: "high",
      }));
    }
  });

  const checklistItems = bookingChecklist?.items || [];
  const notSelectedItems = checklistItems.filter((item) => item.status === "not_selected");
  const needsChangeItems = checklistItems.filter((item) => item.status === "needs_change");
  const confirmedItems = checklistItems.filter((item) => item.status === "confirmed");

  if (notSelectedItems.length) {
    const pendingTypes = [...new Set(notSelectedItems.map((item) => item.type))].join(" / ");
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("booking", "pending"),
      type: "booking",
      title: "预订待确认提醒",
      body: `仍有未选择项目：${pendingTypes || "酒店 / 门票 / 城市交通"}。生成正式执行单前建议完成确认。`,
      priority: "high",
    }));
  }

  if (needsChangeItems.length) {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("warning", "needs-change"),
      type: "warning",
      title: "预订需要重选",
      body: "有项目被标记为需要重选，请不要直接按当前执行单出发。",
      priority: "high",
    }));
  }

  if (confirmedItems.length) {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("booking", "confirmed"),
      type: "booking",
      title: "已确认项目提醒",
      body: "已确认项目可用于最终执行单，请同时保存电子版和纸质版确认信息。",
      priority: "medium",
    }));
  }

  if (tripEffort?.days?.length) {
    tripEffort.days
      .filter((day) => day.energyLevel === "高强度" || Number(day.riskLevel || 0) <= 2)
      .forEach((day) => {
        pushMessage(createTravelAssistantMessage({
          messageId: buildTravelAssistantMessageId("effort", day.dayId || day.dayLabel),
          type: "effort",
          title: `${day.dayLabel} 强度提醒`,
          body: `${day.dayLabel} 行程强度较高，建议减少临时加点，保留交通和休息缓冲。`,
          relatedDayId: day.dayId || day.dayLabel,
          priority: "high",
        }));
      });
  }

  if (travelerProfile.conservative) {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("reminder", "conservative-profile"),
      type: "reminder",
      title: "体力敏感同行提醒",
      body: "同行成员对体力更敏感，建议优先保留休息时间，不要追加夜间活动。",
      priority: "medium",
    }));
  }

  dailyPlans.forEach((entry) => {
    (entry.days || []).forEach((day, dayIndex) => {
      const dayId = `${entry.city}-${day.day || dayIndex + 1}`;
      const primaryItem = day.items?.[0];
      const body = dayIndex === 0
        ? "请优先完成抵达、入住和第一餐安排。当天不建议追加大型景点。"
        : `请优先完成 ${primaryItem?.title || "当天核心安排"}，并为交通与休息保留缓冲。`;

      pushMessage(createTravelAssistantMessage({
        messageId: buildTravelAssistantMessageId("daily", dayId),
        type: "daily",
        title: `${day.day || `Day ${dayIndex + 1}`} 今日重点`,
        body,
        relatedDayId: dayId,
        priority: dayIndex === 0 ? "medium" : "low",
      }));
    });
  });

  if (!messages.length && analysis) {
    pushMessage(createTravelAssistantMessage({
      messageId: buildTravelAssistantMessageId("reminder", "fallback"),
      type: "reminder",
      title: "旅行中助手已准备",
      body: "当前还没有需要优先提醒的节点。确认航班、预订和每日安排后，这里会同步生成执行提醒。",
      priority: "medium",
    }));
  }

  return messages;
}

function deriveTravelAssistantState(
  analysis = appState.analysis,
  planner = appState.planner,
  selectedFlights = appState.selectedFlights,
  bookingChecklist = appState.bookingChecklist,
  currentState = appState.travelAssistant,
) {
  const previousMessages = new Map((currentState?.messages || []).map((message) => [message.messageId, message]));
  const nextMessages = deriveTravelAssistantMessages({
    planner,
    analysis,
    selectedFlights,
    bookingChecklist,
  }).map((message) => {
    const previous = previousMessages.get(message.messageId);
    return {
      ...message,
      status: previous?.status === "dismissed" ? "dismissed" : "active",
      createdAt: previous?.createdAt || new Date().toISOString(),
    };
  });

  return {
    enabled: Boolean(currentState?.enabled),
    mode: currentState?.mode || "important",
    messages: nextMessages,
  };
}

function getVisibleTravelAssistantMessages(travelAssistant = appState.travelAssistant) {
  const activeMessages = (travelAssistant?.messages || []).filter((message) => message.status !== "dismissed");
  if (!travelAssistant?.enabled || travelAssistant?.mode === "off") {
    return [];
  }
  if (travelAssistant.mode === "important") {
    return activeMessages.filter((message) => message.priority === "high");
  }
  return activeMessages.filter((message) => message.priority !== "low" || activeMessages.length <= 4);
}

function syncTravelAssistantState() {
  appState.travelAssistant = deriveTravelAssistantState(
    appState.analysis,
    appState.planner,
    appState.selectedFlights,
    appState.bookingChecklist,
    appState.travelAssistant,
  );
  if (appState.analysis) {
    appState.analysis.travelAssistant = appState.travelAssistant;
  }
}

function setTravelAssistantMode(mode) {
  if (mode === "off") {
    appState.travelAssistant = {
      ...appState.travelAssistant,
      enabled: false,
      mode: "off",
    };
  } else {
    appState.travelAssistant = {
      ...appState.travelAssistant,
      enabled: true,
      mode,
    };
  }

  syncTravelAssistantState();
  if (appState.analysis) {
    renderAnalysisResults(appState.analysis);
  }
  renderAssistantSyncSummary();
}

function dismissTravelAssistantMessage(messageId) {
  appState.travelAssistant = {
    ...appState.travelAssistant,
    messages: (appState.travelAssistant.messages || []).map((message) =>
      message.messageId === messageId
        ? {
          ...message,
          status: "dismissed",
        }
        : message),
  };
  if (appState.analysis) {
    appState.analysis.travelAssistant = appState.travelAssistant;
    renderAnalysisResults(appState.analysis);
  }
  renderAssistantSyncSummary();
}

function renderTravelAssistantSection(travelAssistant = appState.travelAssistant) {
  const visibleMessages = getVisibleTravelAssistantMessages(travelAssistant);
  const totalActive = (travelAssistant?.messages || []).filter((message) => message.status !== "dismissed").length;

  return `
    <div class="travel-assistant-section">
      <div class="travel-assistant-head">
        <div>
          <strong>旅行中助手</strong>
          <p>${travelAssistant?.enabled ? `当前模式：${getTravelAssistantModeLabel(travelAssistant.mode)}` : "旅行中助手已关闭。你可以随时重新开启提醒。"}</p>
        </div>
        <span class="flight-badge">${escapeHtml(getTravelAssistantModeLabel(travelAssistant?.enabled ? travelAssistant.mode : "off"))}</span>
      </div>
      <div class="travel-assistant-controls">
        ${travelAssistant?.enabled ? "" : '<button class="analysis-link booking-action-button" type="button" data-travel-assistant-action="enable">开启旅行中助手</button>'}
        <button class="analysis-link booking-action-button" type="button" data-travel-assistant-action="important">只看重要提醒</button>
        <button class="analysis-link booking-action-button" type="button" data-travel-assistant-action="standard">标准提醒</button>
        <button class="analysis-link booking-action-button" type="button" data-travel-assistant-action="off">关闭提醒</button>
      </div>
      ${travelAssistant?.enabled
        ? `
          <div class="travel-assistant-summary-card">
            <strong>当前可见提醒：${visibleMessages.length}</strong>
            <p>全部活跃提醒：${totalActive}</p>
          </div>
          <div class="travel-assistant-message-list">
            ${visibleMessages.length
              ? visibleMessages.map((message) => renderTravelAssistantMessageCard(message)).join("")
              : '<p class="analysis-empty">当前模式下没有需要展示的提醒。</p>'}
          </div>
        `
        : '<p class="analysis-empty">旅行中助手已关闭。开启后会根据航班、预订状态、每日行程和旅行消耗力自动生成网页内提醒。</p>'}
    </div>
  `;
}

function renderTravelAssistantMessageCard(message) {
  return `
    <article class="travel-assistant-message-card" data-travel-assistant-message="${escapeHtml(message.messageId)}">
      <div class="travel-assistant-message-head">
        <div>
          <strong>${escapeHtml(message.title)}</strong>
          <p>${escapeHtml(message.body)}</p>
        </div>
        <div class="travel-assistant-message-meta">
          <span class="flight-badge">${escapeHtml(formatTravelAssistantPriorityLabel(message.priority))}</span>
          <button class="analysis-link booking-action-button" type="button" data-travel-assistant-action="dismiss" data-travel-assistant-message-id="${escapeHtml(message.messageId)}">忽略此提醒</button>
        </div>
      </div>
    </article>
  `;
}

function getUnselectedFlightSegments(analysis = appState.analysis, selectedFlights = appState.selectedFlights) {
  const selectableSegments = (analysis?.flightDecisions || []).filter((segment) => !segment.isGroundSegment);
  return selectableSegments.filter((segment) => !selectedFlights?.[segment.segmentId]);
}

function getExecutionPlanDraftStatus(
  analysis = appState.analysis,
  selectedFlights = appState.selectedFlights,
  bookingChecklist = appState.bookingChecklist,
) {
  const unselectedFlightSegments = getUnselectedFlightSegments(analysis, selectedFlights);
  const checklistItems = bookingChecklist?.items || [];
  const hasNotSelected = checklistItems.some((item) => item.status === "not_selected");
  const hasNeedsChange = checklistItems.some((item) => item.status === "needs_change");
  const reasons = [];

  if (unselectedFlightSegments.length) {
    reasons.push("There are still unconfirmed flight segments.");
  }
  if (hasNotSelected) {
    reasons.push("Some booking checklist items are still not selected.");
  }
  if (hasNeedsChange) {
    reasons.push("Some booking checklist items need re-selection.");
  }

  return {
    isDraft: Boolean(unselectedFlightSegments.length || hasNotSelected || hasNeedsChange),
    unselectedFlightSegments,
    hasNotSelected,
    hasNeedsChange,
    reasons,
  };
}

function formatBookingStatusForPdf(status) {
  const labels = {
    not_selected: "未选择",
    selected: "已选择",
    purchased: "已购买",
    confirmed: "已确认",
    needs_change: "需要重选",
  };
  return labels[status] || status || "未选择";
}

function escapePrintMultiline(value) {
  return formatMessageContent(value || "");
}

function renderSelectedFlightsForPrint(analysis, selectedFlights) {
  const selectableSegments = (analysis?.flightDecisions || []).filter((segment) => !segment.isGroundSegment);
  if (!selectableSegments.length) {
    return "<p>当前路线没有需要确认的飞行航段。</p>";
  }

  return selectableSegments.map((segment) => {
    const selected = selectedFlights?.[segment.segmentId]?.selectedFlightOffer;
    if (!selected) {
      return `
        <article class="print-card">
          <h3>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</h3>
          <p><strong>仍有未确认航班段</strong></p>
        </article>
      `;
    }

    return `
      <article class="print-card">
        <h3>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</h3>
        <p>航段 ID：${escapeHtml(segment.segmentId)}</p>
        <p>${escapeHtml(selected.airline)} · ${escapeHtml(selected.flightNumber || selected.carrierCode || "")}</p>
        <p>${escapeHtml(selected.departure)} → ${escapeHtml(selected.arrival)} · ${escapeHtml(selected.duration)} · ${escapeHtml(selected.stopLabel)}</p>
        <p>${escapeHtml(selected.priceLabel || `${selected.price} ${selected.currency}`)} · ${selected.isRedEye ? "红眼航班" : "非红眼航班"}</p>
      </article>
    `;
  }).join("");
}

function renderBookingChecklistForPrint(bookingChecklist) {
  const items = bookingChecklist?.items || [];
  if (!items.length) {
    return "<p>当前没有可用的预订清单项目。</p>";
  }

  return items.map((item) => `
    <article class="print-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>类型：${escapeHtml(item.type)}</p>
      <p>${escapeHtml(item.subtitle || "")}</p>
      <p>状态：${escapeHtml(formatBookingStatusForPdf(item.status))}</p>
      <p>${escapeHtml([item.price, item.provider].filter(Boolean).join(" · ") || "暂无价格或来源记录")}</p>
      <p>确认号：${escapeHtml(item.confirmationCode || "-")}</p>
      <p>备注：${escapeHtml(item.notes || "-")}</p>
    </article>
  `).join("");
}

function renderRecommendedExecutionPathForPrint(path) {
  if (!path) {
    return "<p>当前没有可用的推荐执行方案。</p>";
  }

  const flightLines = path.flightSelections?.length
    ? path.flightSelections.map((selection) => `
      <li>${escapeHtml(selection.from)} → ${escapeHtml(selection.to)} · ${escapeHtml(selection.selectedOffer?.airline || selection.selectedOffer?.carrierCode || "推荐航班")} · ${escapeHtml(selection.selectedOffer?.departure || "-")} → ${escapeHtml(selection.selectedOffer?.arrival || "-")} · ${escapeHtml(selection.selectedOffer?.priceLabel || `${selection.selectedOffer?.price || ""} ${selection.selectedOffer?.currency || ""}`)}</li>
    `).join("")
    : "<li>当前没有可自动生成的推荐航班。</li>";
  const hotelLines = path.hotelSelections?.length
    ? path.hotelSelections.map((selection) => `
      <li>${escapeHtml(selection.city || selection.hotel?.city || "酒店")} · ${escapeHtml(selection.hotel?.name || "推荐酒店")}${selection.hotel?.address ? ` · ${escapeHtml(selection.hotel.address)}` : ""}</li>
    `).join("")
    : "<li>当前没有可自动生成的推荐酒店。</li>";
  const anchorLines = path.dayAnchors?.length
    ? path.dayAnchors.map((anchor) => `
      <li>${escapeHtml([anchor.day, anchor.time, anchor.title].filter(Boolean).join(" · "))}</li>
    `).join("")
    : "<li>当前没有可自动生成的路线锚点。</li>";

  return `
    <article class="print-card">
      <h3>推荐执行方案</h3>
      <p>状态：${escapeHtml(path.statusLabel || (path.status === "stale" ? "已过期，需要重新分析" : "等待确认"))}</p>
      <p>${escapeHtml(path.summary || "系统推荐，尚未完成购买确认。")}</p>
      <p>${escapeHtml(path.supplierNote || "航班和酒店最终价格、库存与付款均需在原平台确认/支付。")}</p>
      <p><strong>推荐航班</strong></p>
      <ul>${flightLines}</ul>
      <p><strong>推荐酒店</strong></p>
      <ul>${hotelLines}</ul>
      <p><strong>路线锚点</strong></p>
      <ul>${anchorLines}</ul>
    </article>
  `;
}

function renderTripEffortForPrint(tripEffort) {
  if (!tripEffort?.overall) {
    return "<p>当前没有可用的旅行消耗力分析。</p>";
  }

  return `
    <article class="print-card">
      <h3>整体概览</h3>
      <p>${escapeHtml(tripEffort.overall.energyLevel)}</p>
      <p>${escapeHtml(tripEffort.overall.summary)}</p>
      <p>体力消耗 ${tripEffort.overall.energyScore}/5 · 步行负担 ${tripEffort.overall.walkingLoad}/5 · 交通复杂度 ${tripEffort.overall.transitComplexity}/5 · 预算压力 ${tripEffort.overall.budgetPressure}/5 · 风险力 ${tripEffort.overall.riskLevel}/5（分数越高代表风险越低）</p>
    </article>
    ${tripEffort.days.map((day) => `
      <article class="print-card">
        <h3>${escapeHtml(day.dayLabel)} · ${escapeHtml(day.title)}</h3>
        <p>${escapeHtml(day.date)} · ${escapeHtml(day.energyLevel)}</p>
        <p>体力消耗 ${day.energyScore}/5 · 步行负担 ${day.walkingLoad}/5 · 交通复杂度 ${day.transitComplexity}/5 · 预算压力 ${day.budgetPressure}/5 · 风险力 ${day.riskLevel}/5</p>
        <p>原因：</p>
        <ul>${day.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
        <p>调整建议：${escapeHtml(day.adjustmentSuggestion)}</p>
      </article>
    `).join("")}
  `;
}

function renderDailyPlanForPrint(dailyPlans) {
  if (!(dailyPlans || []).length) {
    return "<p>当前没有可用的每日行程。</p>";
  }

  return dailyPlans.map((entry) => `
    <article class="print-card">
      <h3>${escapeHtml(entry.city)}</h3>
      ${entry.days.map((day) => `
        <div class="print-day-block">
          <strong>${escapeHtml(day.day)} · ${escapeHtml(day.theme)}</strong>
          <ul>
            ${day.items.map((item) => `<li>${escapeHtml(item.time)} · <strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.detail)}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </article>
  `).join("");
}

function renderImportantRemindersForPrint(draftStatus) {
  return `
    <article class="print-card">
      <h3>重要提醒</h3>
      <ul>
        <li>请提前确认护照、签证、身份证件</li>
        <li>请提前确认航班时间和登机口</li>
        <li>请提前确认酒店入住时间</li>
        <li>请保存电子与纸质确认单</li>
        <li>所有价格和营业时间以实际平台为准</li>
        <li>若行程中存在 needs_change 项，请不要直接出发，需重新确认</li>
      </ul>
      ${draftStatus.isDraft ? `<p><strong>草稿说明：</strong>${escapeHtml(draftStatus.reasons.join(" "))}</p>` : ""}
    </article>
  `;
}

function renderFinalTravelPrintDocument({
  planner = appState.planner,
  analysis = appState.analysis,
  selectedFlights = appState.selectedFlights,
  bookingChecklist = appState.bookingChecklist,
  draftStatus = getExecutionPlanDraftStatus(analysis, selectedFlights, bookingChecklist),
} = {}) {
  const generatedDate = new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  const recommendedExecutionPath = resolveRecommendedExecutionPathForRender(analysis, planner, selectedFlights);

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>最终旅行执行单</title>
        <style>
          :root { color-scheme: light; }
          body {
            margin: 0;
            padding: 24px;
            background: #ffffff;
            color: #111111;
            font-family: Georgia, "Times New Roman", serif;
            line-height: 1.55;
          }
          main { max-width: 860px; margin: 0 auto; }
          h1, h2, h3 { margin: 0 0 10px; color: #111111; }
          h1 { font-size: 28px; }
          h2 {
            margin-top: 28px;
            padding-top: 10px;
            border-top: 1px solid #cccccc;
            font-size: 20px;
          }
          h3 { font-size: 16px; }
          p, li { font-size: 13px; }
          .draft-flag {
            display: inline-block;
            margin-bottom: 12px;
            padding: 6px 10px;
            border: 1px solid #000000;
            font-weight: 700;
          }
          .cover-grid,
          .print-card {
            margin-bottom: 14px;
            padding: 12px;
            border: 1px solid #d5d5d5;
            background: #ffffff;
          }
          .print-day-block { margin-top: 10px; }
          ul { margin: 8px 0 0 18px; padding: 0; }
          @page { size: A4 portrait; margin: 14mm; }
          @media print {
            body { padding: 0; }
            button, input, textarea, nav, .no-print { display: none !important; }
            .print-card, .cover-grid { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <main>
          <section>
            <p>Katris Merrio AI Trip Studio</p>
            <h1>Final Travel Execution Plan</h1>
            ${draftStatus.isDraft ? '<div class="draft-flag">草稿 / Draft</div>' : ""}
            <div class="cover-grid">
              <p>出发地：${escapeHtml(planner.from || "-")}</p>
              <p>目的地：${escapeHtml(planner.to || "-")}</p>
              <p>出发日期：${escapeHtml(planner.date || "-")}</p>
              <p>人数：${escapeHtml(planner.people || "-")}</p>
              <p>预算：${escapeHtml(planner.budget || "-")}</p>
              <p>生成日期：${escapeHtml(generatedDate)}</p>
            </div>
          </section>

          <section>
            <h2>每日行程</h2>
            ${renderDailyPlanForPrint(analysis?.dailyPlans || [])}
          </section>

          <section>
            <h2>推荐执行方案</h2>
            ${renderRecommendedExecutionPathForPrint(recommendedExecutionPath)}
          </section>

          <section>
            <h2>已选择航班</h2>
            ${renderSelectedFlightsForPrint(analysis, selectedFlights)}
          </section>

          <section>
            <h2>预订清单</h2>
            ${renderBookingChecklistForPrint(bookingChecklist)}
          </section>

          <section>
            <h2>旅行消耗力分析</h2>
            ${renderTripEffortForPrint(analysis?.tripEffort)}
          </section>

          <section>
            <h2>重要提醒</h2>
            ${renderImportantRemindersForPrint(draftStatus)}
          </section>
        </main>
      </body>
    </html>
  `;
}

function renderAssistantPdfSummary(isDraft = appState.pdfExport.wasDraft, generatedAt = appState.pdfExport.lastGeneratedAt) {
  if (!generatedAt && !isDraft) {
    return "";
  }

  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">执行单同步</p>
      <h3>最终旅行执行单已生成。</h3>
      <p>${isDraft ? "该执行单仍为草稿 / Draft，因为还有未确认的预订项目。" : "该执行单已生成，当前没有草稿级阻断项。"}</p>
      ${generatedAt ? `<p>生成时间：${escapeHtml(generatedAt)}</p>` : ""}
    </div>
  `;
}

function generateFinalTravelPdf() {
  if (!appState.analysis) {
    return;
  }

  const draftStatus = getExecutionPlanDraftStatus(appState.analysis, appState.selectedFlights, appState.bookingChecklist);
  if (draftStatus.isDraft) {
    const shouldContinue = window.confirm(
      "当前执行单仍有未确认项目，将标记为 Draft。\n\n未确认项目可能包括：\n- 未选择航班段\n- 未确认酒店 / 门票 / 城市交通\n- 有项目被标记为需要重选\n\n你仍然可以生成 Draft PDF，但出发前需要回到页面完成确认。\n\n是否继续生成？",
    );
    if (!shouldContinue) {
      return;
    }
  }

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");
  if (!printWindow) {
    return;
  }

  const html = renderFinalTravelPrintDocument({
    planner: appState.planner,
    analysis: appState.analysis,
    selectedFlights: appState.selectedFlights,
    bookingChecklist: appState.bookingChecklist,
    draftStatus,
  });

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener("load", () => {
    printWindow.focus();
    printWindow.print();
  });

  appState.pdfExport = {
    lastGeneratedAt: new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    wasDraft: draftStatus.isDraft,
  };
  renderAssistantSyncSummary();
}

function chooseFlightForSegment(segmentId, offerId) {
  if (!appState.analysis?.flightDecisions) {
    return;
  }

  const segment = appState.analysis.flightDecisions.find((entry) => entry.segmentId === segmentId);
  const offer = segment?.offers?.find((entry) => entry.offerId === offerId);

  if (!segment || !offer) {
    return;
  }

  appState.selectedFlights = {
    ...appState.selectedFlights,
    [segmentId]: {
      segmentId,
      from: segment.from,
      to: segment.to,
      departDate: segment.departDate,
      selectedFlightOffer: offer,
    },
  };

  appState.analysis.selectedFlights = appState.selectedFlights;
  appState.analysis.tripEffort = deriveTripEffort(appState.analysis, appState.planner, appState.selectedFlights);
  appState.analysis.recommendedExecutionPath = deriveRecommendedExecutionPath(appState.analysis, appState.planner, appState.selectedFlights);
  appState.bookingChecklist = deriveBookingChecklist(appState.analysis, appState.selectedFlights, appState.bookingChecklist);
  appState.analysis.bookingChecklist = appState.bookingChecklist;
  syncTravelAssistantState();
  renderAnalysisResults(appState.analysis);
  renderAssistantThread();
  renderAssistantSyncSummary();
  saveTripStateToStorage("flight_selected");
}

function handleAnalysisResultClick(event) {
  const button = event.target.closest("[data-select-flight-segment][data-select-flight-offer]");
  if (button) {
    chooseFlightForSegment(button.dataset.selectFlightSegment, button.dataset.selectFlightOffer);
    return;
  }

  const travelAssistantButton = event.target.closest("[data-travel-assistant-action]");
  if (travelAssistantButton) {
    const { travelAssistantAction, travelAssistantMessageId } = travelAssistantButton.dataset;
    if (travelAssistantAction === "enable") {
      setTravelAssistantMode("important");
    } else if (travelAssistantAction === "off") {
      setTravelAssistantMode("off");
    } else if (travelAssistantAction === "important" || travelAssistantAction === "standard") {
      setTravelAssistantMode(travelAssistantAction);
    } else if (travelAssistantAction === "dismiss" && travelAssistantMessageId) {
      dismissTravelAssistantMessage(travelAssistantMessageId);
    }
    return;
  }

  const bookingButton = event.target.closest("[data-booking-action][data-booking-item-id]");
  const pdfButton = event.target.closest("[data-generate-final-pdf]");
  if (pdfButton) {
    generateFinalTravelPdf();
    return;
  }
  if (!bookingButton) {
    return;
  }

  const { bookingAction, bookingItemId } = bookingButton.dataset;
  if (bookingAction === "purchased") {
    appState.bookingChecklist = updateBookingChecklistItemStatus(appState.bookingChecklist, bookingItemId, "purchased");
  } else if (bookingAction === "needs_change") {
    appState.bookingChecklist = updateBookingChecklistItemStatus(appState.bookingChecklist, bookingItemId, "needs_change");
  } else if (bookingAction === "save_confirmation") {
    const input = document.querySelector(`[data-booking-confirmation-input="${bookingItemId}"]`);
    appState.bookingChecklist = setBookingChecklistConfirmationCode(appState.bookingChecklist, bookingItemId, input?.value || "");
  }

  if (appState.analysis) {
    appState.analysis.bookingChecklist = appState.bookingChecklist;
    syncTravelAssistantState();
    renderAnalysisResults(appState.analysis);
    renderAssistantSyncSummary();
    saveTripStateToStorage("booking_checklist");
  }
}

function handleAnalysisResultInput(event) {
  const input = event.target.closest("[data-booking-confirmation-input]");
  if (!input) {
    return;
  }

  appState.bookingChecklist = {
    items: (appState.bookingChecklist.items || []).map((item) =>
      item.itemId === input.dataset.bookingConfirmationInput
        ? {
          ...item,
          confirmationCode: input.value,
        }
        : item),
  };

  if (appState.analysis) {
    appState.analysis.bookingChecklist = appState.bookingChecklist;
    saveTripStateToStorage("booking_confirmation_input");
  }
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
    const stopDayCount = getStopDayCount(totalDays, normalizedStops.length, index);
    const checkoutDate = getDateAfterDays(stop.date, stopDayCount);
    const hotelOptions = await searchHotels(stop.city, stop.date, checkoutDate, Number(appState.planner.people) || 1);
    const attractionOptions = await searchAttractions(stop.city);
    const dayPlanOptions = buildDailyPlan(stop, index, appState.planner.pillars, stopDayCount, dayCursor, attractionOptions, hotelOptions);
    const transportLinks = {
      ...generateTransportLinks(stop.city),
      routeMap: buildRouteMapUrl(stop.city, hotelOptions, attractionOptions),
    };
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

  result.plannerSignature = createPlannerSignature(appState.planner);
  result.flightDecisions = deriveFlightDecisions(result.flights, appState.planner.budget, normalizedStops);
  result.selectedFlights = appState.selectedFlights;
  result.tripEffort = deriveTripEffort(result, appState.planner, appState.selectedFlights);
  result.budgetFeasibility = deriveBudgetFeasibility(result, appState.planner);
  result.recommendedExecutionPath = deriveRecommendedExecutionPath(result, appState.planner, appState.selectedFlights);
  appState.bookingChecklist = deriveBookingChecklist(result, appState.selectedFlights, appState.bookingChecklist);
  result.bookingChecklist = appState.bookingChecklist;
  appState.travelAssistant = deriveTravelAssistantState(result, appState.planner, appState.selectedFlights, appState.bookingChecklist, appState.travelAssistant);
  result.travelAssistant = appState.travelAssistant;
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

function renderOperationsMonitor() {
  const monitor = document.getElementById("ops-monitor");
  if (!monitor) {
    return;
  }

  const analysis = appState.analysis;
  const saveStatus = formatSaveStatus(appState.savedState);
  const routeStatus = analysis?.error
    ? "Plan needs another generation attempt"
    : analysis
      ? "Plan generated and ready to review"
      : "Waiting for route input";
  const flightStatuses = analysis?.flights?.length
    ? analysis.flights.map((flight) => formatProviderName(flight.provider || flight.status || "external")).join(", ")
    : "No flight segment generated yet";
  const hotelCount = analysis?.hotels?.reduce((total, entry) => total + (entry.options?.length || 0), 0) || 0;
  const placeCount = analysis?.attractions?.reduce((total, entry) => total + (entry.options?.length || 0), 0) || 0;
  const lastSaved = appState.savedState?.savedAt ? formatStorageTime(appState.savedState.savedAt) : "Not saved yet";

  monitor.innerHTML = `
    <p class="eyebrow">Operations status</p>
    <h3>${escapeHtml(routeStatus)}</h3>
    <div class="ops-monitor-grid">
      <article>
        <span>Local save</span>
        <strong>${escapeHtml(saveStatus)}</strong>
        <p>${escapeHtml(lastSaved)}</p>
      </article>
      <article>
        <span>Flights</span>
        <strong>${escapeHtml(flightStatuses)}</strong>
        <p>Displayed offers can be selected in Katris; final purchase remains with the airline or travel provider.</p>
      </article>
      <article>
        <span>Hotels</span>
        <strong>${hotelCount ? `${hotelCount} station recommendations` : "Waiting for plan"}</strong>
        <p>Katris recommends stays and sends users to the original platform to confirm inventory, terms, and payment.</p>
      </article>
      <article>
        <span>Places</span>
        <strong>${placeCount ? `${placeCount} mapped anchors` : "Waiting for plan"}</strong>
        <p>Places and map links are used as itinerary anchors, not paid inventory.</p>
      </article>
    </div>
  `;
}

function formatSaveStatus(savedState = {}) {
  if (savedState.status === "saved") {
    return "Saved in this browser";
  }
  if (savedState.status === "restored") {
    return "Restored after refresh";
  }
  if (savedState.status === "cleared") {
    return "Cleared";
  }
  if (savedState.status === "error") {
    return savedState.error ? `Save issue: ${savedState.error}` : "Save issue";
  }
  return "Not saved yet";
}

function formatStorageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderAnalysisResults(result) {
  const container = document.getElementById("analysis-results");

  if (!result) {
    container.innerHTML = '<p class="analysis-empty">Analyze an itinerary to see flights, hotels, transport, and summary.</p>';
    renderOperationsMonitor();
    return;
  }

  if (result.error) {
    container.innerHTML = `<p class="analysis-empty">${escapeHtml(result.error)}</p>`;
    renderOperationsMonitor();
    return;
  }

  const summaryList = result.stops
    .map((stop) => `<li><strong>${escapeHtml(stop.city)}</strong><span>${escapeHtml(stop.date || "Date flexible")}</span></li>`)
    .join("");
  const budgetFeasibility = result.budgetFeasibility || deriveBudgetFeasibility(result, appState.planner);
  const recommendedExecutionPath = resolveRecommendedExecutionPathForRender(result, appState.planner, appState.selectedFlights);
  const staleBanner = result.isStale
    ? `<p class="analysis-empty execution-stale">${escapeHtml(result.staleMessage || "当前推荐已过期，请重新分析后再继续确认。")}</p>`
    : "";

  const flightDecisions = result.flightDecisions || deriveFlightDecisions(result.flights || [], appState.planner.budget, result.stops || []);
  const flightsMarkup = flightDecisions.length
    ? `
      ${renderFlightSelectionStatus(getFlightSelectionSummary(flightDecisions, appState.selectedFlights))}
      ${flightDecisions.map((segment) => renderFlightDecisionBlock(segment)).join("")}
    `
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
                    <p>${escapeHtml(hotel.rating)} · ${escapeHtml(hotel.date)}${hotel.checkoutDate ? ` → ${escapeHtml(hotel.checkoutDate)}` : ""}${hotel.address ? ` · ${escapeHtml(hotel.address)}` : ""}${hotel.warning ? ` · ${escapeHtml(hotel.warning)}` : ""}</p>
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
                            <p><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.detail)}${item.mapsUrl ? ` <a class="analysis-link" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noreferrer">Map</a>` : ""}</p>
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

  const tripEffortMarkup = renderTripEffortSection(
    result.tripEffort || deriveTripEffort(result, appState.planner, appState.selectedFlights),
  );
  const bookingChecklistMarkup = renderBookingChecklistSection(
    result.bookingChecklist || deriveBookingChecklist(result, appState.selectedFlights, appState.bookingChecklist),
  );
  const travelAssistantMarkup = renderTravelAssistantSection(
    result.travelAssistant || deriveTravelAssistantState(result, appState.planner, appState.selectedFlights, result.bookingChecklist || appState.bookingChecklist, appState.travelAssistant),
  );

  const transportMarkup = result.transport
    .map(
      (entry) => `
        <div class="analysis-block">
          <h5>${escapeHtml(entry.city)}</h5>
          <div class="transport-links">
            <a href="${escapeHtml(entry.links.metro)}" target="_blank" rel="noreferrer">Metro</a>
            <a href="${escapeHtml(entry.links.uber)}" target="_blank" rel="noreferrer">Uber</a>
            <a href="${escapeHtml(entry.links.train)}" target="_blank" rel="noreferrer">Train</a>
            ${entry.links.routeMap ? `<a href="${escapeHtml(entry.links.routeMap)}" target="_blank" rel="noreferrer">Route map</a>` : ""}
          </div>
        </div>
      `,
    )
    .join("");

  container.innerHTML = `
    <section class="analysis-section">
      <h4>Summary</h4>
      ${staleBanner}
      <p>${escapeHtml(result.summary)}</p>
      <ul class="summary-stops">${summaryList}</ul>
      ${renderBudgetFeasibilityCard(budgetFeasibility)}
      ${renderRecommendedExecutionPath(recommendedExecutionPath)}
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
      <h4>每日行程</h4>
      ${dailyPlansMarkup}
    </section>
    <section class="analysis-section">
      <h4>旅行消耗力分析</h4>
      ${tripEffortMarkup}
    </section>
    <section class="analysis-section">
      <h4>预订清单</h4>
      ${bookingChecklistMarkup}
    </section>
    <section class="analysis-section">
      <h4>旅行中助手</h4>
      ${travelAssistantMarkup}
    </section>
    <section class="analysis-section">
      <h4>Transport</h4>
      ${transportMarkup}
    </section>
  `;

  renderAssistantSyncSummary();
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

  const providerLabel = formatDataStatus(segment.provider, "success", segment.message || "");

  return `<p class="analysis-empty">${escapeHtml(providerLabel)}</p>`;
}

function renderBudgetFeasibilityCard(feasibility) {
  if (!feasibility) {
    return "";
  }

  const statusLabels = {
    over_budget: "预算压力",
    within_budget: "预算可行",
    unknown_budget: "预算待确认",
    insufficient_price_data: "价格数据不足",
  };
  const statusLabel = statusLabels[feasibility.status] || "预算状态";
  const cardClass = feasibility.status === "over_budget" ? " is-warning" : "";
  const parts = [
    feasibility.cheapestFlight ? `最低航班：${Math.round(feasibility.cheapestFlight)} ${feasibility.currency}` : "",
    feasibility.cheapestHotel ? `最低住宿：${Math.round(feasibility.cheapestHotel)} ${feasibility.currency}` : "",
    feasibility.minimumTotal ? `最低可比总额：${feasibility.minimumTotal} ${feasibility.currency}` : "",
    feasibility.budgetAmount ? `预算：${feasibility.budgetAmount} ${feasibility.currency}` : "",
  ].filter(Boolean);

  return `
    <aside class="budget-feasibility-card${cardClass}">
      <div>
        <p class="eyebrow">Budget check</p>
        <h5>${escapeHtml(statusLabel)}</h5>
      </div>
      <p>${escapeHtml(feasibility.primaryMessage)}</p>
      <p>${escapeHtml(feasibility.recommendation)}</p>
      ${parts.length ? `<ul>${parts.map((part) => `<li>${escapeHtml(part)}</li>`).join("")}</ul>` : ""}
    </aside>
  `;
  renderOperationsMonitor();
}

function renderRecommendedExecutionPath(path) {
  if (!path) {
    return "";
  }

  const staleNotice = path.status === "stale"
    ? '<p class="execution-stale">这份推荐方案已过期。你修改了路线、日期、人数或预算，请重新分析后再购买。</p>'
    : "";
  const flightItems = path.flightSelections.length
    ? path.flightSelections.map((selection) => `
      <li>
        <strong>${escapeHtml(selection.from)} → ${escapeHtml(selection.to)}</strong>
        <span>${escapeHtml(selection.selectedOffer.airline || selection.selectedOffer.carrierCode || "Recommended flight")} · ${escapeHtml(selection.selectedOffer.departure || "-")} – ${escapeHtml(selection.selectedOffer.arrival || "-")} · ${escapeHtml(selection.selectedOffer.priceLabel || `${selection.selectedOffer.price || ""} ${selection.selectedOffer.currency || ""}`)}</span>
      </li>
    `).join("")
    : "<li><strong>航班</strong><span>当前路线没有可自动选择的航班，使用外部查询链接确认。</span></li>";
  const hotelItems = path.hotelSelections.length
    ? path.hotelSelections.map((selection) => `
      <li>
        <strong>${escapeHtml(selection.city)}</strong>
        <span>${escapeHtml(selection.hotel.name)}${selection.hotel.address ? ` · ${escapeHtml(selection.hotel.address)}` : ""} · ${escapeHtml(selection.hotel.rateLabel || "原平台确认价格")}</span>
      </li>
    `).join("")
    : "<li><strong>酒店</strong><span>当前没有可自动选择的酒店，使用原平台查询确认。</span></li>";
  const anchorItems = path.dayAnchors.length
    ? path.dayAnchors.map((anchor) => `
      <li>
        <strong>${escapeHtml([anchor.day, anchor.time].filter(Boolean).join(" · "))}</strong>
        <span>${escapeHtml(anchor.title)}${anchor.detail ? ` · ${escapeHtml(anchor.detail)}` : ""}${anchor.mapsUrl ? ` <a class="analysis-link" href="${escapeHtml(anchor.mapsUrl)}" target="_blank" rel="noreferrer">Map</a>` : ""}</span>
      </li>
    `).join("")
    : "<li><strong>每日锚点</strong><span>行程锚点会在地点数据返回后自动生成。</span></li>";

  return `
    <aside class="recommended-execution-card">
      <div class="recommended-execution-head">
        <div>
          <p class="eyebrow">推荐执行方案</p>
          <h5>${escapeHtml(path.title || "推荐执行方案")}</h5>
        </div>
        <span>${escapeHtml(path.statusLabel || (path.status === "stale" ? "已过期，需要重新分析" : "等待确认"))}</span>
      </div>
      ${staleNotice}
      <p>${escapeHtml(path.summary || "系统推荐，尚未完成购买确认。")}</p>
      <p>${escapeHtml(path.supplierNote || "航班和酒店最终价格、库存与付款均需在原平台确认/支付。")}</p>
      <div class="recommended-execution-grid">
        <section>
          <strong>推荐航班</strong>
          <ul>${flightItems}</ul>
        </section>
        <section>
          <strong>推荐酒店</strong>
          <ul>${hotelItems}</ul>
        </section>
        <section>
          <strong>今日路线锚点</strong>
          <ul>${anchorItems}</ul>
        </section>
      </div>
    </aside>
  `;
}

function renderFlightSelectionStatus(summary) {
  return `
    <div class="flight-selection-status">
      <div>
        <strong>${escapeHtml(summary.summaryLabel)}</strong>
        <p>${escapeHtml(summary.warning || "所有需要飞行的航段都已确认。")}</p>
      </div>
    </div>
  `;
}

function renderFlightDecisionBlock(segment) {
  if (segment.isGroundSegment) {
    return `
      <div class="analysis-block">
        <h5>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</h5>
        <p class="analysis-empty">${escapeHtml(segment.message || "Ground transport segment. Rail / Bus / Maps can be connected later.")}</p>
      </div>
    `;
  }

  if (!segment.offers.length) {
    return `
      <div class="analysis-block">
        <h5>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</h5>
        ${renderProviderNotice({ provider: segment.provider, message: segment.message })}
        <p class="analysis-empty">${escapeHtml(segment.message || "No live flight offers returned for this route/date.")}</p>
        <a class="analysis-link" href="${escapeHtml(buildExternalFlightSearchUrl(segment.from, segment.to))}" target="_blank" rel="noreferrer">Search externally</a>
      </div>
    `;
  }

  return `
    <div class="analysis-block">
      <h5>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</h5>
      ${renderProviderNotice({ provider: segment.provider, message: segment.message })}
      <p class="analysis-empty flight-segment-meta">${escapeHtml(segment.departDate || "Date flexible")} · ${escapeHtml(segment.status || "success")}</p>
      <div class="flight-decision-grid">
        ${segment.offers.map((offer) => renderFlightDecisionCard(segment, offer)).join("")}
      </div>
    </div>
  `;
}

function renderFlightDecisionCard(segment, offer) {
  const selectedOffer = appState.selectedFlights?.[segment.segmentId]?.selectedFlightOffer;
  const isSelected = selectedOffer?.offerId === offer.offerId;
  const budgetAmount = parseBudgetAmount(appState.planner.budget);
  const riskText = offer.riskScore >= 4 ? "风险较低" : offer.riskScore <= 2 ? "风险较高" : "风险中等";

  return `
    <article class="flight-card${isSelected ? " is-selected" : ""}">
      <div class="flight-card-head">
        <div>
          <div class="flight-badges">
            <span class="flight-badge${offer.isRecommended ? " is-recommended" : ""}">${escapeHtml(offer.label)}</span>
            ${isSelected ? '<span class="flight-badge is-selected">已选择</span>' : ""}
          </div>
          <strong>${escapeHtml(offer.airline)}</strong>
          <p>${escapeHtml(offer.flightNumber || offer.carrierCode || "航班信息待补充")}</p>
        </div>
        <span class="flight-price">${escapeHtml(offer.priceLabel || `${offer.price} ${offer.currency}`)}</span>
      </div>
      <div class="flight-route-line">
        <strong>${escapeHtml(offer.from)} → ${escapeHtml(offer.to)}</strong>
        <p>${escapeHtml(offer.departure)} · ${escapeHtml(offer.arrival)} · ${escapeHtml(offer.duration)} · ${escapeHtml(offer.stopLabel)} · ${offer.isRedEye ? "红眼航班" : "日间航班"}</p>
      </div>
      <div class="flight-force-grid">
        ${renderFlightForceItem("时间力", offer.timeScore)}
        ${renderFlightForceItem("体力", offer.energyScore)}
        ${renderFlightForceItem("预算力", offer.budgetScore)}
        ${renderFlightForceItem("风险力", offer.riskScore)}
        ${renderFlightForceItem("舒适力", offer.comfortScore)}
      </div>
      <p class="flight-card-copy"><strong>${offer.isRecommended ? "推荐理由：" : "亮点："}</strong> ${escapeHtml(String(offer.recommendationReason || buildRecommendationReason(offer, budgetAmount)).replace(/^推荐理由：/i, ""))}</p>
      <p class="flight-card-copy"><strong>权衡点：</strong> ${escapeHtml(String(offer.tradeoffReason || buildTradeoffReason(offer, budgetAmount)).replace(/^Tradeoff:\s*/i, "").replace(/^权衡点：/i, ""))}</p>
      <p class="flight-card-note">风险说明：${escapeHtml(riskText)}。</p>
      <div class="flight-card-actions">
        ${offer.bookingUrl ? `<a class="analysis-link" href="${escapeHtml(offer.bookingUrl)}" target="_blank" rel="noreferrer">打开票价链接</a>` : ""}
        <button class="analysis-link flight-select-button" type="button" data-select-flight-segment="${escapeHtml(segment.segmentId)}" data-select-flight-offer="${escapeHtml(offer.offerId)}">${isSelected ? "已选择" : "选择此航班"}</button>
      </div>
    </article>
  `;
}

function renderFlightForceItem(label, score) {
  const safeScore = Math.max(1, Math.min(5, Number(score) || 1));
  return `
    <div class="flight-force-item">
      <span>${escapeHtml(label)}</span>
      <strong>${"★".repeat(safeScore)}${"☆".repeat(5 - safeScore)}</strong>
    </div>
  `;
}

function renderTripEffortSection(tripEffort) {
  if (!tripEffort?.overall || !tripEffort?.days?.length) {
    return appState.analysis?.isStale
      ? '<p class="analysis-empty">当前行程条件已变化，旧旅行消耗力分析已失效，请重新分析。</p>'
      : '<p class="analysis-empty">旅行消耗力分析会在行程分析完成后显示。</p>';
  }

  return `
    <div class="trip-effort-overview">
      <div class="trip-effort-overview-head">
        <strong>整体强度：${escapeHtml(tripEffort.overall.energyLevel)}</strong>
        <p>${escapeHtml(tripEffort.overall.summary)}</p>
      </div>
      <div class="trip-effort-score-grid">
        ${renderTripEffortScore("体力消耗", tripEffort.overall.energyScore)}
        ${renderTripEffortScore("步行负担", tripEffort.overall.walkingLoad)}
        ${renderTripEffortScore("交通复杂度", tripEffort.overall.transitComplexity)}
        ${renderTripEffortScore("预算压力", tripEffort.overall.budgetPressure)}
        ${renderTripEffortScore("风险力", tripEffort.overall.riskLevel, "分数越高代表风险越低")}
      </div>
    </div>
    <div class="trip-effort-day-list">
      ${tripEffort.days.map((day) => renderTripEffortDayCard(day)).join("")}
    </div>
  `;
}

function renderTripEffortScore(label, score, helper = "") {
  const safeScore = Math.max(1, Math.min(5, Number(score) || 1));
  return `
    <div class="trip-effort-score-item">
      <span>${escapeHtml(label)}</span>
      <strong>${"★".repeat(safeScore)}${"☆".repeat(5 - safeScore)}</strong>
      ${helper ? `<p>${escapeHtml(helper)}</p>` : ""}
    </div>
  `;
}

function renderTripEffortDayCard(day) {
  return `
    <article class="trip-effort-day-card">
      <div class="trip-effort-day-head">
        <div>
          <strong>${escapeHtml(day.dayLabel)} · ${escapeHtml(day.title)}</strong>
          <p>${escapeHtml(day.date)}</p>
        </div>
        <span class="flight-badge">${escapeHtml(day.energyLevel)}</span>
      </div>
      <div class="trip-effort-score-grid">
        ${renderTripEffortScore("体力消耗", day.energyScore)}
        ${renderTripEffortScore("步行负担", day.walkingLoad)}
        ${renderTripEffortScore("交通复杂度", day.transitComplexity)}
        ${renderTripEffortScore("预算压力", day.budgetPressure)}
        ${renderTripEffortScore("风险力", day.riskLevel, "分数越高代表风险越低")}
      </div>
      <div class="trip-effort-copy">
        <p><strong>原因：</strong></p>
        <ul>
          ${day.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
        </ul>
        <p><strong>调整建议：</strong>${escapeHtml(day.adjustmentSuggestion)}</p>
      </div>
    </article>
  `;
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
    syncPlannerStateFromForm();
    applyAssistantPromptToPlanner(value);
    syncPlannerFormFromState();
    renderPlannerPreview();

    ensureDefaultPreferenceAnswers();
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
  appState.selectedFlights = {};
  appState.bookingChecklist = { items: [] };
  appState.travelAssistant = createDefaultTravelAssistantState();
  appState.pdfExport = { lastGeneratedAt: "", wasDraft: false };
  const analysis = await analyzeTripPlan(buildAssistantItineraryText(userMessage));
  appState.analysis = analysis;
  renderAnalysisResults(analysis);
  setKatrisView("trip");

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

function renderFlightOptionItems(segment) {
  const options = segment.options || [];

  if (!options.length) {
    return `<a class="analysis-link" href="${escapeHtml(buildExternalFlightSearchUrl(segment.origin, segment.destination))}" target="_blank" rel="noreferrer">Search externally</a>`;
  }

  return options
    .map(
      (flight) => `
        <article class="analysis-item">
          <div>
            <strong>${escapeHtml(flight.airline)}</strong>
            <p>${escapeHtml(flight.departure)} – ${escapeHtml(flight.arrival)} · ${escapeHtml(flight.date)}</p>
          </div>
          <span>${escapeHtml(flight.priceLabel || `${flight.price} ${flight.currency}`)}</span>
          ${flight.bookingUrl ? `<a class="analysis-link" href="${escapeHtml(flight.bookingUrl)}" target="_blank" rel="noreferrer">Select fare</a>` : ""}
        </article>
      `,
    )
    .join("");
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
    confirmedPreferences: {
      ...DEFAULT_PREFERENCE_ANSWERS,
      ...appState.preferences.answers,
    },
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
    warning: response.provider === "fallback" && response.warning
      ? "Live AI is temporarily unavailable. Katris prepared a structured plan from the current trip data."
      : "",
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
    openrouter: "实时 AI 规划",
    mistral: "实时 AI 规划",
    groq: "实时 AI 规划",
    gemini: "实时 AI 规划",
    fallback: "结构化备用规划",
  };
  const providerText = providerLabels[provider] || "结构化规划";
  const sections = formatAiSections(plan.uiSections);

  if (sections) {
    return `${plan.title || "Travel plan"} (${providerText}).\n${plan.summary || ""}\n\n${sections}`;
  }

  return `${plan.title || "Travel plan"} (${providerText}). ${plan.summary || ""} ${citySummaries}. ${bookingNotes}`;
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
      ${renderAssistantFlights(analysis.flightDecisions || deriveFlightDecisions(analysis.flights || [], appState.planner.budget, analysis.stops || []), appState.selectedFlights)}
      ${renderAssistantHotels(analysis.hotels || [])}
      ${renderAssistantAttractions(analysis.attractions || [])}
      ${renderAssistantRouteMaps(analysis.transport || [])}
    </div>
  `;
}

function renderAssistantRouteMaps(transport) {
  const routes = transport.filter((entry) => entry.links?.routeMap);

  if (!routes.length) {
    return "";
  }

  return `
    <section class="assistant-booking-card">
      <h4>Route map</h4>
      ${routes
        .map(
          (entry) => `
            <article class="assistant-mini-item">
              <div>
                <strong>${escapeHtml(entry.city)}</strong>
                <p>Hotel, selected places, and transit anchor in one Google Maps route.</p>
              </div>
              <a href="${escapeHtml(entry.links.routeMap)}" target="_blank" rel="noreferrer">Open route</a>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function renderAssistantFlights(flightDecisions, selectedFlights = appState.selectedFlights) {
  const segments = flightDecisions.length ? flightDecisions : [];
  if (!segments.length) {
    return `<section class="assistant-booking-card"><h4>Flights</h4><p>No flight segment was required or origin is still missing.</p></section>`;
  }

  return `
    <section class="assistant-booking-card">
      <h4>Flights</h4>
      ${segments
        .map((segment) => {
          if (segment.isGroundSegment) {
            return `
              <div class="assistant-provider-row">
                <strong>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</strong>
                <span>地面交通段</span>
              </div>
              <p>${escapeHtml(segment.message || "地面交通段，后续可接入 Rail / Bus / Maps 方案。")}</p>
            `;
          }

          const selectedOffer = selectedFlights?.[segment.segmentId]?.selectedFlightOffer || null;
          const recommendedOffer = segment.offers.find((offer) => offer.offerId === segment.recommendedOfferId) || segment.offers[0];
          return `
            <div class="assistant-provider-row">
              <strong>${escapeHtml(segment.from)} → ${escapeHtml(segment.to)}</strong>
              <span>${escapeHtml(formatDataStatus(segment.provider, segment.status, segment.message))}</span>
            </div>
            ${recommendedOffer
              ? `
                <article class="assistant-mini-item">
                  <div>
                    <strong>${escapeHtml(selectedOffer ? `${selectedOffer.airline} · ${selectedOffer.flightNumber || selectedOffer.carrierCode}` : `${recommendedOffer.airline} · ${recommendedOffer.flightNumber || recommendedOffer.carrierCode}`)}</strong>
                    <p>${escapeHtml(selectedOffer ? `${selectedOffer.departure} – ${selectedOffer.arrival} · ${selectedOffer.priceLabel || `${selectedOffer.price} ${selectedOffer.currency}`}` : `${recommendedOffer.departure} – ${recommendedOffer.arrival} · ${recommendedOffer.priceLabel || `${recommendedOffer.price} ${recommendedOffer.currency}`}`)}</p>
                    <p>${escapeHtml(selectedOffer ? "你已选择该航班，下一步可确认酒店或生成执行单。" : recommendedOffer.recommendationReason || "推荐航班已在主结果区准备好。")}</p>
                    <p>${escapeHtml(selectedOffer ? `五力摘要：时间力 ${selectedOffer.timeScore}/5，体力 ${selectedOffer.energyScore}/5，预算力 ${selectedOffer.budgetScore}/5，风险力 ${selectedOffer.riskScore}/5，舒适力 ${selectedOffer.comfortScore}/5。` : `五力摘要：时间力 ${recommendedOffer.timeScore}/5，体力 ${recommendedOffer.energyScore}/5，预算力 ${recommendedOffer.budgetScore}/5，风险力 ${recommendedOffer.riskScore}/5，舒适力 ${recommendedOffer.comfortScore}/5。`)}</p>
                    ${selectedOffer ? "" : '<p>请前往主结果区点击“选择此航班”。</p>'}
                  </div>
                </article>
              `
              : `<p>${escapeHtml(segment.message || "当前没有返回可用航班，可改日期、改路线或使用外部搜索。")}</p>`}
          `;
        })
        .join("")}
    </section>
  `;
}

function renderAssistantSyncSummary() {
  const container = document.getElementById("assistant-flight-summary");
  if (!container) {
    return;
  }

  if (!appState.analysis?.flightDecisions?.length) {
    container.innerHTML = `
      <div class="preview-card assistant-sync-card">
        <p class="eyebrow">航班同步摘要</p>
        <h3>推荐航班会显示在这里。</h3>
        <p>先完成一次行程分析，Katris 会在这里同步每个航段的推荐摘要，不额外堆叠聊天消息。</p>
      </div>
      <div class="preview-card assistant-sync-card">
        <p class="eyebrow">消耗力同步摘要</p>
        <h3>旅行消耗力摘要会显示在这里。</h3>
        <p>行程分析完成后，Katris 会同步整体强度、高负荷日期和调整建议。</p>
      </div>
      <div class="preview-card assistant-sync-card">
        <p class="eyebrow">旅行中助手</p>
        <h3>旅行中提醒会显示在这里。</h3>
        <p>开启后会根据航班、预订状态、每日行程和旅行消耗力同步当前执行提醒。</p>
      </div>
    `;
    return;
  }

  const summary = getFlightSelectionSummary(appState.analysis.flightDecisions, appState.selectedFlights);
  const tripEffort = appState.analysis.tripEffort || deriveTripEffort(appState.analysis, appState.planner, appState.selectedFlights);
  const budgetFeasibility = appState.analysis.budgetFeasibility || deriveBudgetFeasibility(appState.analysis, appState.planner);
  const recommendedExecutionPath = resolveRecommendedExecutionPathForRender(appState.analysis, appState.planner, appState.selectedFlights);
  const bookingChecklist = appState.analysis.bookingChecklist || deriveBookingChecklist(appState.analysis, appState.selectedFlights, appState.bookingChecklist);

  container.innerHTML = `
    ${renderAssistantExecutionSummary(recommendedExecutionPath)}
    ${renderAssistantBudgetSummary(budgetFeasibility)}
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">航班同步摘要</p>
      <h3>${escapeHtml(summary.summaryLabel)}</h3>
      <p>${escapeHtml(summary.warning || "所有需要飞行的航段都已确认，下一步可处理酒店或生成执行单。")}</p>
      ${renderAssistantFlights(appState.analysis.flightDecisions, appState.selectedFlights)}
    </div>
    ${renderAssistantTripEffortSummary(tripEffort)}
    ${renderAssistantBookingChecklistSummary(bookingChecklist, appState.selectedFlights)}
    ${renderAssistantTravelAssistantSummary(appState.travelAssistant)}
    ${renderAssistantPdfSummary(appState.pdfExport.wasDraft, appState.pdfExport.lastGeneratedAt)}
  `;
}

function renderAssistantExecutionSummary(path) {
  if (!path) {
    return "";
  }

  const firstFlight = path.flightSelections[0]?.selectedOffer;
  const firstHotel = path.hotelSelections[0]?.hotel;
  const anchorText = path.dayAnchors.slice(0, 3).map((anchor) => anchor.title).join(" / ");

  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">推荐执行方案</p>
      <h3>${escapeHtml(path.status === "stale" ? "方案已过期，需要重新分析" : "推荐方案已生成，等待你确认")}</h3>
      <p><strong>状态：</strong>${escapeHtml(path.statusLabel || (path.status === "stale" ? "已过期，需要重新分析" : "等待确认"))}</p>
      <p><strong>航班：</strong>${escapeHtml(firstFlight ? `${firstFlight.airline || firstFlight.carrierCode} · ${firstFlight.departure || "-"} – ${firstFlight.arrival || "-"} · ${firstFlight.priceLabel || `${firstFlight.price || ""} ${firstFlight.currency || ""}`}` : "使用外部查询链接确认。")}</p>
      <p><strong>酒店：</strong>${escapeHtml(firstHotel ? `${firstHotel.name}${firstHotel.address ? ` · ${firstHotel.address}` : ""}` : "使用原平台查询确认。")}</p>
      <p><strong>路线锚点：</strong>${escapeHtml(anchorText || "等待地点数据返回。")}</p>
      <p>${escapeHtml(path.summary || "系统推荐，尚未完成购买确认。")}</p>
      <p>${escapeHtml(path.supplierNote || "航班和酒店最终价格、库存与付款均需在原平台确认/支付。")}</p>
    </div>
  `;
}

function renderAssistantBudgetSummary(feasibility) {
  if (!feasibility) {
    return "";
  }

  const heading = feasibility.status === "over_budget"
    ? "预算超出，需要调整"
    : feasibility.status === "within_budget"
      ? "预算目前可行"
      : "预算状态待确认";

  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">预算同步摘要</p>
      <h3>${escapeHtml(heading)}</h3>
      <p>${escapeHtml(feasibility.primaryMessage)}</p>
      <p>${escapeHtml(feasibility.recommendation)}</p>
    </div>
  `;
}

function renderAssistantTripEffortSummary(tripEffort) {
  if (!tripEffort?.overall || !tripEffort?.days?.length) {
    return "";
  }

  const flaggedDays = tripEffort.days
    .filter((day) => day.energyLevel === "高强度" || day.transitComplexity <= 2 || day.riskLevel <= 2)
    .slice(0, 3)
    .map((day) => day.dayLabel)
    .join(" / ");
  const selectedRedEyeNote = tripEffort.days.find((day) => day.reasons.some((reason) => /red-eye/i.test(reason)));

  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">消耗力同步摘要</p>
      <h3>旅行强度摘要</h3>
      <p><strong>整体：</strong>${escapeHtml(tripEffort.overall.energyLevel)}</p>
      <p><strong>需要注意：</strong>${escapeHtml(flaggedDays || "当前没有特别超负荷的日期。")}</p>
      <p><strong>建议：</strong>${escapeHtml(tripEffort.overall.summary)}</p>
      ${selectedRedEyeNote ? `<p>${escapeHtml(`你选择的航班会提高 ${selectedRedEyeNote.dayLabel} 的疲劳感，建议当天减少活动。`)}</p>` : ""}
    </div>
  `;
}

function renderAssistantBookingChecklistSummary(bookingChecklist, selectedFlights = appState.selectedFlights) {
  const summary = getBookingChecklistSummary(bookingChecklist);
  const selectedFlightCount = Object.keys(selectedFlights || {}).length;
  const placeholdersRemaining = (bookingChecklist?.items || []).filter((item) => item.type !== "flight" && item.status !== "confirmed").map((item) => item.type);

  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">预订同步摘要</p>
      <h3>预订进度</h3>
      <p>已选航班段数：${selectedFlightCount}</p>
      <p>已确认：${summary.confirmedCount} / ${summary.totalCount} 项</p>
      <p>${summary.needsChangeCount ? "当前有项目需要重选。" : "当前没有项目被标记为需要重选。"}</p>
      <p>${placeholdersRemaining.length ? `仍待处理：${placeholdersRemaining.join("、")}。` : "当前没有待处理的占位项目。"}</p>
      <p>完成购买后，请点击“我已购买”并保存确认号。</p>
    </div>
  `;
}

function renderAssistantTravelAssistantSummary(travelAssistant = appState.travelAssistant) {
  if (!travelAssistant?.enabled || travelAssistant.mode === "off") {
    return `
      <div class="preview-card assistant-sync-card">
        <p class="eyebrow">旅行中助手</p>
        <h3>旅行中助手已关闭。</h3>
        <p>你可以随时重新开启提醒。</p>
      </div>
    `;
  }

  const visibleMessages = getVisibleTravelAssistantMessages(travelAssistant).slice(0, 3);
  return `
    <div class="preview-card assistant-sync-card">
      <p class="eyebrow">旅行中助手</p>
      <h3>状态：${escapeHtml(getTravelAssistantModeLabel(travelAssistant.mode))}</h3>
      <p><strong>当前需要注意：</strong></p>
      ${visibleMessages.length
        ? `<ul class="assistant-summary-list">${visibleMessages.map((message) => `<li>${escapeHtml(message.body)}</li>`).join("")}</ul>`
        : "<p>当前模式下没有需要展示的提醒。</p>"}
    </div>
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
                <p>${escapeHtml(hotel.date)}${hotel.checkoutDate ? ` → ${escapeHtml(hotel.checkoutDate)}` : ""}${hotel.address ? ` · ${escapeHtml(hotel.address)}` : ""}</p>
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

  return Array.from(new Set(filtered.map((value) => formatProviderName(value)))).slice(0, 3).join(" / ");
}

function getAiProviderLabel(provider) {
  const labels = {
    openrouter: "实时 AI 规划",
    mistral: "实时 AI 规划",
    groq: "实时 AI 规划",
    gemini: "实时 AI 规划",
    fallback: "结构化备用规划",
  };

  return labels[String(provider || "").toLowerCase()] || "结构化规划";
}

function formatProviderName(provider) {
  const normalized = String(provider || "").toLowerCase();
  if (!normalized) return "外部查询链接";
  if (normalized.includes("apify") || normalized.includes("booking")) return "真实酒店数据";
  if (normalized.includes("amadeus") || normalized.includes("aviationstack")) return "真实航班数据";
  if (normalized.includes("hasdata")) return "实时供应商数据";
  if (normalized.includes("verified + geoapify")) return "已核验地点数据";
  if (normalized.includes("geoapify")) return "地点与住宿数据";
  if (normalized.includes("verified")) return "已核验地点数据";
  if (normalized.includes("mock") || normalized.includes("fallback")) return "备用结果";
  if (normalized.includes("external")) return "外部查询链接";
  if (normalized.includes("openrouter") || normalized.includes("mistral") || normalized.includes("groq") || normalized.includes("gemini")) return "实时 AI 规划";
  return "供应商数据";
}

function formatDataStatus(provider, status, message = "") {
  const providerText = provider || status || "external";
  const normalized = providerText.toLowerCase();
  const truthLabel = formatProviderName(providerText);
  const confidence = ["mock", "fallback", "external"].some((item) => normalized.includes(item))
    ? "需在原平台最终确认"
    : "可用于当前规划";
  const updateLabel = message
    ? (confidence === "需在原平台最终确认" ? "可打开原平台继续确认" : "数据已返回")
    : "";
  return updateLabel ? `${truthLabel} · ${confidence} · ${updateLabel}` : `${truthLabel} · ${confidence}`;
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
    progressStep.textContent = "Preparing travel plan";
    return;
  }

  const steps = [
    "Preparing travel plan",
    "Structuring route and budget",
    "Checking supplier-backed options",
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
