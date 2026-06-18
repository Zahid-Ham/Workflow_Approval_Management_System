import { useState, useEffect, useCallback } from 'react';
import reviewerService from '../services/reviewerService';

export const useReviewerDashboardData = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the first 100 requests to enable rich filtering and dashboard widgets
      const data = await reviewerService.listAssignedRequests(0, 100);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load reviewer dashboard data:', err);
      setError(err.message || 'Failed to fetch reviewer requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Widgets filtering
  const pendingRequests = requests.filter((r) => r.status?.toUpperCase() === 'PENDING');
  const reviewedRequests = requests.filter((r) => r.status?.toUpperCase() !== 'PENDING');

  return {
    requests,
    pendingRequests,
    reviewedRequests,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

export default useReviewerDashboardData;
