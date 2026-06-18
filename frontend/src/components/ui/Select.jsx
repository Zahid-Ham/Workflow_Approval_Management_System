import React from 'react';

export const Select = ({
  id,
  label,
  error,
  value,
  onChange,
  options = [],
  placeholder = '-- Choose Option --',
  disabled = false,
  required = false,
}) => {
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select-input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} className="field-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
