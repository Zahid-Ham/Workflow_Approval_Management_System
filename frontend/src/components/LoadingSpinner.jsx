import React from 'react';

export const LoadingSpinner = ({ size = 'medium', fullPage = false, message = 'Loading...' }) => {
  const sizePx = size === 'small' ? '24px' : size === 'large' ? '56px' : '40px';

  const inner = (
    <div className="loading-container" data-testid="loading-spinner">
      <div
        className="spinner"
        style={{ width: sizePx, height: sizePx }}
        role="status"
        aria-label={message}
      />
      {message && size !== 'small' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="loading-container full-page" role="status" aria-live="polite">
        {inner}
      </div>
    );
  }
  return inner;
};

export default LoadingSpinner;
