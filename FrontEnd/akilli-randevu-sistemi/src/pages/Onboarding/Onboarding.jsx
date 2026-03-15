import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, 
  FiArrowRight, FiArrowLeft, FiCheck, FiPlus, FiTrash2,
  FiClock, FiStar, FiLoader
} from 'react-icons/fi';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding, business } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [suggestedServices, setSuggestedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: business?.businessName || '',
    businessType: '',
    phone: '',
    email: business?.email || '',
    address: '',
    services: [],
    newService: '',
    workingHours: {
      monday: { active: true, start: '09:00', end: '18:00' },
      tuesday: { active: true, start: '09:00', end: '18:00' },
      wednesday: { active: true, start: '09:00', end: '18:00' },
      thursday: { active: true, start: '09:00', end: '18:00' },
      friday: { active: true, start: '09:00', end: '18:00' },
      saturday: { active: false, start: '10:00', end: '16:00' },
      sunday: { active: false, start: '10:00', end: '16:00' }
    }
  });

  // Tüm işletme tipleri tek grid'de (eski güzel tasarım)
  const businessTypes = [
    // Güzellik & Sağlık
    { id: 'kuafor', name: 'Kuaför & Berber', icon: '💇' },
    { id: 'guzellik', name: 'Güzellik Merkezi', icon: '💅' },
    { id: 'spa', name: 'Spa & Masaj', icon: '💆' },
    
    // Sağlık
    { id: 'dental', name: 'Diş Kliniği', icon: '🦷' },
    { id: 'doktor', name: 'Doktor', icon: '👨‍⚕️' },
    { id: 'psikolog', name: 'Psikolog', icon: '🧠' },
    
    // Eğitim & Danışmanlık
    { id: 'ogretmen', name: 'Online Öğretmen', icon: '👩‍🏫' },
    { id: 'avukat', name: 'Avukat', icon: '⚖️' },
    { id: 'danisman', name: 'Danışman', icon: '📊' },
    
    // Spor & Fitness
    { id: 'fitness', name: 'Fitness', icon: '🏋️' },
    { id: 'yoga', name: 'Yoga & Pilates', icon: '🧘' },
    
    
    // Diğer
    { id: 'diger', name: 'Diğer', icon: '📌' }
  ];

  // İşletme tipine göre hizmet önerileri
  const serviceSuggestions = {
    kuafor: ['Saç Kesimi', 'Saç Boyama', 'Fön', 'Keratin Bakım', 'Sakal Kesim', 'Cilt Bakımı', 'Kaş Alma'],
    guzellik: ['Cilt Bakımı', 'Manikür', 'Pedikür', 'Kalıcı Oje', 'İpek Kirpik', 'Kaş Tasarımı', 'Epilasyon'],
    spa: ['Klasik Masaj', 'Aromaterapi', 'Sıcak Taş', 'Hamam', 'Sauna', 'Refleksoloji'],
    dental: ['Diş Taşı Temizliği', 'Kanal Tedavisi', 'İmplant', 'Diş Beyazlatma', 'Ortodonti', 'Diş Çekimi'],
    doktor: ['Muayene', 'Kontrol', 'Tahlil', 'Konsültasyon', 'Aşı', 'Reçete'],
    psikolog: ['Bireysel Terapi', 'Çift Terapisi', 'Online Görüşme', 'Test', 'Danışmanlık'],
    ogretmen: ['Özel Ders', 'Grup Dersi', 'Etüt', 'Danışmanlık', 'Sınav Hazırlık', 'Yabancı Dil'],
    avukat: ['Hukuki Danışmanlık', 'Dava Takibi', 'Sözleşme', 'Arabuluculuk', 'İcra'],
    danisman: ['İş Danışmanlığı', 'Kariyer Koçluğu', 'Eğitim Danışmanlığı', 'Strateji'],
    fitness: ['Antrenman', 'Grup Dersi', 'Beslenme', 'Vücut Analizi', 'Yoga', 'Pilates'],
    yoga: ['Yoga Dersi', 'Pilates', 'Meditasyon', 'Nefes', 'Online Ders'],
    fizyoterapist: ['Tedavi', 'Rehabilitasyon', 'Masaj', 'Egzersiz', 'Manuel Terapi'],
    diger: ['Randevu', 'Danışmanlık', 'Görüşme', 'Diğer']
  };

  useEffect(() => {
    if (formData.businessType && serviceSuggestions[formData.businessType]) {
      setSuggestedServices(serviceSuggestions[formData.businessType]);
    } else {
      setSuggestedServices([]);
    }
  }, [formData.businessType]);

  const daysInTurkish = {
    monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
    thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar'
  };

  const progressPercentage = (currentStep / 3) * 100;

  const handleNext = async () => {
    // Step 1'de businessType kontrolü
    if (currentStep === 1) {
      if (!formData.businessType) {
        setError('Lütfen bir işletme türü seçin');
        return;
      }
    }
    
    // Step 2'de en az 1 hizmet kontrolü
    if (currentStep === 2) {
      if (formData.services.length === 0) {
        setError('Lütfen en az 1 hizmet ekleyin');
        return;
      }
    }

    if (currentStep < 3) {
      setError('');
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding'i tamamla - API'ye gönder
      setLoading(true);
      setError('');
      
      try {
        const result = await completeOnboarding({
          businessType: formData.businessType,
          phone: formData.phone,
          address: formData.address,
          services: formData.services,
          workingHours: formData.workingHours
        });
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Bir hata oluştu');
        }
      } catch (err) {
        setError('Sunucu hatası oluştu');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleWorkingHourChange = (day, field, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: { ...formData.workingHours[day], [field]: value }
      }
    });
  };

  const toggleDayActive = (day) => {
    handleWorkingHourChange(day, 'active', !formData.workingHours[day].active);
  };

  const addService = () => {
    if (formData.newService.trim() !== '') {
      setFormData({
        ...formData,
        services: [...formData.services, formData.newService.trim()],
        newService: ''
      });
    }
  };

  const addSuggestedService = (service) => {
    if (!formData.services.includes(service)) {
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    }
  };

  const removeService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updatedServices });
  };

  return (
    <div className="onboarding-page">
      {/* Arka Plan */}
      <div className="onboarding-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
      </div>

      <div className="onboarding-container">
        
        {/* Header */}
        <div className="onboarding-header">
          <h1>İşletmenizi Oluşturun</h1>
          <p>Randevu sisteminizi 3 adımda kurun, hemen başlayın.</p>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="progress-container">
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-circle">{currentStep > 1 ? <FiCheck /> : '1'}</div>
              <span className="step-label">İşletme</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-circle">{currentStep > 2 ? <FiCheck /> : '2'}</div>
              <span className="step-label">Hizmetler</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Çalışma Saatleri</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Form Kartı */}
        <div className="onboarding-card">
          
          {/* ADIM 1: İşletme Bilgileri */}
          {currentStep === 1 && (
            <div className="step-content fade-in">
              <h2 className="step-title">İşletme Bilgileri</h2>
              <p className="step-description">İşletmenizin temel bilgilerini girin.</p>
              
              {/* TEK GRID - ESKİ GÜZEL TASARIM */}
              <div className="business-types-grid">
                {businessTypes.map(type => (
                  <button
                    key={type.id}
                    className={`type-card ${formData.businessType === type.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, businessType: type.id })}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-name">{type.name}</span>
                  </button>
                ))}
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>İşletme Adı</label>
                  <div className="input-wrapper">
                    <FiBriefcase className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Örn: Vibe Güzellik Salonu" 
                      value={formData.businessName} 
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Telefon</label>
                  <div className="input-wrapper">
                    <FiPhone className="input-icon" />
                    <input 
                      type="tel" 
                      placeholder="0555 123 45 67" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>E-posta</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="info@isletme.com" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Adres</label>
                  <div className="input-wrapper">
                    <FiMapPin className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Müşterilerinizin sizi bulacağı adres" 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADIM 2: Hizmetler */}
          {currentStep === 2 && (
            <div className="step-content fade-in">
              <h2 className="step-title">Hizmetleriniz</h2>
              <p className="step-description">
                {formData.businessType 
                  ? 'Size özel önerilen hizmetler:' 
                  : 'Sunduğunuz hizmetleri ekleyin.'}
              </p>
              
              {/* Önerilen Hizmetler */}
              {formData.businessType && suggestedServices.length > 0 && (
                <div className="suggested-services">
                  <div className="suggested-header">
                    <FiStar /> Önerilen Hizmetler
                  </div>
                  <div className="suggested-grid">
                    {suggestedServices.map((service, index) => (
                      <button
                        key={index}
                        className={`suggested-tag ${formData.services.includes(service) ? 'added' : ''}`}
                        onClick={() => addSuggestedService(service)}
                        disabled={formData.services.includes(service)}
                      >
                        {service}
                        {formData.services.includes(service) && <FiCheck />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeni Hizmet Ekleme */}
              <div className="add-service">
                <input 
                  type="text" 
                  placeholder="Yeni hizmet ekleyin..." 
                  value={formData.newService}
                  onChange={(e) => setFormData({...formData, newService: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                />
                <button onClick={addService}>
                  <FiPlus /> Ekle
                </button>
              </div>

              {/* Eklenen Hizmetler */}
              <div className="services-list">
                <h4>Eklediğiniz Hizmetler</h4>
                {formData.services.length > 0 ? (
                  <div className="service-tags">
                    {formData.services.map((service, index) => (
                      <div key={index} className="service-tag">
                        <span>{service}</span>
                        <button onClick={() => removeService(index)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-services">Henüz hizmet eklemediniz.</p>
                )}
              </div>
            </div>
          )}

          {/* ADIM 3: Çalışma Saatleri */}
          {currentStep === 3 && (
            <div className="step-content fade-in">
              <h2 className="step-title">Çalışma Saatleri</h2>
              <p className="step-description">
                Müşterilerinizin randevu alabileceği saatleri belirleyin.
              </p>
              
              <div className="working-hours">
                {Object.entries(formData.workingHours).map(([day, hours]) => (
                  <div key={day} className="hour-row">
                    <div className="day-info">
                      <label className="day-toggle">
                        <input 
                          type="checkbox" 
                          checked={hours.active} 
                          onChange={() => toggleDayActive(day)} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="day-name">{daysInTurkish[day]}</span>
                    </div>

                    {hours.active ? (
                      <div className="time-inputs">
                        <input 
                          type="time" 
                          value={hours.start} 
                          onChange={(e) => handleWorkingHourChange(day, 'start', e.target.value)} 
                        />
                        <span>-</span>
                        <input 
                          type="time" 
                          value={hours.end} 
                          onChange={(e) => handleWorkingHourChange(day, 'end', e.target.value)} 
                        />
                      </div>
                    ) : (
                      <span className="closed-day">Kapalı</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="hours-note">
                <FiClock />
                <span>Kapalı günlerde müşterileriniz randevu alamaz.</span>
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="form-actions">
            {error && <div className="error-message">{error}</div>}
            <button 
              className="btn-back" 
              onClick={handleBack} 
              disabled={currentStep === 1 || loading}
            >
              <FiArrowLeft /> Geri
            </button>
            <button 
              className="btn-next" 
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="spin" /> Kaydediliyor...
                </>
              ) : (
                <>
                  {currentStep === 3 ? 'Tamamla' : 'Devam'} <FiArrowRight />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;