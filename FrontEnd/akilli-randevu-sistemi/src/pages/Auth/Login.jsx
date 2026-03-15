import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, 
  FiAlertCircle 
} from 'react-icons/fi';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false // Varsayılan olarak kapalı
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        
        // Önce eski kalıntıları temizleyelim (Garanti olsun diye)
        localStorage.removeItem('token');
        localStorage.removeItem('business');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('business');

        // ✨ BENİ HATIRLA MANTIĞI ✨
        if (formData.rememberMe) {
          // Beni Hatırla SEÇİLDİYSE -> localStorage (Kalıcı)
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('business', JSON.stringify(response.data.data));
        } else {
          // Beni Hatırla SEÇİLMEDİYSE -> sessionStorage (Geçici)
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('business', JSON.stringify(response.data.data));
        }
        
        // Yönlendirme (Onboarding tamamlanmış mı kontrolü)
        if (!response.data.data.isOnboardingComplete) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      let errorMessage = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      
      if (err.response) {
        errorMessage = err.response.data?.error || 
                       err.response.data?.message || 
                       `Hata ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      } else {
        errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
      }
      
      setErrors({ server: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Hoş Geldiniz</h1>
          <p>İşletmenizi yönetmek için hesabınıza giriş yapın</p>
        </div>

        {/* Sunucu hatası */}
        {errors.server && (
          <div className="server-error-box">
            <FiAlertCircle className="error-icon" />
            <span>{errors.server}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>E-posta Adresi</label>
            <div className={`input-wrapper ${formData.email ? 'has-value' : ''} ${errors.email ? 'error' : ''}`}>
              <input
                type="email"
                placeholder="ornek@isletme.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  if(errors.email) setErrors({...errors, email: null});
                }}
              />
              <FiMail className="input-icon" />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <div className={`input-wrapper ${formData.password ? 'has-value' : ''} ${errors.password ? 'error' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if(errors.password) setErrors({...errors, password: null});
                }}
              />
              <FiLock className="input-icon" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
              />
              <span>Beni hatırla</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Şifremi unuttum
            </Link>
          </div>

          <button 
            type="submit" 
            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>Giriş Yap <FiArrowRight className="btn-arrow" /></>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>veya şununla devam et</span>
        </div>

        <div className="auth-footer">
          <p>
            İşletmeniz sistemde yok mu?
            <Link to="/register" className="auth-link">
              Hemen Ücretsiz Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;