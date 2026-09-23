// Chinese pages live under /zh/ with <html lang="zh-HK">. They use root-absolute
// paths so links and assets resolve whether the URL has a trailing slash or not.
const IS_ZH = (document.documentElement.lang || "").toLowerCase().startsWith("zh");
const ASSET_BASE = IS_ZH ? "/" : "";
const PAGE_BASE = IS_ZH ? "/zh/" : "";

function t(en, zh) {
  return IS_ZH ? zh : en;
}

const navBar = document.getElementById("nav");

if (navBar) {
  let previousScrollPosition = window.pageYOffset;

  window.addEventListener("scroll", () => {
    const currentScrollPosition = window.pageYOffset;
    navBar.style.top =
      previousScrollPosition > currentScrollPosition ? "0" : "-110px";
    previousScrollPosition = currentScrollPosition;
  });
}

const hamburger = document.querySelector(".hamburger");
const mobileDropdown = document.querySelector(".dropdown");

function closeMobileMenu() {
  if (!hamburger || !mobileDropdown) {
    return;
  }

  hamburger.classList.remove("active");
  mobileDropdown.classList.remove("open");
}

if (hamburger && mobileDropdown) {
  hamburger.addEventListener("click", (event) => {
    event.stopPropagation();
    hamburger.classList.toggle("active");
    mobileDropdown.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 1050 &&
      !hamburger.contains(event.target) &&
      !mobileDropdown.contains(event.target)
    ) {
      closeMobileMenu();
    }
  });
}

const desktopDropdowns = document.querySelectorAll(".has-dropdown");

