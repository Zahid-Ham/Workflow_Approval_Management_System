import React from 'react';

export const EmptyState = ({ icon = '📂', title, description, actionLabel, onAction }) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h3>{title || 'No items found'}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="empty-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
