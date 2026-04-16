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

const cta = document.getElementById("CTA");

if (cta) {
  function ctaTemplate() {
    const ctaContainer = document.createElement("div");
    ctaContainer.className = "container";

    const ctaText = document.createElement("div");
    ctaText.className = "CTA-text";

    const ctaTextHeading = document.createElement("h4");
    ctaTextHeading.textContent =
      "Our goal is to provide our clients with a customised solution tailored to their needs.";

    const ctaTextParagraph = document.createElement("p");
    ctaTextParagraph.textContent =
      "Connect with our medical and tech experts to discuss your preferences";

    const ctaTextButton = document.createElement("button");
    ctaTextButton.className = "button darkgreen";

    const ctaButtonLink = document.createElement("a");
    ctaButtonLink.href = "contact";
    ctaButtonLink.textContent = "Chat with us";

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
  logoImage.src = "assets/Rapport-logo-RGB_symbol_black.png";
  logoImage.alt = "Rapport AI Medical logo";
  footerLogo.appendChild(logoImage);

  const footerTextContainer = document.createElement("div");
  footerTextContainer.className = "desc";

  const footerText = document.createElement("h6");
  footerText.textContent =
    "Rapport AI Medical is a healthcare technology solutions platform with a mission to address the inefficiencies of our healthcare industry and improve patient experience by leveraging AI and technology.";

  const footerCallToAction = document.createElement("button");
  footerCallToAction.className = "button";

  const footerCallToActionLink = document.createElement("a");
  footerCallToActionLink.href = "contact";
  footerCallToActionLink.textContent = "Chat with us";

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
  subText.textContent = "Stay in touch";

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
  subButton.textContent = "Submit";

  subForm.appendChild(subInput);
  subForm.appendChild(subButton);

  footerSub.appendChild(subText);
  footerSub.appendChild(subForm);

  const footerLinks = document.createElement("div");
  footerLinks.className = "page-links";

  const pageLinks = [
    { link: "about", name: "About us" },
    { link: "product", name: "AskJune" },
    { link: "patient-reacq", name: "Patient ReAcq" },
    { link: "smart-scheduler", name: "Smart Scheduler" },
    { link: "ai-typist", name: "AI Typist" },
    { link: "ai-course", name: "AI Course" },
    { link: "others", name: "Others" },
    { link: "customers", name: "Our Customers" },
    { link: "press", name: "Press" },
    { link: "contact", name: "Contact us" },
  ];

  pageLinks.forEach(({ link, name }) => {
    const paragraph = document.createElement("p");
    const anchor = document.createElement("a");
    anchor.href = link;
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

  const smallPrintText = document.createElement("p");
  smallPrintText.textContent =
    "\u00A9 " + new Date().getFullYear() + " Rapport AI Medical. All rights reserved.";

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
