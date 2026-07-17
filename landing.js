(() => {
  const videos = [...document.querySelectorAll(".scene-video")];
  const motionVideos = [...document.querySelectorAll(".motion-card video")];
  const buttons = [...document.querySelectorAll("[data-scene]")];
  const label = document.querySelector("[data-active-scene]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = 0;
  let locked = false;
  let rotationTimer;

  function syncPlayback() {
    const canPlay = !reducedMotion.matches && !document.hidden;
    videos.forEach((video, videoIndex) => {
      if (canPlay && videoIndex === active) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    motionVideos.forEach((video) => {
      if (canPlay) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  function syncRotationTimer() {
    window.clearInterval(rotationTimer);
    rotationTimer = undefined;
    if (!reducedMotion.matches) {
      rotationTimer = window.setInterval(() => setScene((active + 1) % videos.length), 6500);
    }
    syncPlayback();
  }

  function setScene(index) {
    if (locked || index === active || !videos[index]) return;
    locked = true;
    active = index;
    videos.forEach((video, videoIndex) => {
      video.classList.toggle("is-active", videoIndex === index);
    });
    syncPlayback();
    buttons.forEach((button) => button.classList.toggle("is-active", Number(button.dataset.scene) === index));
    if (label) label.textContent = buttons[index]?.textContent || "Route signal";
    window.setTimeout(() => {
      locked = false;
    }, 1000);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => setScene(Number(button.dataset.scene)));
  });

  document.addEventListener("visibilitychange", syncPlayback);
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncRotationTimer);
  } else {
    reducedMotion.addListener(syncRotationTimer);
  }
  syncRotationTimer();
})();
