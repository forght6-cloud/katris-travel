(() => {
  const STORAGE_KEY = "katris-travel:feature-state-v2";

  const ROUTES = [
    {
      id: "fjord",
      region: "fjord",
      type: "nature",
      topic: "Norway",
      kind: "Route remix",
      kicker: "Norway · 7 nights",
      title: "Bergen to Flam by rail and ferry",
      summary: "Scenic rail, ferry movement, and one flexible weather day without rushed same-day transfers.",
      image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=88",
      to: "Bergen",
      length: "7 nights",
      budget: "1800 EUR",
      stay: "Quiet waterfront or station stay",
      move: "Rail + ferry",
      mood: "slow scenery",
      pillars: ["Scenery", "Quiet stays", "Rail or ferry"],
      note: "Bergen arrival. Flam Railway and Aurlandsfjord ferry. Keep one flexible weather day and avoid tight same-day transfers.",
      ask: "Build a 7-night Bergen to Flam trip using scenic rail and ferry, quiet stays, and one flexible weather day.",
      fallback: "Confirm rail and ferry schedules with the operating supplier.",
    },
    {
      id: "stockholm",
      region: "forest",
      type: "city",
      topic: "Sweden",
      kind: "Creator-style guide",
      kicker: "Sweden · 5 nights",
      title: "Stockholm design and archipelago break",
      summary: "Museums, walkable neighborhoods, one island day, and open evenings for an unhurried city rhythm.",
      image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1400&q=88",
      to: "Stockholm",
      length: "5 nights",
      budget: "1500 EUR",
      stay: "Sodermalm or central transit stay",
      move: "Metro + local ferry",
      mood: "urban calm",
      pillars: ["Local culture", "Quiet stays", "Rail or ferry"],
      note: "Base in Stockholm. Add one museum block, one archipelago day, and one unscheduled evening. Favor easy transit over nightlife zones.",
      ask: "Create a 5-night Stockholm design and archipelago itinerary with museums, local ferry travel, and quiet evenings.",
      fallback: "Archipelago departures are seasonal and require date-specific confirmation.",
    },
    {
      id: "copenhagen",
      region: "coast",
      type: "city",
      topic: "Denmark",
      kind: "Food + place idea",
      kicker: "Denmark · 5 nights",
      title: "Copenhagen coast, cycling, and galleries",
      summary: "Cycling, Louisiana Museum, coastal trains, and unhurried meals with an indoor weather alternative.",
      image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1400&q=88",
      to: "Copenhagen",
      length: "5 nights",
      budget: "1400 EUR",
      stay: "Central or Norrebro stay near metro",
      move: "Bike + regional rail",
      mood: "creative coast",
      pillars: ["Local culture", "Scenery"],
      note: "Copenhagen base. Include Louisiana Museum by regional rail, one coastal cycling block, and a weather-proof indoor alternative.",
      ask: "Plan a 5-night Copenhagen trip with cycling, Louisiana Museum, coastal rail, and a weather-proof backup.",
      fallback: "Confirm bike access and museum opening hours for the selected date.",
    },
    {
      id: "lapland",
      region: "aurora",
      type: "winter",
      topic: "Finland",
      kind: "Seasonal signal",
      kicker: "Finland · 7 nights",
      title: "Lapland cabin and aurora rhythm",
      summary: "Sauna, short outdoor blocks, recovery time, and flexible aurora evenings that respect winter energy.",
      image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1400&q=88",
      to: "Helsinki",
      length: "7 nights",
      budget: "2400 EUR",
      stay: "Cabin with local transfer support",
      move: "Flight + local shuttle",
      mood: "winter recovery",
      pillars: ["Scenery", "Quiet stays", "Wellness"],
      note: "Use Helsinki as the gateway, then continue to Lapland. Keep outdoor blocks short and treat aurora viewing as weather-dependent.",
      ask: "Build a 7-night Finland and Lapland cabin trip with sauna, short winter activities, and flexible aurora evenings.",
      fallback: "Aurora visibility is not guaranteed; confirm transfers and pickup points.",
    },
    {
      id: "reykjavik",
      region: "aurora",
      type: "nature",
      topic: "Iceland",
      kind: "Travel warning",
      kicker: "Iceland · 7 nights",
      title: "Reykjavik base with two landscape days",
      summary: "A base-first route that limits hotel changes and keeps weather alternatives within reach.",
      image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1400&q=88",
      to: "Reykjavik",
      length: "7 nights",
      budget: "2200 EUR",
      stay: "Central Reykjavik with breakfast",
      move: "Guided day trip or rental car",
      mood: "weather-aware",
      pillars: ["Scenery", "Quiet stays"],
      note: "Stay mainly in Reykjavik. Add two landscape days with weather alternatives and one geothermal recovery block.",
      ask: "Create a 7-night Reykjavik-based trip with two landscape days, weather alternatives, and geothermal recovery.",
      fallback: "Check road conditions and excursion operation close to departure.",
    },
    {
      id: "helsinki",
      region: "forest",
      type: "city",
      topic: "Finland",
      kind: "Community route",
      kicker: "Finland + Estonia · 5 nights",
      title: "Helsinki and Tallinn by ferry",
      summary: "One clear crossing, compact old-town walking, and a light ferry day without immediate fixed bookings.",
      image: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&w=1400&q=88",
      to: "Helsinki",
      length: "5 nights",
      budget: "1200 EUR",
      stay: "Helsinki center + Tallinn old-town edge",
      move: "Ferry + tram",
      mood: "two-city ease",
      pillars: ["Local culture", "Rail or ferry"],
      note: "Split the route between Helsinki and Tallinn. Keep the ferry day light and avoid fixed bookings immediately after arrival.",
      ask: "Plan a 5-night Helsinki and Tallinn trip with a relaxed ferry day, local culture, and transit-based stays.",
      fallback: "Confirm ferry schedules and terminal details for the chosen date.",
    },
  ];

  const VIDEOS = [
    {
      id: "fjord-overlook",
      type: "nature",
      topic: "Norway",
      title: "Read the scale of a fjord day",
      summary: "Keep viewpoint time separate from the transfer window so the day does not become one long connection.",
      poster: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=900&q=86",
      source: "https://www.pexels.com/download/video/5208612/",
      sourcePage: "https://www.pexels.com/video/drone-footage-of-a-river-valley-5208612/",
      credit: "Video by Frederik M · Pexels",
      tip: "Reserve a separate two-hour viewpoint block and keep the transfer window free of fixed activities.",
      ask: "Use this Norway fjord video context to build a route with a separate viewpoint block and a relaxed transfer window.",
    },
    {
      id: "aurora-window",
      type: "nature",
      topic: "Aurora",
      title: "Keep aurora nights flexible",
      summary: "Treat the light show as a weather window, not a fixed event, and protect the following morning.",
      poster: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=92",
      source: "https://www.pexels.com/download/video/5701989/",
      sourcePage: "https://www.pexels.com/video/aurora-borealis-in-the-night-sky-5701989/",
      credit: "Video by Taryn Elliott · Pexels",
      tip: "Reserve two flexible aurora windows and keep the next morning light.",
      ask: "Use this aurora video context to build a winter route with flexible night windows and recovery time.",
    },
    {
      id: "water-crossing",
      type: "water",
      topic: "Water routes",
      title: "Treat the crossing as part of the trip",
      summary: "A scenic water leg needs terminal time, luggage margin, and a soft arrival rather than a packed checklist.",
      poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=92",
      source: "https://www.pexels.com/download/video/13600132/",
      sourcePage: "https://www.pexels.com/video/cruise-ship-on-lake-13600132/",
      credit: "Video by SwissHumanity Stories · Pexels",
      tip: "Keep 90 minutes of terminal and luggage margin around the water crossing, then use a soft arrival plan.",
      ask: "Build a scenic water-route day with terminal margin, luggage time, and an easy arrival evening.",
    },
  ];

  const EDITORIAL_NOTES = [
    {
      id: "editorial-fjord",
      label: "Editorial route note",
      topic: "Norway",
      routeId: "fjord",
      route: "Bergen to Flam by rail and ferry",
      note: "Do not book the tightest rail-to-ferry connection. The view is part of the trip, and weather makes margin useful.",
    },
    {
      id: "editorial-stockholm",
      label: "Editorial route note",
      topic: "Sweden",
      routeId: "stockholm",
      route: "Stockholm design and archipelago break",
      note: "One archipelago day is enough for a five-night route. Keep the next morning light if the ferry returns late.",
    },
    {
      id: "editorial-copenhagen",
      label: "Editorial route note",
      topic: "Denmark",
      routeId: "copenhagen",
      route: "Copenhagen coast, cycling, and galleries",
      note: "Pair Louisiana Museum with the coastal train, but keep a city gallery alternative ready for rain.",
    },
    {
      id: "editorial-lapland",
      label: "Editorial route note",
      topic: "Finland",
      routeId: "lapland",
      route: "Lapland cabin and aurora rhythm",
      note: "Aurora time is a weather window, not a guaranteed event. Put sauna or cabin time around it so the night still works.",
    },
  ];

  const REGION_ROUTE = {
    fjord: "fjord",
    forest: "stockholm",
    coast: "copenhagen",
    aurora: "lapland",
  };

  const freshState = () => ({
    saved: [],
    savedVideos: [],
    followedTopics: [],
    recentTopics: [],
    posts: [],
    helpful: {},
    communityTopic: "all",
    board: {
      destination: "Not selected",
      stay: "Not selected",
      transport: "Not selected",
      priority: "Not selected",
      provider: "Waiting for planner analysis",
      fallback: "No fallback note yet",
      export: "Not copied",
      source: "Manual planner input",
    },
    context: null,
  });

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
  })[character]);

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const base = freshState();
      return {
        ...base,
        ...stored,
        saved: Array.isArray(stored.saved) ? stored.saved : [],
        savedVideos: Array.isArray(stored.savedVideos) ? stored.savedVideos : [],
        followedTopics: Array.isArray(stored.followedTopics) ? stored.followedTopics : [],
        recentTopics: Array.isArray(stored.recentTopics) ? stored.recentTopics : [],
        posts: Array.isArray(stored.posts) ? stored.posts : [],
        helpful: stored.helpful && typeof stored.helpful === "object" ? stored.helpful : {},
        board: { ...base.board, ...(stored.board || {}) },
      };
    } catch {
      return freshState();
    }
  }

  const state = loadState();
  let activeVideoFilter = "all";
  let videoObserver = null;
  let toastTimer = 0;

  const routeById = (id) => ROUTES.find((route) => route.id === id);
  const videoById = (id) => VIDEOS.find((video) => video.id === id);
  const scrollTo = (selector) => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setField(selector, value) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function showToast(message) {
    const toast = document.querySelector("#social-toast");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => { toast.hidden = true; }, 180);
    }, 2600);
  }

  function rememberTopic(topic) {
    if (!topic) return;
    state.recentTopics = [topic, ...state.recentTopics.filter((item) => item !== topic)].slice(0, 6);
  }

  function setContext(context) {
    state.context = context;
    rememberTopic(context?.topic);
    save();
    renderContext();
  }

  function renderContext() {
    const plannerContext = document.querySelector("#planner-context");
    const assistantContext = document.querySelector("#assistant-context");
    if (!state.context) {
      if (plannerContext) plannerContext.innerHTML = "<span>No discovery context selected yet.</span>";
      if (assistantContext) assistantContext.innerHTML = "<span>No discovery context sent to the assistant yet.</span>";
      return;
    }

    const label = escapeHtml(state.context.label);
    const source = escapeHtml(state.context.source);
    const html = `<span class="context-label">Used from discovery</span><strong>${label}</strong><span>${source}</span>`;
    if (plannerContext) plannerContext.innerHTML = html;
    if (assistantContext) assistantContext.innerHTML = html;
  }

  function renderRoutes(filter = "all") {
    const routes = filter === "all" ? ROUTES : ROUTES.filter((route) => route.type === filter);
    const grid = document.querySelector("#discovery-grid");
    const count = document.querySelector("#discovery-count");
    const stateNode = document.querySelector("#discovery-state");
    if (!grid || !count) return;

    count.textContent = `${routes.length} of ${ROUTES.length} routes`;
    if (!routes.length) {
      grid.innerHTML = "";
      if (stateNode) {
        stateNode.hidden = false;
        stateNode.textContent = "No curated routes match this filter yet.";
      }
      return;
    }
    if (stateNode) stateNode.hidden = true;

    grid.innerHTML = routes.map((route, index) => {
      const saved = state.saved.includes(route.id);
      const following = state.followedTopics.includes(route.topic);
      return `
        <article class="discovery-card ${index === 0 ? "discovery-card--featured" : ""}">
          <div class="discovery-media">
            <img src="${route.image}" alt="${escapeHtml(route.title)} travel landscape" width="1200" height="900" loading="lazy" />
            <span class="content-type">${escapeHtml(route.kind)}</span>
            <span class="route-mood">${escapeHtml(route.mood)}</span>
          </div>
          <div class="discovery-body">
            <div class="card-kicker"><span>${escapeHtml(route.kicker)}</span><button type="button" data-save="${route.id}" aria-pressed="${saved}">${saved ? "Saved" : "Save"}</button></div>
            <h3>${escapeHtml(route.title)}</h3>
            <p>${escapeHtml(route.summary)}</p>
            <dl>
              <div><dt>Stay</dt><dd>${escapeHtml(route.stay)}</dd></div>
              <div><dt>Move</dt><dd>${escapeHtml(route.move)}</dd></div>
            </dl>
            <div class="topic-action-row">
              <button type="button" data-follow-topic="${escapeHtml(route.topic)}" aria-pressed="${following}">${following ? "Following" : `Follow ${escapeHtml(route.topic)}`}</button>
              <button type="button" data-share-route="${route.id}">Share</button>
            </div>
            <div class="feature-actions">
              <button class="primary-button" type="button" data-use="${route.id}">Use in planner</button>
              <button class="ghost-button" type="button" data-ask="${route.id}">Ask assistant</button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function renderVideos(filter = activeVideoFilter) {
    activeVideoFilter = filter;
    const grid = document.querySelector("#guidance-grid");
    const stateNode = document.querySelector("#video-state");
    if (!grid) return;
    const videos = filter === "all" ? VIDEOS : VIDEOS.filter((video) => video.type === filter);

    if (!videos.length) {
      grid.innerHTML = "";
      if (stateNode) {
        stateNode.hidden = false;
        stateNode.textContent = "No licensed clips match this topic yet.";
      }
      return;
    }
    if (stateNode) stateNode.hidden = true;

    grid.innerHTML = videos.map((video) => {
      const saved = state.savedVideos.includes(video.id);
      return `
        <article class="video-card" data-guide-card="${video.id}" data-video-card>
          <div class="video-frame">
            <video muted playsinline preload="none" poster="${video.poster}" aria-label="${escapeHtml(video.title)}">
              <source src="${video.source}" type="video/mp4" />
            </video>
            <div class="video-loading" role="status" aria-live="polite">Ready when you are</div>
            <button class="video-play-button" type="button" data-play="${video.id}" aria-label="Play ${escapeHtml(video.title)}">Play</button>
            <span class="video-topic">${escapeHtml(video.topic)}</span>
          </div>
          <div class="video-copy">
            <p class="eyebrow">Licensed travel clip</p>
            <h3>${escapeHtml(video.title)}</h3>
            <p>${escapeHtml(video.summary)}</p>
            <a href="${video.sourcePage}" target="_blank" rel="noreferrer">${escapeHtml(video.credit)}</a>
            <div class="feature-actions stacked-actions">
              <button class="secondary-button" type="button" data-tip="${video.id}">Use in my trip</button>
              <button class="ghost-button" type="button" data-video-ask="${video.id}">Ask assistant about this</button>
              <button class="ghost-button" type="button" data-save-video="${video.id}" aria-pressed="${saved}">${saved ? "Saved video" : "Save video"}</button>
            </div>
          </div>
        </article>`;
    }).join("");

    bindRenderedVideos();
  }

  function pauseVideoCard(card) {
    const video = card?.querySelector("video");
    const button = card?.querySelector("[data-play]");
    if (!video || !button) return;
    video.pause();
    card.classList.remove("is-playing", "is-loading");
    button.textContent = "Play";
    button.setAttribute("aria-label", `Play ${video.getAttribute("aria-label") || "travel video"}`);
  }

  function pauseOtherVideos(activeCard = null) {
    document.querySelectorAll("[data-video-card]").forEach((card) => {
      if (card !== activeCard) pauseVideoCard(card);
    });
  }

  function bindRenderedVideos() {
    if (videoObserver) videoObserver.disconnect();
    if ("IntersectionObserver" in window) {
      videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) pauseVideoCard(entry.target);
        });
      }, { threshold: [0, 0.35, 0.75] });
    }

    document.querySelectorAll("[data-video-card]").forEach((card) => {
      const video = card.querySelector("video");
      const status = card.querySelector(".video-loading");
      if (!video) return;
      videoObserver?.observe(card);
      video.addEventListener("playing", () => {
        card.classList.remove("is-loading");
        card.classList.add("is-playing");
        if (status) status.textContent = "Playing muted";
      });
      video.addEventListener("pause", () => {
        card.classList.remove("is-playing", "is-loading");
        const button = card.querySelector("[data-play]");
        if (button) button.textContent = "Play";
        if (status) status.textContent = "Paused";
      });
      video.addEventListener("error", () => {
        card.classList.remove("is-playing", "is-loading");
        card.classList.add("has-error");
        const button = card.querySelector("[data-play]");
        if (button) {
          button.textContent = "Retry";
          button.disabled = false;
        }
        if (status) status.textContent = "Clip unavailable. Open the Pexels source or retry.";
      });
      video.addEventListener("ended", () => pauseVideoCard(card));
    });
  }

  async function toggleVideo(videoId, button) {
    const card = button.closest("[data-video-card]");
    const video = card?.querySelector("video");
    const status = card?.querySelector(".video-loading");
    if (!card || !video) return;

    if (!video.paused) {
      pauseVideoCard(card);
      return;
    }

    pauseOtherVideos(card);
    card.classList.remove("has-error");
    card.classList.add("is-loading");
    button.textContent = "Loading…";
    button.disabled = true;
    if (status) status.textContent = "Loading licensed clip…";

    try {
      await video.play();
      button.disabled = false;
      button.textContent = "Pause";
      button.setAttribute("aria-label", `Pause ${video.getAttribute("aria-label") || "travel video"}`);
      const item = videoById(videoId);
      rememberTopic(item?.topic);
      save();
      renderSaved();
    } catch {
      card.classList.remove("is-loading");
      card.classList.add("has-error");
      button.disabled = false;
      button.textContent = "Retry";
      if (status) status.textContent = "Playback was blocked or the clip could not load.";
    }
  }

  function renderCommunity(topic = state.communityTopic) {
    state.communityTopic = topic;
    const list = document.querySelector("#community-list");
    if (!list) return;
    const posts = [...EDITORIAL_NOTES, ...state.posts].filter((post) => topic === "all" || post.topic === topic);

    if (!posts.length) {
      list.innerHTML = `<div class="empty-state"><strong>No local notes in this topic yet.</strong><p>Add one with the form; it will stay in this browser.</p></div>`;
      return;
    }

    list.innerHTML = posts.map((post) => {
      const marked = Boolean(state.helpful[post.id]);
      return `
        <article class="community-card">
          <div class="community-card-head"><span>${post.local ? "Saved in this browser" : escapeHtml(post.label)}</span><span>${escapeHtml(post.topic)}</span></div>
          <h3>${escapeHtml(post.route)}</h3>
          <blockquote>${escapeHtml(post.note)}</blockquote>
          ${post.local ? `<p class="local-author">Added locally by ${escapeHtml(post.name)}</p>` : ""}
          <div class="feature-actions">
            <button class="ghost-button" type="button" data-helpful="${post.id}" aria-pressed="${marked}">${marked ? "Helpful · marked locally" : "Helpful"}</button>
            <button class="secondary-button" type="button" data-use="${post.routeId}">Use this route</button>
            <button class="ghost-button" type="button" data-share-post="${post.id}">Share</button>
          </div>
        </article>`;
    }).join("");
  }

  function renderSaved() {
    const routeGrid = document.querySelector("#saved-grid");
    const videoGrid = document.querySelector("#saved-video-grid");
    const routeCount = document.querySelector("#saved-route-count");
    const videoCount = document.querySelector("#saved-video-count");
    const topicList = document.querySelector("#followed-topic-list");
    const savedRoutes = state.saved.map(routeById).filter(Boolean);
    const savedVideos = state.savedVideos.map(videoById).filter(Boolean);

    if (routeCount) routeCount.textContent = String(savedRoutes.length);
    if (videoCount) videoCount.textContent = String(savedVideos.length);

    if (routeGrid) {
      routeGrid.innerHTML = savedRoutes.length
        ? savedRoutes.map((route) => `
          <article class="saved-card">
            <img src="${route.image}" alt="" width="400" height="280" loading="lazy" />
            <div><span>${escapeHtml(route.topic)}</span><h4>${escapeHtml(route.title)}</h4><p>${escapeHtml(route.length)} · ${escapeHtml(route.mood)}</p>
              <div><button type="button" data-use="${route.id}">Use in planner</button><button type="button" data-save="${route.id}" aria-pressed="true">Remove</button></div>
            </div>
          </article>`).join("")
        : `<div class="empty-state"><strong>No saved trips yet.</strong><p>Save a discovery card and it will appear here.</p><a href="#discover">Browse routes</a></div>`;
    }

    if (videoGrid) {
      videoGrid.innerHTML = savedVideos.length
        ? savedVideos.map((video) => `
          <article class="saved-card">
            <img src="${video.poster}" alt="" width="400" height="280" loading="lazy" />
            <div><span>${escapeHtml(video.topic)}</span><h4>${escapeHtml(video.title)}</h4><p>Licensed Pexels clip</p>
              <div><button type="button" data-tip="${video.id}">Use in trip</button><button type="button" data-save-video="${video.id}" aria-pressed="true">Remove</button></div>
            </div>
          </article>`).join("")
        : `<div class="empty-state"><strong>No saved short videos yet.</strong><p>Save a clip to keep its planning tip close.</p><a href="#guides">Watch clips</a></div>`;
    }

    if (topicList) {
      const topics = [...new Set([...state.followedTopics, ...state.recentTopics])];
      topicList.innerHTML = topics.length
        ? topics.map((topic) => `<button type="button" data-follow-topic="${escapeHtml(topic)}" aria-pressed="${state.followedTopics.includes(topic)}"><span>${escapeHtml(topic)}</span><small>${state.followedTopics.includes(topic) ? "Following locally" : "Recently viewed"}</small></button>`).join("")
        : `<div class="empty-state compact"><strong>No followed topics.</strong><p>Follow a destination from a discovery card.</p></div>`;
    }
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
    grid.innerHTML = items.map(([label, value]) => `<article><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong></article>`).join("");
  }

  function syncBoard() {
    const destination = document.querySelector("#to")?.value.trim();
    const priorities = [...document.querySelectorAll('input[name="pillars"]:checked')].map((input) => input.value);
    if (destination) state.board.destination = destination;
    if (priorities.length) state.board.priority = priorities.join(", ");
    save();
    renderBoard();
  }

  function useRoute(route, source = "Discovery route") {
    if (!route) return;
    setField("#to", route.to);
    setField("#tripLength", route.length);
    setField("#budget", route.budget);
    setField("#notes", route.note);
    document.querySelectorAll('input[name="pillars"]').forEach((input) => {
      input.checked = route.pillars.includes(input.value);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    state.board = {
      destination: route.to,
      stay: route.stay,
      transport: route.move,
      priority: route.pillars.join(", "),
      provider: state.board.provider,
      fallback: route.fallback,
      export: "Not copied",
      source,
    };
    setContext({ label: route.title, source, topic: route.topic });
    save();
    renderBoard();
    renderSaved();
    scrollTo("#planner");
    showToast("Route context added to the planner.");
  }

  function askAboutRoute(route, source = "Discovery route") {
    const input = document.querySelector("#assistant-input");
    if (!route || !input) return;
    input.value = route.ask;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setContext({ label: route.title, source, topic: route.topic });
    scrollTo("#assistant");
    input.focus({ preventScroll: true });
    showToast("Prompt prepared with discovery context.");
  }

  function useVideoTip(video) {
    const notes = document.querySelector("#notes");
    if (!video || !notes) return;
    notes.value = [notes.value.trim(), video.tip].filter(Boolean).join("\n");
    notes.dispatchEvent(new Event("input", { bubbles: true }));
    setContext({ label: video.title, source: "Licensed short video", topic: video.topic });
    syncBoard();
    scrollTo("#planner");
    showToast("Video tip added to the itinerary outline.");
  }

  function askAboutVideo(video) {
    const input = document.querySelector("#assistant-input");
    if (!video || !input) return;
    input.value = video.ask;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setContext({ label: video.title, source: "Licensed short video", topic: video.topic });
    scrollTo("#assistant");
    input.focus({ preventScroll: true });
    showToast("Video context prepared for the assistant.");
  }

  async function shareText(title, text) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        showToast("Share sheet opened.");
        return;
      }
      await navigator.clipboard.writeText(`${title}\n${text}`);
      showToast("Share text copied to the clipboard.");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Sharing is unavailable in this browser.");
    }
  }

  function getSelectedTemplateRoute() {
    const region = document.querySelector(".destination-card.is-active")?.dataset.region || "fjord";
    return routeById(REGION_ROUTE[region] || "fjord");
  }

  function bindInteractions() {
    document.addEventListener("click", async (event) => {
      const filter = event.target.closest("[data-filter]");
      if (filter) {
        document.querySelectorAll("[data-filter]").forEach((button) => {
          const active = button === filter;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        renderRoutes(filter.dataset.filter);
        return;
      }

      const videoFilter = event.target.closest("[data-video-filter]");
      if (videoFilter) {
        document.querySelectorAll("[data-video-filter]").forEach((button) => {
          const active = button === videoFilter;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        renderVideos(videoFilter.dataset.videoFilter);
        return;
      }

      const communityTopic = event.target.closest("[data-community-topic]");
      if (communityTopic) {
        document.querySelectorAll("[data-community-topic]").forEach((button) => {
          const active = button === communityTopic;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        renderCommunity(communityTopic.dataset.communityTopic);
        save();
        return;
      }

      const saveButton = event.target.closest("[data-save]");
      if (saveButton) {
        const routeId = saveButton.dataset.save;
        const wasSaved = state.saved.includes(routeId);
        state.saved = wasSaved ? state.saved.filter((id) => id !== routeId) : [...state.saved, routeId];
        const route = routeById(routeId);
        rememberTopic(route?.topic);
        save();
        renderRoutes(document.querySelector("[data-filter].is-active")?.dataset.filter || "all");
        renderSaved();
        showToast(wasSaved ? "Route removed from local saves." : "Route saved in this browser.");
        return;
      }

      const saveVideoButton = event.target.closest("[data-save-video]");
      if (saveVideoButton) {
        const videoId = saveVideoButton.dataset.saveVideo;
        const wasSaved = state.savedVideos.includes(videoId);
        state.savedVideos = wasSaved ? state.savedVideos.filter((id) => id !== videoId) : [...state.savedVideos, videoId];
        const video = videoById(videoId);
        rememberTopic(video?.topic);
        save();
        renderVideos(activeVideoFilter);
        renderSaved();
        showToast(wasSaved ? "Video removed from local saves." : "Video saved in this browser.");
        return;
      }

      const followButton = event.target.closest("[data-follow-topic]");
      if (followButton) {
        const topic = followButton.dataset.followTopic;
        const following = state.followedTopics.includes(topic);
        state.followedTopics = following ? state.followedTopics.filter((item) => item !== topic) : [...state.followedTopics, topic];
        rememberTopic(topic);
        save();
        renderRoutes(document.querySelector("[data-filter].is-active")?.dataset.filter || "all");
        renderSaved();
        showToast(following ? `Stopped following ${topic}.` : `Following ${topic} in this browser.`);
        return;
      }

      const useButton = event.target.closest("[data-use]");
      if (useButton) {
        const route = routeById(useButton.dataset.use);
        useRoute(route, useButton.closest(".community-card") ? "Community note" : "Discovery route");
        return;
      }

      const askButton = event.target.closest("[data-ask]");
      if (askButton) {
        askAboutRoute(routeById(askButton.dataset.ask));
        return;
      }

      const playButton = event.target.closest("[data-play]");
      if (playButton) {
        await toggleVideo(playButton.dataset.play, playButton);
        return;
      }

      const tipButton = event.target.closest("[data-tip]");
      if (tipButton) {
        useVideoTip(videoById(tipButton.dataset.tip));
        return;
      }

      const videoAskButton = event.target.closest("[data-video-ask]");
      if (videoAskButton) {
        askAboutVideo(videoById(videoAskButton.dataset.videoAsk));
        return;
      }

      const helpfulButton = event.target.closest("[data-helpful]");
      if (helpfulButton) {
        state.helpful[helpfulButton.dataset.helpful] = !Boolean(state.helpful[helpfulButton.dataset.helpful]);
        save();
        renderCommunity();
        return;
      }

      const shareRouteButton = event.target.closest("[data-share-route]");
      if (shareRouteButton) {
        const route = routeById(shareRouteButton.dataset.shareRoute);
        if (route) await shareText(route.title, `${route.summary}\nSuggested move: ${route.move}. ${route.fallback}`);
        return;
      }

      const sharePostButton = event.target.closest("[data-share-post]");
      if (sharePostButton) {
        const post = [...EDITORIAL_NOTES, ...state.posts].find((item) => item.id === sharePostButton.dataset.sharePost);
        if (post) await shareText(post.route, post.note);
        return;
      }

      const heroRouteButton = event.target.closest("[data-hero-route]");
      if (heroRouteButton) {
        useRoute(routeById(heroRouteButton.dataset.heroRoute), "Hero route");
        return;
      }

      if (event.target.closest("[data-template-use]")) {
        useRoute(getSelectedTemplateRoute(), "Ready-made direction");
        return;
      }

      if (event.target.closest("[data-template-remix]")) {
        const route = getSelectedTemplateRoute();
        if (route) {
          useRoute(route, "Ready-made route remix");
          const notes = document.querySelector("#notes");
          if (notes) {
            notes.value = `${notes.value}\nRemix this route: preserve the travel mood but propose one alternative stop.`.trim();
            notes.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        return;
      }

      if (event.target.closest("[data-template-share]")) {
        const route = getSelectedTemplateRoute();
        if (route) await shareText(route.title, route.summary);
        return;
      }

      if (event.target.closest("[data-open-planner]")) {
        scrollTo("#planner-form");
        return;
      }

      if (event.target.closest("[data-clear-board]")) {
        state.board = freshState().board;
        state.context = null;
        save();
        renderBoard();
        renderContext();
        const status = document.querySelector("#route-board-status");
        if (status) status.textContent = "Route board cleared; planner fields were not changed.";
        return;
      }

      if (event.target.closest("[data-copy-board]")) {
        syncBoard();
        const board = state.board;
        const text = `Katris route board\nDestination: ${board.destination}\nStay: ${board.stay}\nTransport: ${board.transport}\nPriority: ${board.priority}\nProvider: ${board.provider}\nFallback: ${board.fallback}`;
        try {
          await navigator.clipboard.writeText(text);
          board.export = "Copied to clipboard";
          const status = document.querySelector("#route-board-status");
          if (status) status.textContent = "Route board copied.";
          showToast("Route board copied.");
        } catch {
          board.export = "Copy blocked by browser";
          const status = document.querySelector("#route-board-status");
          if (status) status.textContent = "Clipboard access was blocked.";
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
        topic: route.topic,
        note: String(data.get("note")).trim(),
        routeId: route.id,
        local: true,
      });
      state.posts = state.posts.slice(-8);
      save();
      renderCommunity("all");
      document.querySelectorAll("[data-community-topic]").forEach((button) => {
        const active = button.dataset.communityTopic === "all";
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      event.currentTarget.reset();
      const status = document.querySelector("#community-status");
      if (status) status.textContent = "Saved in this browser. It was not published online.";
      showToast("Local note saved in this browser.");
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

  function populateCommunityRoutes() {
    const select = document.querySelector("#community-route");
    if (!select) return;
    select.innerHTML = ROUTES.map((route) => `<option value="${route.id}">${escapeHtml(route.title)}</option>`).join("");
  }

  function init() {
    populateCommunityRoutes();
    renderRoutes();
    renderVideos();
    renderCommunity();
    renderSaved();
    renderBoard();
    renderContext();
    bindInteractions();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
