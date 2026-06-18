import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

// Test component to consume the hook
const TestConsumer = () => {
  const { user, loading, isAuthenticated, isRequester, isReviewer, login, logout, loginWithGoogle } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <div data-testid="username">{user.name}</div>
          <div data-testid="role">{user.role}</div>
          <div data-testid="is-requester">{isRequester ? 'yes' : 'no'}</div>
          <div data-testid="is-reviewer">{isReviewer ? 'yes' : 'no'}</div>
          <button onClick={logout} data-testid="logout-btn">Logout</button>
        </>
      ) : (
        <>
          <div data-testid="unauthenticated">Guest</div>
          <button onClick={() => login('dummy-code')} data-testid="login-btn">Login</button>
          <button onClick={loginWithGoogle} data-testid="login-google-btn">Google URL</button>
        </>
      )}
    </div>
  );
};

describe('AuthContext and useAuth Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('initializes with guest status when no token is in localStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unauthenticated')).toBeInTheDocument();
    });
  });

  it('validates session and fetches user details on mount if token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    const getMeSpy = vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
      name: 'John Doe',
      role: 'Reviewer',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('role')).toHaveTextContent('Reviewer');
      expect(screen.getByTestId('is-reviewer')).toHaveTextContent('yes');
    });

    expect(getMeSpy).toHaveBeenCalledTimes(1);
  });

  it('performs login by calling google callback and setting token', async () => {
    const handleGoogleCallbackSpy = vi.spyOn(authService, 'handleGoogleCallback').mockResolvedValueOnce({
      token: 'new-token',
    });
    const getMeSpy = vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
      name: 'Alice Requester',
      role: 'Requester',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const loginBtn = await screen.findByTestId('login-btn');
    act(() => {
      loginBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('Alice Requester');
      expect(screen.getByTestId('role')).toHaveTextContent('Requester');
      expect(screen.getByTestId('is-requester')).toHaveTextContent('yes');
    });

    expect(handleGoogleCallbackSpy).toHaveBeenCalledWith('dummy-code');
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('performs logout and clears state', async () => {
    localStorage.setItem('token', 'valid-token');
    vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
      name: 'John Doe',
      role: 'Reviewer',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const logoutBtn = await screen.findByTestId('logout-btn');
    act(() => {
      logoutBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('unauthenticated')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});