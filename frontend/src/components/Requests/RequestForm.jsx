import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

export const RequestForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Submit' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [reviewerId, setReviewerId] = useState('');
  const [reviewers, setReviewers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch Reviewers list on mount
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const list = await authService.getReviewers();
        setReviewers(list || []);
      } catch (err) {
        console.error('Failed to load reviewers list:', err);
        setError('Failed to load reviewers list. Please reload the page.');
      }
    };
    fetchReviewers();
  }, []);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'LOW');
      setReviewerId(initialData.reviewer_id || '');
    }
  }, [initialData]);

  const validate = () => {
    const errors = {};
    if (!title || title.trim().length < 3 || title.length > 100) {
      errors.title = 'Title must be between 3 and 100 characters.';
    }
    if (!description || description.trim().length < 5 || description.length > 2000) {
      errors.description = 'Description must be between 5 and 2000 characters.';
    }
    if (!reviewerId) {
      errors.reviewerId = 'Please select a reviewer.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        reviewer_id: reviewerId || null,
      });
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="request-form" aria-label="Approval Request Form" noValidate>
      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="req-title" className="form-label">
          Request Title <span className="required-star">*</span>
        </label>
        <input
          id="req-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`form-input ${validationErrors.title ? 'input-error' : ''}`}
          placeholder="Short summary of your request (3–100 characters)"
          maxLength={100}
          aria-describedby={validationErrors.title ? 'title-error' : undefined}
        />
        {validationErrors.title && (
          <span id="title-error" className="field-error-msg" role="alert">
            {validationErrors.title}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="req-description" className="form-label">
          Description <span className="required-star">*</span>
        </label>
        <textarea
          id="req-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`form-textarea ${validationErrors.description ? 'input-error' : ''}`}
          placeholder="Provide detailed context for this approval request (5–2000 characters)"
          rows={5}
          maxLength={2000}
          aria-describedby={validationErrors.description ? 'description-error' : undefined}
        />
        {validationErrors.description && (
          <span id="description-error" className="field-error-msg" role="alert">
            {validationErrors.description}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="req-priority" className="form-label">Priority</label>
        <select
          id="req-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="form-select"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="req-reviewer" className="form-label">
          Assign Reviewer <span className="required-star">*</span>
        </label>
        <select
          id="req-reviewer"
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
          className={`form-select ${validationErrors.reviewerId ? 'input-error' : ''}`}
          aria-describedby={validationErrors.reviewerId ? 'reviewer-error' : undefined}
        >
          <option value="">— Select a Reviewer —</option>
          {reviewers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.email})
            </option>
          ))}
        </select>
        {validationErrors.reviewerId && (
          <span id="reviewer-error" className="field-error-msg" role="alert">
            {validationErrors.reviewerId}
          </span>
        )}
      </div>

      <div className="form-actions-row">
        <button type="button" onClick={onCancel} className="form-btn cancel-btn" disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="form-btn submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default RequestForm;