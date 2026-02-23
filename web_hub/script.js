const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");
const clockZone = document.getElementById("clockZone");
const clockRegionLabel = document.getElementById("clockRegionLabel");
const clockRegionSelect = document.getElementById("clockRegionSelect");
const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const year = document.getElementById("year");
const themeSelect = document.getElementById("themeSelect");
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
const emojiBurstPower = document.getElementById("emojiBurstPower");
const emojiBurstValue = document.getElementById("emojiBurstValue");
const emojiSoundToggle = document.getElementById("emojiSoundToggle");

const FEEDBACK_REPO_URL = "https://github.com/Techologoutility/Techologoutility.github.io";

let expression = "0";
let showFreshInput = false;
let isCalculatorOpen = false;
let isEmojiOpen = false;
let emojiAudioContext = null;
let emojiNoiseBuffer = null;
let clockIntervalId = null;

const EMOJI_PROFILES = {
  "Smile": { animationClass: "fx-bounce", sound: "chime", spread: 1.0, countScale: 1.0 },
  "Cool face": { animationClass: "fx-wave", sound: "cool", spread: 1.15, countScale: 1.0 },
  "Party face": { animationClass: "fx-pop", sound: "party", spread: 1.35, countScale: 1.25 },
  "Fire": { animationClass: "fx-flare", sound: "flare", spread: 1.1, countScale: 1.15 },
  "Sparkles": { animationClass: "fx-spark", sound: "spark", spread: 1.25, countScale: 1.2 },
  "Boom": { animationClass: "fx-boom", sound: "boom", spread: 1.45, countScale: 1.4 },
  "Heart": { animationClass: "fx-heart", sound: "warm", spread: 0.9, countScale: 0.9 },
  "Rocket": { animationClass: "fx-rocket", sound: "rocket", spread: 1.6, countScale: 1.1 },
  "Party popper": { animationClass: "fx-party", sound: "confetti", spread: 1.35, countScale: 1.35 },
  "Rainbow": { animationClass: "fx-rainbow", sound: "rainbow", spread: 1.2, countScale: 1.0 },
};

function getEmojiProfile(label) {
  return EMOJI_PROFILES[label] || { animationClass: "fx-bounce", sound: "chime", spread: 1.0, countScale: 1.0 };
}

function applyTheme(themeName) {
  const safeTheme = themeName || "default";
  if (safeTheme === "default") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.setAttribute("data-theme", safeTheme);
  }
  try {
    localStorage.setItem("utilityHubTheme", safeTheme);
  } catch {}
}

