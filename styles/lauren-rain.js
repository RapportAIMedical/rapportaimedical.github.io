(() => {
  const trigger = "lauren";
  const imageUrl = "/assets/lauren-head-cutout.webp";
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
      pointer-events: auto;
      touch-action: none;
      user-select: none;
      cursor: grab;
      animation: lauren-fall var(--duration) linear var(--delay) both;
      will-change: transform;
    }
    .lauren-rain__face.is-grabbed { cursor: grabbing; }
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

  function makeCatchable(face) {
    face.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !face.isConnected) return;
      event.preventDefault();
      event.stopPropagation();

      const matrix = new DOMMatrixReadOnly(getComputedStyle(face).transform);
      let x = matrix.m41;
      let y = matrix.m42;
      let angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
      let pointerX = event.clientX;
      let pointerY = event.clientY;
      let samples = [{ x: pointerX, y: pointerY, time: event.timeStamp }];

      face.style.animation = "none";
      face.classList.add("is-grabbed");
      face.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      face.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        x += moveEvent.clientX - pointerX;
        y += moveEvent.clientY - pointerY;
        pointerX = moveEvent.clientX;
        pointerY = moveEvent.clientY;
        samples.push({ x: pointerX, y: pointerY, time: moveEvent.timeStamp });
        samples = samples.filter((sample) => moveEvent.timeStamp - sample.time <= 100);
        face.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      }

      function release(releaseEvent) {
        face.removeEventListener("pointermove", move);
        face.removeEventListener("pointerup", release);
        face.removeEventListener("pointercancel", release);
        face.classList.remove("is-grabbed");
        if (!face.isConnected) return;

        const first = samples[0];
        const elapsed = Math.max(1, releaseEvent.timeStamp - first.time);
        let vx = Math.max(-2.5, Math.min(2.5, (releaseEvent.clientX - first.x) / elapsed));
        let vy = Math.max(-2.5, Math.min(2.5, (releaseEvent.clientY - first.y) / elapsed));
        let previousTime = 0;
        let flightTime = 0;

        function fly(now) {
          if (!face.isConnected) return;
          if (!previousTime) previousTime = now;
          const dt = Math.min(now - previousTime, 32);
          previousTime = now;
          flightTime += dt;
          vy += 0.0013 * dt;
          x += vx * dt;
          y += vy * dt;
          angle += vx * dt * 0.12;

          const right = window.innerWidth - face.offsetWidth;
          const bottom = window.innerHeight - face.offsetHeight;
          if (x < 0 || x > right) {
            x = Math.max(0, Math.min(right, x));
            vx *= -0.7;
          }
          if (y > bottom) {
            y = bottom;
            vy *= -0.55;
            vx *= 0.85;
          }

          face.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
          if (flightTime < 6000) requestAnimationFrame(fly);
          else face.remove();
        }

        requestAnimationFrame(fly);
      }

      face.addEventListener("pointermove", move);
      face.addEventListener("pointerup", release);
      face.addEventListener("pointercancel", release);
    });
  }

  function spawnFace(initial = false) {
    if (!rain) return;

    // Keep a fixed upper bound even if a background tab throttles animations.
    if (rain.childElementCount >= 36) {
      const oldestFalling = rain.querySelector(".lauren-rain__face:not(.is-grabbed)");
      if (!oldestFalling) return;
      oldestFalling.remove();
    }

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
    makeCatchable(face);
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
