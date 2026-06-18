import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import requestService from '../services/requestService';
import reviewerService from '../services/reviewerService';
import StatusBadge from '../components/Requests/StatusBadge';
import PriorityBadge from '../components/Requests/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReviewer, isRequester } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline review state (reviewer sidebar)
  const [comments, setComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchRequestDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await requestService.getRequest(id);
      setRequest(data);
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError(err.message || 'Failed to retrieve request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this request? This action cannot be undone.')) return;
    try {
      await requestService.deleteRequest(id);
      navigate('/requester');
    } catch (err) {
      setError(err.message || 'Failed to delete request.');
    }
  };

  const handleReviewAction = async (actionType) => {
    setReviewError('');
    setReviewSuccess('');
    if (!comments || comments.trim().length < 3) {
      setReviewError('Comments are required (minimum 3 characters).');
      return;
    }
    setSubmittingReview(true);
    try {
      if (actionType === 'APPROVE') {
        await reviewerService.approveRequest(id, comments.trim());
        setReviewSuccess('Request approved successfully!');
      } else {
        await reviewerService.rejectRequest(id, comments.trim());
        setReviewSuccess('Request rejected.');
      }
      setComments('');
      await fetchRequestDetails();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError(err.message || 'Failed to submit review decision.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  if (error || !request) {
    return (
      <div style={{ maxWidth: 600 }}>
        <button onClick={() => navigate(-1)} className="back-nav-btn" style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <div className="error-banner">{error || 'Request not found.'}</div>
      </div>
    );
  }

  const isPending = request.status?.toUpperCase() === 'PENDING';
  const showReviewActions = isReviewer && isPending;

  return (
    <div aria-label="Request Detailed View">
      {/* Page header */}
      <div className="page-header-row">
        <button onClick={() => navigate(-1)} className="back-nav-btn" aria-label="Go back">
          ← Back
        </button>
        <h1 className="page-title">Request Details</h1>
        {isRequester && isPending && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.625rem' }}>
            <button
              onClick={() => navigate(`/requests/edit/${request.id}`)}
              className="action-btn-secondary"
            >
              ✏️ Edit
            </button>
            <button onClick={handleDelete} className="action-btn-danger">
              🗑 Delete
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Main grid */}
      <div className="request-detail-grid">
        {/* Left: content */}
        <div>
          {/* Core request card */}
          <div className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-request-title">{request.title}</h2>
              <div className="detail-badges">
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div className="detail-field">
              <p className="field-label">Description</p>
              <p className="field-value" style={{ whiteSpace: 'pre-wrap' }}>
                {request.description}
              </p>
            </div>

            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Submitted By</span>
                <span className="metadata-value">
                  {request.requester?.name || request.requester_email || 'Unknown'}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Assigned Reviewer</span>
                <span className="metadata-value">
                  {request.reviewer?.name || request.reviewer_email || 'Unassigned'}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Created At</span>
                <span className="metadata-value">{formatDate(request.created_at)}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Last Updated</span>
                <span className="metadata-value">{formatDate(request.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Review comments (if already reviewed) */}
          {request.comments && (
            <div className="comments-section-card" style={{ marginTop: '1.25rem' }}>
              <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>
                Review Comments
              </h3>
              <div className="comments-bubble">
                <p className="comment-text">{request.comments}</p>
                <span className="comment-timestamp">
                  Reviewed by {request.reviewer?.name || 'Reviewer'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: reviewer action sidebar */}
        {showReviewActions && (
          <aside>
            <div className="action-card">
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '0.375rem',
                  color: 'var(--text-primary)',
                }}
              >
                Review Decision
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Provide your decision and mandatory comments.
              </p>

              {reviewError && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="status-message" style={{ marginBottom: '1rem' }}>
                  {reviewSuccess}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="reviewer-comments" className="form-label">
                  Comments <span className="required-star">*</span>
                </label>
                <textarea
                  id="reviewer-comments"
                  className="form-textarea"
                  rows={5}
                  placeholder="Explain your decision (min. 3 characters)…"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={submittingReview}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                  marginTop: '1rem',
                }}
              >
                <button
                  onClick={() => handleReviewAction('APPROVE')}
                  disabled={submittingReview}
                  className="btn-approve-full"
                  style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem' }}
                >
                  {submittingReview ? 'Processing…' : '✓ Approve Request'}
                </button>
                <button
                  onClick={() => handleReviewAction('REJECT')}
                  disabled={submittingReview}
                  className="btn-reject-full"
                  style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem' }}
                >
                  {submittingReview ? 'Processing…' : '✕ Reject Request'}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;