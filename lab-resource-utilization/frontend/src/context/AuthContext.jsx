import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = authService.getStoredAuth();
    if (stored) {
      setToken(stored.token);
      setUser(stored.user);
    }
    setLoading(false);
  }, []);

  /**
   * Login — calls the backend, stores JWT + user, returns result.
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const { token: jwtToken, email: userEmail, name, role, message } = data;

      if (jwtToken) {
        const userData = { email: userEmail, name, role };
        authService.saveAuth(jwtToken, userData);
        setToken(jwtToken);
        setUser(userData);
        return { success: true, role };
      } else {
        return { success: false, error: message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Invalid credentials';
      return { success: false, error: errMsg };
    }
  };

  /**
   * Register — calls the backend, returns result.
   */
  const register = async (name, email, password, role) => {
    try {
      const data = await authService.register(name, email, password, role);
      if (data === 'User registered successfully') {
        return { success: true };
      } else {
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errMsg = error.response?.data || 'Registration failed';
      return { success: false, error: errMsg };
    }
  };

  /**
   * Logout — clears everything.
   */
  const logout = () => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
  };

  /**
   * Get the role-based dashboard path for the current user.
   */
  const getDashboardPath = () => {
    return authService.getDashboardPath(user?.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};
