import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const { loginWithGoogle, login, user, loading: authLoading, mockLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user && !isExchanging) {
      if (user.role === 'Reviewer') {
        navigate('/reviewer', { replace: true });
      } else {
        navigate('/requester', { replace: true });
      }
    }
  }, [user, navigate, isExchanging]);

  // Handle Google OAuth redirect code callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const exchangeCode = async () => {
        setIsExchanging(true);
        setStatusMessage('Authenticating secure Google session...');
        setErrorMessage('');
        try {
          const profile = await login(code);
          setStatusMessage('Successfully logged in! Redirecting...');
          if (profile.role === 'Reviewer') {
            navigate('/reviewer', { replace: true });
          } else {
            navigate('/requester', { replace: true });
          }
        } catch (error) {
          console.error('Login callback error:', error);
          setErrorMessage(
            error.message || 'Authentication with Google failed. Please try again.'
          );
          setStatusMessage('');
        } finally {
          setIsExchanging(false);
        }
      };

      exchangeCode();
    }
  }, [searchParams, login, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setStatusMessage('Fetching Google Sign-In link...');
      setErrorMessage('');
      // loginWithGoogle is async: fetches the URL from backend then redirects
      await loginWithGoogle();
    } catch (error) {
      console.error('Login redirect error:', error);
      setErrorMessage(
        'Failed to initiate Google login. Is the backend running? Try a mock session below.'
      );
      setStatusMessage('');
    }
  };

  const handleMockLogin = async (role) => {
    try {
      setStatusMessage(`Starting ${role} demo session...`);
      setErrorMessage('');
      const profile = await mockLogin(role);
      setStatusMessage('Session started! Redirecting...');
      if (profile.role === 'Reviewer') {
        navigate('/reviewer', { replace: true });
      } else {
        navigate('/requester', { replace: true });
      }
    } catch (error) {
      console.error('Mock login error:', error);
      setErrorMessage('Failed to launch demo session.');
      setStatusMessage('');
    }
  };

  const isBusy = isExchanging || authLoading;

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Logo area */}
        <div className="login-logo-area">
          <div className="login-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path d="M8 12h16M8 16h10M8 20h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="login-title">Workflow Approval</h1>
        <p className="login-subtitle">Sign in to manage and review approval requests</p>

        {statusMessage && <div className="status-message">{statusMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          disabled={isBusy}
          className="google-login-btn"
          id="google-login-btn"
          aria-label="Sign in with Google"
        >
          {isBusy && !errorMessage ? (
            'Connecting...'
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.6z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H.95v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.96 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.95a9 9 0 0 0 0 8.06l3.01-2.33z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 .95 4.97l3.01 2.33c.7-2.12 2.7-3.7 5.04-3.7z" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="login-divider">
          <span>Or try a demo session</span>
        </div>

        {/* Mock / Demo Login Buttons */}
        <div className="mock-login-container">
          <button
            id="mock-requester-btn"
            onClick={() => handleMockLogin('Requester')}
            disabled={isBusy}
            className="mock-login-btn requester"
          >
            <span className="mock-btn-icon">📋</span>
            <span>
              <strong>Login as Requester</strong>
              <small>Submit &amp; track approval requests</small>
            </span>
          </button>
          <button
            id="mock-reviewer-btn"
            onClick={() => handleMockLogin('Reviewer')}
            disabled={isBusy}
            className="mock-login-btn reviewer"
          >
            <span className="mock-btn-icon">✅</span>
            <span>
              <strong>Login as Reviewer</strong>
              <small>Review, approve or reject requests</small>
            </span>
          </button>
        </div>

        <p className="login-footer-note">
          Demo sessions use a live backend JWT. No Google account needed.
        </p>
      </div>
    </div>
  );
};

export default Login;