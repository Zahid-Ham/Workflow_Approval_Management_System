import React from 'react';

export const Card = ({ children, className = '', title }) => {
  return (
    <div className={`detail-card ${className}`} role="region" aria-label={title || 'Content Card'}>
      {title && <h2 className="detail-section-subtitle">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
