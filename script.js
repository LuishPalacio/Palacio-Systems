const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const siteHeader = document.querySelector("[data-header]");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (siteHeader) {
  const updateHeaderState = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .two-column, .metrics div, .service-item, .package-card, .audience-item, .process-steps article, .project-card, .proof-items article, .contact-form, .footer-content"
);

if (revealTargets.length) {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 70, 210)}ms`);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });

    projectCards.forEach((card) => {
      const shouldShow = selectedFilter === "todos" || card.dataset.category === selectedFilter;
      card.classList.toggle("is-hidden", !shouldShow);
      card.hidden = !shouldShow;
    });
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const whatsapp = String(formData.get("whatsapp") || "").trim();
    const business = String(formData.get("business") || "").trim();
    const projectType = String(formData.get("projectType") || "").trim();
    const goal = String(formData.get("goal") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const whatsappMessage = [
      "Olá, Palacio Systems. Gostaria de pedir um orçamento para uma solução digital.",
      "",
      `Nome: ${name}`,
      `WhatsApp: ${whatsapp}`,
      `Empresa ou projeto: ${business}`,
      `Tipo de solução: ${projectType}`,
      `Objetivo principal: ${goal}`,
      "",
      `O que precisa desenvolver: ${message}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/5511916140651?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    if (formStatus) {
      formStatus.textContent = "Mensagem preparada. Confira o WhatsApp para confirmar o envio.";
    }
  });
}
