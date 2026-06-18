import React from 'react';

export const StatCard = ({ title, value, variant = 'info', description }) => {
  return (
    <div className={`stat-card stat-${variant}`} role="region" aria-label={`${title} statistic`}>
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-badge" aria-hidden="true">
          {variant === 'success' && '✓'}
          {variant === 'warning' && '⏳'}
          {variant === 'danger' && '✕'}
          {variant === 'info' && '📁'}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {description && <p className="stat-card-description">{description}</p>}
    </div>
  );
};

export default StatCard;
