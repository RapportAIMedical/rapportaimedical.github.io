// Nav scroll

var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.querySelector(".nav").style.top = "0";
  } else {
    document.querySelector(".nav").style.top = "-110px";
  }
  prevScrollpos = currentScrollPos;
};

// Hamburger menu

let open = document.querySelector(".hamburger");
let dropdown = document.querySelector(".dropdown");
open.onclick = function () {
  open.classList.toggle("active");
  dropdown.classList.toggle("open");
};

// Required field

// reCAPTCHA v2 callback function
function onRecaptchaSuccess(token) {
  // Clear any existing captcha error when successfully completed
  document.getElementById("captcha-error").innerHTML = "";
}

function validate() {
  let email = document.getElementById("email").value;
  let error = document.getElementById("error");
  let captchaError = document.getElementById("captcha-error");

  error.style.padding = "0 0 12px 0";

  let emailErrors = [];
  let hasError = false;

  // Check email validation
  if (email.indexOf("@") == -1 || email.length < 6) {
    emailErrors.push("Please enter a valid email address");
    hasError = true;
  }

  // Check if reCAPTCHA is completed
  let recaptchaResponse = grecaptcha.getResponse();
  if (recaptchaResponse.length === 0) {
    captchaError.innerHTML = "Please verify that you are not a robot";
    hasError = true;
  } else {
    captchaError.innerHTML = "";
  }

  // Display email errors
  if (emailErrors.length > 0) {
    error.innerHTML = emailErrors.join("<br>");
  } else {
    error.innerHTML = "";
    document.getElementById("error").style.display = "none";
  }

  if (hasError) {
    return false;
  } else {
    document.getElementById("error").style.display = "none";
    captchaError.innerHTML = "";

    // Send Contact Form input to Google Sheets

    const form = document.getElementById("form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);

      // Add reCAPTCHA token to form data
      const recaptchaToken = grecaptcha.getResponse();
      data.append("g-recaptcha-response", recaptchaToken);

      const action = e.target.action;
      fetch(action, {
        method: "POST",
        body: data,
      })
        .then((res) => res.json()) // Parse the JSON response
        .then((data) => {
          if (data.ok) {
            // Show success message
            document.getElementById("submitted").innerHTML = "Submitted!";
            document.getElementById("success").style.display = "block";
          } else {
            // Show error message
            document.getElementById("captcha-error").innerHTML =
              data.error || "Submission failed";
          }
        })
        .catch((e) => {
          console.error(e, "error");
          document.getElementById("captcha-error").innerHTML =
            "Network error. Please try again.";
        });
    });

    var submitbtn = document.getElementById("submitbtn");
    submitbtn.disabled = true;
    submitbtn.style.backgroundColor = "#b1e0b6";
    submitbtn.style.color = "var(--black)";
    document.getElementById("submitted").innerHTML = "Submitted!";
    document.getElementById("success").style.display = "block";

    return true;
  }
}

// CTA

const cta = document.getElementById("CTA");

