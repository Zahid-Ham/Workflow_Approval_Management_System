import React, { useState } from 'react';

export const DecisionModal = ({ isOpen, actionType, requestTitle, onConfirm, onClose }) => {
  const [comments, setComments] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApprove = actionType === 'APPROVE';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!comments.trim() || comments.trim().length < 3) {
      setValidationError('Comments are required (minimum 3 characters).');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(comments.trim());
      setComments('');
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2
            id="modal-title"
            style={{ fontSize: '1rem', fontWeight: 700, color: isApprove ? '#34d399' : '#f87171' }}
          >
            {isApprove ? '✓ Approve Request' : '✕ Reject Request'}
          </h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You are about to{' '}
              <strong style={{ color: isApprove ? '#34d399' : '#f87171' }}>
                {isApprove ? 'APPROVE' : 'REJECT'}
              </strong>{' '}
              the request:
            </p>
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.875rem',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              "{requestTitle}"
            </div>

            <div className="form-field">
              <label htmlFor="modal-comments" className="form-label">
                Decision Comments <span className="required-star">*</span>
              </label>
              <textarea
                id="modal-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder="Provide your decision rationale (minimum 3 characters)…"
                maxLength={500}
                aria-describedby={validationError ? 'modal-comment-error' : undefined}
                autoFocus
              />
              {validationError && (
                <span id="modal-comment-error" className="field-error-msg" role="alert">
                  {validationError}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="form-btn cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`form-btn ${isApprove ? 'submit-btn' : 'form-btn'}`}
              style={
                !isApprove
                  ? {
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font)',
                    }
                  : {}
              }
              disabled={submitting}
            >
              {submitting
                ? 'Processing…'
                : isApprove
                ? '✓ Confirm Approval'
                : '✕ Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecisionModal;