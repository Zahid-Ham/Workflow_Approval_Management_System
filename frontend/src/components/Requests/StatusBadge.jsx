import React from 'react';

export const StatusBadge = ({ status }) => {
  const cls = {
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    PENDING:  'status-pending',
  }[status?.toUpperCase()] || 'status-pending';

  return (
    <span className={`badge ${cls}`} aria-label={`Status: ${status || 'PENDING'}`}>
      {status || 'PENDING'}
    </span>
  );
};

export default StatusBadge;
