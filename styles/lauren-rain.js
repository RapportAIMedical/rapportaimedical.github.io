(() => {
  const trigger = "lauren";
  let typed = "";
  let lastKeyAt = 0;
  let rain = null;
  let cleanupTimer = null;

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
      height: var(--size);
      border: 3px solid white;
      border-radius: 50%;
      background: #eee url('/assets/lauren-prank.png') center 37% / 265% no-repeat;
      box-shadow: 0 8px 22px rgba(0, 0, 0, .22);
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

  function makeItRain() {
    if (rain) rain.remove();
    clearTimeout(cleanupTimer);

    rain = document.createElement("div");
    rain.className = "lauren-rain";
    rain.setAttribute("aria-hidden", "true");

    const count = Math.min(48, Math.max(24, Math.floor(window.innerWidth / 22)));
    for (let i = 0; i < count; i += 1) {
      const face = document.createElement("span");
      face.className = "lauren-rain__face";
      face.style.setProperty("--size", `${55 + Math.random() * 55}px`);
      face.style.setProperty("--x", `${Math.random() * 100}vw`);
      face.style.setProperty("--drift", `${(Math.random() - .5) * 180}px`);
      face.style.setProperty("--spin", `${(Math.random() - .5) * 950}deg`);
      face.style.setProperty("--duration", `${4 + Math.random() * 2}s`);
      face.style.setProperty("--delay", `${Math.random() * 2}s`);
      rain.appendChild(face);
    }

    document.body.appendChild(rain);
    cleanupTimer = window.setTimeout(() => {
      rain?.remove();
      rain = null;
    }, 8200);
  }

  document.addEventListener("keydown", (event) => {
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
      makeItRain();
    }
  });
})();
