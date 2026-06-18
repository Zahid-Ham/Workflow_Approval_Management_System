import React from 'react';

export const Textarea = ({
  id,
  label,
  error,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
}) => {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`form-textarea ${error ? 'input-error' : ''}`}
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

export default Textarea;
