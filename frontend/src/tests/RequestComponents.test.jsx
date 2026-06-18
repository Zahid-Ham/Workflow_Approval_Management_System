import React from 'react';
import { screen, render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createMockRequest } from './mockData';
import PriorityBadge from '../components/Requests/PriorityBadge';
import StatusBadge from '../components/Requests/StatusBadge';
import RequestCard from '../components/Requests/RequestCard';
import { RequestFilters } from '../components/Requests/RequestFilters';
import { Pagination } from '../components/Requests/Pagination';
import { RequestForm } from '../components/Requests/RequestForm';
import { renderWithProviders } from './testUtils';

describe('Requests Components', () => {
  it('renders PriorityBadge correctly', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders StatusBadge correctly', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders RequestCard with request detail', () => {
    const request = createMockRequest({ title: 'Important Request' });
    renderWithProviders(<RequestCard request={request} onDelete={vi.fn()} />);
    expect(screen.getByText('Important Request')).toBeInTheDocument();
    expect(screen.getByText('Alice Requester')).toBeInTheDocument();
  });

  it('renders RequestFilters dropdowns', () => {
    render(
      <RequestFilters
        searchQuery=""
        statusFilter="ALL"
        prioritySort="NONE"
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
  });
});