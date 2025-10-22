// ===============================
// Windows 11 Style Calculator JS
// ===============================

// Lấy phần tử DOM
const calculator = document.getElementById("calculator");
const mainDisplay = document.getElementById("mainDisplay");
const expressionDisplay = document.getElementById("expressionDisplay");

// -------------------------------
// Biến trạng thái
// -------------------------------
let currentInput = "0";
let expression = "";
let lastOperator = null;
let waitingForNewInput = false;
let memory = 0;

// -------------------------------
// Cập nhật hiển thị
// -------------------------------
function updateDisplay() {
  mainDisplay.textContent = currentInput;
  expressionDisplay.textContent = expression;
}

// -------------------------------
// Hàm đánh giá biểu thức an toàn
// -------------------------------
function evaluateExpression(expr) {
  try {
    const sanitized = expr.replace(/[^0-9+\-*/().]/g, "");
    const result = Function('"use strict";return (' + sanitized + ")")();

    if (!isFinite(result)) return "Cannot divide by zero";
    return result;
  } catch (e) {
    return "Error";
  }
}

// -------------------------------
// Xử lý nhập số
// -------------------------------
function inputDigit(digit) {
  if (currentInput === "0" || waitingForNewInput) {
    currentInput = digit;
    waitingForNewInput = false;
  } else {
    currentInput += digit;
  }
  updateDisplay();
}

// -------------------------------
// Xử lý dấu thập phân
// -------------------------------
function inputDecimal() {
  if (waitingForNewInput) {
    currentInput = "0.";
    waitingForNewInput = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  updateDisplay();
}

// -------------------------------
// Xử lý toán tử (+ - * /)
// -------------------------------
function inputOperator(op) {
  if (currentInput === "Error" || currentInput.includes("Không thể")) return;

  if (expression && !waitingForNewInput) {
    // Có biểu thức rồi và đang nhập số
    expression += currentInput;
    const result = evaluateExpression(expression);
    currentInput = typeof result === "string" ? result : result.toString();
    expression = result === "Error" ? "" : currentInput + " " + op + " ";
  } else if (!expression) {
    expression = currentInput + " " + op + " ";
  } else {
    // Thay đổi toán tử
    expression = expression.slice(0, -3) + op + " ";
  }

  lastOperator = op;
  waitingForNewInput = true;
  updateDisplay();
}

// -------------------------------
// Xử lý dấu "="
// -------------------------------
function calculate() {
  if (!expression) return;

  expression += currentInput;
  const result = evaluateExpression(expression);

  if (typeof result === "string") {
    currentInput = result;
  } else {
    currentInput = result.toString();
  }

  expressionDisplay.textContent = expression + " =";
  expression = "";
  waitingForNewInput = true;
  updateDisplay();
}

// -------------------------------
// Các phép đơn (√, 1/x, x², +/-)
// -------------------------------
function unaryOperation(type) {
  let num = parseFloat(currentInput);
  if (isNaN(num)) return;

  let result;
  switch (type) {
    case "reciprocal":
      result = num === 0 ? "Cannot divide by zero" : 1 / num;
      break;
    case "square":
      result = num * num;
      break;
    case "sqrt":
      result = num < 0 ? "Đầu vào không hợp lệ" : Math.sqrt(num);
      break;
    case "negate":
      result = -num;
      break;
    case "percent":
      result = num / 100;
      break;
  }

  currentInput = typeof result === "string" ? result : result.toString();
  waitingForNewInput = true;
  updateDisplay();
}

// -------------------------------
// Xóa và chỉnh sửa
// -------------------------------
function clearAll() {
  currentInput = "0";
  expression = "";
  waitingForNewInput = false;
  updateDisplay();
}

function clearEntry() {
  currentInput = "0";
  updateDisplay();
}

function backspace() {
  if (currentInput.includes("lỗi") || currentInput.includes("Error")) return;

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }

  updateDisplay();
}

// -------------------------------
// Bộ nhớ (MC, MR, M+, M-, MS)
// -------------------------------
function handleMemory(action) {
  const num = parseFloat(currentInput);
  if (isNaN(num) && action !== "memory-clear") return;

  switch (action) {
    case "memory-clear":
      memory = 0;
      break;
    case "memory-recall":
      currentInput = memory.toString();
      waitingForNewInput = true;
      break;
    case "memory-add":
      memory += num;
      break;
    case "memory-subtract":
      memory -= num;
      break;
    case "memory-store":
      memory = num;
      break;
  }
  updateDisplay();
}

// -------------------------------
// Lắng nghe sự kiện
// -------------------------------
calculator.addEventListener("click", (e) => {
  const btn = e.target;
  if (!btn.classList.contains("calc-button")) return;

  const value = btn.textContent.trim();
  const type = btn.getAttribute("data-value");
  const action = btn.getAttribute("data-action");

  if (action && action.startsWith("memory")) {
    handleMemory(action);
  } else if (type === "digit") {
    inputDigit(value);
  } else if (type === "decimal") {
    inputDecimal();
  } else if (type === "operator") {
    inputOperator(value);
  } else if (type === "equal") {
    calculate();
  } else if (type === "clear") {
    clearAll();
  } else if (type === "clear-entry") {
    clearEntry();
  } else if (type === "backspace") {
    backspace();
  } else if (
    ["reciprocal", "square", "sqrt", "negate", "percent"].includes(type)
  ) {
    unaryOperation(type);
  }
});

// -------------------------------
// Khởi tạo
// -------------------------------
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (!isNaN(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    inputOperator(key);
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    e.preventDefault();
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});
updateDisplay();
handleMemory("init");
