// ===== STATE MANAGEMENT =====
let isEditMode = false;
let currentUserId = null;
let currentActionMenu = null;
let usersData = [];

// ===== API BASE URL =====
const API_BASE = "api/users";

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

// ===== API FUNCTIONS =====

/**
 * Fetches all users from the backend
 */
async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE}/get_users.php`);
    const data = await response.json();

    if (data.success) {
      usersData = data.users;
      renderUsersTable(usersData);
    } else {
      if (response.status === 401) {
        window.location.href = "login.html";
        return;
      }
      showAlert(data.message || "Failed to load users", "error");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    showAlert("Failed to load users", "error");
  }
}

/**
 * Creates a new user
 * @param {Object} userData - User data to create
 */
async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/create_user.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("User created successfully!");
      fetchUsers();
      return true;
    } else {
      showAlert(data.message || "Failed to create user", "error");
      return false;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    showAlert("Failed to create user", "error");
    return false;
  }
}

/**
 * Updates an existing user
 * @param {number} userId - User ID to update
 * @param {Object} userData - User data to update
 */
async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_BASE}/update_user.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("User updated successfully!");
      fetchUsers();
      return true;
    } else {
      showAlert(data.message || "Failed to update user", "error");
      return false;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showAlert("Failed to update user", "error");
    return false;
  }
}

/**
 * Deletes a user
 * @param {number} userId - User ID to delete
 */
async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_BASE}/delete_user.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("User deleted successfully!");
      fetchUsers();
      return true;
    } else {
      showAlert(data.message || "Failed to delete user", "error");
      return false;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showAlert("Failed to delete user", "error");
    return false;
  }
}

/**
 * Resets a user's password
 * @param {number} userId - User ID to reset password for
 */
async function resetPassword(userId) {
  try {
    const response = await fetch(`${API_BASE}/reset_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });

    const data = await response.json();

    if (data.success) {
      // Copy the new password to clipboard
      await navigator.clipboard.writeText(data.new_password);
      showAlert(`Password reset! New password copied to clipboard: ${data.new_password}`);
      return true;
    } else {
      showAlert(data.message || "Failed to reset password", "error");
      return false;
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    showAlert("Failed to reset password", "error");
    return false;
  }
}

/**
 * Renders the users table with the given data
 * @param {Array} users - Array of user objects
 */
function renderUsersTable(users) {
  elements.usersTableBody.innerHTML = "";

  if (users.length === 0) {
    elements.usersTableBody.innerHTML = `
      <tr id="noUsersRow">
        <td colspan="5" style="text-align: center; color: #6b7280; padding: 40px;">
          No users found
        </td>
      </tr>
    `;
    return;
  }

  users.forEach((user) => {
    const roleDisplay = user.role === "admin" ? "Admin" : "Barangay";
    const row = document.createElement("tr");
    row.dataset.userId = user.id;
    row.innerHTML = `
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.first_name)}</td>
      <td>${escapeHtml(user.last_name)}</td>
      <td>${roleDisplay}</td>
      <td>
        <div class="action-menu-container">
          <button class="action-btn">⋮</button>
          <div class="action-menu">
            <button class="action-item edit-btn">Edit</button>
            <button class="action-item delete-btn">Delete</button>
          </div>
        </div>
      </td>
    `;
    elements.usersTableBody.appendChild(row);
  });
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== FORM SUBMISSION =====

/**
 * Handles form submission
 * @param {Event} e - Form submit event
 */
async function handleFormSubmit(e) {
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

  // Disable submit button
  elements.submitBtn.disabled = true;

  // Submit to backend
  let success;
  if (isEditMode) {
    success = await updateUser(currentUserId, formData);
  } else {
    success = await createUser(formData);
  }

  elements.submitBtn.disabled = false;

  if (success) {
    closeModal();
  }
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
  const userId = row.dataset.userId;
  const user = usersData.find((u) => u.id == userId);

  if (!user) {
    showAlert("User not found", "error");
    return;
  }

  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
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
async function confirmDelete() {
  if (!currentUserId) {
    showAlert("No user selected", "error");
    return;
  }

  elements.confirmDeleteBtn.disabled = true;
  const success = await deleteUser(currentUserId);
  elements.confirmDeleteBtn.disabled = false;

  if (success) {
    closeDeleteModal();
  }
}

/**
 * Handles reset password action
 */
async function handleResetPassword() {
  if (!currentUserId) {
    showAlert("No user selected", "error");
    return;
  }

  elements.resetPasswordBtn.disabled = true;
  await resetPassword(currentUserId);
  elements.resetPasswordBtn.disabled = false;
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

// ===== INITIALIZATION =====
// Check if user is admin before loading the page
async function initPage() {
  const user = await loadUserInfo({ requireAdmin: true });
  if (user) {
    // User is admin, fetch users
    fetchUsers();
  }
  // If not admin, loadUserInfo will redirect to dashboard.html
}

initPage();
