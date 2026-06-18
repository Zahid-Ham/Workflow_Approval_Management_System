import { useState, useEffect, useCallback } from 'react';
import requestService from '../services/requestService';

export const useRequesterDashboardData = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the first 100 requests to compute accurate statistics
      const data = await requestService.listRequests(0, 100);
      setRequests(data || []);

      // Calculate statistics dynamically
      const computedStats = (data || []).reduce(
        (acc, req) => {
          acc.total += 1;
          const status = req.status?.toUpperCase();
          if (status === 'PENDING') acc.pending += 1;
          else if (status === 'APPROVED') acc.approved += 1;
          else if (status === 'REJECTED') acc.rejected += 1;
          return acc;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      );
      setStats(computedStats);
    } catch (err) {
      console.error('Failed to load requester dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Activity feed: Show top 5 most recently created/updated requests
  const recentActivities = requests.slice(0, 5);

  return {
    requests,
    recentActivities,
    stats,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

export default useRequesterDashboardData;
