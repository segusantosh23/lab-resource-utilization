import api from './api';

/**
 * Authentication service — centralises all auth-related API calls.
 */
const authService = {
  /**
   * POST /auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token, email, name, role, message }>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * POST /auth/register
   * @param {{ name: string, email: string, password: string, role: string }} data
   * @returns {Promise<string>} — success / error message from backend
   */
  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  /**
   * Persist auth data to localStorage.
   */
  saveAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Remove auth data from localStorage.
   */
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Retrieve persisted auth data.
   */
  getStoredAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        return { token, user: JSON.parse(userStr) };
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Return the dashboard path that matches the user's role.
   */
  getDashboardPath: (role) => {
    const roleRoutes = {
      RESEARCHER: '/dashboard/researcher',
      LAB_TECHNICIAN: '/dashboard/lab-technician',
      LAB_MANAGER: '/dashboard/lab-manager',
      DEPARTMENT_HEAD: '/dashboard/department-head',
      INSTITUTION_ADMIN: '/dashboard/institution-admin',
      SYSTEM_ADMIN: '/dashboard/system-admin',
    };
    return roleRoutes[role] || '/dashboard/researcher';
  },
};

export default authService;
