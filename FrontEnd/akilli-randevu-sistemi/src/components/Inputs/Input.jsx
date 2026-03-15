import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  helperText,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  
  // Unique ID oluştur
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // CSS sınıflarını belirle
  const inputClasses = [
    'input-field',
    error && 'input--error',
    success && 'input--success',
    disabled && 'input--disabled',
    className
  ].filter(Boolean).join(' ');

  const InputElement = type === 'textarea' ? 'textarea' : 
                       type === 'select' ? 'select' : 'input';

  return (
    <div className="input-wrapper">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`input-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}

      {/* İkonlu input */}
      {icon ? (
        <div className="input-icon-wrapper">
          <span className={`input-icon ${iconPosition === 'right' ? 'right' : ''}`}>
            {icon}
          </span>
          <InputElement
            ref={ref}
            id={inputId}
            type={type !== 'textarea' && type !== 'select' ? type : undefined}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            name={name}
            {...props}
          />
        </div>
      ) : (
        /* İkonsuz input */
        <InputElement
          ref={ref}
          id={inputId}
          type={type !== 'textarea' && type !== 'select' ? type : undefined}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          name={name}
          {...props}
        />
      )}

      {/* Hata mesajı veya yardım metni */}
      {error && <span className="input-error">{error}</span>}
      {!error && helperText && <span className="input-helper">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;