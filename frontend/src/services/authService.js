import axiosClient from '../api/axiosClient';

export const authService = {
  /**
   * Fetch current authenticated user profile using JWT session token.
   */
  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  /**
   * Get Google OAuth login URL from the backend, then redirect the browser.
   * The backend returns { login_url: "https://accounts.google.com/..." }
   */
  getGoogleLoginUrl: async () => {
    const response = await axiosClient.get('/auth/google/login');
    return response.data.login_url;
  },

  /**
   * Complete Google OAuth callback exchange code for JWT.
   */
  handleGoogleCallback: async (code) => {
    const response = await axiosClient.get(`/auth/google/callback?code=${code}`);
    return response.data;
  },

  /**
   * Mock login via the real backend endpoint — returns a valid JWT token.
   * role: 'Requester' | 'Reviewer'
   */
  mockLogin: async (role) => {
    const response = await axiosClient.post(`/auth/mock-login?role=${role}`);
    return response.data; // { access_token: "...", token_type: "bearer" }
  },

  /**
   * List all users with the Reviewer role (for assigning to requests).
   */
  getReviewers: async () => {
    const response = await axiosClient.get('/auth/reviewers');
    return response.data;
  },
};

export default authService;
