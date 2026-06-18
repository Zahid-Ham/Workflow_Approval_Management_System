import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  ariaLabel,
  className = '',
}) => {
  // variants: primary, secondary, danger, success, approve, reject
  const btnClass = variant === 'primary' ? 'action-primary' : 'action-secondary';
  
  // Custom button styling overrides if needed
  let customStyleClass = `action-btn ${btnClass} ${className}`;
  if (variant === 'danger') customStyleClass = `action-btn btn-confirm-reject ${className}`;
  if (variant === 'success' || variant === 'approve') customStyleClass = `action-btn btn-confirm-approve ${className}`;

  return (
    <button
      type={type}
      className={customStyleClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
