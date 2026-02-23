const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");
const clockZone = document.getElementById("clockZone");
const indiaClockDate = document.getElementById("indiaClockDate");
const indiaClockTime = document.getElementById("indiaClockTime");
const year = document.getElementById("year");
const display = document.getElementById("calcDisplay");
const clearAllBtn = document.getElementById("clearAllBtn");
const ideaBtn = document.getElementById("ideaBtn");
const ideaTip = document.getElementById("ideaTip");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");
const copyFeedbackBtn = document.getElementById("copyFeedbackBtn");
const calculatorSection = document.getElementById("calculator");
const calculatorContent = document.getElementById("calculatorContent");
const toggleCalculatorBtn = document.getElementById("toggleCalculatorBtn");
const calcClosedHint = document.getElementById("calcClosedHint");
const emojiSection = document.getElementById("emoji-playground");
const emojiContent = document.getElementById("emojiContent");
const toggleEmojiBtn = document.getElementById("toggleEmojiBtn");
const emojiClosedHint = document.getElementById("emojiClosedHint");
const emojiFxLayer = document.getElementById("emojiFxLayer");

const FEEDBACK_REPO_URL = "https://github.com/Techologoutility/Techologoutility.github.io";

let expression = "0";
let showFreshInput = false;
let isCalculatorOpen = false;
let isEmojiOpen = false;

