(() => {
  const trigger = "lauren";
  const imageUrl = "/assets/lauren-head-cutout.png";
  let typed = "";
  let lastKeyAt = 0;
  let rain = null;
  let spawnTimer = null;

  const style = document.createElement("style");
  style.textContent = `
    .lauren-rain {
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 2147483647;
    }
    .lauren-rain__face {
      position: absolute;
      top: 0;
      left: 0;
      width: var(--size);
      height: auto;
      max-width: none;
      animation: lauren-fall var(--duration) linear var(--delay) both;
      will-change: transform;
    }
    @keyframes lauren-fall {
      from { transform: translate3d(var(--x), calc(-1 * var(--size) - 10px), 0) rotate(-25deg); }
      to { transform: translate3d(calc(var(--x) + var(--drift)), 110vh, 0) rotate(var(--spin)); }
    }
    @media (prefers-reduced-motion: reduce) {
      .lauren-rain__face { animation: lauren-peek 2s ease-out var(--delay) both; }
      @keyframes lauren-peek {
        0%, 100% { opacity: 0; transform: translate3d(var(--x), 25vh, 0) scale(.6); }
        25%, 75% { opacity: 1; transform: translate3d(var(--x), 25vh, 0) scale(1); }
      }
    }
  `;
  document.head.appendChild(style);

  function spawnFace(initial = false) {
    if (!rain) return;

    // Keep a fixed upper bound even if a background tab throttles animations.
    if (rain.childElementCount >= 36) rain.firstElementChild.remove();

    const face = document.createElement("img");
    face.className = "lauren-rain__face";
    face.src = imageUrl;
    face.alt = "";
    face.draggable = false;
    const duration = 4 + Math.random() * 2;
    face.style.setProperty("--size", `${70 + Math.random() * 65}px`);
    face.style.setProperty("--x", `${Math.random() * 100}vw`);
    face.style.setProperty("--drift", `${(Math.random() - .5) * 180}px`);
    face.style.setProperty("--spin", `${(Math.random() - .5) * 950}deg`);
    face.style.setProperty("--duration", `${duration}s`);
    face.style.setProperty("--delay", initial ? `${-Math.random() * duration * .75}s` : "0s");
    face.addEventListener("animationend", () => face.remove(), { once: true });
    rain.appendChild(face);
  }

  function stopRain() {
    clearInterval(spawnTimer);
    spawnTimer = null;
    rain?.remove();
    rain = null;
  }

  function startRain() {
    rain = document.createElement("div");
    rain.className = "lauren-rain";
    rain.setAttribute("aria-hidden", "true");
    document.body.appendChild(rain);

    const initialCount = Math.min(16, Math.max(8, Math.floor(window.innerWidth / 85)));
    for (let i = 0; i < initialCount; i += 1) spawnFace(true);
    spawnTimer = window.setInterval(() => spawnFace(), 320);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && rain) {
      stopRain();
      typed = "";
      return;
    }

    const target = event.target;
    if (
      event.ctrlKey || event.metaKey || event.altKey ||
      target instanceof Element && target.closest("input, textarea, select, [contenteditable]")
    ) {
      typed = "";
      return;
    }

    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) {
      typed = "";
      return;
    }

    if (Date.now() - lastKeyAt > 2500) typed = "";
    lastKeyAt = Date.now();
    typed = (typed + event.key.toLowerCase()).slice(-trigger.length);
    if (typed === trigger) {
      typed = "";
      if (rain) stopRain();
      else startRain();
    }
  });
})();
