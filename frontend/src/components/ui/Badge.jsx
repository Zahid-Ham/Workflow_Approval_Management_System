import React from 'react';

export const Badge = ({ children, variant = 'info', className = '' }) => {
  // variants: info, warning, success, danger
  const getBadgeClass = (v) => {
    switch (v?.toLowerCase()) {
      case 'success':
      case 'approved':
        return 'status-approved';
      case 'danger':
      case 'rejected':
      case 'high':
        return 'status-rejected';
      case 'warning':
      case 'pending':
      case 'medium':
        return 'status-pending';
      case 'info':
      case 'low':
      default:
        return 'user-role-badge role-requester';
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass(variant)} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
