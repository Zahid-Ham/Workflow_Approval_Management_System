import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import ReviewerDashboard from '../pages/ReviewerDashboard';
import * as reviewerHook from '../hooks/useReviewerDashboardData';
import { createMockRequest } from './mockData';

vi.mock('../hooks/useReviewerDashboardData', () => ({
  useReviewerDashboardData: vi.fn(),
}));

describe('ReviewerDashboard Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders pending tab queue requests by default', () => {
    const mockReq = createMockRequest({ title: 'Pending Approval', status: 'PENDING' });
    vi.mocked(reviewerHook.useReviewerDashboardData).mockReturnValue({
      pendingRequests: [mockReq],
      reviewedRequests: [],
      loading: false,
      error: '',
      refresh: vi.fn(),
    });

    renderWithProviders(<ReviewerDashboard />, {
      authValue: {
        user: { name: 'Bob Reviewer', role: 'Reviewer' },
        loading: false,
        isAuthenticated: true,
      },
    });

    expect(screen.getByRole('button', { name: /⏳ Pending \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  it('allows tab switching to history', async () => {
    const mockReviewed = createMockRequest({ title: 'Historical Request', status: 'APPROVED' });
    vi.mocked(reviewerHook.useReviewerDashboardData).mockReturnValue({
      pendingRequests: [],
      reviewedRequests: [mockReviewed],
      loading: false,
      error: '',
      refresh: vi.fn(),
    });

    renderWithProviders(<ReviewerDashboard />, {
      authValue: {
        user: { name: 'Bob Reviewer', role: 'Reviewer' },
        loading: false,
        isAuthenticated: true,
      },
    });

    const historyTab = screen.getByRole('button', { name: /✓ Reviewed/i });
    act(() => {
      historyTab.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Historical Request')).toBeInTheDocument();
    });
  });
});