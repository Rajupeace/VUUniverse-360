// src/utils/tokenHelper.js
/**
 * Token Helper Utility
 * Centralizes token retrieval logic for consistent authentication across the app
 */

/**
 * Get the active authentication token from localStorage
 * Checks in priority order: studentToken, facultyToken, adminToken
 * @returns {string|null} The token if found, null otherwise
 */
export function getAuthToken() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return (
    localStorage.getItem('studentToken') ||
    localStorage.getItem('facultyToken') ||
    localStorage.getItem('adminToken') ||
    null
  );
}

/**
 * Get user role based on which token is stored
 * @returns {string} 'student', 'faculty', 'admin', or 'unknown'
 */
export function getUserRole() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'unknown';
  }

  if (localStorage.getItem('studentToken')) return 'student';
  if (localStorage.getItem('facultyToken')) return 'faculty';
  if (localStorage.getItem('adminToken')) return 'admin';
  return 'unknown';
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if any valid token exists
 */
export function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Get all stored user data (combines localStorage data for the current role)
 * @returns {object} User data object
 */
export function getUserData() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const token = getAuthToken();
  if (!token) return null;

  const role = getUserRole();

  switch (role) {
    case 'student':
      try {
        return JSON.parse(localStorage.getItem('userData')) || null;
      } catch (e) {
        console.error('Failed to parse user data:', e);
        return null;
      }
    case 'faculty':
      try {
        return JSON.parse(localStorage.getItem('facultyData')) || null;
      } catch (e) {
        console.error('Failed to parse faculty data:', e);
        return null;
      }
    case 'admin':
      try {
        return JSON.parse(localStorage.getItem('adminData')) || null;
      } catch (e) {
        console.error('Failed to parse admin data:', e);
        return null;
      }
    default:
      return null;
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  localStorage.removeItem('studentToken');
  localStorage.removeItem('facultyToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('facultyData');
  localStorage.removeItem('adminData');
  localStorage.removeItem('token'); // Clear legacy token key if exists
}

export default {
  getAuthToken,
  getUserRole,
  isAuthenticated,
  getUserData,
  clearAuthData
};
