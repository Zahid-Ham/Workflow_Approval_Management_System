import React from 'react';

export const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="login-alert error" role="alert" aria-live="assertive">
      <span>{message || 'An unexpected error occurred.'}</span>
      {onRetry && (
        <button onClick={onRetry} className="retry-link-btn">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
