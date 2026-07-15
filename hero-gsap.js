window.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapReady = typeof window.gsap !== "undefined";

  const heroItems = document.querySelectorAll(
    ".hero-copy .eyebrow, .hero-copy h1, .hero-copy .hero-text, .hero-route-motion, .hero-actions, .hero-stats"
  );
  const cards = document.querySelectorAll(".masonry-card");
  const seasonCard = document.querySelector(".hero-panel--masonry .season-card");

  if (!gsapReady || reduceMotion) {
    [...heroItems, ...cards, seasonCard].filter(Boolean).forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return;
  }

  const gsap = window.gsap;

  gsap.set(heroItems, { opacity: 0, y: 18 });
  gsap.set(cards, { opacity: 0, y: 24, scale: 0.985 });
  if (seasonCard) gsap.set(seasonCard, { opacity: 0, y: 16 });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  intro
    .to(heroItems, {
      opacity: 1,
      y: 0,
      duration: 0.72,
      stagger: 0.065,
      clearProps: "transform"
    })
    .to(
      cards,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.78,
        stagger: 0.055,
        clearProps: "transform"
      },
      "-=0.4"
    );

  if (seasonCard) {
    intro.to(
      seasonCard,
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        clearProps: "transform"
      },
      "-=0.32"
    );
  }

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      gsap.to(card, {
        y: -4,
        scale: 1.008,
        duration: 0.26,
        ease: "power2.out",
        overwrite: true
      });
    });

    card.addEventListener("pointerleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true
      });
    });
  });

  const revealTargets = document.querySelectorAll(
    ".inspiration-strip article, .destination-card, .destination-template, .liquid-plan-stage, .planner-form, .planner-preview, .assistant-panel, .assistant-sidebar"
  );

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        gsap.fromTo(
          entry.target,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            clearProps: "transform",
            overwrite: true
          }
        );

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  revealTargets.forEach((target) => observer.observe(target));
});
