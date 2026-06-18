import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const RequestCard = ({ request, onEdit, onDelete, onViewDetails }) => {
  const isPending = request.status?.toUpperCase() === 'PENDING';

  return (
    <article
      className="activity-item-card request-item-card"
      aria-label={`Request: ${request.title}, status is ${request.status}, priority is ${request.priority}`}
    >
      <div className="item-meta">
        <PriorityBadge priority={request.priority} />
        <span className="item-date">{formatDate(request.created_at)}</span>
      </div>

      <div className="item-details">
        <h3 className="item-title">{request.title}</h3>
        <p className="item-description">{request.description || 'No description provided.'}</p>

        <div className="item-people-grid">
          {request.reviewer && (
            <div className="people-info">
              Reviewer: <span className="people-name">{request.reviewer.name}</span>
            </div>
          )}
          {request.creator && (
            <div className="people-info">
              Submitted By: <span className="people-name">{request.creator.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-actions-column">
        <StatusBadge status={request.status} />

        <div className="actions-buttons-row">
          <button
            onClick={() => onViewDetails(request.id)}
            className="card-action-btn view-btn"
            aria-label={`View full details of request ${request.title}`}
          >
            View Details
          </button>

          {isPending && onEdit && (
            <button
              onClick={() => onEdit(request.id)}
              className="card-action-btn edit-btn"
              aria-label={`Edit request ${request.title}`}
            >
              Edit
            </button>
          )}

          {isPending && onDelete && (
            <button
              onClick={() => onDelete(request.id)}
              className="card-action-btn delete-btn"
              aria-label={`Delete request ${request.title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default RequestCard;