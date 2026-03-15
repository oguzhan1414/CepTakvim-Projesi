import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { authService } from '../../services/api';
import './ForgotPassword.css'; // Senin o harika CSS dosyan

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  // E-posta format kontrolü
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Şifre sıfırlama isteğini Backend'e gönderen ana fonksiyon
  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Hem formdan hem butondan tetiklenebilmesi için
    
    // Validasyonlar
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setServerMessage('');

    try {
      // api.js'ye eklediğin forgotPassword servisini çağırıyoruz
      const response = await authService.forgotPassword({ email });
      
      if (response.data.success) {
        setIsSent(true);
        setServerMessage(response.data.message); // Backend'den gelen "Gönderildi" mesajı
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err);
      
      // Backend'den gelen error veya message'ı yakala
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı "Tekrar Gönder" butonuna basarsa direkt api'yi tekrar tetikle
  const handleResend = () => {
    handleSubmit(); 
  };

  // Formu sıfırlayıp başka bir e-posta girmek isterse
  const handleTryDifferentEmail = () => {
    setIsSent(false);
    setEmail('');
    setServerMessage('');
    setError('');
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Ana Sayfaya Dön
        </Link>
        
        <div className="forgot-password-card glass-card">
          <div className="card-header">
            <h1>Şifremi Unuttum</h1>
            <p>E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
          </div>

          {!isSent ? (
            /* ================= FORM EKRANI ================= */
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <label>E-posta Adresi</label>
                <div className={`input-wrapper ${error ? 'error' : ''} ${email ? 'has-value' : ''}`}>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(''); // Kullanıcı yazmaya başlayınca hatayı sil
                    }}
                    disabled={isLoading}
                  />
                  <FiMail className="input-icon" />
                </div>
                {error && (
                  <div className="error-message">
                    <FiAlertCircle /> {error}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="btn-loading-content">
                    <span className="loading-spinner"></span> İşleniyor...
                  </span>
                ) : (
                  'Sıfırlama Bağlantısı Gönder'
                )}
              </button>
            </form>
          ) : (
            /* ================= BAŞARILI GÖNDERİM EKRANI ================= */
            <div className="success-message-container">
              <div className="success-icon">
                <FiCheckCircle size={48} color="#10b981" />
              </div>
              <h2>E-posta Gönderildi!</h2>
              <p>
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              </p>
              {serverMessage && <p className="server-message-text">{serverMessage}</p>}
              
              <div className="info-box">
                <FiAlertCircle /> Lütfen e-postanızı kontrol edin. Spam (Gereksiz) klasörüne bakmayı unutmayın.
              </div>
              
              <div className="success-actions">
                <button 
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Tekrar Gönder'}
                </button>
                <button 
                  type="button"
                  className="text-btn"
                  onClick={handleTryDifferentEmail}
                  disabled={isLoading}
                >
                  Farklı bir e-posta dene
                </button>
              </div>
            </div>
          )}

          <div className="card-footer">
            <p>
              Şifrenizi hatırladınız mı?{' '}
              <Link to="/login" className="login-link">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;