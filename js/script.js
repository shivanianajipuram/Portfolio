"use strict";

/* ---------- Data (arrays of objects) ---------- */
const skills = [
  { name: "C", level: 80 },
  { name: "Java", level: 75 },
  { name: "Python", level: 65 },
  { name: "HTML / CSS", level: 85 },
  { name: "SQL (MySQL)", level: 75 },
  { name: "Machine Learning", level: 70 },
];
const tools = ["GitHub", "Google Colab", "VS Code", "Canvas"];

/* ---------- Helpers ---------- */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Render skills (DOM manipulation) ---------- */
const skillBars = $("#skillBars");
skills.forEach(({ name, level }) => {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-3";
  wrapper.innerHTML = `
    <div class="skill-label"><span>${name}</span><span>${level}%</span></div>
    <div class="progress" role="progressbar" aria-label="${name} proficiency"
         aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" style="width:0" data-level="${level}"></div>
    </div>`;
  skillBars.appendChild(wrapper);
});

$("#toolBadges").innerHTML = tools
  .map(tool => `<span class="badge text-bg-secondary fs-6 fw-normal">${tool}</span>`)
  .join("");

// Animate bars when the skills section scrolls into view
const barObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      $$(".progress-bar").forEach(bar => (bar.style.width = bar.dataset.level + "%"));
      obs.disconnect();
    }
  });
}, { threshold: 0.3 });
barObserver.observe($("#skills"));

/* ---------- Feature 1: Theme switching ---------- */
const themeBtn = $("#themeToggle");
const html = document.documentElement;

const applyTheme = (theme) => {
  html.setAttribute("data-bs-theme", theme);
  const isDark = theme === "dark";
  themeBtn.innerHTML = `<i class="bi ${isDark ? "bi-sun-fill" : "bi-moon-stars-fill"}" aria-hidden="true"></i>`;
  themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  localStorage.setItem("theme", theme);
};

applyTheme(
  localStorage.getItem("theme") ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
);
themeBtn.addEventListener("click", () =>
  applyTheme(html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark")
);

/* ---------- Feature 2: Project filtering ---------- */
const filterButtons = $$("#filterGroup button");
const projectItems = $$(".project-item");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach(b => {
      const active = b === button;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    let visible = 0;
    projectItems.forEach(item => {
      const match = filter === "all" || item.dataset.category.split(" ").includes(filter);
      item.classList.toggle("hide", !match);
      if (match) {
        visible++;
        item.classList.remove("fade-in");
        void item.offsetWidth; // restart animation
        item.classList.add("fade-in");
      }
    });
    $("#noProjects").classList.toggle("d-none", visible > 0);
  });
});

/* ---------- Feature 3: Typing effect ---------- */
const roles = ["Computer Science Student", "AI / ML Enthusiast", "Python Developer", "Full Stack Learner"];
const typedEl = $("#typed");
let roleIndex = 0, charIndex = 0, deleting = false;

const type = () => {
  const current = roles[roleIndex];
  typedEl.textContent = current.slice(0, charIndex);
  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(type, 90);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1400);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(type, 45);
  } else {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, 300);
  }
};
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typedEl.textContent = roles[0];
} else {
  type();
}

/* ---------- Active nav link on scroll ---------- */
const sections = $$("main section");
const navLinks = $$(".navbar .nav-link");
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  sections.forEach(section => {
    if (y >= section.offsetTop && y < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link =>
        link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`)
      );
    }
  });
  $("#toTop").classList.toggle("show", window.scrollY > 400);
});
$("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Close mobile menu after clicking a link
navLinks.forEach(link => link.addEventListener("click", () => {
  const menu = $("#navMenu");
  if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
}));

/* ---------- Feature 4: Contact form validation ---------- */
const form = $("#contactForm");
const alertBox = $("#formAlert");
const message = $("#message");

const validators = {
  name: (v) => {
    if (!v.trim()) return "Please enter your name.";
    if (v.trim().length < 3) return "Name must be at least 3 characters.";
    if (!/^[A-Za-z\s.'-]+$/.test(v.trim())) return "Name can contain letters only.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Please enter a valid email address.";
    return "";
  },
  phone: (v) => {
    if (!v.trim()) return ""; // optional
    if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.trim())) return "Enter a valid 10-digit Indian mobile number.";
    return "";
  },
  message: (v) => {
    if (!v.trim()) return "Please write a message.";
    if (v.trim().length < 10) return "Message must be at least 10 characters.";
    if (v.length > 500) return "Message cannot exceed 500 characters.";
    return "";
  },
};

const validateField = (input) => {
  const error = validators[input.name](input.value);
  input.classList.toggle("is-invalid", Boolean(error));
  input.classList.toggle("is-valid", !error && input.value.trim() !== "");
  $(`#${input.id}Error`).textContent = error;
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
};

const showAlert = (type, text) => {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
};

// Live validation
$$("input, textarea", form).forEach(field => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) validateField(field);
  });
});
message.addEventListener("input", () => ($("#charCount").textContent = message.value.length));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = $$("input, textarea", form);
  const results = fields.map(validateField);

  if (results.every(Boolean)) {
    const name = $("#name").value.trim();
    showAlert("success", `<strong>Thank you, ${name}!</strong> Your message has been sent successfully.`);
    form.reset();
    fields.forEach(f => f.classList.remove("is-valid", "is-invalid"));
    $("#charCount").textContent = 0;
  } else {
    showAlert("danger", "Please fix the highlighted errors and try again.");
    fields.find(f => f.classList.contains("is-invalid"))?.focus();
  }
});