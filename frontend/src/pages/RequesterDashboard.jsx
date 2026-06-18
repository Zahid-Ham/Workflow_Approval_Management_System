import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRequesterDashboardData } from '../hooks/useRequesterDashboardData';
import UserSummary from '../components/Dashboard/UserSummary';
import StatCard from '../components/Dashboard/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const RequesterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recentActivities, stats, loading, error, refresh } = useRequesterDashboardData();

  if (loading) return <LoadingSpinner fullPage={true} />;

  const getPriorityClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':   return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      default:       return 'priority-low';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default:         return 'status-pending';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return dateStr; }
  };

  return (
    <div className="dashboard-layout" aria-label="Requester Workspace">
      {/* Left sidebar panel */}
      <aside className="dashboard-sidebar">
        <UserSummary user={user} />

        <div className="quick-actions-card">
          <h2 className="card-section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button
              onClick={() => navigate('/requests/new')}
              className="action-btn-primary"
              id="new-request-btn"
            >
              + New
            </button>
            <button
              onClick={() => navigate('/requests')}
              className="action-btn-secondary"
            >
              View All
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="dashboard-main">
        {error && <div className="error-banner">{error}</div>}

        {/* Stats row */}
        <div className="stats-grid">
          <StatCard title="Total Requests" value={stats?.total  ?? 0} variant="info"    />
          <StatCard title="Pending"        value={stats?.pending  ?? 0} variant="warning" />
          <StatCard title="Approved"       value={stats?.approved ?? 0} variant="success" />
          <StatCard title="Rejected"       value={stats?.rejected ?? 0} variant="danger"  />
        </div>

        {/* Recent activity */}
        <section aria-labelledby="recent-activity-title">
          <div className="section-header-row">
            <h2 id="recent-activity-title" className="section-title">Recent Activity</h2>
            <button onClick={refresh} className="refresh-btn">↺ Refresh</button>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Reviewer</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        onClick={() => navigate(`/requests/${activity.id}`)}
                        className="clickable-row"
                      >
                        <td>{activity.title}</td>
                        <td>{activity.reviewer?.name || activity.reviewer_email || 'Unassigned'}</td>
                        <td>
                          <span className={`badge ${getPriorityClass(activity.priority)}`}>
                            {activity.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(activity.status)}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td>{formatDate(activity.updated_at || activity.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">
                        No requests yet. Click <strong>+ New</strong> to submit your first request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RequesterDashboard;