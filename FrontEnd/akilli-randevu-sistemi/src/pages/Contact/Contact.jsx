import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout/MainLayout';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiLoader, FiAlertCircle } from 'react-icons/fi';
// API servisini import ediyoruz. Dosya yolunu kendi klasör yapına göre kontrol et.
import { contactService } from '../../services/api'; 
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Durum yönetimi için daha kapsamlı bir state kullanıyoruz
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // İstek başlarken loading durumunu true yap, eski hataları temizle
    setStatus({ loading: true, success: false, error: null });

    try {
      // Backend'e form verilerini gönderiyoruz
      const response = await contactService.sendMessage(formData);

      if (response.data.success) {
        // Başarılı olursa durumu güncelle ve formu sıfırla
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        
        // 5 saniye sonra başarı mesajını gizle
        setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
      }
    } catch (err) {
      // Hata durumunda backend'den gelen mesajı veya genel bir mesajı göster
      const errorMessage = err.response?.data?.message || 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.';
      setStatus({ loading: false, success: false, error: errorMessage });
    }
  };

  return (
    <MainLayout>
      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-form-container">
            <h2>Bize Mesaj Gönderin</h2>
            
            {/* Başarı ve Hata Mesajları */}
            {status.success && (
              <div className="success-message">
                <FiSend className="message-icon" />
                Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.
              </div>
            )}
            
            {status.error && (
              <div className="error-message">
                <FiAlertCircle className="message-icon" />
                {status.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Adınız Soyadınız</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Adınızı girin"
                    disabled={status.loading} // Yüklenirken inputları kilitle
                  />
                </div>
                <div className="form-group">
                  <label>E-posta Adresiniz</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="ornek@email.com"
                    disabled={status.loading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefon Numaranız</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0555 123 45 67"
                    disabled={status.loading}
                  />
                </div>
                <div className="form-group">
                  <label>Konu</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    placeholder="Mesajınızın konusu"
                    disabled={status.loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mesajınız</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  placeholder="Mesajınızı yazın..."
                  rows="5"
                  disabled={status.loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status.loading}
              >
                {status.loading ? (
                  <span className="btn-loading-content">
                    <FiLoader className="spin-icon" /> Gönderiliyor...
                  </span>
                ) : (
                  'Mesaj Gönder'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default Contact;