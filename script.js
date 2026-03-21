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

const appState = {
  planner: { ...DEFAULT_PLANNER_STATE },
  assistant: {
    messages: [{ ...INITIAL_ASSISTANT_MESSAGE }],
  },
  selectedRegion: "fjord",
};

const regionDescriptions = {
  fjord: "Reflective fjord routes, quiet ferry crossings, and architecture that blends into stone and water.",
  forest: "Slow woodland days with lakeside stays, saunas, and soft contemporary Nordic interiors.",
  coast: "Salt-air towns, easy cycling paths, sea-view dining, and understated cultural discovery.",
  aurora: "Volcanic textures, northern skies, and winter-light experiences with room for wonder.",
};

function initializeHomepage() {
  bindScrollButtons();
  bindDestinationCards();
  bindPlannerForm();
  bindAssistant();
  renderPlannerPreview();
  renderAssistantThread();
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
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
  plannerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    syncPlannerStateFromForm();
    renderPlannerPreview();
  });

  resetButton.addEventListener("click", () => {
    plannerForm.reset();
    resetPlannerState();
    syncPlannerFormFromState();
    renderPlannerPreview();
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
      <p class="message-label">${message.role === "assistant" ? "Katris Assistant" : "You"}</p>
      <p>${message.content}</p>
    `;
    thread.appendChild(article);
  });

  thread.scrollTop = thread.scrollHeight;
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
  const [year, month] = value.split("-");
  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

document.addEventListener("DOMContentLoaded", initializeHomepage);
