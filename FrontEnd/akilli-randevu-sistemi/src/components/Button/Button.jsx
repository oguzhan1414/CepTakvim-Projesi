import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',     // primary, secondary, danger, outline, ghost
  size = 'medium',          // small, medium, large
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  ...props
}) => {
  
  // CSS sınıflarını dinamik olarak oluştur
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    size !== 'medium' && `btn--${size}`,
    fullWidth && 'btn--full-width'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;