import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from token in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  /**
   * Initiate Google OAuth flow:
   * 1. Fetch the login_url from the backend
   * 2. Redirect the browser window to Google's consent screen
   */
  const loginWithGoogle = async () => {
    const googleUrl = await authService.getGoogleLoginUrl();
    window.location.href = googleUrl;
  };

  /**
   * Exchange Google OAuth callback code for JWT, then load profile.
   */
  const login = async (code) => {
    const data = await authService.handleGoogleCallback(code);
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    const profile = await authService.getMe();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Mock login: calls the real backend /auth/mock-login endpoint to get
   * a valid JWT, then loads the user profile — fully functional for demo.
   */
  const mockLogin = async (role) => {
    try {
      const data = await authService.mockLogin(role);
      const token = data.access_token || data.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      // Seed mock requests & reviewers database silently
      try {
        const axiosClient = (await import('../api/axiosClient')).default;
        await axiosClient.post('/seed/demo-data');
      } catch (seedErr) {
        console.warn('Silently failed to seed database:', seedErr);
      }

      const profile = await authService.getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      // Fallback: if backend is down, create a local mock profile
      console.warn('Backend mock-login unavailable, using local fallback:', err);
      const profile = {
        id: `mock-${role.toLowerCase()}-uuid`,
        name: `Demo ${role}`,
        email: `${role.toLowerCase()}@demo.com`,
        role: role,
      };
      localStorage.setItem('token', `mock-${role.toLowerCase()}-token`);
      setUser(profile);
      return profile;
    }
  };

  const isAuthenticated = !!user;
  const isRequester = user?.role === 'Requester';
  const isReviewer = user?.role === 'Reviewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isRequester,
        isReviewer,
        login,
        logout,
        loginWithGoogle,
        mockLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