function closeDesktopDropdowns() {
  desktopDropdowns.forEach((dropdownItem) => {
    dropdownItem.classList.remove("open");

    const toggle = dropdownItem.querySelector(".nav-parent");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

desktopDropdowns.forEach((dropdownItem) => {
  const toggle = dropdownItem.querySelector(".nav-parent");

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const wasOpen = dropdownItem.classList.contains("open");

    closeDesktopDropdowns();

    if (!wasOpen) {
      dropdownItem.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
});

document.addEventListener("click", (event) => {
  const clickedInsideDesktopDropdown = Array.from(desktopDropdowns).some(
    (dropdownItem) => dropdownItem.contains(event.target)
  );

  if (!clickedInsideDesktopDropdown) {
    closeDesktopDropdowns();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1050) {
    closeMobileMenu();
  }

  closeDesktopDropdowns();
});

function initReacqDatabaseVisuals() {
  const widgets = document.querySelectorAll(".database-visual[data-reacq-animation]");

  if (!widgets.length) {
    return;
  }

  const patients = [
    { initials: "AL", name: "A.L. - 52F", detail: t("Cancer screening eligible", "符合癌症篩查資格"), badge: "screen", val: 1210 },
    { initials: "MR", name: "M.R. - 62F", detail: t("Missed follow-up", "錯過覆診"), badge: "overdue", val: 1850 },
    { initials: "KT", name: "K.T. - 45M", detail: t("Eligible for screening", "符合篩查資格"), badge: "screen", val: 1180 },
    { initials: "RN", name: "R.N. - 67F", detail: t("Chronic care follow-up due", "慢性病跟進到期"), badge: "overdue", val: 2120 },
    { initials: "TC", name: "T.C. - 44M", detail: t("Lab results not reviewed", "化驗結果尚未覆閱"), badge: "overdue", val: 1290 },
    { initials: "CM", name: "C.M. - 49M", detail: t("Suitable for health package", "適合健康檢查套餐"), badge: "screen", val: 1195 },
    { initials: "SW", name: "S.W. - 63F", detail: t("Post-discharge follow-up missed", "錯過出院後覆診"), badge: "overdue", val: 1980 },
    { initials: "FL", name: "F.L. - 60F", detail: t("Bone density screening due", "骨質密度檢查到期"), badge: "screen", val: 1430 },
  ];
  const badgeTexts = {
    screen: t("Screening", "篩查"),
    overdue: t("Overdue", "逾期"),
  };

  function burstDollars(widget, el) {
    const elRect = el.getBoundingClientRect();
    const widgetRect = widget.getBoundingClientRect();
    const cx = elRect.left + elRect.width / 2 - widgetRect.left;
    const cy = elRect.top + elRect.height / 2 - widgetRect.top;

    for (let i = 0; i < 4; i += 1) {
      const span = document.createElement("span");
      span.textContent = "$";
      span.className = "dollar-burst";
      const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.8;
      const dist = 18 + Math.random() * 18;
      span.style.left = `${cx}px`;
      span.style.top = `${cy}px`;
      span.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      span.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      widget.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    }
  }

  widgets.forEach((widget) => {
    const rows = Array.from(widget.querySelectorAll(".db-row"));
    const opportunityCount = widget.querySelector(".db-footer strong");

    if (!rows.length) {
      return;
    }

    let widgetVisible = true;
    let visibleIndices = rows.map((_, index) => index);
    let currentValues = rows.map((row, index) => {
      const seeded = patients[index] || patients[0];
      return seeded.val;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        widgetVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 }).observe(widget);
    }

    rows.forEach((row, index) => {
      const value = row.querySelector(".db-value");
      const target = currentValues[index];
      const duration = 800;
      const delay = index * 180;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) {
          startTime = timestamp + delay;
        }

        if (timestamp < startTime) {
          requestAnimationFrame(step);
          return;
        }

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        value.textContent = `+$${Math.round(eased * target).toLocaleString()}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          burstDollars(widget, value);
        }
      }

      requestAnimationFrame(step);
    });

    setTimeout(function tickValue() {
      if (widgetVisible) {
        const liveRows = Array.from(widget.querySelectorAll(".db-row"));
        const index = Math.floor(Math.random() * liveRows.length);
        const increment = Math.floor(Math.random() * 140) + 65;
        const value = liveRows[index].querySelector(".db-value");

        currentValues[index] += increment;
        value.textContent = `+$${currentValues[index].toLocaleString()}`;
        value.classList.remove("db-value--tick");
        void value.offsetWidth;
        value.classList.add("db-value--tick");
        setTimeout(() => value.classList.remove("db-value--tick"), 500);
        burstDollars(widget, value);
      }

      setTimeout(tickValue, Math.random() * 650 + 450);
    }, 1400);

    setTimeout(function swapRow() {
      if (widgetVisible) {
        const liveRows = Array.from(widget.querySelectorAll(".db-row"));
        const rowIndex = Math.floor(Math.random() * liveRows.length);
        const row = liveRows[rowIndex];
        let nextIndex = Math.floor(Math.random() * patients.length);
        let attempts = 0;

        while (visibleIndices.includes(nextIndex) && attempts < 30) {
          nextIndex = Math.floor(Math.random() * patients.length);
          attempts += 1;
        }

        row.classList.remove("db-row--settled");
        row.classList.add("db-row--out");

        setTimeout(() => {
          const patient = patients[nextIndex];
          row.querySelector(".db-avatar").textContent = patient.initials;
          row.querySelector(".db-name").textContent = patient.name;
          row.querySelector(".db-detail").textContent = patient.detail;
          const badge = row.querySelector(".db-badge");
          badge.textContent = badgeTexts[patient.badge];
          badge.className = `db-badge db-badge--${patient.badge}`;
          const value = row.querySelector(".db-value");
          value.textContent = `+$${patient.val.toLocaleString()}`;
          currentValues[rowIndex] = patient.val;
          visibleIndices[rowIndex] = nextIndex;

          row.classList.remove("db-row--out");
          row.classList.add("db-row--in");
          setTimeout(() => {
            row.classList.remove("db-row--in");
            row.classList.add("db-row--settled");
            burstDollars(widget, value);
          }, 420);
        }, 270);
      }

      setTimeout(swapRow, Math.random() * 1400 + 2000);
    }, 3000);

    if (opportunityCount) {
      let count = 36714;

      setTimeout(function tickOpportunities() {
        if (widgetVisible) {
          count += Math.floor(Math.random() * 5) + 1;
          opportunityCount.textContent = count.toLocaleString();
        }

        setTimeout(tickOpportunities, Math.random() * 4000 + 1500);
      }, 2200);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReacqDatabaseVisuals);
} else {
  initReacqDatabaseVisuals();
}

function schedulerEase(progress) {
  let t = progress;

  for (let i = 0; i < 4; i += 1) {
    const oneMinusT = 1 - t;
    const x = 3 * oneMinusT * oneMinusT * t * 0.4 +
      3 * oneMinusT * t * t * 0.2 + t * t * t;
    const derivative = 3 * oneMinusT * oneMinusT * 0.4 +
      6 * oneMinusT * t * (0.2 - 0.4) + 3 * t * t * (1 - 0.2);

    if (Math.abs(derivative) < 0.000001) {
      break;
    }

    t = Math.max(0, Math.min(1, t - (x - progress) / derivative));
  }

  return 3 * (1 - t) * t * t + t * t * t;
}

function runRulesChoreography(mock, reduced) {
  const sliderRows = Array.from(mock.querySelectorAll(".scheduler-slider-row[data-count-to]"));
  const listRows = Array.from(mock.querySelectorAll(".scheduler-toggle-list > div"));
  const listFlipTimes = [600, 800, 1000, 1200, 1333];

  if (reduced) {
    mock.querySelectorAll(".scheduler-toggle").forEach((toggle) => {
      toggle.classList.add("sched-flip-on");
    });
    listRows.forEach((row) => row.classList.add("sched-row-on"));
    return;
  }

  sliderRows.forEach((row, index) => {
    const toggle = row.querySelector(".scheduler-toggle");
    setTimeout(() => {
      if (toggle) {
        toggle.classList.add("sched-flip-on");
      }
    }, index * 333);
  });

  listRows.forEach((row, index) => {
    setTimeout(() => {
      row.classList.add("sched-row-on");
      const toggle = row.querySelector(".scheduler-toggle");
      if (toggle) {
        toggle.classList.add("sched-flip-on");
      }
    }, listFlipTimes[index]);
  });

  const counters = sliderRows.map((row, index) => ({
    row,
    label: row.querySelector("em"),
    from: Number(row.dataset.countFrom),
    to: Number(row.dataset.countTo),
    unitOne: row.dataset.countUnitOne,
    unitMany: row.dataset.countUnitMany,
    finalPct: parseFloat(row.style.getPropertyValue("--value")),
    delay: index * 333,
  }));
  const duration = 667;
  let startTime;

  function updateCounters(timestamp) {
    if (startTime === undefined) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;

    counters.forEach((counter) => {
      const progress = Math.max(0, Math.min(1, (elapsed - counter.delay) / duration));
      const eased = schedulerEase(progress);
      const value = Math.round(counter.from + eased * (counter.to - counter.from));
      const pct = (value / counter.to) * counter.finalPct;
      const unit = value === 1 ? counter.unitOne : counter.unitMany;

      counter.row.style.setProperty("--value", `${pct}%`);
      if (counter.label) {
        counter.label.textContent = `${value} ${unit}`;
      }
    });

    if (elapsed < (counters.length - 1) * 333 + duration) {
      requestAnimationFrame(updateCounters);
    }
  }

  requestAnimationFrame(updateCounters);
}


function initSchedulerHeroLoop() {
  const board = document.querySelector(".scheduler-hero-board");

  if (!board || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const stage = board.querySelector(".scheduler-hero-stage");
  const monthLabel = board.querySelector("[data-scheduler-month]");
  const stateLabel = board.querySelector("[data-scheduler-state]");
  const nextMonth = board.querySelector(".scheduler-next-month");
  const generateButton = board.querySelector(".scheduler-generate-button");
  const generateButtonLabel = generateButton && generateButton.querySelector("span");
  const success = board.querySelector(".scheduler-hero-success");
  const successTitle = success && success.querySelector("strong");
  const successMeta = success && success.querySelector("small");
  const summaryDays = board.querySelector(".scheduler-hero-summary span:first-child strong");
  const summaryDoctors = board.querySelector(".scheduler-hero-summary span:nth-child(2) strong");
  const cursor = board.querySelector(".scheduler-demo-cursor");
  const rows = Array.from(board.querySelectorAll(
    ".scheduler-hero-roster-row:not(.scheduler-hero-roster-head)"
  ));

  if (!stage || !monthLabel || !stateLabel || !nextMonth || !generateButton ||
      !generateButtonLabel || !success || !successTitle || !successMeta ||
      !summaryDays || !summaryDoctors || !cursor || !rows.length) {
    return;
  }

  const monthNames = IS_ZH
    ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    : [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
  const weekdayNames = IS_ZH
    ? ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const shiftPool = ["D", "O", "E", "N", "D", "O", "E", "D", "O"];
  const doctorCount = 42;
  const kindClasses = {
    D: "shift-day",
    E: "shift-evening",
    N: "shift-night",
    O: "shift-off",
    VL: "shift-vl",
  };

  let currentMonth = new Date(2026, 8, 1);
  let cycleToken = 0;
  let running = false;

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function monthKey(monthDate) {
    return monthDate.getFullYear() * 12 + monthDate.getMonth();
  }

  function formatMonth(monthDate) {
    return IS_ZH
      ? `${monthDate.getFullYear()}年${monthNames[monthDate.getMonth()]}`
      : `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  }

  function daysInMonth(monthDate) {
    return new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  }

  function nextCalendarMonth(monthDate) {
    return new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  }

  function randomFrom(seed) {
    const x = Math.sin(seed * 91.7 + 47.3) * 10000;
    return x - Math.floor(x);
  }

  function visibleDates(monthDate) {
    return rows.map((row, rowIndex) => {
      const day = rowIndex + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      return `${day} ${weekdayNames[date.getDay()]}`;
    });
  }

  function makeRoster(monthDate) {
    const key = monthKey(monthDate);
    const leaveDoctor = Math.abs(key * 5 + 2) % 7;
    const leaveStart = 5 + Math.abs(key % 2);

    return rows.map((row, rowIndex) => (
      Array.from(row.querySelectorAll(".scheduler-hero-duty")).map((cell, columnIndex) => {
        if (columnIndex === leaveDoctor &&
            (rowIndex === leaveStart || rowIndex === leaveStart + 1)) {
          return "VL";
        }

        const seed = key * 101 + rowIndex * 17 + columnIndex * 29;
        const jitter = Math.floor(randomFrom(seed) * 4);
        const poolIndex = Math.abs(
          rowIndex * 2 + columnIndex * 3 + key + jitter
        ) % shiftPool.length;
        return shiftPool[poolIndex];
      })
    ));
  }

  function setCell(cell, kind, animate) {
    cell.textContent = kind;
    cell.className = `scheduler-hero-duty shift ${kindClasses[kind]}${animate ? " is-filling" : ""}`;
  }

  function updateRowDates(monthDate) {
    const dates = visibleDates(monthDate);

    rows.forEach((row, rowIndex) => {
      const date = row.querySelector("strong");
      const actualDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        rowIndex + 1
      );

      if (date) {
        date.textContent = dates[rowIndex];
      }

      row.classList.toggle("is-weekend", actualDate.getDay() === 0 || actualDate.getDay() === 6);
    });
  }

  function setRoster(monthDate, roster, animate) {
    updateRowDates(monthDate);

    rows.forEach((row, rowIndex) => {
      Array.from(row.querySelectorAll(".scheduler-hero-duty")).forEach((cell, columnIndex) => {
        setCell(cell, roster[rowIndex][columnIndex], animate);
      });
    });
  }

  function emptyRoster(monthDate) {
    updateRowDates(monthDate);

    rows.forEach((row) => {
      Array.from(row.querySelectorAll(".scheduler-hero-duty")).forEach((cell) => {
        cell.textContent = "";
        cell.className = "scheduler-hero-duty is-empty";
      });
    });
  }

  function fillRoster(monthDate, roster, token) {
    let finalDelay = 0;
    const key = monthKey(monthDate);

    rows.forEach((row, rowIndex) => {
      Array.from(row.querySelectorAll(".scheduler-hero-duty")).forEach((cell, columnIndex) => {
        const seed = key * 67 + rowIndex * 7 + columnIndex;
        const jitter = randomFrom(seed);
        const delay = (rowIndex + columnIndex) * 66 + jitter * 105;
        finalDelay = Math.max(finalDelay, delay);

        window.setTimeout(() => {
          if (running && token === cycleToken) {
            setCell(cell, roster[rowIndex][columnIndex], true);
          }
        }, delay);
      });
    });

    return finalDelay + 560;
  }

  function updateCompletedCopy(monthDate) {
    const label = formatMonth(monthDate);
    const totalDays = daysInMonth(monthDate);

    monthLabel.textContent = label;
    stateLabel.textContent = t(
      `${totalDays} days scheduled / all 27 rules satisfied`,
      `已編排 ${totalDays} 天，符合全部 27 條規則`
    );
    generateButtonLabel.textContent = t("Generate next month", "生成下月更表");
    summaryDays.textContent = totalDays;
    summaryDoctors.textContent = doctorCount;
    successTitle.textContent = t(
      `${monthNames[monthDate.getMonth()]} schedule generated`,
      `${monthNames[monthDate.getMonth()]}更表已生成`
    );
    successMeta.textContent = t(
      `${doctorCount} doctors / leave and rules satisfied`,
      `${doctorCount} 位醫生，已符合假期安排及所有規則`
    );
  }

  function moveCursor(target) {
    const stageRect = stage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    cursor.style.left = `${targetRect.left - stageRect.left + targetRect.width * 0.56}px`;
    cursor.style.top = `${targetRect.top - stageRect.top + targetRect.height * 0.58}px`;
    cursor.classList.add("is-active");
  }

  async function clickTarget(target, token) {
    if (!running || token !== cycleToken) {
      return false;
    }

    cursor.classList.add("is-pressing");
    target.classList.add("is-clicked");
    await wait(170);
    cursor.classList.remove("is-pressing");
    target.classList.remove("is-clicked");
    return running && token === cycleToken;
  }

  async function generateNextMonth(token) {
    const targetMonth = nextCalendarMonth(currentMonth);
    const currentRoster = makeRoster(currentMonth);
    const targetRoster = makeRoster(targetMonth);
    const targetLabel = formatMonth(targetMonth);
    const targetDays = daysInMonth(targetMonth);

    board.classList.remove("is-generating", "is-empty", "is-resetting", "is-generated");
    const shouldFadeSuccess = success.classList.contains("is-visible");
    if (shouldFadeSuccess) {
      success.classList.add("is-fade-ready");
      void success.offsetWidth;
      success.classList.add("is-fading");
    }
    cursor.classList.remove("is-active", "is-pressing");
    nextMonth.classList.remove("is-clicked");
    generateButton.classList.remove("is-clicked");
    updateCompletedCopy(currentMonth);
    setRoster(currentMonth, currentRoster, false);

    await wait(320);
    success.classList.remove("is-visible", "is-fade-ready", "is-fading");
    await wait(30);
    if (!running || token !== cycleToken) return;

    moveCursor(nextMonth);
    await wait(560);
    if (!await clickTarget(nextMonth, token)) return;

    monthLabel.textContent = targetLabel;
    stateLabel.textContent = t(
      `${monthNames[targetMonth.getMonth()]} selected / ready to generate`,
      `已選擇${monthNames[targetMonth.getMonth()]}，準備生成`
    );
    generateButtonLabel.textContent = t("Generate schedule", "生成更表");
    summaryDays.textContent = targetDays;
    board.classList.add("is-empty");
    emptyRoster(targetMonth);

    await wait(420);
    if (!running || token !== cycleToken) return;
    moveCursor(generateButton);
    await wait(560);
    if (!await clickTarget(generateButton, token)) return;

    board.classList.add("is-generating");
    stateLabel.textContent = t(
      `Optimising ${doctorCount} doctors across ${targetDays} days...`,
      `正在為 ${doctorCount} 位醫生優化 ${targetDays} 天的更表...`
    );
    generateButtonLabel.textContent = t("Generating...", "生成中...");
    cursor.classList.remove("is-active");

    await wait(250);
    if (!running || token !== cycleToken) return;

    const fillDuration = fillRoster(targetMonth, targetRoster, token);
    await wait(fillDuration);
    if (!running || token !== cycleToken) return;

    currentMonth = targetMonth;
    board.classList.remove("is-generating", "is-empty");
    board.classList.add("is-generated");
    updateCompletedCopy(currentMonth);
    success.classList.add("is-visible");

    await wait(1700);
  }

  async function runTimeline(token) {
    while (running && token === cycleToken) {
      await generateNextMonth(token);
    }
  }

  function start() {
    if (running) {
      return;
    }

    running = true;
    cycleToken += 1;
    runTimeline(cycleToken);
  }

  function stop() {
    if (!running) {
      return;
    }

    running = false;
    cycleToken += 1;
    cursor.classList.remove("is-active", "is-pressing");
    nextMonth.classList.remove("is-clicked");
    generateButton.classList.remove("is-clicked");
  }

  if (!("IntersectionObserver" in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(board);
}

function initSchedulerReveals() {
  document.documentElement.setAttribute("data-sched-anim-ready", "");

  const targets = Array.from(document.querySelectorAll(".scheduler-page .sched-reveal"));
  if (!targets.length) {
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal(target) {
    try {
      const rows = Array.from(target.querySelectorAll(
        ".scheduler-roster-table tbody tr, .scheduler-mini-row:not(.scheduler-mini-head)"
      ));
      const baseDelay = target.classList.contains("scheduler-schedule-mock") ? 267 : 60;

      rows.forEach((row, fallbackRowIndex) => {
        const rowIndex = typeof row.rowIndex === "number" ? row.rowIndex : fallbackRowIndex;
        const cells = Array.from(row.querySelectorAll(".shift"));

        cells.forEach((cell, columnIndex) => {
          const seed = rowIndex * 8 + columnIndex;
          const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
          const jitter = x - Math.floor(x);
          const delay = baseDelay + (rowIndex + columnIndex) * 57 + jitter * 100;
          cell.style.setProperty("--delay", `${delay.toFixed(3)}ms`);
        });
      });

      if (target.classList.contains("scheduler-rules-mock")) {
        runRulesChoreography(target, reduced);
      }

      target.classList.add("is-revealed");
    } catch (error) {
      document.documentElement.classList.remove("js-anim");
    }
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        reveal(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((target) => observer.observe(target));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSchedulerReveals);
  document.addEventListener("DOMContentLoaded", initSchedulerHeroLoop);
} else {
  initSchedulerReveals();
  initSchedulerHeroLoop();
}

const cta = document.getElementById("CTA");

if (cta) {
  function ctaTemplate() {
    const ctaContainer = document.createElement("div");
    ctaContainer.className = "container";

    const ctaText = document.createElement("div");
    ctaText.className = "CTA-text";

    const ctaTextHeading = document.createElement("h4");
    ctaTextHeading.textContent = t(
      "Our goal is to provide our clients with a customised solution tailored to their needs.",
      "我們的目標是為客戶提供切合其需要、度身定制的方案。"
    );

    const ctaTextParagraph = document.createElement("p");
    ctaTextParagraph.textContent = t(
      "Connect with our medical and tech experts to discuss your preferences",
      "與我們的醫療及科技專家聯絡，商討您的需要"
    );

    const ctaTextButton = document.createElement("button");
    ctaTextButton.className = "button darkgreen";

    const ctaButtonLink = document.createElement("a");
    ctaButtonLink.href = PAGE_BASE + "contact";
    ctaButtonLink.textContent = t("Chat with us", "與我們傾談");

    ctaTextButton.appendChild(ctaButtonLink);
    ctaText.appendChild(ctaTextHeading);
    ctaText.appendChild(ctaTextParagraph);
    ctaText.appendChild(ctaTextButton);

    const graphic = document.createElement("div");
    graphic.className = "graphic";

    const round = document.createElement("div");
    round.className = "quadrant white round_TL";

    const square = document.createElement("div");
    square.className = "square coral";

    graphic.appendChild(round);
    graphic.appendChild(square);

    ctaContainer.appendChild(ctaText);
    cta.appendChild(ctaContainer);
    cta.appendChild(graphic);
  }

  ctaTemplate();
}

function footerTemplate() {
  const footer = document.getElementById("footer");

  if (!footer) {
    return;
  }

  const footerTop = document.createElement("div");
  footerTop.className = "footer-top";

  const footerLeft = document.createElement("div");
  footerLeft.className = "footer-left";

  const footerLogo = document.createElement("div");
  footerLogo.className = "logo";

  const logoImage = document.createElement("img");
  logoImage.src = ASSET_BASE + "assets/Rapport-logo-RGB_symbol_black.png";
  logoImage.alt = "Rapport AI Medical logo";
  footerLogo.appendChild(logoImage);

  const footerTextContainer = document.createElement("div");
  footerTextContainer.className = "desc";

  const footerText = document.createElement("h6");
  footerText.textContent = t(
    "Rapport AI Medical is a healthcare technology solutions platform with a mission to address the inefficiencies of our healthcare industry and improve patient experience by leveraging AI and technology.",
    "Rapport AI Medical 是一個醫療科技方案平台，致力善用 AI 及科技，解決醫療行業的低效問題，並改善病人體驗。"
  );

  const footerCallToAction = document.createElement("button");
  footerCallToAction.className = "button";

  const footerCallToActionLink = document.createElement("a");
  footerCallToActionLink.href = PAGE_BASE + "contact";
  footerCallToActionLink.textContent = t("Chat with us", "與我們傾談");

  footerCallToAction.appendChild(footerCallToActionLink);
  footerTextContainer.appendChild(footerText);
  footerTextContainer.appendChild(footerCallToAction);

  footerLeft.appendChild(footerLogo);
  footerLeft.appendChild(footerTextContainer);

  const footerRight = document.createElement("div");
  footerRight.className = "footer-right";

  const footerSub = document.createElement("div");
  footerSub.className = "sub";

  const subText = document.createElement("h6");
  subText.textContent = t("Stay in touch", "保持聯繫");

  const subForm = document.createElement("form");
  subForm.id = "subscribe";
  subForm.method = "POST";
  subForm.action = "subscribe.php";

  const subInput = document.createElement("input");
  subInput.type = "email";
  subInput.name = "subscribe";
  subInput.id = "subscribe-email";
  subInput.placeholder = "yourname@email.com";
  subInput.required = true;

  const subButton = document.createElement("button");
  subButton.type = "submit";
  subButton.className = "button outlined";
  subButton.textContent = t("Submit", "提交");

  subForm.appendChild(subInput);
  subForm.appendChild(subButton);

  footerSub.appendChild(subText);
  footerSub.appendChild(subForm);

  const footerLinks = document.createElement("div");
  footerLinks.className = "page-links";

  const pageLinks = [
    { link: "about", name: t("About us", "關於我們") },
    { link: "product", name: "AskJune" },
    { link: "patient-reacq", name: "Patient ReAcq" },
    { link: "smart-scheduler", name: "Smart Scheduler" },
    { link: "radiology-assistant", name: t("AI Radiology Report Solution", "AI 放射科報告方案") },
    { link: "ai-course", name: t("AI Course", "AI 課程") },
    { link: "others", name: t("Others", "其他方案") },
    { link: "customers", name: t("Our Customers", "我們的客戶") },
    { link: "press", name: t("Press", "媒體報道") },
    { link: "contact", name: t("Contact us", "聯絡我們") },
  ];

  pageLinks.forEach(({ link, name }) => {
    const paragraph = document.createElement("p");
    const anchor = document.createElement("a");
    anchor.href = PAGE_BASE + link;
    anchor.textContent = name;
    paragraph.appendChild(anchor);
    footerLinks.appendChild(paragraph);
  });

  footerRight.appendChild(footerSub);
  footerRight.appendChild(footerLinks);

  footerTop.appendChild(footerLeft);
  footerTop.appendChild(footerRight);

  const footerBottom = document.createElement("div");
  footerBottom.className = "footer-bottom";

  const socials = document.createElement("div");
  socials.className = "socials";

  const socialIcons = document.createElement("div");
  socialIcons.className = "icons";

  const socialLinks = [
    {
      name: "x",
      link: "https://www.twitter.com/RapportAiMed",
      path: "M24.325 3h4.411l-9.636 11.013 11.336 14.987h-8.876l-6.952-9.089-7.955 9.089h-4.413l10.307-11.78-10.875-14.22h9.101l6.284 8.308zM22.777 26.36h2.444l-15.776-20.859h-2.623z",
    },
    {
      name: "linkedin",
      link: "https://www.linkedin.com/company/rapport-ai-medical/",
      path: "M29 0h-26c-1.65 0-3 1.35-3 3v26c0 1.65 1.35 3 3 3h26c1.65 0 3-1.35 3-3v-26c0-1.65-1.35-3-3-3zM12 26h-4v-14h4v14zM10 10c-1.106 0-2-0.894-2-2s0.894-2 2-2c1.106 0 2 0.894 2 2s-0.894 2-2 2zM26 26h-4v-8c0-1.106-0.894-2-2-2s-2 0.894-2 2v8h-4v-14h4v2.481c0.825-1.131 2.087-2.481 3.5-2.481 2.488 0 4.5 2.238 4.5 5v9z",
    },
  ];

  socialLinks.forEach(({ name, link, path }) => {
    const anchor = document.createElement("a");
    anchor.href = link;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", name);

    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("class", "icon icon-" + name);
    svg.setAttribute("viewBox", "0 0 32 32");

    const svgPath = document.createElementNS(svgNamespace, "path");
    svgPath.setAttribute("d", path);

    svg.appendChild(svgPath);
    anchor.appendChild(svg);
    socialIcons.appendChild(anchor);
  });

  const email = document.createElement("p");
  const emailAddress = document.createElement("a");
  emailAddress.href = "mailto:hello@rapportaimedical.com";
  emailAddress.style.textDecoration = "underline";
  emailAddress.textContent = "hello@rapportaimedical.com";
  email.appendChild(emailAddress);

  socials.appendChild(socialIcons);
  socials.appendChild(email);

  const smallPrint = document.createElement("div");
  smallPrint.className = "smallprint";

  const footerMemberLogos = document.createElement("div");
  footerMemberLogos.className = "footer-member-logos";

  const memberLogoData = [
    { href: "https://www.hkstp.org/", src: "assets/HKSTP_PartnerLogo_EN_Black_RGB.png", alt: "HKSTP" },
    { href: "https://cloud.google.com/startup", src: "assets/google-for-startups.png", alt: "Google for Startups" },
    { href: "https://www.investhk.gov.hk/", src: "assets/Press_investhk.png", alt: "InvestHK" },
    { href: "https://aws.amazon.com/", src: "assets/aws-startup.png", alt: "AWS" },
    { href: "https://www.hkmedtech.org/en/", src: "assets/hkmta_logo.png", alt: "Hong Kong MedTech Association" },
  ];

  memberLogoData.forEach(({ href, src, alt }) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "member-link";
    const img = document.createElement("img");
    img.src = ASSET_BASE + src;
    img.alt = alt;
    img.className = "footer-member-logo";
    a.appendChild(img);
    footerMemberLogos.appendChild(a);
  });

  const smallPrintText = document.createElement("p");
  smallPrintText.textContent =
    "\u00A9 " + new Date().getFullYear() + " Rapport AI Medical. " + t("All rights reserved.", "\u7248\u6B0A\u6240\u6709\u3002");

  smallPrint.appendChild(footerMemberLogos);
  smallPrint.appendChild(smallPrintText);
  footerBottom.appendChild(socials);
  footerBottom.appendChild(smallPrint);

  footer.appendChild(footerTop);
  footer.appendChild(footerBottom);
}

footerTemplate();

console.log(
  "\n" +
  "%c            ___\n" +
  "           /   \\\n" +
  "___/\\  /\\_/     \\____/\\/\\___\n" +
  "    \\/\\/\n" +
  "\n" +
  "RAPPORT AI MEDICAL — PATIENT INTAKE\n" +
  "────────────────────────────────────────\n" +
  "Name        : Curious Developer\n" +
  "Status      : Nosy\n" +
  "Diagnosis   : Chronic code-inspecting behaviour\n" +
  "Treatment   : Join our team ;)\n" +
  "Contact     : hello@rapportaimedical.com\n" +
  "────────────────────────────────────────\n",
  "font-family: monospace; font-size: 13px; color: #2d7a5a;"
);