function initializeTheme() {
  let savedTheme = "default";
  try {
    savedTheme = localStorage.getItem("utilityHubTheme") || "default";
  } catch {}

  const available = Array.from(themeSelect.options).map((opt) => opt.value);
  if (!available.includes(savedTheme)) {
    savedTheme = "default";
  }

  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
}
function updateClock() {
  if (!clockTime || !clockDate || !clockZone || !clockRegionSelect || !hourHand || !minuteHand || !secondHand) {
    return;
  }

  const now = new Date();
  const selectedValue = clockRegionSelect.value || "local";
  const selectedOption = clockRegionSelect.options[clockRegionSelect.selectedIndex] || null;
  const selectedLabel = selectedOption ? selectedOption.text : "My Local Time";
  const selectedLocale = selectedOption?.dataset?.locale || "en-US";
  const timeZone = selectedValue === "local" ? undefined : selectedValue;

  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const getPart = (type) => Number(timeParts.find((p) => p.type === type)?.value || 0);
  const hour24 = getPart("hour");
  const minute = getPart("minute");
  const second = getPart("second");
  const ms = now.getMilliseconds();

  const hourAngle = ((hour24 % 12) + minute / 60 + second / 3600) * 30;
  const minuteAngle = (minute + second / 60 + ms / 60000) * 6;
  const secondAngle = (second + ms / 1000) * 6;

  hourHand.style.transform = "translateX(-50%) rotate(" + hourAngle + "deg)";
  minuteHand.style.transform = "translateX(-50%) rotate(" + minuteAngle + "deg)";
  secondHand.style.transform = "translateX(-50%) rotate(" + secondAngle + "deg)";

  clockTime.textContent = new Intl.DateTimeFormat(selectedLocale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  clockDate.textContent = new Intl.DateTimeFormat(selectedLocale, {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const resolvedLocalZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zoneText = selectedValue === "local" ? (resolvedLocalZone || "Local Time") : selectedValue;
  clockZone.textContent = "Timezone: " + zoneText;
  clockRegionLabel.textContent = selectedLabel;
}

function startClockTicker() {
  if (clockIntervalId) {
    clearInterval(clockIntervalId);
  }

  updateClock();
  clockIntervalId = setInterval(() => {
    try {
      updateClock();
    } catch {}
  }, 250);
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
  if (!emojiSection || !emojiContent || !emojiClosedHint || !toggleEmojiBtn) return;

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

function createFlyingEmoji(char, originX, originY, power, profile) {
  const node = document.createElement("span");
  node.className = "flying-emoji " + (profile.animationClass || "fx-bounce");
  node.textContent = char;

  const intensity = Math.max(6, Number(power) || 12);
  const spread = profile.spread || 1;
  const angle = Math.random() * Math.PI * 2;
  const distance = (80 + Math.random() * (18 * intensity)) * spread;
  const driftX = Math.cos(angle) * distance;
  const driftY = Math.sin(angle) * distance - (20 + Math.random() * (10 * intensity));
  const midX = originX + driftX * (0.38 + Math.random() * 0.18);
  const midY = originY + driftY * (0.35 + Math.random() * 0.22) - (18 + Math.random() * 40);
  const rotate = (-240 + Math.random() * 480).toFixed(0) + "deg";
  const duration = Math.floor(680 + Math.random() * (45 * intensity)) + "ms";
  const scale = (0.85 + Math.random() * 1.4).toFixed(2);
  const fontSize = (18 + Math.random() * (1.6 * intensity)).toFixed(0) + "px";

  node.style.fontSize = fontSize;
  node.style.setProperty("--start-x", originX + "px");
  node.style.setProperty("--start-y", originY + "px");
  node.style.setProperty("--mid-x", midX + "px");
  node.style.setProperty("--mid-y", midY + "px");
  node.style.setProperty("--end-x", originX + driftX + "px");
  node.style.setProperty("--end-y", originY + driftY + "px");
  node.style.setProperty("--emoji-rotate", rotate);
  node.style.setProperty("--emoji-duration", duration);
  node.style.setProperty("--emoji-scale", scale);

  node.addEventListener("animationend", () => node.remove(), { once: true });
  emojiFxLayer.appendChild(node);
}

function burstEmoji(char, anchorEl, profile) {
  const rect = anchorEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const activeProfile = profile || getEmojiProfile("");
  const sliderCount = Math.max(6, Number(emojiBurstPower.value) || 12);
  const count = Math.max(4, Math.round(sliderCount * (activeProfile.countScale || 1)));

  for (let i = 0; i < count; i += 1) {
    const jitterX = (Math.random() - 0.5) * 24;
    const jitterY = (Math.random() - 0.5) * 24;
    createFlyingEmoji(char, centerX + jitterX, centerY + jitterY, sliderCount, activeProfile);
  }

  return { power: sliderCount, profile: activeProfile };
}

function handleEmojiPickerClick(event) {
  const button = event.target.closest(".emoji-btn");
  if (!button) return;

  const char = (button.textContent || "").trim();
  if (!char) return;

  const label = (button.getAttribute("aria-label") || "").trim();
  const profile = getEmojiProfile(label);
  const result = burstEmoji(char, button, profile);
  playEmojiBurstSound(result.power, result.profile);
}

function updateEmojiBurstLabel() {
  emojiBurstValue.textContent = String(emojiBurstPower.value);
}

function getNoiseBuffer(ctx) {
  if (emojiNoiseBuffer) return emojiNoiseBuffer;

  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  emojiNoiseBuffer = buffer;
  return buffer;
}

function getEmojiAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!emojiAudioContext) {
    emojiAudioContext = new AudioCtx();
  }
  return emojiAudioContext;
}

function playEmojiBurstSound(power, profile) {
  if (!emojiSoundToggle.checked) return;

  const ctx = getEmojiAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const intensity = Math.max(6, Number(power) || 12);
  const soundType = profile?.sound || "chime";

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.055 + intensity * 0.0018, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  master.connect(ctx.destination);

  function tone(type, f1, f2, duration, detune) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, now);
    if (f2) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, f2), now + duration);
    }
    if (detune) {
      osc.detune.setValueAtTime(detune, now);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.65, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noiseBurst(duration, highpassHz) {
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = getNoiseBuffer(ctx);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(highpassHz, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  switch (soundType) {
    case "boom":
      tone("sine", 180 + intensity * 5, 70, 0.2, 0);
      tone("triangle", 95 + intensity * 2, 50, 0.22, -4);
      noiseBurst(0.08, 900);
      break;
    case "spark":
      tone("square", 1100 + intensity * 20, 450, 0.12, 0);
      tone("triangle", 1400 + intensity * 30, 700, 0.09, 8);
      noiseBurst(0.05, 2500);
      break;
    case "rocket":
      tone("sawtooth", 260 + intensity * 8, 620 + intensity * 12, 0.18, 0);
      tone("triangle", 180, 90, 0.2, -7);
      break;
    case "warm":
      tone("sine", 420, 260, 0.18, 0);
      tone("triangle", 520, 310, 0.16, 3);
      break;
    case "flare":
      tone("sawtooth", 500 + intensity * 10, 260, 0.16, 0);
      noiseBurst(0.06, 1800);
      break;
    case "party":
      tone("triangle", 760, 520, 0.1, 0);
      tone("square", 980, 740, 0.08, 10);
      tone("triangle", 640, 420, 0.12, -8);
      break;
    case "confetti":
      tone("triangle", 900, 700, 0.08, 0);
      tone("sine", 1200, 840, 0.07, 6);
      noiseBurst(0.04, 2200);
      break;
    case "rainbow":
      tone("sine", 520, 780, 0.1, 0);
      tone("triangle", 660, 980, 0.14, 4);
      break;
    case "cool":
      tone("triangle", 430, 240, 0.16, 0);
      tone("sine", 680, 380, 0.12, -6);
      break;
    case "chime":
    default:
      tone("triangle", 720 + intensity * 8, 460, 0.14, 0);
      tone("sine", 960 + intensity * 10, 620, 0.1, 6);
      break;
  }
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
document.querySelector(".emoji-picker")?.addEventListener("click", handleEmojiPickerClick);
clearAllBtn.addEventListener("click", resetCalculator);
toggleCalculatorBtn.addEventListener("click", () => setCalculatorOpen(!isCalculatorOpen));
clockRegionSelect.addEventListener("change", () => { updateClock(); startClockTicker(); });
toggleEmojiBtn?.addEventListener("click", () => setEmojiOpen(!isEmojiOpen));
emojiBurstPower?.addEventListener("input", updateEmojiBurstLabel);
document.addEventListener("keydown", handleKeyboard);
themeSelect.addEventListener("change", (event) => applyTheme(event.target.value));
window.addEventListener("hashchange", maybeOpenCalculatorFromHash);
window.addEventListener("hashchange", maybeOpenEmojiFromHash);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateClock(); });
ideaBtn.addEventListener("click", toggleTip);
feedbackForm.addEventListener("submit", openGitHubFeedbackIssue);
copyFeedbackBtn.addEventListener("click", copyFeedbackDraft);

year.textContent = new Date().getFullYear();
initializeTheme();
resetCalculator();
setCalculatorOpen(false);
if (emojiSection) setEmojiOpen(false);
if (emojiBurstPower && emojiBurstValue) updateEmojiBurstLabel();
startClockTicker();













