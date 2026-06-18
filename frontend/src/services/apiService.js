import client from '../api/client';

export const apiService = {
  // Requests API
  getRequests: async () => {
    const response = await client.get('/requests');
    return response.data;
  },
  
  createRequest: async (data) => {
    const response = await client.post('/requests', data);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await client.put(`/requests/${id}`, data);
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await client.delete(`/requests/${id}`);
    return response.data;
  },

  // Reviewer API
  getAssignedRequests: async () => {
    const response = await client.get('/reviewer/requests');
    return response.data;
  },

  approveRequest: async (id, comments) => {
    const response = await client.post(`/reviewer/requests/${id}/approve`, { comments });
    return response.data;
  },

  rejectRequest: async (id, comments) => {
    const response = await client.post(`/reviewer/requests/${id}/reject`, { comments });
    return response.data;
  },
};
export default apiService;
