import React from 'react';

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ui-modal-title">
      <div className="modal-content-card">
        <header className="modal-header">
          <h2 id="ui-modal-title" className="modal-title">
            {title}
          </h2>
          <button onClick={onClose} className="modal-close-x" aria-label="Close modal">
            &times;
          </button>
        </header>
        <div className="modal-body-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
