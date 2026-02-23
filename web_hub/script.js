const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");
const clockZone = document.getElementById("clockZone");
const year = document.getElementById("year");
const display = document.getElementById("calcDisplay");
const clearAllBtn = document.getElementById("clearAllBtn");
const ideaBtn = document.getElementById("ideaBtn");
const ideaTip = document.getElementById("ideaTip");

let expression = "0";
let showFreshInput = false;

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

function handleKeyboard(event) {
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

document.querySelector(".calc-grid").addEventListener("click", handleButtonClick);
clearAllBtn.addEventListener("click", resetCalculator);
document.addEventListener("keydown", handleKeyboard);
ideaBtn.addEventListener("click", toggleTip);

year.textContent = new Date().getFullYear();
resetCalculator();
updateClock();
setInterval(updateClock, 1000);
