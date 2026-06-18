import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const cls = {
    HIGH:   'priority-high',
    MEDIUM: 'priority-medium',
    LOW:    'priority-low',
  }[priority?.toUpperCase()] || 'priority-low';

  return (
    <span className={`badge ${cls}`} aria-label={`Priority: ${priority || 'LOW'}`}>
      {priority || 'LOW'}
    </span>
  );
};

export default PriorityBadge;
