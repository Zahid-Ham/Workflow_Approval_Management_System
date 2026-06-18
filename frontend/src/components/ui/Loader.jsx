import React from 'react';

export const Loader = ({ fullPage = false }) => {
  const spinnerElement = (
    <div className="spinner-mini" style={{ width: '40px', height: '40px' }} data-testid="loading-spinner" />
  );

  if (fullPage) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '80vh' }}>
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Loader;
