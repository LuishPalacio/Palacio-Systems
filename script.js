const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const siteHeader = document.querySelector("[data-header]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const backToTopButton = document.querySelector("[data-back-to-top]");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const nativeSelects = document.querySelectorAll(".form-field select");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const trackedSections = Array.from(navLinks)
  .map((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") ? document.querySelector(href) : null;
  })
  .filter(Boolean);

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

const updateActiveNav = () => {
  if (!trackedSections.length) {
    return;
  }

  const readingLine = window.innerHeight * 0.38;
  const currentSection = trackedSections.reduce((current, section) => {
    return section.getBoundingClientRect().top <= readingLine ? section : current;
  }, null);

  navLinks.forEach((link) => {
    const isActive = Boolean(currentSection && link.getAttribute("href") === `#${currentSection.id}`);
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updatePageState = () => {
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  if (scrollProgress) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 520);
  }

  updateActiveNav();
};

updatePageState();
window.addEventListener("scroll", updatePageState, { passive: true });

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const closeCustomSelects = (currentSelect = null) => {
  document.querySelectorAll(".custom-select.is-open").forEach((customSelect) => {
    if (customSelect === currentSelect) {
      return;
    }

    customSelect.classList.remove("is-open");
    const trigger = customSelect.querySelector(".custom-select-trigger");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
};

const focusOption = (options, index) => {
  const targetOption = options[index];

  if (targetOption) {
    targetOption.focus();
  }
};

nativeSelects.forEach((select) => {
  const customSelect = document.createElement("div");
  const trigger = document.createElement("button");
  const valueText = document.createElement("span");
  const chevron = document.createElement("span");
  const optionList = document.createElement("div");
  const selectLabel = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
  const listId = `${select.id || select.name}-custom-options`;

  select.classList.add("native-select");

  if (select.required) {
    select.dataset.required = "true";
    select.required = false;
  }

  customSelect.className = "custom-select has-placeholder";
  trigger.className = "custom-select-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", listId);

  valueText.className = "custom-select-value";
  chevron.className = "custom-select-chevron";
  chevron.setAttribute("aria-hidden", "true");

  optionList.className = "custom-select-options";
  optionList.id = listId;
  optionList.setAttribute("role", "listbox");

  trigger.append(valueText, chevron);
  customSelect.append(trigger, optionList);

  const optionButtons = Array.from(select.options).map((option, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "custom-select-option";
    optionButton.type = "button";
    optionButton.textContent = option.textContent;
    optionButton.dataset.value = option.value;
    optionButton.setAttribute("role", "option");

    if (!option.value) {
      optionButton.classList.add("is-placeholder");
    }

    optionButton.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      closeCustomSelects();
      trigger.focus();
    });

    optionButton.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusOption(optionButtons, Math.min(index + 1, optionButtons.length - 1));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusOption(optionButtons, Math.max(index - 1, 0));
      }

      if (event.key === "Escape") {
        closeCustomSelects();
        trigger.focus();
      }
    });

    optionList.append(optionButton);
    return optionButton;
  });

  const syncCustomSelect = () => {
    const selectedOption = select.options[select.selectedIndex];
    const selectedValue = selectedOption ? selectedOption.value : "";
    valueText.textContent = selectedOption ? selectedOption.textContent : "Selecione";
    customSelect.classList.toggle("has-placeholder", !selectedValue);

    if (selectedValue) {
      delete select.dataset.invalid;
    }

    customSelect.classList.toggle(
      "is-invalid",
      select.dataset.invalid === "true" && select.dataset.required === "true" && !selectedValue
    );

    optionButtons.forEach((optionButton) => {
      const isSelected = Boolean(selectedValue && optionButton.dataset.value === selectedValue);
      optionButton.classList.toggle("is-selected", isSelected);
      optionButton.setAttribute("aria-selected", String(isSelected));
    });
  };

  trigger.addEventListener("click", () => {
    const isOpen = customSelect.classList.toggle("is-open");
    closeCustomSelects(customSelect);
    trigger.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      const selectedIndex = Math.max(select.selectedIndex, 0);
      setTimeout(() => focusOption(optionButtons, selectedIndex), 0);
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      customSelect.classList.add("is-open");
      closeCustomSelects(customSelect);
      trigger.setAttribute("aria-expanded", "true");
      focusOption(optionButtons, Math.max(select.selectedIndex, 0));
    }

    if (event.key === "Escape") {
      closeCustomSelects();
    }
  });

  select.addEventListener("change", syncCustomSelect);

  customSelect.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!customSelect.contains(document.activeElement)) {
        closeCustomSelects();
      }
    }, 0);
  });

  if (selectLabel) {
    selectLabel.addEventListener("click", (event) => {
      event.preventDefault();
      trigger.focus();
    });
  }

  select.insertAdjacentElement("afterend", customSelect);
  syncCustomSelect();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".custom-select")) {
    closeCustomSelects();
  }
});

const revealTargets = document.querySelectorAll(
  ".section-heading, .two-column, .metrics div, .service-item, .package-card, .audience-item, .process-steps article, .project-card, .proof-items article, .about-me-content, .about-tags span, .contact-form, .footer-content"
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

    const requiredSelects = Array.from(contactForm.querySelectorAll(".native-select[data-required='true']"));
    const missingSelect = requiredSelects.find((select) => !select.value);

    requiredSelects.forEach((select) => {
      const customSelect = select.nextElementSibling;
      select.dataset.invalid = select.value ? "false" : "true";

      if (customSelect && customSelect.classList.contains("custom-select")) {
        customSelect.classList.toggle("is-invalid", select.dataset.invalid === "true");
      }
    });

    if (missingSelect) {
      const customSelect = missingSelect.nextElementSibling;
      const trigger = customSelect ? customSelect.querySelector(".custom-select-trigger") : null;

      if (formStatus) {
        formStatus.textContent = "Selecione o tipo de solução e o objetivo principal para continuar.";
      }

      if (trigger) {
        trigger.focus();
      }

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
