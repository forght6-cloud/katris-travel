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
    const gsap = window.gsap;
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

    if (reducedMotion || !gsap) {
      revealWithoutMotion(hero);
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .fromTo(storyItems, { autoAlpha: 0, y: 26, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.66, stagger: 0.06 })
      .fromTo(copyItems, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.045 }, "-=0.42");
  }

  window.initSocialJourneyHero = initSocialJourneyHero;
})();
