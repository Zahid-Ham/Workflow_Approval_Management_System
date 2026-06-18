import React from 'react';

export const Input = ({
  id,
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  maxLength,
}) => {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`form-input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
      />
      {error && (
        <span id={`${id}-error`} className="field-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
