/**
 * Mock Data Factories for frontend test suites.
 */

export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-uuid-' + Math.random().toString(36).substr(2, 9),
  name: 'Test User',
  email: 'testuser@example.com',
  role: 'Requester',
  google_id: 'google-id-' + Math.random().toString(36).substr(2, 9),
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockRequest = (overrides = {}) => {
  const reqId = overrides.id || 'mock-request-uuid-' + Math.random().toString(36).substr(2, 9);
  return {
    id: reqId,
    title: 'Budget Request',
    description: 'Annual budget details explanation context.',
    priority: 'LOW',
    status: 'PENDING',
    created_by: 'creator-uuid',
    reviewer_id: 'reviewer-uuid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator: {
      id: 'creator-uuid',
      name: 'Alice Requester',
      email: 'alice@example.com',
      role: 'Requester',
    },
    reviewer: {
      id: 'reviewer-uuid',
      name: 'Bob Reviewer',
      email: 'bob@example.com',
      role: 'Reviewer',
    },
    actions: [],
    ...overrides,
  };
};

export const createMockReviewAction = (overrides = {}) => ({
  id: 'mock-action-uuid-' + Math.random().toString(36).substr(2, 9),
  request_id: 'mock-request-uuid',
  action: 'APPROVED',
  comments: 'Approved after verification.',
  reviewed_by: 'reviewer-uuid',
  reviewed_at: new Date().toISOString(),
  reviewer: {
    id: 'reviewer-uuid',
    name: 'Bob Reviewer',
    email: 'bob@example.com',
    role: 'Reviewer',
  },
  ...overrides,
});
