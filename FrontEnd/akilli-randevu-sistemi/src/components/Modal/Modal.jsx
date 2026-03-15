import React, { useEffect } from 'react';
import Button from '../Button/Button';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium', // small, medium, large, full
  animation = 'scale', // scale, slide-up, slide-down, slide-left, slide-right
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  
  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Overlay'e tıklama
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'open' : ''}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`modal-container modal--${size} modal--${animation} ${className}`}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button className="modal-close" onClick={onClose}>
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Hazır modal tipleri
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Onayla', cancelText = 'İptal', variant = 'danger' }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Onay'}
      size="small"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p style={{ textAlign: 'center', margin: '1rem 0' }}>
        {message || 'Bu işlemi onaylıyor musunuz?'}
      </p>
    </Modal>
  );
};

export const AlertModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Bilgi'}
      size="small"
      footer={
        <Button variant="primary" onClick={onClose} fullWidth>
          Tamam
        </Button>
      }
    >
      <p style={{ textAlign: 'center', margin: '1rem 0' }}>
        {message}
      </p>
    </Modal>
  );
};

export default Modal;