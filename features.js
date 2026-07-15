(() => {
  const STORAGE_KEY = "katris-travel:feature-state-v2";

  const ROUTES = [
    {
      id: "fjord",
      type: "nature",
      kicker: "Norway / 7 nights",
      title: "Bergen to Flam by rail and ferry",
      summary: "Scenic rail, ferry movement, and one flexible weather day.",
      image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=88",
      to: "Bergen",
      length: "7 nights",
      budget: "1800 EUR",
      stay: "Quiet waterfront or station stay",
      move: "Rail + ferry",
      pillars: ["Scenery", "Quiet stays", "Rail or ferry"],
      note: "Bergen arrival. Flam Railway and Aurlandsfjord ferry. Keep one flexible weather day and avoid tight same-day transfers.",
      ask: "Build a 7-night Bergen to Flam trip using scenic rail and ferry, quiet stays, and one flexible weather day.",
      fallback: "Confirm rail and ferry schedules with the operating supplier.",
    },
    {
      id: "stockholm",
      type: "city",
      kicker: "Sweden / 5 nights",
      title: "Stockholm design and archipelago break",
      summary: "Museums, walkable neighborhoods, one island day, and open evenings.",
      image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1400&q=88",
      to: "Stockholm",
      length: "5 nights",
      budget: "1500 EUR",
      stay: "Sodermalm or central transit stay",
      move: "Metro + local ferry",
      pillars: ["Local culture", "Quiet stays", "Rail or ferry"],
      note: "Base in Stockholm. Add one museum block, one archipelago day, and one unscheduled evening. Favor easy transit over nightlife zones.",
      ask: "Create a 5-night Stockholm design and archipelago itinerary with museums, local ferry travel, and quiet evenings.",
      fallback: "Archipelago departures are seasonal and require date-specific confirmation.",
    },
    {
      id: "copenhagen",
      type: "city",
      kicker: "Denmark / 5 nights",
      title: "Copenhagen coast, cycling, and galleries",
      summary: "Cycling, Louisiana Museum, coastal trains, and unhurried meals.",
      image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1400&q=88",
      to: "Copenhagen",
      length: "5 nights",
      budget: "1400 EUR",
      stay: "Central or Norrebro stay near metro",
      move: "Bike + regional rail",
      pillars: ["Local culture", "Scenery"],
      note: "Copenhagen base. Include Louisiana Museum by regional rail, one coastal cycling block, and a weather-proof indoor alternative.",
      ask: "Plan a 5-night Copenhagen trip with cycling, Louisiana Museum, coastal rail, and a weather-proof backup.",
      fallback: "Confirm bike access and museum opening hours for the selected date.",
    },
    {
      id: "lapland",
      type: "winter",
      kicker: "Finland / 7 nights",
      title: "Lapland cabin and aurora rhythm",
      summary: "Sauna, short outdoor blocks, recovery time, and flexible aurora evenings.",
      image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1400&q=88",
      to: "Helsinki",
      length: "7 nights",
      budget: "2400 EUR",
      stay: "Cabin with local transfer support",
      move: "Flight + local shuttle",
      pillars: ["Scenery", "Quiet stays", "Wellness"],
      note: "Use Helsinki as the gateway, then continue to Lapland. Keep outdoor blocks short and treat aurora viewing as weather-dependent.",
      ask: "Build a 7-night Finland and Lapland cabin trip with sauna, short winter activities, and flexible aurora evenings.",
      fallback: "Aurora visibility is not guaranteed; confirm transfers and pickup points.",
    },
    {
      id: "reykjavik",
      type: "nature",
      kicker: "Iceland / 7 nights",
      title: "Reykjavik base with two slow landscape days",
      summary: "A base-first route that limits hotel changes and weather risk.",
      image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1400&q=88",
      to: "Reykjavik",
      length: "7 nights",
      budget: "2200 EUR",
      stay: "Central Reykjavik with breakfast",
      move: "Guided day trip or rental car",
      pillars: ["Scenery", "Quiet stays"],
      note: "Stay mainly in Reykjavik. Add two landscape days with weather alternatives and one geothermal recovery block.",
      ask: "Create a 7-night Reykjavik-based trip with two landscape days, weather alternatives, and geothermal recovery.",
      fallback: "Check road conditions and excursion operation close to departure.",
    },
    {
      id: "helsinki",
      type: "city",
      kicker: "Finland + Estonia / 5 nights",
      title: "Helsinki and Tallinn by ferry",
      summary: "One clear crossing, compact old-town walking, and a light ferry day.",
      image: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&w=1400&q=88",
      to: "Helsinki",
      length: "5 nights",
      budget: "1200 EUR",
      stay: "Helsinki center + Tallinn old-town edge",
      move: "Ferry + tram",
      pillars: ["Local culture", "Rail or ferry"],
      note: "Split the route between Helsinki and Tallinn. Keep the ferry day light and avoid fixed bookings immediately after arrival.",
      ask: "Plan a 5-night Helsinki and Tallinn trip with a relaxed ferry day, local culture, and transit-based stays.",
      fallback: "Confirm ferry schedules and terminal details for the chosen date.",
    },
  ];

  const GUIDES = [
    {
      id: "pace",
      title: "Set the pace before choosing attractions",
      tip: "Use relaxed pacing. Protect arrival and transfer days and leave one flexible weather or fatigue block.",
    },
    {
      id: "stay",
      title: "Rank stays by transit, quiet, and total friction",
      tip: "Rank stays by transit ease, quiet, late-arrival practicality, and total transfer friction. Treat unverified prices as provisional.",
    },
    {
      id: "provider",
      title: "Separate inspiration from supplier confirmation",
      tip: "Keep a supplier confirmation step for final price, inventory, cancellation terms, and operating status.",
    },
  ];

  const EXAMPLE_NOTES = [
    {
      id: "example-1",
      name: "Mara",
      route: "Bergen → Flam",
      note: "Moving the ferry day away from arrival made the route much calmer.",
      routeId: "fjord",
      helpful: 12,
    },
    {
      id: "example-2",
      name: "Jon",
      route: "Stockholm",
      note: "One archipelago day was enough; the open final evening mattered.",
      routeId: "stockholm",
      helpful: 8,
    },
    {
      id: "example-3",
      name: "Anika",
      route: "Helsinki → Lapland",
      note: "Aurora plans worked best as optional evening blocks, not promises.",
      routeId: "lapland",
      helpful: 15,
    },
  ];

  const freshState = () => ({
    saved: [],
    posts: [],
    helpful: {},
    board: {
      destination: "Not selected",
      stay: "Not selected",
      transport: "Not selected",
      priority: "Not selected",
      provider: "Waiting for planner analysis",
      fallback: "No fallback note yet",
      export: "Not copied",
      source: "Planner inputs",
    },
  });

  let state = (() => {
    try {
      return { ...freshState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return freshState();
    }
  })();

  state.board = { ...freshState().board, ...(state.board || {}) };
  state.saved ||= [];
  state.posts ||= [];
  state.helpful ||= {};

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character]);
  const routeById = (id) => ROUTES.find((route) => route.id === id);
  const scrollTo = (selector) => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function setField(selector, value) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function installSections() {
    if (document.querySelector("#discover")) return;
    const inspiration = document.querySelector(".inspiration-strip");
    const destinations = document.querySelector("#destinations");
    const planner = document.querySelector("#planner");
    if (!inspiration || !destinations || !planner) return;

    inspiration.insertAdjacentHTML(
      "afterend",
      `<section class="feature-section" id="discover">
        <div class="feature-heading">
          <div><p class="eyebrow">Finite discovery stream</p><h2>Choose one useful direction.</h2></div>
          <p>Six practical routes. Save one, send it to the planner, or turn it into an assistant prompt.</p>
        </div>
        <div class="feature-filters">
          <button class="is-active" type="button" data-filter="all">All routes</button>
          <button type="button" data-filter="nature">Nature</button>
          <button type="button" data-filter="city">City</button>
          <button type="button" data-filter="winter">Winter</button>
          <span id="discovery-count"></span>
        </div>
        <div class="discovery-grid" id="discovery-grid"></div>
      </section>`,
    );

    destinations.insertAdjacentHTML(
      "afterend",
      `<section class="feature-section" id="guides">
        <div class="feature-heading">
          <div><p class="eyebrow">Short guidance surface</p><h2>One planning decision at a time.</h2></div>
          <p>Finite motion guides with transcripts, not fake live destination footage.</p>
        </div>
        <div class="guidance-grid" id="guidance-grid"></div>
      </section>
      <section class="feature-section" id="community">
        <div class="feature-heading">
          <div><p class="eyebrow">Lightweight community preview</p><h2>Use traveler notes as evidence.</h2></div>
          <p>Examples and browser-only notes are labeled separately.</p>
        </div>
        <div class="community-layout">
          <div id="community-list"></div>
          <form id="community-form" class="community-form">
            <p class="eyebrow">Add a local note</p>
            <h3>Record what another traveler should know.</h3>
            <label><span>Name</span><input name="name" maxlength="30" required></label>
            <label><span>Route</span><select name="route">${ROUTES.map((route) => `<option value="${route.id}">${escapeHtml(route.title)}</option>`).join("")}</select></label>
            <label><span>Note</span><textarea name="note" maxlength="220" rows="4" required></textarea></label>
            <button class="secondary-button" type="submit">Save local note</button>
            <p id="community-status" aria-live="polite"></p>
          </form>
        </div>
      </section>`,
    );

    planner.insertAdjacentHTML(
      "beforebegin",
      `<section class="feature-section" id="route-board">
        <div class="feature-heading">
          <div><p class="eyebrow">Route board</p><h2>Keep the current decision visible.</h2></div>
          <p>Planner inputs, saved route context, provider status, fallback, and export state.</p>
        </div>
        <div class="route-board-grid" id="route-board-grid"></div>
        <div class="feature-actions">
          <button class="secondary-button" type="button" data-open-planner>Open planner</button>
          <button class="ghost-button" type="button" data-copy-board>Copy route board</button>
          <button class="ghost-button" type="button" data-clear-board>Clear route board</button>
        </div>
        <p id="route-board-status" aria-live="polite"></p>
      </section>`,
    );

    const nav = document.querySelector(".site-nav");
    [["Discover", "#discover"], ["Guides", "#guides"], ["Community", "#community"], ["Route board", "#route-board"]].forEach(([text, href]) => {
      if (!nav || nav.querySelector(`[href="${href}"]`)) return;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      nav.append(link);
    });
  }

  function renderRoutes(filter = "all") {
    const routes = filter === "all" ? ROUTES : ROUTES.filter((route) => route.type === filter);
    const grid = document.querySelector("#discovery-grid");
    const count = document.querySelector("#discovery-count");
    if (!grid || !count) return;

    count.textContent = `${routes.length} of ${ROUTES.length} routes`;
    grid.innerHTML = routes.map((route) => `
      <article class="discovery-card">
        <div class="discovery-media" style="--route-image:url('${route.image}')">
          <span>${escapeHtml(route.kicker)}</span>
        </div>
        <div class="discovery-body">
          <div class="card-head">
            <h3>${escapeHtml(route.title)}</h3>
            <button type="button" data-save="${route.id}" aria-pressed="${state.saved.includes(route.id)}">${state.saved.includes(route.id) ? "Saved" : "Save"}</button>
          </div>
          <p>${escapeHtml(route.summary)}</p>
          <dl>
            <div><dt>Stay</dt><dd>${escapeHtml(route.stay)}</dd></div>
            <div><dt>Move</dt><dd>${escapeHtml(route.move)}</dd></div>
          </dl>
          <div class="feature-actions">
            <button class="primary-button" type="button" data-use="${route.id}">Use in planner</button>
            <button class="ghost-button" type="button" data-ask="${route.id}">Ask assistant</button>
          </div>
        </div>
      </article>`).join("");
  }

  function renderGuides() {
    const grid = document.querySelector("#guidance-grid");
    if (!grid) return;
    grid.innerHTML = GUIDES.map((guide, index) => `
      <article class="guidance-card" data-guide-card="${guide.id}">
        <div class="guide-stage"><strong>0${index + 1}</strong><span></span></div>
        <p class="eyebrow">20-second motion guide</p>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.tip)}</p>
        <div class="guide-progress"><span></span></div>
        <div class="feature-actions">
          <button class="secondary-button" type="button" data-play="${guide.id}">Play guide</button>
          <button class="ghost-button" type="button" data-tip="${guide.id}">Use tip in planner</button>
        </div>
      </article>`).join("");
  }

  function renderCommunity() {
    const list = document.querySelector("#community-list");
    if (!list) return;
    list.innerHTML = [...EXAMPLE_NOTES, ...state.posts].map((post) => `
      <article class="community-card">
        <p class="eyebrow">${post.local ? "Saved in this browser" : "Example traveler note"}</p>
        <div class="card-head"><h3>${escapeHtml(post.route)}</h3><span>${escapeHtml(post.name)}</span></div>
        <blockquote>${escapeHtml(post.note)}</blockquote>
        <div class="feature-actions">
          <button class="ghost-button" type="button" data-helpful="${post.id}">Helpful ${(post.helpful || 0) + (state.helpful[post.id] || 0)}</button>
          <button class="secondary-button" type="button" data-use="${post.routeId}">Use this route</button>
        </div>
      </article>`).join("");
  }

  function renderBoard() {
    const grid = document.querySelector("#route-board-grid");
    if (!grid) return;
    const board = state.board;
    const items = [
      ["Destination", board.destination],
      ["Saved stay", board.stay],
      ["Transport", board.transport],
      ["Priority", board.priority],
      ["Provider status", board.provider],
      ["Fallback note", board.fallback],
      ["Export state", board.export],
      ["Source", board.source],
    ];
    grid.innerHTML = items.map(([label, value]) => `<article><p class="eyebrow">${label}</p><strong>${escapeHtml(value)}</strong></article>`).join("");
  }

  function useRoute(route, source = "Discovery route") {
    setField("#to", route.to);
    setField("#tripLength", route.length);
    setField("#budget", route.budget);

    const notes = document.querySelector("#notes");
    if (notes) {
      notes.value = [notes.value.trim(), route.note].filter(Boolean).join("\n");
      notes.dispatchEvent(new Event("input", { bubbles: true }));
    }

    document.querySelectorAll('input[name="pillars"]').forEach((input) => {
      if (route.pillars.includes(input.value)) input.checked = true;
    });

    state.board = {
      ...state.board,
      destination: route.to,
      stay: route.stay,
      transport: route.move,
      priority: route.pillars.join(", "),
      fallback: route.fallback,
      export: "Not copied",
      source,
    };
    save();
    renderBoard();
    scrollTo("#planner");
  }

  function syncBoard() {
    const destination = document.querySelector("#to")?.value.trim();
    const priorities = [...document.querySelectorAll('input[name="pillars"]:checked')].map((input) => input.value);
    if (destination) state.board.destination = destination;
    if (priorities.length) state.board.priority = priorities.join(", ");
    save();
    renderBoard();
  }

  function bindInteractions() {
    document.addEventListener("click", async (event) => {
      const filter = event.target.closest("[data-filter]");
      if (filter) {
        document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === filter));
        renderRoutes(filter.dataset.filter);
        return;
      }

      const saveButton = event.target.closest("[data-save]");
      if (saveButton) {
        state.saved = state.saved.includes(saveButton.dataset.save)
          ? state.saved.filter((id) => id !== saveButton.dataset.save)
          : [...state.saved, saveButton.dataset.save];
        save();
        renderRoutes(document.querySelector("[data-filter].is-active")?.dataset.filter || "all");
        return;
      }

      const useButton = event.target.closest("[data-use]");
      if (useButton) {
        const route = routeById(useButton.dataset.use);
        if (route) useRoute(route, useButton.closest(".community-card") ? "Community note" : "Discovery route");
        return;
      }

      const askButton = event.target.closest("[data-ask]");
      if (askButton) {
        const route = routeById(askButton.dataset.ask);
        const input = document.querySelector("#assistant-input");
        if (route && input) {
          input.value = route.ask;
          scrollTo("#assistant");
          input.focus({ preventScroll: true });
        }
        return;
      }

      const playButton = event.target.closest("[data-play]");
      if (playButton) {
        const card = playButton.closest(".guidance-card");
        const bar = card.querySelector(".guide-progress span");
        card.classList.toggle("is-playing");
        bar.style.animation = "none";
        requestAnimationFrame(() => {
          bar.style.animation = card.classList.contains("is-playing") ? "guideProgress 20s linear forwards" : "none";
        });
        playButton.textContent = card.classList.contains("is-playing") ? "Pause guide" : "Play guide";
        return;
      }

      const tipButton = event.target.closest("[data-tip]");
      if (tipButton) {
        const guide = GUIDES.find((item) => item.id === tipButton.dataset.tip);
        const notes = document.querySelector("#notes");
        if (guide && notes) {
          notes.value = [notes.value.trim(), guide.tip].filter(Boolean).join("\n");
          notes.dispatchEvent(new Event("input", { bubbles: true }));
          syncBoard();
          scrollTo("#planner");
        }
        return;
      }

      const helpfulButton = event.target.closest("[data-helpful]");
      if (helpfulButton) {
        state.helpful[helpfulButton.dataset.helpful] = (state.helpful[helpfulButton.dataset.helpful] || 0) + 1;
        save();
        renderCommunity();
        return;
      }

      if (event.target.closest("[data-open-planner]")) {
        scrollTo("#planner");
        return;
      }

      if (event.target.closest("[data-clear-board]")) {
        state.board = freshState().board;
        save();
        renderBoard();
        document.querySelector("#route-board-status").textContent = "Route board cleared; planner fields were not changed.";
        return;
      }

      if (event.target.closest("[data-copy-board]")) {
        syncBoard();
        const board = state.board;
        const text = `Katris route board\nDestination: ${board.destination}\nStay: ${board.stay}\nTransport: ${board.transport}\nPriority: ${board.priority}\nProvider: ${board.provider}\nFallback: ${board.fallback}`;
        try {
          await navigator.clipboard.writeText(text);
          board.export = "Copied to clipboard";
          document.querySelector("#route-board-status").textContent = "Route board copied.";
        } catch {
          board.export = "Copy blocked by browser";
          document.querySelector("#route-board-status").textContent = "Clipboard access was blocked.";
        }
        save();
        renderBoard();
      }
    });

    document.querySelector("#community-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const route = routeById(String(data.get("route")));
      if (!route) return;
      state.posts.push({
        id: `local-${Date.now()}`,
        name: String(data.get("name")).trim(),
        route: route.title,
        note: String(data.get("note")).trim(),
        routeId: route.id,
        helpful: 0,
        local: true,
      });
      state.posts = state.posts.slice(-8);
      save();
      renderCommunity();
      event.currentTarget.reset();
      document.querySelector("#community-status").textContent = "Saved in this browser. It was not published online.";
    });

    document.querySelector("#planner-form")?.addEventListener("input", syncBoard);

    const operations = document.querySelector("#ops-monitor");
    if (operations) {
      new MutationObserver(() => {
        state.board.provider = [
          operations.querySelector("h3")?.textContent,
          operations.querySelector("p:last-child")?.textContent,
        ].filter(Boolean).join(" — ");
        save();
        renderBoard();
      }).observe(operations, { childList: true, subtree: true, characterData: true });
    }
  }

  function init() {
    installSections();
    renderRoutes();
    renderGuides();
    renderCommunity();
    syncBoard();
    bindInteractions();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
