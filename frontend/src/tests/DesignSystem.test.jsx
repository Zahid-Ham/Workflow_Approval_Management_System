import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

describe('Enterprise Design System UI Components', () => {
  it('renders Button correctly with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders Badge correctly', () => {
    render(<Badge>APPROVED</Badge>);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('renders Card correctly', () => {
    render(<Card title="My Card Title">Card Content</Card>);
    expect(screen.getByRole('heading', { name: 'My Card Title' })).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders Input with label', () => {
    render(<Input id="test-input" label="Username" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('renders Select dropdown with options', () => {
    const options = [{ value: '1', label: 'Option 1' }];
    render(<Select id="test-select" label="Choose" options={options} value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
  });

  it('renders Textarea with label', () => {
    render(<Textarea id="test-area" label="Comments" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
  });

  it('renders Modal when open', () => {
    render(
      <Modal isOpen={true} title="Modal Title" onClose={() => {}}>
        Modal Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Modal Title' })).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders Table with headers and body', () => {
    const headers = [{ label: 'Name' }, { label: 'Role' }];
    render(
      <Table headers={headers}>
        <tr>
          <td>Zahid</td>
          <td>Admin</td>
        </tr>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Zahid')).toBeInTheDocument();
  });

  it('renders Loader when active', () => {
    render(<Loader fullPage={false} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders EmptyState with action button', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No items found"
        description="Try creating one"
        actionLabel="Create"
        onAction={onAction}
      />
    );
    expect(screen.getByRole('heading', { name: 'No items found' })).toBeInTheDocument();
    expect(screen.getByText('Try creating one')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Create' });
    btn.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders ErrorState with retry trigger', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="API error" onRetry={onRetry} />);
    expect(screen.getByText('API error')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /retry/i });
    btn.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});