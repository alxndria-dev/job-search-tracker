const STORAGE_KEY = "clear-signal-applications-v1";
const today = new Date();
const iso = (date) => new Date(date).toISOString().slice(0, 10);
const dateOffset = (days) => iso(new Date(today.getTime() + days * 86400000));

const seed = [
  { id: crypto.randomUUID(), company: "Nory", role: "Product Designer", stage: "interview", fit: 4, appliedDate: dateOffset(-17), followUpDate: dateOffset(2), nextAction: "Prepare questions for Head of Product interview", fitEvidence: "B2B AI, complex workflows, product-design-engineering background.", risks: "Restaurant domain knowledge is new; process may be slow.", learning: "Need to make the AI collaboration and operational experience concrete." },
  { id: crypto.randomUUID(), company: "Linear", role: "Staff Product Designer", stage: "applied", fit: 5, appliedDate: dateOffset(-8), followUpDate: dateOffset(6), nextAction: "Send focused portfolio follow-up", fitEvidence: "Design systems, async operating model, high-bar product craft.", risks: "Exceptionally competitive; portfolio must carry the case.", learning: "" },
  { id: crypto.randomUUID(), company: "Checkly", role: "Product Designer", stage: "closed", fit: 4, appliedDate: dateOffset(-32), followUpDate: "", nextAction: "", fitEvidence: "Developer tooling and design-engineering overlap.", risks: "Interview was cancelled without context.", learning: "Do not keep a cancelled process active indefinitely. Follow up once, then close it." },
  { id: crypto.randomUUID(), company: "Example Co", role: "Senior Product Designer", stage: "applied", fit: 2, appliedDate: dateOffset(-23), followUpDate: "", nextAction: "", fitEvidence: "Interesting product space.", risks: "Weak direct evidence of fit and unclear remote policy.", learning: "" }
];

let applications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || seed;
let filters = { query: "", stage: "all", action: "all" };
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value = "") => String(value).replace(/[&<>'\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
const activeStages = ["applied", "screen", "interview", "final", "offer"];
const prettyStage = (stage) => stage === "final" ? "Final round" : stage[0].toUpperCase() + stage.slice(1);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
const daysBetween = (date) => Math.ceil((new Date(date) - new Date(iso(today))) / 86400000);

function actionState(application) {
  if (!activeStages.includes(application.stage)) return "done";
  if (!application.nextAction.trim()) return "none";
  if (application.followUpDate && daysBetween(application.followUpDate) <= 0) return "due";
  if (!application.followUpDate && application.appliedDate && daysBetween(application.appliedDate) < -14) return "stale";
  return "planned";
}

function filteredApplications() {
  return applications.filter(app => {
    const query = `${app.company} ${app.role}`.toLowerCase().includes(filters.query.toLowerCase());
    const stage = filters.stage === "all" || app.stage === filters.stage;
    const state = actionState(app);
    const action = filters.action === "all" || state === filters.action;
    return query && stage && action;
  }).sort((a, b) => {
    const aPriority = ["due", "stale", "none"].indexOf(actionState(a));
    const bPriority = ["due", "stale", "none"].indexOf(actionState(b));
    return (aPriority === -1 ? 9 : aPriority) - (bPriority === -1 ? 9 : bPriority);
  });
}

function renderMetrics() {
  const active = applications.filter(app => activeStages.includes(app.stage));
  const due = active.filter(app => actionState(app) === "due").length;
  const stale = active.filter(app => actionState(app) === "stale").length;
  const noAction = active.filter(app => actionState(app) === "none").length;
  const metrics = [
    [active.length, "Active opportunities", "A pipeline is not progress unless it has a next move."],
    [due, "Actions due now", due ? "These can still change an outcome." : "Nothing urgent today."],
    [stale, "Likely cold", stale ? "Stop counting silence as an active lead." : "No stale applications."],
    [noAction, "No next action", noAction ? "Decide: follow up, archive, or wait for a reason." : "Every active role has a move."]
  ];
  $("#metrics").innerHTML = metrics.map(([number, label, text]) => `<article class="metric"><p class="eyebrow">${label.toUpperCase()}</p><p class="number">${number}</p><p>${text}</p></article>`).join("");
  const priority = due + stale + noAction;
  $("#hero-copy").textContent = priority ? `${priority} opportunity${priority === 1 ? " needs" : "ies need"} a decision or action. Work those before adding another application.` : "Your active pipeline has a next move. Protect that momentum.";
}

function renderReality() {
  const active = applications.filter(app => activeStages.includes(app.stage));
  const weakFit = active.filter(app => Number(app.fit) <= 2).length;
  const interviews = applications.filter(app => ["interview", "final", "offer"].includes(app.stage)).length;
  const sourceMessage = interviews ? `${interviews} application${interviews === 1 ? " has" : "s have"} moved beyond an initial screen. Capture what created momentum before you forget.` : "No applications have reached interview yet. Review your role targeting and proof of fit, not just application volume.";
  const cards = [
    [weakFit ? "warning" : "", "Fit quality", weakFit ? `${weakFit} active role${weakFit === 1 ? " is" : "s are"} scored 1–2. That may be a deliberate stretch, but do not let them crowd out stronger evidence-led applications.` : "Your active roles have at least plausible evidence of fit."],
    ["", "Pipeline signal", sourceMessage],
    [active.some(app => !app.fitEvidence.trim()) ? "danger" : "", "Evidence check", active.some(app => !app.fitEvidence.trim()) ? "At least one active application has no written proof of fit. If you cannot name it, it is probably not a strong target." : "Every active application has recorded fit evidence."]
  ];
  $("#reality-check").innerHTML = cards.map(([tone, title, copy]) => `<article class="reality-card ${tone}"><h3>${title}</h3><p>${copy}</p></article>`).join("");
}

function stateLabel(app) {
  const state = actionState(app);
  if (state === "due") return `<span class="status due">Follow up due</span>`;
  if (state === "stale") return `<span class="status stale">Likely cold</span>`;
  if (state === "none") return `<span class="status none">No next action</span>`;
  if (app.followUpDate) return `<span class="detail">${escapeHTML(app.followUpDate)}</span>`;
  return `<span class="detail">—</span>`;
}

function renderApplications() {
  const rows = filteredApplications();
  $("#application-list").innerHTML = rows.length ? rows.map(app => `<tr>
    <td><span class="company">${escapeHTML(app.company)}</span><span class="role">${escapeHTML(app.role)}</span></td>
    <td><span class="tag ${app.stage}">${prettyStage(app.stage)}</span></td>
    <td><strong>${app.fit}/5</strong><span class="detail">${app.fit >= 4 ? "evidence-led" : app.fit <= 2 ? "stretch" : "plausible"}</span></td>
    <td>${app.nextAction ? `<span>${escapeHTML(app.nextAction)}</span>` : `<span class="status none">Not defined</span>`}</td>
    <td>${stateLabel(app)}</td>
    <td><button class="row-button" data-edit="${app.id}">Review</button></td>
  </tr>`).join("") : `<tr><td colspan="6" class="detail">No applications match these filters.</td></tr>`;
  document.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openDialog(button.dataset.edit)));
}

