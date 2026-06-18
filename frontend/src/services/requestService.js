import axiosClient from '../api/axiosClient';

export const requestService = {
  /**
   * Submit a new approval request document.
   */
  createRequest: async (requestData) => {
    const response = await axiosClient.post('/requests', requestData);
    return response.data;
  },

  /**
   * List paginated approval requests submitted by the logged-in requester.
   */
  listRequests: async (skip = 0, limit = 10) => {
    const response = await axiosClient.get(`/requests?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get detailed view details for a specific request.
   */
  getRequest: async (id) => {
    const response = await axiosClient.get(`/requests/${id}`);
    return response.data;
  },

  /**
   * Modify request title, description, priority, or reviewer.
   */
  updateRequest: async (id, requestData) => {
    const response = await axiosClient.put(`/requests/${id}`, requestData);
    return response.data;
  },

  /**
   * Remove request document from queue.
   */
  deleteRequest: async (id) => {
    await axiosClient.delete(`/requests/${id}`);
    return true;
  },
};

export default requestService;
