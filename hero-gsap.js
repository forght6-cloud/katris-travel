window.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined") {
    const cards = document.querySelectorAll(".masonry-card");
    const copyItems = document.querySelectorAll(".hero-copy .eyebrow, .hero-copy h1, .hero-copy .hero-text, .hero-route-motion, .hero-actions, .hero-stats");
    const seasonCard = document.querySelector(".hero-panel--masonry .season-card");

    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: -48, scale: 0.96, rotate: (index) => (index % 2 === 0 ? -1.2 : 1.2) });
      gsap.set(copyItems, { opacity: 0, y: 22 });
      if (seasonCard) gsap.set(seasonCard, { opacity: 0, y: 18 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cards, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.92, stagger: 0.08 })
        .to(copyItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, "-=0.45");

      if (seasonCard) tl.to(seasonCard, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

      cards.forEach((card) => {
        card.addEventListener("mouseenter", () => gsap.to(card, { y: -6, scale: 1.015, duration: 0.32, ease: "power2.out" }));
        card.addEventListener("mouseleave", () => gsap.to(card, { y: 0, scale: 1, duration: 0.36, ease: "power2.out" }));
      });
    }
  }

  if (!document.querySelector('link[href="features.css"]')) {
    const featureStyles = document.createElement("link");
    featureStyles.rel = "stylesheet";
    featureStyles.href = "features.css";
    document.head.append(featureStyles);
  }

  if (!document.querySelector('script[src="features.js"]')) {
    const featureScript = document.createElement("script");
    featureScript.src = "features.js";
    featureScript.defer = true;
    document.body.append(featureScript);
  }
});