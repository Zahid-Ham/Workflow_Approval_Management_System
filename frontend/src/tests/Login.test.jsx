import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import Login from '../pages/Login';
import * as router from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return {
    ...original,
    useNavigate: vi.fn(),
  };
});

describe('Login Component', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock);
  });

  it('renders sign-in option when unauthenticated', () => {
    renderWithProviders(<Login />, {
      authValue: {
        user: null,
        loading: false,
        isAuthenticated: false,
        loginWithGoogle: vi.fn(),
        login: vi.fn(),
      },
    });

    expect(screen.getByText('Workflow Approval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('triggers loginWithGoogle when clicked', () => {
    const loginWithGoogleMock = vi.fn();
    renderWithProviders(<Login />, {
      authValue: {
        user: null,
        loading: false,
        isAuthenticated: false,
        loginWithGoogle: loginWithGoogleMock,
        login: vi.fn(),
      },
    });

    const button = screen.getByRole('button', { name: /sign in with google/i });
    act(() => {
      button.click();
    });

    expect(loginWithGoogleMock).toHaveBeenCalledTimes(1);
  });

  it('redirects to reviewer route if authenticated as reviewer', async () => {
    renderWithProviders(<Login />, {
      authValue: {
        user: { name: 'Bob Reviewer', role: 'Reviewer' },
        loading: false,
        isAuthenticated: true,
        loginWithGoogle: vi.fn(),
        login: vi.fn(),
      },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/reviewer', { replace: true });
    });
  });

  it('redirects to requester route if authenticated as requester', async () => {
    renderWithProviders(<Login />, {
      authValue: {
        user: { name: 'Alice Requester', role: 'Requester' },
        loading: false,
        isAuthenticated: true,
        loginWithGoogle: vi.fn(),
        login: vi.fn(),
      },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/requester', { replace: true });
    });
  });
});