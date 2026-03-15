import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiPhone, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const businessTypes = [
    { id: 'kuafor', name: 'Kuaför & Berber', icon: '💇' },
    { id: 'guzellik', name: 'Güzellik Merkezi', icon: '💅' },
    { id: 'dental', name: 'Diş Kliniği', icon: '🦷' },
    { id: 'spa', name: 'Spa & Masaj', icon: '💆' },
    { id: 'fitness', name: 'Fitness Salonu', icon: '🏋️' },
    { id: 'diger', name: 'Diğer', icon: '🏢' }
  ];

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Ad Soyad gerekli';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Telefon numarası gerekli';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'Kullanım koşullarını kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 2 && !validateStep2()) return;
    
    setIsLoading(true);
    setApiError('');
    setErrors({});

    try {
      // Backend'in beklediği formata çevir
      const businessData = {
        businessName: formData.businessName || formData.fullName + "'ın İşletmesi", // İşletme adı yoksa varsayılan
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessType: formData.businessType || 'diger'
      };

      console.log('Kayıt isteği gönderiliyor:', businessData);

      const response = await api.post('/auth/register', businessData);

      console.log('Kayıt yanıtı:', response.data);

      if (response.data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('business', JSON.stringify(response.data.data));
        
// Başarılı kayıttan sonra dashboard'a yönlendir
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      
      let errorMessage = 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.';
      
      if (err.response) {
        // Sunucu yanıt verdi ama hata kodu döndü
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      `Hata ${err.response.status}: ${err.response.statusText}`;
        
        // E-posta zaten kayıtlıysa özel mesaj
        if (err.response.status === 400 && errorMessage.includes('email')) {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta deneyin.';
        }
      } else if (err.request) {
        // İstek yapıldı ama yanıt alınamadı
        errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      } else {
        // İstek oluşturulurken hata oldu
        errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Sol Taraf - Progress */}
        <div className="register-left">
          <Link to="/" className="register-logo">
            <span className="logo-icon"></span>
            <span className="logo-text">CepTakvim</span>
          </Link>
          
          <div className="progress-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-info">
                <span className="step-label">Adım 1</span>
                <span className="step-title">Hesap Bilgileri</span>
              </div>
            </div>
            
            <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
            
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-info">
                <span className="step-label">Adım 2</span>
                <span className="step-title">Güvenlik & Onay</span>
              </div>
            </div>
          </div>
          
          <div className="register-benefits">
            <h3>Ücretsiz üyelikle kazanın:</h3>
            <ul>
              <li>✅ 14 gün tüm özellikler ücretsiz</li>
              <li>🚀 Akıllı randevu sistemi</li>
              <li>📱 WhatsApp entegrasyonu</li>
              <li>📊 Detaylı raporlama araçları</li>
              <li>🔒 SSL güvenceli veri koruması</li>
            </ul>
          </div>
        </div>

        {/* Sağ Taraf - Form */}
        <div className="register-right">
          <div className="register-form-container">
            <div className="register-header">
              <h1>Ücretsiz Hesap Oluşturun</h1>
              <p>14 gün boyunca tüm özellikleri deneyin</p>
            </div>

            {/* API Hata Mesajı */}
            {apiError && (
              <div className="api-error-box">
                <FiAlertCircle className="error-icon" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <div className="input-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        placeholder="Ahmet Yılmaz"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({...formData, fullName: e.target.value});
                          if(errors.fullName) setErrors({...errors, fullName: null});
                        }}
                        className={errors.fullName ? 'error' : ''}
                      />
                    </div>
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label>E-posta Adresi</label>
                    <div className="input-wrapper">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        placeholder="ahmet@email.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          if(errors.email) setErrors({...errors, email: null});
                        }}
                        className={errors.email ? 'error' : ''}
                      />
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Telefon Numarası</label>
                    <div className="input-wrapper">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        placeholder="0555 123 45 67"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({...formData, phone: e.target.value});
                          if(errors.phone) setErrors({...errors, phone: null});
                        }}
                        className={errors.phone ? 'error' : ''}
                      />
                    </div>
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label>İşletme Adı</label>
                    <div className="input-wrapper">
                      <FiBriefcase className="input-icon" />
                      <input
                        type="text"
                        placeholder="Vibe Salon"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>İşletme Türü</label>
                    <select
                      className="business-select"
                      value={formData.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    >
                      <option value="">Seçiniz</option>
                      {businessTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="button" 
                    className="register-next-btn"
                    onClick={handleNextStep}
                  >
                    Devam Et <FiArrowRight />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label>Şifre</label>
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value});
                          if(errors.password) setErrors({...errors, password: null});
                        }}
                        className={errors.password ? 'error' : ''}
                      />
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

                  <div className="form-group">
                    <label>Şifre Tekrar</label>
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({...formData, confirmPassword: e.target.value});
                          if(errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                        }}
                        className={errors.confirmPassword ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <div className="form-group terms-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.terms}
                        onChange={(e) => {
                          setFormData({...formData, terms: e.target.checked});
                          if(errors.terms) setErrors({...errors, terms: null});
                        }}
                      />
                      <span>
                        <Link to="/legal">Kullanım koşulları</Link> ve{' '}
                        <Link to="/legal">gizlilik politikasını</Link> kabul ediyorum.
                      </span>
                    </label>
                    {errors.terms && <span className="error-message">{errors.terms}</span>}
                  </div>

                  <div className="register-actions">
                    <button 
                      type="button" 
                      className="register-back-btn"
                      onClick={handlePrevStep}
                    >
                      Geri
                    </button>
                    
                    <button 
                      type="submit" 
                      className="register-submit-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        'Hesap Oluştur'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="register-footer">
              <p>
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="register-link">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;