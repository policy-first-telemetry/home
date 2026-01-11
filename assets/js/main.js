// Client-side validation + mailto submit (no backend).
// Replace EMAIL_TO with an address you control.
const EMAIL_TO = "policy-first.telemetry@proton.me"; // <-- change this

function buildMailto(subject, body) {
  const enc = (s) => encodeURIComponent(s);
  return `mailto:${EMAIL_TO}?subject=${enc(subject)}&body=${enc(body)}`;
}

function templateBody(fields) {
  return [
    "Hello,",
    "",
    "I'm responding to the Policy-First Browser Telemetry validation page.",
    "",
    `Role: ${fields.role}`,
    `Industry: ${fields.industry}`,
    `Company size: ${fields.size}`,
    //fields.contact ? `Contact email: ${fields.contact}` : "Contact email: (not provided)",
    "",
    "1) What audit/compliance question are you trying to answer?",
    fields.auditq,
    "",
    "2) What would make this a non-starter (legal, privacy, technical)?",
    fields.blockers,
    "",
    "Thank you,"
  ].join("\n");
}

(function () {
  const form = document.getElementById("interestForm");
  const copyLink = document.getElementById("copyTemplate");

  function getFields() {
    return {
      role: document.getElementById("role").value,
      industry: document.getElementById("industry").value,
      size: document.getElementById("size").value,
      //contact: document.getElementById("contact").value.trim(),
      auditq: document.getElementById("auditq").value.trim(),
      blockers: document.getElementById("blockers").value.trim(),
      consent: document.getElementById("consent").checked
    };
  }

  function validate(fields) {
    // Bootstrap validation UI
    const ok = fields.role && fields.industry && fields.size && fields.auditq && fields.blockers && fields.consent;
    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = getFields();

    // Trigger bootstrap validation styling
    form.classList.add("was-validated");

    if (!validate(fields)) return;

    const subject = "Validation feedback: Policy-First Browser Telemetry";
    const body = templateBody(fields);

    // If the user provided a contact email, include it in the body only.
    // No backend storage—this opens the user's mail client.
    window.location.href = buildMailto(subject, body);
  });

  copyLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const fields = getFields();

    const subject = "Validation feedback: Policy-First Browser Telemetry";
    const body = templateBody({
      role: fields.role || "(your role)",
      industry: fields.industry || "(your industry)",
      size: fields.size || "(company size)",
      //contact: fields.contact || "",
      auditq: fields.auditq || "(answer here)",
      blockers: fields.blockers || "(answer here)",
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
})();
