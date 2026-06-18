import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import RequestList from '../pages/RequestList';
import RequestDetail from '../pages/RequestDetail';
import RequestManagement from '../pages/RequestManagement';
import requestService from '../services/requestService';
import { createMockRequest } from './mockData';
import * as router from 'react-router-dom';

vi.mock('../services/requestService', () => ({
  default: {
    listRequests: vi.fn(),
    getRequest: vi.fn(),
    createRequest: vi.fn(),
    updateRequest: vi.fn(),
    deleteRequest: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return {
    ...original,
    useParams: () => ({ id: 'mock-id' }),
    useNavigate: () => vi.fn(),
  };
});

describe('Request Catalog and Action Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders RequestList page details', async () => {
    const mockReq = createMockRequest({ title: 'Standard Laptop' });
    vi.mocked(requestService.listRequests).mockResolvedValueOnce([mockReq]);

    renderWithProviders(<RequestList />);

    await waitFor(() => {
      expect(screen.getByText('Standard Laptop')).toBeInTheDocument();
    });
  });

  it('renders RequestDetail view correctly', async () => {
    const mockReq = createMockRequest({ title: 'Travel Subsidy Request', description: 'Business travel cost reimbursement.' });
    vi.mocked(requestService.getRequest).mockResolvedValueOnce(mockReq);

    renderWithProviders(<RequestDetail />, {
      authValue: {
        user: { name: 'Alice Requester', role: 'Requester' },
        isRequester: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Travel Subsidy Request')).toBeInTheDocument();
      expect(screen.getByText('Business travel cost reimbursement.')).toBeInTheDocument();
    });
  });

  it('renders RequestManagement create form', async () => {
    renderWithProviders(<RequestManagement isEdit={false} />);
    expect(screen.getByText('New Approval Request')).toBeInTheDocument();
  });
});