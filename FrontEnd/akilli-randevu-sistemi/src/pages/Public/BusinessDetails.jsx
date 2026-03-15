import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiPhone, FiArrowLeft, FiCheck, FiClock, FiUser, FiCalendar
} from 'react-icons/fi';
import { publicService } from '../../services/api';
import './BusinessDetails.css';

const BusinessDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Telefon numarasını otomatik 0555 555 55 55 şeklinde formatla
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    
    // Maksimum 11 hane (05XX XXX XX XX)
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = val;
    if (val.length > 3) {
      formatted = val.slice(0, 4) + ' ' + val.slice(4);
    }
    if (val.length > 6) {
      formatted = formatted.slice(0, 8) + ' ' + formatted.slice(8);
    }
    if (val.length > 8) {
      formatted = formatted.slice(0, 11) + ' ' + formatted.slice(11);
    }
    
    setCustomerInfo({...customerInfo, phone: formatted});
  };

  const isFormValid = customerInfo.fullName.trim().length > 2 && customerInfo.phone.replace(/\D/g, '').length === 11;

  useEffect(() => {
    fetchBusinessData();
  }, [slug]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const businessRes = await publicService.getBusiness(slug);
      if (businessRes.data.success) {
        setBusiness(businessRes.data.data);
        const servicesRes = await publicService.getServices(businessRes.data.data._id);
        if (servicesRes.data.success) setServices(servicesRes.data.data);
        const staffRes = await publicService.getStaff(businessRes.data.data._id);
        if (staffRes.data.success) setStaff(staffRes.data.data);
      }
    } catch (error) {
      console.error('Veri çekilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedService && business) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const fetchAvailableSlots = async () => {
    try {
      const params = {
        businessId: business._id,
        serviceId: selectedService._id,
        date: selectedDate
      };
      if (selectedStaff) params.staffId = selectedStaff._id;
      const response = await publicService.getAvailableSlots(params);
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (error) {
      console.error('Saatler alınamadı:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!isFormValid) {
      alert("Lütfen tüm zorunlu alanları (Ad Soyad ve geçerli Telefon) eksiksiz doldurun.");
      return;
    }
    
    try {
      const appointmentData = {
        businessId: business._id,
        serviceId: selectedService._id,
        staffId: selectedStaff?._id,
        date: selectedDate,
        time: selectedSlot,
        customer: customerInfo
      };
      
      const response = await publicService.createAppointment(appointmentData);
      if (response.data.success) {
        alert('Randevunuz başarıyla oluşturuldu! Sizi bekliyoruz.');
        navigate('/randevu-al');
      }
    } catch (error) {
      console.error('Randevu oluşturulamadı:', error);
      alert('Randevu oluşturulurken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div className="bd-loading"><div className="bd-spinner"></div></div>;
  }

  if (!business) {
    return (
      <div className="bd-error">
        <h2>İşletme bulunamadı</h2>
        <button onClick={() => navigate('/randevu-al')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="bd-layout">
      <div className="bd-container">
        
        {/* Left Pane - Sticky Sidebar */}
        <aside className="bd-sidebar">
          <button className="bd-back-btn" onClick={() => navigate('/randevu-al')}>
            <FiArrowLeft /><span>Geri Dön</span>
          </button>
          
          <div className="bd-biz-card">
            <div className="bd-biz-avatar">{business.businessName.charAt(0)}</div>
            <h1 className="bd-biz-title">{business.businessName}</h1>
            <div className="bd-biz-meta-list">
              <div className="bd-meta-item">
                <FiMapPin /> {business.address || 'Adres belirtilmemiş'}
              </div>
              {business.phone && (
                <div className="bd-meta-item">
                  <FiPhone /> {business.phone}
                </div>
              )}
            </div>
          </div>

          {/* Sürpriz Detaylar / Özet Kartı */}
          {(selectedService || selectedDate) && (
            <div className="bd-summary-card">
              <h3>Randevu Özeti</h3>
              <div className="summary-details">
                {selectedService && (
                  <div className="summary-row">
                    <span className="summary-label">Hizmet</span>
                    <span className="summary-val">{selectedService.name}</span>
                  </div>
                )}
                {selectedStaff && (
                  <div className="summary-row">
                    <span className="summary-label">Personel</span>
                    <span className="summary-val">{selectedStaff.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="summary-row">
                    <span className="summary-label">Tarih</span>
                    <span className="summary-val">{new Date(selectedDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="summary-row">
                    <span className="summary-label">Saat</span>
                    <span className="summary-val">{selectedSlot}</span>
                  </div>
                )}
              </div>
              {selectedService && (
                <div className="summary-total">
                  <span>Toplam</span>
                  <strong>{selectedService.price} ₺</strong>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Right Pane - Booking Flow */}
        <main className="bd-content">
          <h2 className="bd-page-title">Hemen Randevu Al</h2>
          <p className="bd-page-subtitle">Sadece birkaç adımda işleminizi tamamlayın.</p>

          <div className="bd-steps">
            
            {/* Step 1: Service */}
            <div className={`bd-step-box ${step === 1 ? 'active' : step > 1 ? 'completed' : 'disabled'}`}>
              <div className="bd-step-header" onClick={() => step > 1 && setStep(1)}>
                <div className="bd-step-indicator">{step > 1 ? <FiCheck /> : '1'}</div>
                <div className="bd-step-title">
                  <h3>Hizmet Seçimi</h3>
                  {step > 1 && <span className="bd-step-preview">{selectedService?.name}</span>}
                </div>
              </div>
              
              {step === 1 && (
                <div className="bd-step-body">
                  <div className="bd-service-list">
                    {services.map(s => (
                      <label 
                        key={s._id} 
                        className={`bd-service-item ${selectedService?._id === s._id ? 'selected' : ''}`}
                      >
                        <div className="bd-radio">
                          <input 
                            type="radio" 
                            name="service" 
                            checked={selectedService?._id === s._id}
                            onChange={() => { setSelectedService(s); setStep(2); }}
                          />
                          <div className="bd-radio-dot"></div>
                        </div>
                        <div className="bd-service-info">
                          <h4>{s.name}</h4>
                          <span className="time"><FiClock/> {s.duration} dk</span>
                        </div>
                        <div className="bd-service-price">{s.price} ₺</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Staff */}
            <div className={`bd-step-box ${step === 2 ? 'active' : step > 2 ? 'completed' : 'disabled'}`}>
              <div className="bd-step-header" onClick={() => step > 2 && setStep(2)}>
                <div className="bd-step-indicator">{step > 2 ? <FiCheck /> : '2'}</div>
                <div className="bd-step-title">
                  <h3>Personel Seçimi</h3>
                  {step > 2 && <span className="bd-step-preview">{selectedStaff ? selectedStaff.name : 'Herhangi Biri'}</span>}
                </div>
                {step === 2 && (
                  <button className="bd-skip-link" onClick={() => { setSelectedStaff(null); setStep(3); }}>
                    Atla (Fark Etmez)
                  </button>
                )}
              </div>
              
              {step === 2 && (
                <div className="bd-step-body">
                  <div className="bd-staff-grid">
                    {staff.map(member => (
                      <div 
                        key={member._id} 
                        className="bd-staff-card"
                        onClick={() => { setSelectedStaff(member); setStep(3); }}
                      >
                        <div className="bd-staff-avatar">{member.name.charAt(0)}</div>
                        <div className="bd-staff-info">
                          <h4>{member.name}</h4>
                          <span>{member.title || 'Uzman'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Date & Time */}
            <div className={`bd-step-box ${step === 3 ? 'active' : step > 3 ? 'completed' : 'disabled'}`}>
              <div className="bd-step-header" onClick={() => step > 3 && setStep(3)}>
                <div className="bd-step-indicator">{step > 3 ? <FiCheck /> : '3'}</div>
                <div className="bd-step-title">
                  <h3>Tarih ve Saat Seçimi</h3>
                  {step > 3 && <span className="bd-step-preview">{selectedDate && new Date(selectedDate).toLocaleDateString('tr-TR')} - {selectedSlot}</span>}
                </div>
              </div>
              
              {step === 3 && (
                <div className="bd-step-body">
                  <div className="bd-date-picker-wrap">
                    <label>Tarih Seçin</label>
                    <div className="bd-date-input-container">
                      <FiCalendar className="bd-date-icon" />
                      <input 
                        type="date" 
                        className="bd-date-input"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                    />
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="bd-slots-wrap">
                      <label>Saat Seçin</label>
                      <div className="bd-slots-grid">
                        {availableSlots.length > 0 ? (
                          availableSlots.map(slot => (
                            <button
                              key={slot.start}
                              className={`bd-slot-btn ${selectedSlot === slot.start ? 'selected' : ''}`}
                              onClick={() => { setSelectedSlot(slot.start); setStep(4); }}
                            >
                              {slot.start}
                            </button>
                          ))
                        ) : (
                          <div className="bd-slots-empty">
                            Seçilen tarih içi müsait saat bulunamadı. Lütfen başka bir gün deneyin.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 4: Customer Details */}
            <div className={`bd-step-box ${step === 4 ? 'active' : step > 4 ? 'completed' : 'disabled'}`}>
              <div className="bd-step-header">
                <div className="bd-step-indicator">4</div>
                <div className="bd-step-title">
                  <h3>Sizi Tanıyalım</h3>
                </div>
              </div>
              
              {step === 4 && (
                <div className="bd-step-body">
                  <div className="bd-form-grid">
                    <div className="bd-input-group">
                      <label>Ad Soyad <span>*</span></label>
                      <input 
                        type="text" 
                        placeholder="Örn: Ahmet Yılmaz"
                        value={customerInfo.fullName}
                        onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                      />
                    </div>
                    <div className="bd-input-group">
                      <label>Telefon Numarası <span>*</span></label>
                      <input 
                        type="tel" 
                        placeholder="05-- --- -- --"
                        value={customerInfo.phone}
                        onChange={handlePhoneChange}
                        maxLength="15"
                      />
                    </div>
                    <div className="bd-input-group">
                      <label>E-posta Adresi</label>
                      <input 
                        type="email" 
                        placeholder="ornek@mail.com"
                        value={customerInfo.email}
                        onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                      />
                    </div>
                    <div className="bd-input-group full-width">
                      <label>Eklemek İstedikleriniz (Not)</label>
                      <textarea 
                        rows="2"
                        placeholder="İşletmeye iletmek istediğiniz özel bir durum var mı?"
                        value={customerInfo.notes}
                        onChange={e => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    className="bd-submit-btn"
                    disabled={!isFormValid}
                    onClick={handleCreateAppointment}
                  >
                    Randevuyu Onayla ve Bitir
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default BusinessDetails;