function render() { renderMetrics(); renderReality(); renderApplications(); }

function openDialog(id = null) {
  const dialog = $("#application-dialog");
  const app = applications.find(item => item.id === id);
  $("#dialog-title").textContent = app ? "Review application" : "Add application";
  $("#application-id").value = app?.id || "";
  $("#company").value = app?.company || ""; $("#role").value = app?.role || ""; $("#stage").value = app?.stage || "applied"; $("#fit").value = app?.fit || "3";
  $("#applied-date").value = app?.appliedDate || iso(today); $("#follow-up-date").value = app?.followUpDate || ""; $("#next-action").value = app?.nextAction || "";
  $("#fit-evidence").value = app?.fitEvidence || ""; $("#risks").value = app?.risks || ""; $("#learning").value = app?.learning || "";
  dialog.showModal();
}

$("#application-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const item = { id: form.get("id") || crypto.randomUUID(), company: form.get("company").trim(), role: form.get("role").trim(), stage: form.get("stage"), fit: Number(form.get("fit")), appliedDate: form.get("appliedDate"), followUpDate: form.get("followUpDate"), nextAction: form.get("nextAction").trim(), fitEvidence: form.get("fitEvidence").trim(), risks: form.get("risks").trim(), learning: form.get("learning").trim() };
  const index = applications.findIndex(app => app.id === item.id);
  if (index >= 0) applications[index] = item; else applications.unshift(item);
  save(); $("#application-dialog").close(); render();
});

$("#add-button").addEventListener("click", () => openDialog());
$("#focus-action").addEventListener("click", () => { $("#action-filter").value = "due"; filters.action = "due"; renderApplications(); $("#applications-title").scrollIntoView({ behavior:"smooth" }); });
$("#search").addEventListener("input", event => { filters.query = event.target.value; renderApplications(); });
$("#stage-filter").addEventListener("change", event => { filters.stage = event.target.value; renderApplications(); });
$("#action-filter").addEventListener("change", event => { filters.action = event.target.value; renderApplications(); });
$("#export-button").addEventListener("click", () => { const blob = new Blob([JSON.stringify(applications, null, 2)], {type:"application/json"}); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `clear-signal-backup-${iso(today)}.json`; link.click(); URL.revokeObjectURL(link.href); });

render();
