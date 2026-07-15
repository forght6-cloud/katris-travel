const HERO_WATERFALL_SCENES = [
  {
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&q=90",
    kicker: "Norway · West coast",
    title: "One fjord, revealed in moving slices.",
    region: "fjord",
  },
  {
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90",
    kicker: "Nordic highlands",
    title: "Still water, high ground, room to breathe.",
    region: "forest",
  },
  {
    image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2400&q=90",
    kicker: "Lapland · Winter night",
    title: "A northern sky that changes with every glance.",
    region: "aurora",
  },
];

function loadFeatureLayer() {
  if (!document.querySelector('link[href="features.css"]')) {
    const featureStyles = document.createElement("link");
    featureStyles.rel = "stylesheet";
    featureStyles.href = "features.css";
    document.head.append(featureStyles);
  }

  if (!document.querySelector('script[src="features.js"]')) {
    const featureScript = document.createElement("script");
    featureScript.src = "features.js";
    document.body.append(featureScript);
  }
}

function initHeroWaterfall() {
  const masonry = document.querySelector(".hero-masonry");
  const cards = [...document.querySelectorAll(".hero-masonry .masonry-card")];
  if (!masonry || !cards.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentScene = 0;
  let resizeFrame = 0;

  masonry.dataset.waterfall = "interactive";
  masonry.setAttribute("aria-live", "polite");
  masonry.setAttribute("aria-label", "Interactive Nordic landscape. Click a panel to change the scene.");

  cards.forEach((card, index) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Landscape panel ${index + 1}. Show the next scene.`);

    let sceneLayer = card.querySelector(".masonry-scene");
    if (!sceneLayer) {
      sceneLayer = document.createElement("span");
      sceneLayer.className = "masonry-scene";
      sceneLayer.setAttribute("aria-hidden", "true");
      card.prepend(sceneLayer);
    }
  });

  function syncSceneGeometry() {
    const masonryRect = masonry.getBoundingClientRect();
    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const sceneLayer = card.querySelector(".masonry-scene");
      sceneLayer.style.width = `${masonryRect.width}px`;
      sceneLayer.style.height = `${masonryRect.height}px`;
      sceneLayer.style.left = `${masonryRect.left - cardRect.left}px`;
      sceneLayer.style.top = `${masonryRect.top - cardRect.top}px`;
    });
  }

  function updateLabels(scene) {
    cards.forEach((card, index) => {
      const overlay = card.querySelector(".masonry-overlay");
      if (!overlay) return;

      if (index === 0) {
        overlay.innerHTML = `<span>${scene.kicker}</span><strong>${scene.title}</strong>`;
      } else if (index === cards.length - 1) {
        overlay.innerHTML = "<span>Interactive view</span><strong>Click to change landscape</strong>";
      } else {
        overlay.innerHTML = "";
      }
    });
  }

  function applyScene(index, animate = true) {
    currentScene = (index + HERO_WATERFALL_SCENES.length) % HERO_WATERFALL_SCENES.length;
    const scene = HERO_WATERFALL_SCENES[currentScene];
    const layers = cards.map((card) => card.querySelector(".masonry-scene"));

    layers.forEach((layer) => {
      layer.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,.02), rgba(4,18,24,.24)), url("${scene.image}")`;
    });
    updateLabels(scene);
    syncSceneGeometry();

    document.querySelectorAll("[data-hero-scene]").forEach((element) => delete element.dataset.heroScene);
    const destinationButton = document.querySelector(`[data-region="${scene.region}"]`);
    if (destinationButton) destinationButton.dataset.heroScene = "current";

    if (!animate || reducedMotion || typeof gsap === "undefined") return;
    gsap.fromTo(
      layers,
      { opacity: 0.35, scale: 1.035 },
      { opacity: 1, scale: 1, duration: 0.72, stagger: 0.035, ease: "power2.out" },
    );
  }

  function showNextScene() {
    const layers = cards.map((card) => card.querySelector(".masonry-scene"));
    if (reducedMotion || typeof gsap === "undefined") {
      applyScene(currentScene + 1, false);
      return;
    }

    gsap.to(layers, {
      opacity: 0.18,
      scale: 1.025,
      duration: 0.24,
      stagger: 0.025,
      ease: "power1.in",
      onComplete: () => applyScene(currentScene + 1, true),
    });
  }

  function moveScene(event) {
    if (reducedMotion || typeof gsap === "undefined") return;
    const rect = masonry.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    cards.forEach((card, index) => {
      const depth = 4 + index * 0.7;
      gsap.to(card, {
        x: x * depth,
        y: y * depth,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(card.querySelector(".masonry-scene"), {
        x: x * -10,
        y: y * -8,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }

  function resetScenePosition() {
    if (reducedMotion || typeof gsap === "undefined") return;
    gsap.to(cards, { x: 0, y: 0, duration: 0.55, ease: "power2.out", overwrite: "auto" });
    gsap.to(
      cards.map((card) => card.querySelector(".masonry-scene")),
      { x: 0, y: 0, duration: 0.65, ease: "power2.out", overwrite: "auto" },
    );
  }

  cards.forEach((card) => {
    card.addEventListener("click", showNextScene);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showNextScene();
      }
    });
  });

  masonry.addEventListener("pointermove", moveScene);
  masonry.addEventListener("pointerleave", resetScenePosition);
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(syncSceneGeometry);
  });

  applyScene(0, false);

  if (!reducedMotion && typeof gsap !== "undefined") {
    const heroCopy = document.querySelectorAll(
      ".hero-copy .eyebrow, .hero-copy h1, .hero-copy .hero-text, .hero-route-motion, .hero-actions, .hero-stats",
    );
    gsap.set(cards, { opacity: 0, y: 34, scale: 0.975 });
    gsap.set(heroCopy, { opacity: 0, y: 18 });
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.055 })
      .to(heroCopy, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045 }, "-=0.46");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadFeatureLayer();
  initHeroWaterfall();

  const resync = () => window.dispatchEvent(new Event("resize"));
  requestAnimationFrame(() => requestAnimationFrame(resync));
  window.setTimeout(resync, 250);
  document.fonts?.ready.then(resync).catch(() => {});
});
