const CONTACT_LINKS = {
  telegram: "https://t.me/Finance_Natalia_CFO",
  max: "https://max.ru/u/f9LHodD0cOJM1VTccs81hGtUGmt7isazoDHRw2OFyi2Mk8OJtH_7ubRl1GA"
};

document.documentElement.classList.add("js");

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clampIndex = (value, length) => Math.max(0, Math.min(value, length - 1));

function setupSectionProgress() {
  const screens = qsa("[data-screen]");
  const counter = qs("[data-progress-current]");
  const navLinks = qsa('.site-nav a[href^="#screen-"]');
  if (!screens.length || !counter) return;

  const update = (screen) => {
    counter.textContent = screen.dataset.screen;
    qs(".site-header")?.classList.toggle("is-dark", ["screen-01", "screen-03", "screen-05", "screen-07"].includes(screen.id));
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${screen.id}`;
      if (isCurrent) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if (!("IntersectionObserver" in window)) {
    update(screens[0]);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) update(visible.target);
  }, { threshold: [0.25, 0.5, 0.75], rootMargin: "-12% 0px -38% 0px" });

  screens.forEach((screen) => observer.observe(screen));
  update(screens[0]);
}

function setupReveals() {
  const elements = qsa("[data-reveal]");
  if (!elements.length) return;
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function setExpanded(trigger, panel, expanded) {
  trigger.setAttribute("aria-expanded", String(expanded));
  panel.hidden = !expanded;
  const item = trigger.closest(".service-item, .faq-item");
  if (item) item.classList.toggle("is-open", expanded);
  const icon = trigger.querySelector(".service-toggle, i");
  if (icon) icon.textContent = expanded ? "−" : "+";
}

function setupServiceAccordion() {
  const triggers = qsa("[data-service-trigger]");
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      triggers.forEach((other) => {
        const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) setExpanded(other, otherPanel, other === trigger && willOpen);
      });
    });
  });
}

function setupProblemCarousel() {
  const track = qs("[data-problem-track]");
  const cards = qsa("[data-problem-card]");
  const previous = qs("[data-problem-prev]");
  const next = qs("[data-problem-next]");
  const current = qs("[data-problem-current]");
  const total = qs("[data-problem-total]");
  if (!track || !cards.length || !previous || !next) return;

  let activeIndex = cards.findIndex((card) => card.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;
  if (total) total.textContent = String(cards.length).padStart(2, "0");

  const update = (nextIndex) => {
    activeIndex = (nextIndex + cards.length) % cards.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    cards.forEach((card, index) => {
      const isActive = index === activeIndex;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-hidden", String(!isActive));
    });
    if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
  };

  previous.addEventListener("click", () => update(activeIndex - 1));
  next.addEventListener("click", () => update(activeIndex + 1));
  update(activeIndex);
}

function setupCaseScroller() {
  const track = qs("[data-case-track]");
  const cards = qsa(".case-card", track || document);
  const previous = qs("[data-case-prev]");
  const next = qs("[data-case-next]");
  if (!track || !cards.length || !previous || !next) return;

  const scrollByCard = (direction) => {
    const amount = Math.max(track.clientWidth * 0.78, cards[0].getBoundingClientRect().width + 20);
    track.scrollBy({ left: direction * amount, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  previous.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
}

function setupCheckup() {
  const root = qs("[data-checkup]");
  const questions = qsa("[data-question]", root || document);
  const progress = qs("[data-checkup-progress]");
  const result = qs("[data-checkup-result]");
  if (!root || !questions.length || !progress || !result) return;

  const answers = Array(questions.length).fill(null);
  const messages = {
    diagnosis: "Похоже, бизнес теряет деньги в нескольких местах. Начните с финансовой диагностики — найдём причину и расставим приоритеты.",
    system: "Следующий шаг — настроить управленческий учёт и прогноз денег, чтобы видеть проблему до того, как решение станет дорогим.",
    support: "Финансовое сопровождение поможет держать прибыль, деньги и ключевые решения под регулярным контролем."
  };

  const render = () => {
    const completed = answers.filter(Boolean).length;
    progress.textContent = String(completed);
    if (completed < answers.length) {
      result.hidden = true;
      result.textContent = "";
      return;
    }

    const noCount = answers.filter((answer) => answer === "no").length;
    const message = noCount >= 3 ? messages.diagnosis : noCount >= 1 ? messages.system : messages.support;
    result.textContent = message;
    result.hidden = false;
  };

  questions.forEach((question) => {
    const index = Number(question.dataset.question);
    qsa("[data-checkup-option]", question).forEach((option) => {
      option.addEventListener("click", () => {
        answers[index] = option.dataset.answer;
        qsa("[data-checkup-option]", question).forEach((candidate) => candidate.classList.toggle("is-selected", candidate === option));
        question.classList.add("is-complete");
        render();
      });
    });
  });
}

function showContactNotice(kind) {
  const status = qs("[data-contact-status]");
  const toast = qs("[data-toast]");
  const label = kind === "telegram" ? "Telegram" : "MAX";
  const message = `Ссылка на ${label} будет добавлена после получения контакта.`;
  if (status) status.textContent = message;
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showContactNotice.timeoutId);
  showContactNotice.timeoutId = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function setupContacts() {
  qsa("[data-contact]").forEach((link) => {
    const kind = link.dataset.contact;
    const url = CONTACT_LINKS[kind];
    if (typeof url === "string" && /^https:\/\//i.test(url)) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      return;
    }
    link.href = "#contact-links-needed";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showContactNotice(kind);
      qs("#contact-links-needed")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    });
  });
}

function setupAnchorState() {
  qsa('a[href^="#screen-"]').forEach((link) => {
    link.addEventListener("click", () => qsa(".site-nav a[aria-current]").forEach((active) => active.removeAttribute("aria-current")));
  });
}

setupSectionProgress();
setupReveals();
setupServiceAccordion();
setupProblemCarousel();
setupCaseScroller();
setupCheckup();
setupContacts();
setupAnchorState();
