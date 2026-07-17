(() => {
  let initialized = false;

  function revealWithoutMotion(hero) {
    hero.querySelectorAll("[data-hero-reveal]").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  }

  function initSocialJourneyHero() {
    if (initialized) return;
    const hero = document.querySelector(".hero-section");
    if (!hero) return;
    initialized = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const copyItems = [
      hero.querySelector(".hero-copy .eyebrow"),
      hero.querySelector(".hero-copy h1"),
      hero.querySelector(".hero-text"),
      hero.querySelector(".hero-actions"),
      hero.querySelector(".hero-stats"),
    ].filter(Boolean);
    const storyItems = [
      hero.querySelector(".hero-story--primary"),
      hero.querySelector(".hero-story--side"),
      ...hero.querySelectorAll(".hero-signal"),
    ].filter(Boolean);

    [...copyItems, ...storyItems].forEach((element) => element.setAttribute("data-hero-reveal", ""));

    if (reducedMotion || typeof Element.prototype.animate !== "function") {
      revealWithoutMotion(hero);
      return;
    }

    const animateGroup = (items, options) => {
      items.forEach((element, index) => {
        element.style.opacity = "0";
        element.style.transform = options.startTransform;
        const animation = element.animate(
          [
            { opacity: 0, transform: options.startTransform },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ],
          {
            duration: options.duration,
            delay: options.delay + index * options.stagger,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards",
          },
        );
        animation.addEventListener("finish", () => {
          element.style.opacity = "1";
          element.style.transform = "none";
        }, { once: true });
      });
    };

    animateGroup(storyItems, {
      startTransform: "translate3d(0, 26px, 0) scale(0.985)",
      duration: 660,
      delay: 0,
      stagger: 60,
    });
    animateGroup(copyItems, {
      startTransform: "translate3d(0, 18px, 0) scale(1)",
      duration: 520,
      delay: 240,
      stagger: 45,
    });
  }

  window.initSocialJourneyHero = initSocialJourneyHero;
})();
