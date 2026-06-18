import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../services/authService';
import requestService from '../services/requestService';
import reviewerService from '../services/reviewerService';
import axiosClient from '../api/axiosClient';

vi.mock('../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Frontend API Services', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('authService', () => {
    it('calls getMe profile endpoint', async () => {
      const mockProfile = { name: 'Bob', role: 'Reviewer' };
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockProfile });
      
      const res = await authService.getMe();
      expect(res).toEqual(mockProfile);
      expect(axiosClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('calls handleGoogleCallback endpoint', async () => {
      const mockResponse = { token: 'jwt-token' };
      vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockResponse });
      
      const res = await authService.handleGoogleCallback('auth-code');
      expect(res).toEqual(mockResponse);
      expect(axiosClient.get).toHaveBeenCalledWith('/auth/google/callback?code=auth-code');
    });
  });

  describe('requestService', () => {
    it('creates request document', async () => {
      const mockPayload = { title: 'Laptops' };
      const mockRes = { id: 'req-id', ...mockPayload };
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockRes });
      
      const res = await requestService.createRequest(mockPayload);
      expect(res).toEqual(mockRes);
      expect(axiosClient.post).toHaveBeenCalledWith('/requests', mockPayload);
    });

    it('deletes request document', async () => {
      vi.mocked(axiosClient.delete).mockResolvedValueOnce({});
      
      const res = await requestService.deleteRequest('req-id');
      expect(res).toBe(true);
      expect(axiosClient.delete).toHaveBeenCalledWith('/requests/req-id');
    });
  });

  describe('reviewerService', () => {
    it('approves request document with comments', async () => {
      const mockRes = { id: 'action-id', action: 'APPROVED' };
      vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockRes });
      
      const res = await reviewerService.approveRequest('req-id', 'LGTM');
      expect(res).toEqual(mockRes);
      expect(axiosClient.post).toHaveBeenCalledWith('/reviewer/requests/req-id/approve', { comments: 'LGTM' });
    });
  });
});