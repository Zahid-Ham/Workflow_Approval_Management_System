import axiosClient from '../api/axiosClient';

export const reviewerService = {
  /**
   * Fetch paginated list of approval requests assigned to this reviewer.
   */
  listAssignedRequests: async (skip = 0, limit = 10) => {
    const response = await axiosClient.get(`/reviewer/requests?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Approve a pending request with mandatory comments.
   */
  approveRequest: async (requestId, comments) => {
    const response = await axiosClient.post(`/reviewer/requests/${requestId}/approve`, {
      comments,
    });
    return response.data;
  },

  /**
   * Reject a pending request with mandatory comments.
   */
  rejectRequest: async (requestId, comments) => {
    const response = await axiosClient.post(`/reviewer/requests/${requestId}/reject`, {
      comments,
    });
    return response.data;
  },
};

export default reviewerService;
