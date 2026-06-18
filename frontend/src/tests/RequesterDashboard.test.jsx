import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import RequesterDashboard from '../pages/RequesterDashboard';
import * as dashboardHook from '../hooks/useRequesterDashboardData';
import { createMockRequest } from './mockData';

vi.mock('../hooks/useRequesterDashboardData', () => ({
  useRequesterDashboardData: vi.fn(),
}));

describe('RequesterDashboard Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stats and recent activities table', async () => {
    const mockRequest1 = createMockRequest({ title: 'Request Alpha', priority: 'HIGH' });
    const mockRequest2 = createMockRequest({ title: 'Request Beta', priority: 'LOW' });
    
    vi.mocked(dashboardHook.useRequesterDashboardData).mockReturnValue({
      recentActivities: [mockRequest1, mockRequest2],
      stats: { total: 2, pending: 2, approved: 0, rejected: 0 },
      loading: false,
      error: '',
      refresh: vi.fn(),
    });

    renderWithProviders(<RequesterDashboard />, {
      authValue: {
        user: { name: 'Alice Requester', role: 'Requester' },
        loading: false,
        isAuthenticated: true,
      },
    });

    // Verify stats
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    
    // Verify activities table rows
    expect(screen.getByText('Request Alpha')).toBeInTheDocument();
    expect(screen.getByText('Request Beta')).toBeInTheDocument();
  });

  it('renders loading indicator', () => {
    vi.mocked(dashboardHook.useRequesterDashboardData).mockReturnValue({
      recentActivities: [],
      stats: null,
      loading: true,
      error: '',
      refresh: vi.fn(),
    });

    renderWithProviders(<RequesterDashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});