if (cta) {
  function ctaTemplate() {
    const ctaContainer = document.createElement("div");
    ctaContainer.className = "container";

    const ctaText = document.createElement("div");
    ctaText.className = "CTA-text";
    const ctaTextH4 = document.createElement("h4");
    ctaTextH4.textContent =
      "Our goal is to provide our clients with a customised solution tailored to their needs.";
    const ctaTextp = document.createElement("p");
    ctaTextp.textContent =
      "Connect with our medical and tech experts to discuss your preferences";
    const ctaTextBtn = document.createElement("button");
    ctaTextBtn.className = "button darkgreen";
    const ctaBtnA = document.createElement("a");
    ctaBtnA.href = "contact";
    const ctaTextBtnNode = document.createTextNode("Chat with us");
    ctaBtnA.appendChild(ctaTextBtnNode);
    ctaTextBtn.appendChild(ctaBtnA);
    ctaText.appendChild(ctaTextH4);
    ctaText.appendChild(ctaTextp);
    ctaText.appendChild(ctaTextBtn);

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

// Footer

function footerTemplate() {
  const footerTop = document.createElement("div");
  footerTop.className = "footer-top";

  const footerLeft = document.createElement("div");
  footerLeft.className = "footer-left";

  const footerLogo = document.createElement("div");
  footerLogo.className = "logo";

  const logoImg = document.createElement("img");
  logoImg.src = "assets/Rapport-logo-RGB_symbol_black.png";
  footerLogo.appendChild(logoImg);

  const footerTextContainer = document.createElement("div");
  footerTextContainer.className = "desc";
  const footerText = document.createElement("h6");
  footerText.textContent =
    "Rapport AI Medical is a healthcare technology solutions platform with a mission to address the inefficiencies of our healthcare industry and improve patient experience by leveraging AI and technology.";
  const footerCTA = document.createElement("button");
  footerCTA.className = "button";
  footerCTALink = document.createElement("a");
  footerCTALink.href = "contact";
  footerCTALink.textContent = "Chat with us";
  footerCTA.appendChild(footerCTALink);
  footerTextContainer.appendChild(footerText);
  footerTextContainer.appendChild(footerCTA);

  footerLeft.appendChild(footerLogo);
  footerLeft.appendChild(footerTextContainer);

  const footerRight = document.createElement("div");
  footerRight.className = "footer-right";

  const footerSub = document.createElement("div");
  footerSub.className = "sub";
  const subText = document.createElement("h6");
  subText.textContent = "Stay in touch";

  const subForm = document.createElement("form");
  subForm.setAttribute("id", "subscribe");
  subForm.method = "POST";
  subForm.action = "subscribe.php";

  const subInput = document.createElement("input");
  subInput.type = "email";
  subInput.name = "subscribe";
  subInput.setAttribute("id", "subscribe");
  subInput.setAttribute("placeholder", "yourname@email.com");
  subInput.setAttribute("required", "");

  const subBtn = document.createElement("button");
  subBtn.type = "submit";
  subBtn.className = "button outlined";
  subBtn.textContent = "Submit";

  subForm.appendChild(subInput);
  subForm.appendChild(subBtn);

  footerSub.appendChild(subText);
  footerSub.appendChild(subForm);

  const footerLinks = document.createElement("div");
  footerLinks.className = "page-links";

  const pageLinks = [
    { link: "about", name: "About us" },
    { link: "solutions", name: "Our Solutions" },
    { link: "customers", name: "Our Customers" },
    // { link: "press", name: "Press" },
    { link: "product", name: "Meet June" },
    { link: "contact", name: "Contact us" },
  ];

  function footerPageLinks(link, name) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = link;
    a.textContent = name;
    p.appendChild(a);
    return p;
  }

  pageLinks.forEach(({ link, name }) => {
    const linkElement = footerPageLinks(link, name);
    footerLinks.appendChild(linkElement);
  });

  footerRight.appendChild(footerSub);
  footerRight.appendChild(footerLinks);

  footerTop.appendChild(footerLeft);
  footerTop.appendChild(footerRight);

  const footerBtm = document.createElement("div");
  footerBtm.className = "footer-bottom";

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
    // { name: "instagram", link: "https://instagram.com/RapportAiMed" path: "M16 2.881c4.275 0 4.781 0.019 6.462 0.094 1.563 0.069 2.406 0.331 2.969 0.55 0.744 0.288 1.281 0.638 1.837 1.194 0.563 0.563 0.906 1.094 1.2 1.838 0.219 0.563 0.481 1.412 0.55 2.969 0.075 1.688 0.094 2.194 0.094 6.463s-0.019 4.781-0.094 6.463c-0.069 1.563-0.331 2.406-0.55 2.969-0.288 0.744-0.637 1.281-1.194 1.837-0.563 0.563-1.094 0.906-1.837 1.2-0.563 0.219-1.413 0.481-2.969 0.55-1.688 0.075-2.194 0.094-6.463 0.094s-4.781-0.019-6.463-0.094c-1.563-0.069-2.406-0.331-2.969-0.55-0.744-0.288-1.281-0.637-1.838-1.194-0.563-0.563-0.906-1.094-1.2-1.837-0.219-0.563-0.481-1.413-0.55-2.969-0.075-1.688-0.094-2.194-0.094-6.463s0.019-4.781 0.094-6.463c0.069-1.563 0.331-2.406 0.55-2.969 0.288-0.744 0.638-1.281 1.194-1.838 0.563-0.563 1.094-0.906 1.838-1.2 0.563-0.219 1.412-0.481 2.969-0.55 1.681-0.075 2.188-0.094 6.463-0.094zM16 0c-4.344 0-4.887 0.019-6.594 0.094-1.7 0.075-2.869 0.35-3.881 0.744-1.056 0.412-1.95 0.956-2.837 1.85-0.894 0.888-1.438 1.781-1.85 2.831-0.394 1.019-0.669 2.181-0.744 3.881-0.075 1.713-0.094 2.256-0.094 6.6s0.019 4.887 0.094 6.594c0.075 1.7 0.35 2.869 0.744 3.881 0.413 1.056 0.956 1.95 1.85 2.837 0.887 0.887 1.781 1.438 2.831 1.844 1.019 0.394 2.181 0.669 3.881 0.744 1.706 0.075 2.25 0.094 6.594 0.094s4.888-0.019 6.594-0.094c1.7-0.075 2.869-0.35 3.881-0.744 1.050-0.406 1.944-0.956 2.831-1.844s1.438-1.781 1.844-2.831c0.394-1.019 0.669-2.181 0.744-3.881 0.075-1.706 0.094-2.25 0.094-6.594s-0.019-4.887-0.094-6.594c-0.075-1.7-0.35-2.869-0.744-3.881-0.394-1.063-0.938-1.956-1.831-2.844-0.887-0.887-1.781-1.438-2.831-1.844-1.019-0.394-2.181-0.669-3.881-0.744-1.712-0.081-2.256-0.1-6.6-0.1v0z"
    // OR "M16 7.781c-4.537 0-8.219 3.681-8.219 8.219s3.681 8.219 8.219 8.219 8.219-3.681 8.219-8.219c0-4.537-3.681-8.219-8.219-8.219zM16 21.331c-2.944 0-5.331-2.387-5.331-5.331s2.387-5.331 5.331-5.331c2.944 0 5.331 2.387 5.331 5.331s-2.387 5.331-5.331 5.331z"></path> <path d="M26.462 7.456c0 1.060-0.859 1.919-1.919 1.919s-1.919-0.859-1.919-1.919c0-1.060 0.859-1.919 1.919-1.919s1.919 0.859 1.919 1.919z"}
  ];

  function socialPageLinks(name, link, path) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "icon icon-" + name);
    svg.setAttribute("viewBox", "0 0 32 32"); // Set a viewBox

    const svgPath = document.createElementNS(svgNS, "path");
    svgPath.setAttribute("d", path);

    svg.appendChild(svgPath);
    a.appendChild(svg);
    return a;
  }

  socialLinks.forEach(({ name, link, path }) => {
    const socialElement = socialPageLinks(name, link, path);
    socialIcons.appendChild(socialElement);
  });

  const email = document.createElement("p");
  const emailAdd = document.createElement("a");
  emailAdd.href = "mailto:admin@rapportaimedical.com";
  emailAdd.style.textDecoration = "underline";
  emailAdd.textContent = "admin@rapportaimedical.com";
  email.appendChild(emailAdd);

  socials.appendChild(socialIcons);
  socials.appendChild(email);

  const smallPrint = document.createElement("div");
  smallPrint.className = "smallprint";
  const smallPrintText = document.createElement("p");

  const copyrightSpan = document.createElement("span");
  copyrightSpan.textContent = "© 2025 Rapport AI Medical. All rights reserved.";

  const designerSpan = document.createElement("span");
  designerSpan.textContent = "Website designed and developed by ";
  const designerLink = document.createElement("a");
  designerLink.href = "https://antoinettechow.com/";
  designerLink.target = "_blank";
  designerLink.textContent = "Antoinette Chow";
  designerSpan.appendChild(designerLink);

  smallPrintText.appendChild(copyrightSpan);
  smallPrintText.appendChild(document.createTextNode("\u00A0"));
  // smallPrintText.appendChild(designerSpan);
  smallPrint.appendChild(smallPrintText);

  footerBtm.appendChild(socials);
  footerBtm.appendChild(smallPrint);

  const footer = document.getElementById("footer");
  footer.appendChild(footerTop);
  footer.appendChild(footerBtm);
}

footerTemplate();
