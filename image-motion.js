(() => {
  const MOTION_SELECTOR = [
    ".hero-story img",
    ".hero-story .motion-media",
    ".discovery-media img",
    ".destination-visual img",
    ".destination-visual video",
    ".template-media",
    ".saved-card img",
    ".video-frame video",
  ].join(",");

  const VARIANTS = ["east", "west", "vertical", "diagonal"];
  const DURATIONS = [16000, 18000, 20000, 22000];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let imageObserver;
  let mutationObserver;
  let sequence = 0;
  let initialized = false;

  function motionNodes(root = document) {
    const nodes = [];
    if (root instanceof Element && root.matches(MOTION_SELECTOR)) nodes.push(root);
    if (typeof root.querySelectorAll === "function") nodes.push(...root.querySelectorAll(MOTION_SELECTOR));
    return nodes;
  }

  function setMotionState(node, active) {
    const shouldRun = active && !document.hidden && !reducedMotion.matches;
    node.dataset.imageMotionInView = String(active);
    node.classList.toggle("is-image-motion-active", shouldRun);

    const ambientVideo = node instanceof HTMLVideoElement
      && node.matches(".motion-media, .destination-visual video");
    if (ambientVideo && shouldRun) {
      node.play().catch(() => {});
    } else if (ambientVideo) {
      node.pause();
    }
  }

  function prepareNode(node) {
    if (node.dataset.imageMotion === "ready") return;

    const index = sequence;
    sequence += 1;
    node.dataset.imageMotion = "ready";
    node.dataset.imageMotionVariant = VARIANTS[index % VARIANTS.length];
    node.style.setProperty("--image-motion-duration", `${DURATIONS[index % DURATIONS.length]}ms`);
    node.style.setProperty("--image-motion-delay", `${-((index * 1370) % 9000)}ms`);

    if (reducedMotion.matches) {
      setMotionState(node, false);
    } else if (imageObserver) {
      imageObserver.observe(node);
    } else {
      setMotionState(node, true);
    }
  }

  function prepareMotion(root = document) {
    motionNodes(root).forEach(prepareNode);
  }

  function syncDocumentVisibility() {
    motionNodes().forEach((node) => {
      const inView = node.dataset.imageMotionInView === "true";
      setMotionState(node, inView);
    });
  }

  function syncMotionPreference() {
    document.documentElement.classList.toggle("image-motion-reduced", reducedMotion.matches);
    motionNodes().forEach((node) => {
      if (reducedMotion.matches) {
        imageObserver?.unobserve(node);
        setMotionState(node, false);
      } else if (imageObserver) {
        imageObserver.observe(node);
      } else {
        setMotionState(node, true);
      }
    });
  }

  function initImageMotion() {
    if (initialized) return;
    initialized = true;

    if ("IntersectionObserver" in window) {
      imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => setMotionState(entry.target, entry.isIntersecting));
      }, {
        rootMargin: "160px 0px",
        threshold: 0.08,
      });
    }

    prepareMotion();

    const main = document.querySelector("main");
    if (main && "MutationObserver" in window) {
      mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) prepareMotion(node);
        }));
      });
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    document.addEventListener("visibilitychange", syncDocumentVisibility);
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", syncMotionPreference);
    } else {
      reducedMotion.addListener(syncMotionPreference);
    }
    syncMotionPreference();
  }

  window.initImageMotion = initImageMotion;
  window.refreshImageMotion = prepareMotion;

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initImageMotion, { once: true })
    : initImageMotion();
})();
