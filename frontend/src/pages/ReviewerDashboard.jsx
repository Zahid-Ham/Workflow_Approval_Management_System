import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReviewerDashboardData } from '../hooks/useReviewerDashboardData';
import UserSummary from '../components/Dashboard/UserSummary';
import StatusBadge from '../components/Requests/StatusBadge';
import PriorityBadge from '../components/Requests/PriorityBadge';
import DecisionModal from '../components/Dashboard/DecisionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import reviewerService from '../services/reviewerService';

export const ReviewerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pendingRequests, reviewedRequests, loading, error, refresh } = useReviewerDashboardData();

  const [activeTab, setActiveTab] = useState('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');

  const openDecisionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirmDecision = async (comments) => {
    if (!selectedRequest) return;
    if (actionType === 'APPROVE') {
      await reviewerService.approveRequest(selectedRequest.id, comments);
    } else {
      await reviewerService.rejectRequest(selectedRequest.id, comments);
    }
    refresh();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return dateStr; }
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  const activeRequests = activeTab === 'pending' ? pendingRequests : reviewedRequests;

  return (
    <div className="dashboard-layout" aria-label="Reviewer Workspace">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <UserSummary user={user} />

        <div className="reviewer-summary-card">
          <h2 className="card-section-title">Queue Status</h2>
          <div className="queue-status-stats">
            <div className="queue-stat">
              <span className="stat-label">Pending Reviews</span>
              <span className="stat-value">{pendingRequests?.length || 0}</span>
            </div>
            <div className="queue-stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{reviewedRequests?.length || 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {error && <div className="error-banner">{error}</div>}

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn${activeTab === 'pending' ? ' active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending ({pendingRequests?.length || 0})
          </button>
          <button
            className={`tab-btn${activeTab === 'reviewed' ? ' active' : ''}`}
            onClick={() => setActiveTab('reviewed')}
          >
            ✓ Reviewed ({reviewedRequests?.length || 0})
          </button>
          <button onClick={refresh} className="refresh-btn align-right">
            ↺ Refresh
          </button>
        </div>

        {/* Request cards */}
        <div className="reviewer-list-container">
          {activeRequests && activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <div key={request.id} className="reviewer-request-card">
                <div
                  className="card-main-info"
                  onClick={() => navigate(`/requests/${request.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/requests/${request.id}`)}
                >
                  <h3 className="request-title">{request.title}</h3>
                  <p className="request-meta">
                    Submitted by{' '}
                    <span>{request.requester?.name || request.requester_email || 'Unknown'}</span>
                    {' '}· {formatDate(request.created_at)}
                  </p>
                  <p className="request-desc-preview">
                    {request.description?.length > 120
                      ? `${request.description.substring(0, 120)}…`
                      : request.description}
                  </p>
                </div>

                <div className="card-meta-actions">
                  <div className="card-badges">
                    <PriorityBadge priority={request.priority} />
                    <StatusBadge status={request.status} />
                  </div>

                  {activeTab === 'pending' && (
                    <div className="card-action-buttons">
                      <button
                        onClick={() => openDecisionModal(request, 'APPROVE')}
                        className="btn-approve"
                        aria-label={`Approve ${request.title}`}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => openDecisionModal(request, 'REJECT')}
                        className="btn-reject"
                        aria-label={`Reject ${request.title}`}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              {activeTab === 'pending'
                ? '🎉 No pending requests — all caught up!'
                : '📂 No reviewed requests yet.'}
            </div>
          )}
        </div>
      </main>

      <DecisionModal
        isOpen={modalOpen}
        actionType={actionType}
        requestTitle={selectedRequest?.title}
        onConfirm={handleConfirmDecision}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ReviewerDashboard;