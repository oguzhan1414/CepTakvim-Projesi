import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',     // default, bordered, flat, primary, secondary, danger, warning, info, gradient-primary
  hoverable = false,
  compact = false,
  className = '',
  ...props
}) => {
  
  // CSS sınıflarını dinamik olarak oluştur
  const cardClasses = [
    'card',
    variant !== 'default' && `card--${variant}`,
    hoverable && 'card--hoverable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {/* Başlık varsa göster */}
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* İçerik */}
      <div className={`card-content ${compact ? 'card-content--compact' : ''}`}>
        {children}
      </div>

      {/* Footer varsa göster */}
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

// Özel İstatistik Kartı
export const StatsCard = ({ value, label, icon, variant = 'primary', ...props }) => {
  return (
    <div className={`stats-card stats-card--${variant}`} {...props}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// Randevu Kartı (Özel bir komponent)
export const AppointmentCard = ({ time, name, service, status }) => {
  const statusClass = 
    status === 'confirmed' ? 'status--confirmed' :
    status === 'pending' ? 'status--pending' :
    'status--cancelled';

  const statusText = 
    status === 'confirmed' ? 'Onaylı' :
    status === 'pending' ? 'Beklemede' :
    'İptal';

  return (
    <div className="appointment-card">
      <div className="appointment-time">{time}</div>
      <div className="appointment-info">
        <h4>{name}</h4>
        <p>{service}</p>
      </div>
      <div className={`appointment-status ${statusClass}`}>
        {statusText}
      </div>
    </div>
  );
};

export default Card;