// ===== NAVBAR FUNCTIONALITY =====

// Store current user data globally
let currentUser = null;

/**
 * Fetches and displays current user info in the navbar
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAdmin - If true, redirects non-admins away
 */
async function loadUserInfo(options = {}) {
  try {
    const response = await fetch("api/check_session.php");
    const data = await response.json();

    if (data.success && data.logged_in) {
      currentUser = data.user;

      // Update navbar with user info
      const userEmail = document.querySelector(".user-email");
      const userRole = document.querySelector(".user-role");

      if (userEmail) {
        userEmail.textContent = data.user.email;
      }
      if (userRole) {
        userRole.textContent = data.user.role === "admin" ? "Admin" : "Barangay Official";
      }

      // Check if admin is required for this page
      if (options.requireAdmin && data.user.role !== "admin") {
        // Redirect non-admins to dashboard
        window.location.href = "dashboard.html";
        return null;
      }

      return data.user;
    } else {
      // Not logged in, redirect to login
      window.location.href = "login.html";
      return null;
    }
  } catch (error) {
    console.error("Error loading user info:", error);
    window.location.href = "login.html";
    return null;
  }
}

/**
 * Check if current user is admin
 */
function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

/**
 * Get current user data
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Handles logout
 */
async function handleLogout() {
  try {
    const response = await fetch("api/logout.php");
    const data = await response.json();

    if (data.success) {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if there's an error
    window.location.href = "login.html";
  }
}

// ===== EVENT LISTENERS =====

// Logout button
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

// Load user info on page load
loadUserInfo();
