import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { authService } from '../../services/api';
import './ResetPassword.css'; // Aynı CSS'i kullanarak tasarımı koruyoruz

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL'den token ve email'i yakalıyoruz
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [status, setStatus] = useState({
    loading: false,
    verifying: true, // Sayfa açılır açılmaz token geçerli mi diye bakacağız
    success: false,
    error: null
  });

  // Sayfa yüklendiğinde linkin (token) süresi dolmuş mu diye kontrol et
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setStatus({ verifying: false, loading: false, success: false, error: 'Geçersiz bağlantı. Lütfen yeni bir şifre sıfırlama linki isteyin.' });
        return;
      }

      try {
        await authService.verifyResetToken({ token, email });
        setStatus(prev => ({ ...prev, verifying: false }));
      } catch (err) {
        setStatus({ verifying: false, loading: false, success: false, error: 'Bu bağlantının süresi dolmuş veya geçersiz. Lütfen tekrar sıfırlama talebinde bulunun.' });
      }
    };

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus(prev => ({ ...prev, error: 'Şifreler birbiriyle eşleşmiyor.' }));
      return;
    }

    if (password.length < 6) {
      setStatus(prev => ({ ...prev, error: 'Şifre en az 6 karakter olmalıdır.' }));
      return;
    }

    setStatus({ loading: true, verifying: false, success: false, error: null });

    try {
      const response = await authService.resetPassword({
        email,
        token,
        newPassword: password
      });

      if (response.data.success) {
        setStatus({ loading: false, verifying: false, success: true, error: null });
        // 3 saniye sonra kullanıcıyı giriş ekranına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.';
      setStatus({ loading: false, verifying: false, success: false, error: errorMessage });
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card glass-card">
          <div className="card-header">
            <h1>Yeni Şifre Belirle</h1>
            <p>Lütfen hesabınız için yeni ve güvenli bir şifre oluşturun.</p>
          </div>

          {status.verifying ? (
            <div className="loading-state" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
              <span className="spin-icon" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '2rem' }}>⏳</span>
              <p>Bağlantı kontrol ediliyor...</p>
            </div>
          ) : status.error && !status.success ? (
            <div className="error-state" style={{ textAlign: 'center' }}>
              <div className="error-message" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                <FiAlertCircle size={24} /> {status.error}
              </div>
              <Link to="/forgot-password" className="submit-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                Yeni Link İste
              </Link>
            </div>
          ) : status.success ? (
            <div className="success-message-container">
              <div className="success-icon">
                <FiCheckCircle size={48} color="#10b981" />
              </div>
              <h2>Şifre Güncellendi!</h2>
              <p>Şifreniz başarıyla değiştirildi. Şimdi yeni şifrenizle giriş yapabilirsiniz.</p>
              <p className="info-text" style={{ marginTop: '1rem' }}>Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <label>Yeni Şifre</label>
                <div className="input-wrapper has-value">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (status.error) setStatus(prev => ({ ...prev, error: null }));
                    }}
                    disabled={status.loading}
                  />
                  <FiLock className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label>Yeni Şifre (Tekrar)</label>
                <div className={`input-wrapper ${status.error ? 'error' : ''} has-value`}>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (status.error) setStatus(prev => ({ ...prev, error: null }));
                    }}
                    disabled={status.loading}
                  />
                  <FiLock className="input-icon" />
                </div>
                {status.error && (
                  <div className="error-message" style={{ marginTop: '0.5rem' }}>
                    <FiAlertCircle /> {status.error}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={status.loading || !password || !confirmPassword}
              >
                {status.loading ? (
                  <span className="btn-loading-content">
                    <span className="loading-spinner"></span> Güncelleniyor...
                  </span>
                ) : (
                  'Şifreyi Kaydet'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;