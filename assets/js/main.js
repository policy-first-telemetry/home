// Client-side validation + mailto submit (no backend).
// Replace EMAIL_TO with an address you control.
const EMAIL_TO = "policy-first.telemetry@proton.me"; // <-- change this

function buildMailto(subject, body) {
  const enc = (s) => encodeURIComponent(s);
  return `mailto:${EMAIL_TO}?subject=${enc(subject)}&body=${enc(body)}`;
}

function templateBody(fields) {
  const v = (x, fallback = "(not provided)") => (x && String(x).trim() ? String(x).trim() : fallback);

  return [
    "Hello,",
    "",
    "I'm responding to the Policy-First Browser Telemetry validation page.",
    "",
    `Role: ${v(fields.role)}`,
    `Industry: ${v(fields.industry)}`,
    `Company size: ${v(fields.size)}`,
    //`Contact email: ${v(fields.contact)}`,
    "",
    "1) What audit/compliance question are you trying to answer?",
    v(fields.auditq, "(answer here)"),
    "",
    "2) How do you handle this today?",
    v(fields.current),
    "",
    "3) What would make this a non-starter (legal, privacy, technical)?",
    v(fields.blockers),
    "",
    "Thank you,"
  ].join("\n");
}

(function () {
  const form = document.getElementById("interestForm");
  const copyLink = document.getElementById("copyTemplate");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("primary-nav");

  function byId(id) {
    return document.getElementById(id);
  }

  function val(id) {
    const el = byId(id);
    if (!el) return "";
    return (el.value ?? "").trim();
  }

  function checked(id) {
    const el = byId(id);
    return !!(el && el.checked);
  }

  function getFields() {
    return {
      role: val("role"),
      industry: val("industry"),
      size: val("size"),
//      contact: val("contact"),
      auditq: val("auditq"),
      current: val("current"),
      blockers: val("blockers"),
      consent: checked("consent")
    };
  }

  function markInvalid(fieldId, isInvalid) {
    const field = byId(fieldId);
    if (!field) return;
    const wrapper = field.closest(".field");
    if (!wrapper) return;
    wrapper.classList.toggle("field--invalid", isInvalid);
  }

  function validate(fields) {
    const invalidRole = !fields.role;
    const invalidAudit = !fields.auditq;
    const invalidConsent = !fields.consent;

    markInvalid("role", invalidRole);
    markInvalid("auditq", invalidAudit);
    markInvalid("consent", invalidConsent);

    return !(invalidRole || invalidAudit || invalidConsent);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = getFields();

    if (!validate(fields)) return;

    const subject = "Validation feedback: Policy-First Browser Telemetry";
    const body = templateBody(fields);

    // No backend storage—this opens the user's mail client.
    window.location.href = buildMailto(subject, body);
  });

  if (copyLink) {
    copyLink.addEventListener("click", async (e) => {
      e.preventDefault();

      const fields = getFields();
      const subject = "Validation feedback: Policy-First Browser Telemetry";
      const body = templateBody({
        role: fields.role || "(not provided)",
        industry: fields.industry || "(not provided)",
        size: fields.size || "(not provided)",
//        contact: fields.contact || "(not provided)",
        auditq: fields.auditq || "(not provided)",
        current: fields.current || "(not provided)",
        blockers: fields.blockers || "(not provided)",
        consent: true
      });

      const text = `Subject: ${subject}\n\n${body}`;

      try {
        await navigator.clipboard.writeText(text);
        copyLink.textContent = "copied";
        setTimeout(() => (copyLink.textContent = "copy the message template"), 1500);
      } catch {
      // Fallback: select via prompt
        window.prompt("Copy this message:", text);
      }
    });
  }
})();
