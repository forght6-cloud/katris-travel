(() => {
  const videos = [...document.querySelectorAll(".scene-video")];
  const buttons = [...document.querySelectorAll("[data-scene]")];
  const label = document.querySelector("[data-active-scene]");
  let active = 0;
  let locked = false;

  function setScene(index) {
    if (locked || index === active || !videos[index]) return;
    locked = true;
    active = index;
    videos.forEach((video, videoIndex) => {
      video.classList.toggle("is-active", videoIndex === index);
      if (videoIndex === index) video.play().catch(() => {});
    });
    buttons.forEach((button) => button.classList.toggle("is-active", Number(button.dataset.scene) === index));
    if (label) label.textContent = buttons[index]?.textContent || "Route signal";
    window.setTimeout(() => {
      locked = false;
    }, 1000);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => setScene(Number(button.dataset.scene)));
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(() => setScene((active + 1) % videos.length), 6500);
  }
})();
