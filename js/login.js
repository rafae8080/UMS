// ===== DOM ELEMENTS =====
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const showIcon = document.querySelector(".show-icon");
const hideIcon = document.querySelector(".hide-icon");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");

// ===== PASSWORD TOGGLE FUNCTIONALITY =====

/**
 * Toggles password visibility
 */
function togglePasswordVisibility() {
  const type = passwordInput.getAttribute("type");

  if (type === "password") {
    // Show password
    passwordInput.setAttribute("type", "text");
    showIcon.style.display = "none";
    hideIcon.style.display = "block";
  } else {
    // Hide password
    passwordInput.setAttribute("type", "password");
    showIcon.style.display = "block";
    hideIcon.style.display = "none";
  }
}

// ===== VALIDATION & ERROR HANDLING =====

/**
 * Shows error message and adds error styling
 * @param {string} message - Error message to display
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");

  // Add error class to inputs
  emailInput.classList.add("error");
  passwordInput.classList.add("error");
}

/**
 * Clears error message and removes error styling
 */
function clearError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("show");

  // Remove error class from inputs
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");
}

/**
 * Shows loading state on submit button
 */
function showLoading() {
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  emailInput.disabled = true;
  passwordInput.disabled = true;
}

/**
 * Hides loading state on submit button
 */
function hideLoading() {
  submitBtn.classList.remove("loading");
  submitBtn.disabled = false;
  emailInput.disabled = false;
  passwordInput.disabled = false;
}

// ===== FORM SUBMISSION =====

/**
 * Handles login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
  e.preventDefault();

  // Clear any previous errors
  clearError();

  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Basic validation
  if (!email || !password) {
    showError("Please enter both email and password");
    return;
  }

  // Show loading state
  showLoading();

  // Simulate API call (replace this with your actual backend call)
  setTimeout(() => {
    // For demo purposes, we'll check against dummy credentials
    // TODO: Replace with actual authentication logic

    const validEmail = "admin@example.com";
    const validPassword = "123";

    if (email === validEmail && password === validPassword) {
      // Success - redirect to dashboard
      console.log("Login successful!");
      window.location.href = "ums.html";
      hideLoading();
    } else {
      // Error - invalid credentials
      hideLoading();
      showError("Incorrect username or password");
    }
  }, 1500); // Simulated delay
}

// ===== EVENT LISTENERS =====

// Password toggle button
togglePasswordBtn.addEventListener("click", togglePasswordVisibility);

// Form submission
loginForm.addEventListener("submit", handleLogin);

// Clear errors when user starts typing
emailInput.addEventListener("input", clearError);
passwordInput.addEventListener("input", clearError);