function updateClock() {
  const now = new Date();

  clockTime.textContent = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  clockDate.textContent = new Intl.DateTimeFormat([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  indiaClockTime.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  indiaClockDate.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  clockZone.textContent = zone ? "Timezone: " + zone : "Local Time";
}

function renderDisplay() {
  display.value = expression || "0";
}

function resetCalculator() {
  expression = "0";
  showFreshInput = false;
  renderDisplay();
}

function appendValue(value) {
  if (showFreshInput) {
    expression = "0";
    showFreshInput = false;
  }

  if (expression === "0" && value !== "." && value !== "(") {
    expression = value;
  } else {
    expression += value;
  }

  renderDisplay();
}

function deleteLast() {
  if (showFreshInput) {
    resetCalculator();
    return;
  }

  expression = expression.length > 1 ? expression.slice(0, -1) : "0";
  renderDisplay();
}

function calculateResult() {
  const safe = /^[0-9+\-*/().\s]+$/;
  if (!safe.test(expression)) {
    expression = "Error";
    showFreshInput = true;
    renderDisplay();
    return;
  }

  try {
    const result = Function("return (" + expression + ")")();
    if (!Number.isFinite(result)) {
      throw new Error("Invalid result");
    }
    expression = String(result);
  } catch {
    expression = "Error";
  }

  showFreshInput = true;
  renderDisplay();
}

function handleButtonClick(event) {
  const target = event.target.closest("button");
  if (!target) return;

  const { value, action } = target.dataset;

  if (value) {
    appendValue(value);
    return;
  }

  if (action === "clear") {
    resetCalculator();
  } else if (action === "delete") {
    deleteLast();
  } else if (action === "equals") {
    calculateResult();
  }
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

function setCalculatorOpen(shouldOpen) {
  isCalculatorOpen = Boolean(shouldOpen);
  calculatorContent.hidden = !isCalculatorOpen;
  calculatorSection.classList.toggle("is-collapsed", !isCalculatorOpen);
  toggleCalculatorBtn.setAttribute("aria-expanded", String(isCalculatorOpen));
  toggleCalculatorBtn.textContent = isCalculatorOpen ? "Hide Calculator" : "Open Calculator";
  clearAllBtn.disabled = !isCalculatorOpen;
  calcClosedHint.hidden = isCalculatorOpen;
}

function maybeOpenCalculatorFromHash() {
  if (window.location.hash === "#calculator") {
    setCalculatorOpen(true);
  }
}

function setEmojiOpen(shouldOpen) {
  isEmojiOpen = Boolean(shouldOpen);
  emojiContent.hidden = !isEmojiOpen;
  emojiSection.classList.toggle("is-collapsed", !isEmojiOpen);
  emojiClosedHint.hidden = isEmojiOpen;
  toggleEmojiBtn.setAttribute("aria-expanded", String(isEmojiOpen));
  toggleEmojiBtn.textContent = isEmojiOpen ? "Hide Emoji Fun" : "Show Emoji Fun";
}

function maybeOpenEmojiFromHash() {
  if (window.location.hash === "#emoji-playground") {
    setEmojiOpen(true);
  }
}

function createFlyingEmoji(char, originX, originY) {
  const node = document.createElement("span");
  node.className = "flying-emoji";
  node.textContent = char;

  const angle = Math.random() * Math.PI * 2;
  const distance = 90 + Math.random() * 260;
  const driftX = Math.cos(angle) * distance;
  const driftY = Math.sin(angle) * distance - (30 + Math.random() * 120);
  const rotate = (-220 + Math.random() * 440).toFixed(0) + "deg";
  const duration = Math.floor(900 + Math.random() * 900) + "ms";
  const scale = (0.9 + Math.random() * 1.2).toFixed(2);

  node.style.setProperty("--start-x", originX + "px");
  node.style.setProperty("--start-y", originY + "px");
  node.style.setProperty("--end-x", originX + driftX + "px");
  node.style.setProperty("--end-y", originY + driftY + "px");
  node.style.setProperty("--emoji-rotate", rotate);
  node.style.setProperty("--emoji-duration", duration);
  node.style.setProperty("--emoji-scale", scale);

  node.addEventListener("animationend", () => node.remove(), { once: true });
  emojiFxLayer.appendChild(node);
}

function burstEmoji(char, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i += 1) {
    const jitterX = (Math.random() - 0.5) * 20;
    const jitterY = (Math.random() - 0.5) * 20;
    createFlyingEmoji(char, centerX + jitterX, centerY + jitterY);
  }
}

function handleEmojiPickerClick(event) {
  const button = event.target.closest(".emoji-btn");
  if (!button) return;
  const char = (button.textContent || "").trim();
  if (!char) return;
  burstEmoji(char, button);
}

function handleKeyboard(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (isTypingTarget(event.target)) return;
  if (!isCalculatorOpen) return;

  const key = event.key;
  const allowed = "0123456789+-*/().";

  if (allowed.includes(key)) {
    appendValue(key);
    return;
  }

  if (key === "Enter") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    deleteLast();
    return;
  }

  if (key === "Escape") {
    resetCalculator();
  }
}

function toggleTip() {
  ideaTip.hidden = !ideaTip.hidden;
  ideaBtn.textContent = ideaTip.hidden ? "Show Tip" : "Hide Tip";
}

function buildFeedbackDraft() {
  const type = document.getElementById("feedbackType").value.trim();
  const name = document.getElementById("feedbackName").value.trim() || "Anonymous";
  const rating = document.getElementById("feedbackRating").value.trim();
  const contact = document.getElementById("feedbackContact").value.trim() || "Not shared";
  const message = document.getElementById("feedbackMessage").value.trim();
  const feature = document.getElementById("feedbackFeature").value.trim() || "None";

  const title = "[" + type + "] " + (feature !== "None" ? feature : "Website feedback");
  const body = [
    "## Feedback Type",
    type,
    "",
    "## From",
    name,
    "",
    "## Rating",
    rating + "/5",
    "",
    "## Contact (optional)",
    contact,
    "",
    "## Experience / Tip / Problem",
    message || "No message provided.",
    "",
    "## Requested Feature",
    feature,
  ].join("\n");

  return { title, body };
}

function setFeedbackStatus(message, isError) {
  feedbackStatus.textContent = message;
  feedbackStatus.classList.toggle("error", Boolean(isError));
}

function openGitHubFeedbackIssue(event) {
  event.preventDefault();

  const message = document.getElementById("feedbackMessage").value.trim();
  if (!message) {
    setFeedbackStatus("Please write your feedback message first.", true);
    return;
  }

  const draft = buildFeedbackDraft();
  const issueUrl = FEEDBACK_REPO_URL + "/issues/new?title=" + encodeURIComponent(draft.title) + "&body=" + encodeURIComponent(draft.body);

  window.open(issueUrl, "_blank", "noopener,noreferrer");
  setFeedbackStatus("GitHub issue form opened in a new tab. Submit it there to save your feedback.", false);
}

async function copyFeedbackDraft() {
  const message = document.getElementById("feedbackMessage").value.trim();
  if (!message) {
    setFeedbackStatus("Write feedback first, then click Copy.", true);
    return;
  }

  const draft = buildFeedbackDraft();
  const text = draft.title + "\n\n" + draft.body;

  try {
    await navigator.clipboard.writeText(text);
    setFeedbackStatus("Feedback text copied. You can paste it into GitHub, email, or notes.", false);
  } catch {
    setFeedbackStatus("Copy failed in this browser. You can still use Submit via GitHub.", true);
  }
}

document.querySelector(".calc-grid").addEventListener("click", handleButtonClick);
document.querySelector(".emoji-picker").addEventListener("click", handleEmojiPickerClick);
clearAllBtn.addEventListener("click", resetCalculator);
toggleCalculatorBtn.addEventListener("click", () => setCalculatorOpen(!isCalculatorOpen));
toggleEmojiBtn.addEventListener("click", () => setEmojiOpen(!isEmojiOpen));
document.addEventListener("keydown", handleKeyboard);
window.addEventListener("hashchange", maybeOpenCalculatorFromHash);
window.addEventListener("hashchange", maybeOpenEmojiFromHash);
ideaBtn.addEventListener("click", toggleTip);
feedbackForm.addEventListener("submit", openGitHubFeedbackIssue);
copyFeedbackBtn.addEventListener("click", copyFeedbackDraft);

year.textContent = new Date().getFullYear();
resetCalculator();
setCalculatorOpen(false);
setEmojiOpen(false);
updateClock();
setInterval(updateClock, 1000);




