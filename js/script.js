// ===== STATE MANAGEMENT =====
let isEditMode = false;
let currentUserId = null;
let currentActionMenu = null;

// ===== DOM ELEMENTS =====
const elements = {
  // Modals
  userModal: document.getElementById("userModal"),
  deleteModal: document.getElementById("deleteModal"),

  // Buttons
  openCreateModalBtn: document.getElementById("openCreateModal"),
  closeModalBtn: document.getElementById("closeModal"),
  cancelBtn: document.getElementById("cancelBtn"),
  submitBtn: document.getElementById("submitBtn"),
  generatePasswordBtn: document.getElementById("generatePasswordBtn"),
  copyPasswordBtn: document.getElementById("copyPasswordBtn"),
  resetPasswordBtn: document.getElementById("resetPasswordBtn"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

  // Form
  userForm: document.getElementById("userForm"),
  modalTitle: document.getElementById("modalTitle"),
  emailGroup: document.getElementById("emailGroup"),
  passwordGroup: document.getElementById("passwordGroup"),
  resetPasswordSection: document.getElementById("resetPasswordSection"),

  // Inputs
  emailInput: document.getElementById("email"),
  firstNameInput: document.getElementById("firstName"),
  lastNameInput: document.getElementById("lastName"),
  roleSelect: document.getElementById("role"),
  passwordInput: document.getElementById("password"),
  searchInput: document.getElementById("searchInput"),

  // Table
  usersTableBody: document.getElementById("usersTableBody"),

  // Alert
  alert: document.getElementById("alert"),
};

// ===== MODAL FUNCTIONS =====

/**
 * Opens the modal in CREATE mode
 */
function openCreateModal() {
  isEditMode = false;
  currentUserId = null;

  // Update modal title
  elements.modalTitle.textContent = "Create new user";

  // Show email and password fields
  elements.emailGroup.style.display = "flex";
  elements.passwordGroup.style.display = "flex";
  elements.resetPasswordSection.style.display = "none";

  // Update submit button text
  elements.submitBtn.textContent = "Create user";

  // Reset form
  elements.userForm.reset();
  elements.passwordInput.type = "password";

  // Show modal
  elements.userModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

/**
 * Opens the modal in EDIT mode
 * @param {Object} userData - User data to populate the form
 */
function openEditModal(userData) {
  isEditMode = true;
  currentUserId = userData.id;

  // Update modal title
  elements.modalTitle.textContent = "Edit user";

  // Hide email and password fields (can't edit email, password has separate reset)
  elements.emailGroup.style.display = "none";
  elements.passwordGroup.style.display = "none";
  elements.resetPasswordSection.style.display = "flex";

  // Update submit button text
  elements.submitBtn.textContent = "Update user";

  // Populate form with user data
  elements.firstNameInput.value = userData.firstName || "";
  elements.lastNameInput.value = userData.lastName || "";
  elements.roleSelect.value = userData.role || "barangay_official";

  // Show modal
  elements.userModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

/**
 * Closes the user modal
 */
function closeModal() {
  elements.userModal.classList.remove("show");
  document.body.style.overflow = "";

  // Reset form
  elements.userForm.reset();
  isEditMode = false;
  currentUserId = null;
}

/**
 * Closes the delete confirmation modal
 */
function closeDeleteModal() {
  elements.deleteModal.classList.remove("show");
  document.body.style.overflow = "";
  currentUserId = null;
}

// ===== PASSWORD FUNCTIONS =====

/**
 * Generates a random secure password
 * @returns {string} Generated password
 */
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";

  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Handles password generation button click
 */
function handleGeneratePassword() {
  const password = generatePassword();
  elements.passwordInput.value = password;
  elements.passwordInput.type = "text";

  showAlert("Password generated successfully!");
}

/**
 * Copies password to clipboard
 */
async function copyPassword() {
  const password = elements.passwordInput.value;

  if (!password) {
    showAlert("No password to copy!", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    showAlert("Password copied to clipboard!");
  } catch (error) {
    showAlert("Failed to copy password", "error");
  }
}

// ===== ALERT FUNCTION =====

/**
 * Shows an alert notification
 * @param {string} message - Message to display
 * @param {string} type - Alert type ('success' or 'error')
 */
function showAlert(message, type = "success") {
  elements.alert.textContent = message;
  elements.alert.className = `alert ${type === "error" ? "error" : ""}`;
  elements.alert.classList.add("show");

  setTimeout(() => {
    elements.alert.classList.remove("show");
  }, 3000);
}

// ===== FORM SUBMISSION =====

/**
 * Handles form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();

  // Get form data
  const formData = {
    email: elements.emailInput.value,
    firstName: elements.firstNameInput.value,
    lastName: elements.lastNameInput.value,
    role: elements.roleSelect.value,
    password: elements.passwordInput.value,
  };

  // Validate form
  if (!isEditMode && !formData.email) {
    showAlert("Email is required", "error");
    return;
  }

  if (!formData.firstName) {
    showAlert("First name is required", "error");
    return;
  }

  if (!formData.lastName) {
    showAlert("Last name is required", "error");
    return;
  }

  if (!isEditMode && formData.password.length < 6) {
    showAlert("Password must be at least 6 characters", "error");
    return;
  }

  // Submit to backend
  if (isEditMode) {
    // UPDATE USER - Backend should implement this
    console.log("Update user:", { id: currentUserId, ...formData });
    // Example backend call:
    // updateUser(currentUserId, formData);

    showAlert("User updated successfully!");
  } else {
    // CREATE USER - Backend should implement this
    console.log("Create user:", formData);
    // Example backend call:
    // createUser(formData);

    showAlert("User created successfully!");
  }

  closeModal();
}

// ===== ACTION MENU =====

/**
 * Toggles action menu for a specific row
 * @param {HTMLElement} button - The action button that was clicked
 */
function toggleActionMenu(button) {
  const menu = button.nextElementSibling;

  // Close other open menus
  if (currentActionMenu && currentActionMenu !== menu) {
    currentActionMenu.classList.remove("show");
  }

  // Toggle current menu
  menu.classList.toggle("show");
  currentActionMenu = menu.classList.contains("show") ? menu : null;
}

/**
 * Handles edit action from menu
 * @param {HTMLElement} button - The edit button that was clicked
 */
function handleEditUser(button) {
  // Get user data from the row
  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");

  const userData = {
    id: row.dataset.userId, // Backend should add this
    email: cells[0].textContent,
    firstName: cells[1].textContent,
    lastName: cells[2].textContent,
    role: cells[3].textContent.toLowerCase().replace(" ", "_"),
  };

  openEditModal(userData);

  // Close the action menu
  const menu = button.closest(".action-menu");
  menu.classList.remove("show");
  currentActionMenu = null;
}

/**
 * Handles delete action from menu
 * @param {HTMLElement} button - The delete button that was clicked
 */
function handleDeleteUser(button) {
  const row = button.closest("tr");
  currentUserId = row.dataset.userId; // Backend should add this

  // Show delete confirmation modal
  elements.deleteModal.classList.add("show");
  document.body.style.overflow = "hidden";

  // Close the action menu
  const menu = button.closest(".action-menu");
  menu.classList.remove("show");
  currentActionMenu = null;
}

/**
 * Confirms and executes user deletion
 */
function confirmDelete() {
  if (!currentUserId) {
    showAlert("No user selected", "error");
    return;
  }

  // DELETE USER - Backend should implement this
  console.log("Delete user:", currentUserId);
  // Example backend call:
  // deleteUser(currentUserId);

  showAlert("User deleted successfully!");
  closeDeleteModal();
}

/**
 * Handles reset password action
 */
function handleResetPassword() {
  if (!currentUserId) {
    showAlert("No user selected", "error");
    return;
  }

  // RESET PASSWORD - Backend should implement this
  console.log("Reset password for user:", currentUserId);
  // Example backend call:
  // resetUserPassword(currentUserId);

  showAlert("Password reset email sent!");
}

// ===== SEARCH FUNCTIONALITY =====

function updateNoUsersMessage() {
  const noUsersRow = document.getElementById("noUsersRow");
  const rows = elements.usersTableBody.querySelectorAll("tr:not(#noUsersRow)");
  const visibleRows = Array.from(rows).filter(
    (row) => row.style.display !== "none",
  );

  if (visibleRows.length === 0) {
    if (noUsersRow) {
      noUsersRow.style.display = "";
    }
  } else {
    if (noUsersRow) {
      noUsersRow.style.display = "none";
    }
  }
}

/**
 * Filters table rows based on search input
 */
function handleSearch() {
  const searchTerm = elements.searchInput.value.toLowerCase();
  const rows = elements.usersTableBody.querySelectorAll("tr:not(#noUsersRow)");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });

  updateNoUsersMessage();
}

// ===== EVENT LISTENERS =====

// Modal controls
elements.openCreateModalBtn.addEventListener("click", openCreateModal);
elements.closeModalBtn.addEventListener("click", closeModal);
elements.cancelBtn.addEventListener("click", closeModal);
elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);

// Form submission
elements.userForm.addEventListener("submit", handleFormSubmit);

// Password functions
elements.generatePasswordBtn.addEventListener("click", handleGeneratePassword);
elements.copyPasswordBtn.addEventListener("click", copyPassword);
elements.resetPasswordBtn.addEventListener("click", handleResetPassword);

// Delete confirmation
elements.confirmDeleteBtn.addEventListener("click", confirmDelete);

// Search
elements.searchInput.addEventListener("input", handleSearch);

// Close modal when clicking overlay
elements.userModal.addEventListener("click", (e) => {
  if (
    e.target === elements.userModal ||
    e.target.classList.contains("modal-overlay")
  ) {
    closeModal();
  }
});

elements.deleteModal.addEventListener("click", (e) => {
  if (
    e.target === elements.deleteModal ||
    e.target.classList.contains("modal-overlay")
  ) {
    closeDeleteModal();
  }
});

// Close action menu when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".action-menu-container") && currentActionMenu) {
    currentActionMenu.classList.remove("show");
    currentActionMenu = null;
  }
});

// Event delegation for dynamically added rows
elements.usersTableBody.addEventListener("click", (e) => {
  // Handle action button click
  if (e.target.classList.contains("action-btn")) {
    toggleActionMenu(e.target);
  }

  // Handle edit button click
  if (e.target.classList.contains("edit-btn")) {
    handleEditUser(e.target);
  }

  // Handle delete button click
  if (e.target.classList.contains("delete-btn")) {
    handleDeleteUser(e.target);
  }
});
