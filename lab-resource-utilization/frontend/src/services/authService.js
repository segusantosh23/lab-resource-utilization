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
  login: async (login, password) => {
    const response = await api.post('/auth/login', {
      login,
      password
    });

    return response.data;
  },

  /**
   * POST /auth/register
   * @param {{ name: string, email: string, password: string, role: string }} data
   * @returns {Promise<string>} — success / error message from backend
   */
  register: async (
      name,
      universityId,
      email,
      password,
      role
  ) => {

    const response = await api.post('/auth/register', {
      name,
      universityId,
      email,
      password,
      role
    });

    return response.data;
  },

  /**
   * Persist auth data to sessionStorage.
   */
  saveAuth: (token, user) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Remove auth data from sessionStorage.
   */
  clearAuth: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  /**
   * Retrieve persisted auth data.
   */
  getStoredAuth: () => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
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
