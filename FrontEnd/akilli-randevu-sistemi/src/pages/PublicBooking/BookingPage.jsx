import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicService } from '../../services/api';
import './BookingPage.css';

const BookingPage = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  
  // Business data
  const [business, setBusiness] = useState(null);
  
  // Form data
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Customer data
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  // Services and staff
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load business data
  useEffect(() => {
    fetchBusinessData();
  }, [slug]);

  // Load available slots when date or selection changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate, selectedStaff]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const businessRes = await publicService.getBusiness(slug);
      
      if (!businessRes.data.success) {
        setError('İşletme bulunamadı');
        return;
      }

      const businessData = businessRes.data.data;
      setBusiness(businessData);

      // Fetch services and staff
      const [servicesRes, staffRes] = await Promise.all([
        publicService.getServices(businessData._id),
        publicService.getStaff(businessData._id)
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data);
      }
      if (staffRes.data.success) {
        setStaff(staffRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching business:', err);
      setError('İşletme bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const params = {
        businessId: business._id,
        serviceId: selectedService._id,
        date: selectedDate
      };
      
      if (selectedStaff) {
        params.staffId = selectedStaff._id;
      }

      const response = await publicService.getAvailableSlots(params);
      
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const appointmentData = {
        businessId: business._id,
        serviceId: selectedService._id,
        staffId: selectedStaff?._id,
        date: selectedDate,
        time: selectedSlot.start,
        customer: {
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          notes: customer.notes
        }
      };

      const response = await publicService.createAppointment(appointmentData);
      
      if (response.data.success) {
        setBookingSuccess(response.data.data);
        setStep(6); // Success step
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert(err.response?.data?.message || 'Randevu oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date for min date picker
  const today = new Date().toISOString().split('T')[0];

  // Get day name for display
  const getDayName = (dateStr) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[new Date(dateStr).getDay()];
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h2>⚠️</h2>
          <p>{error || 'İşletme bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Business Header */}
        <div className="business-header">
          {business.logoUrl && (
            <img src={business.logoUrl} alt={business.businessName} className="business-logo" />
          )}
          <h1>{business.businessName}</h1>
          {business.address && <p className="business-address">{business.address}</p>}
          {business.phone && <p className="business-phone">{business.phone}</p>}
        </div>

        {/* Progress Steps */}
        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Hizmet</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Personel</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Tarih</span>
          </div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Bilgi</span>
          </div>
          <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
            <span className="step-number">5</span>
            <span className="step-label">Onay</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="booking-step">
              <h2>Hizmet Seçin</h2>
              <div className="service-list">
                {services.map(service => (
                  <div 
                    key={service._id}
                    className={`service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedSlot(null);
                    }}
                  >
                    <div className="service-info">
                      <h3>{service.name}</h3>
                      {service.description && <p>{service.description}</p>}
                    </div>
                    <div className="service-details">
                      <span className="service-duration">{service.duration} dk</span>
                      <span className="service-price">{service.price} TL</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                className="btn-primary"
                disabled={!selectedService}
                onClick={() => setStep(2)}
              >
                Devam Et
              </button>
            </div>
          )}

          {/* Step 2: Staff Selection (Optional) */}
          {step === 2 && (
            <div className="booking-step">
              <h2>Personel Seçin (Opsiyonel)</h2>
              <div className="staff-list">
                <div 
                  className={`staff-card ${!selectedStaff ? 'selected' : ''}`}
                  onClick={() => setSelectedStaff(null)}
                >
                  <div className="staff-avatar">?</div>
                  <div className="staff-info">
                    <h3>Herhangi Bir personel</h3>
                    <p>Sıradaki müsait personel</p>
                  </div>
                </div>
                {staff.map(s => (
                  <div 
                    key={s._id}
                    className={`staff-card ${selectedStaff?._id === s._id ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(s)}
                  >
                    <div className="staff-avatar">
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt={s.name} />
                      ) : (
                        s.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                      )}
                    </div>
                    <div className="staff-info">
                      <h3>{s.name}</h3>
                      <p>{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="step-buttons">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  Geri
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {step === 3 && (
            <div className="booking-step">
              <h2>Tarih ve Saat Seçin</h2>
              
              <div className="date-picker">
                <label>Tarih</label>
                <input 
                  type="date" 
                  min={today}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  required
                />
              </div>

              {selectedDate && (
                <div className="time-slots">
                  <p className="date-display">
                    {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                  
                  {availableSlots.length > 0 ? (
                    <div className="slots-grid">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-slots">Bu tarihte müsait saat bulunmuyor</p>
                  )}
                </div>
              )}

              <div className="step-buttons">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                  Geri
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep(4)}
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Customer Info */}
          {step === 4 && (
            <div className="booking-step">
              <h2>Kişisel Bilgiler</h2>
              
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input 
                  type="text"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({...customer, fullName: e.target.value})}
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input 
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                  placeholder="0555 123 45 67"
                  required
                />
              </div>

              <div className="form-group">
                <label>E-posta</label>
                <input 
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  placeholder="email@ornek.com"
                />
              </div>

              <div className="form-group">
                <label>Notlar</label>
                <textarea 
                  value={customer.notes}
                  onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                  placeholder="Özel istekleriniz..."
                  rows={3}
                />
              </div>

              <div className="step-buttons">
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                  Geri
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  disabled={!customer.fullName || !customer.phone}
                  onClick={() => setStep(5)}
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="booking-step">
              <h2>Randevu Özeti</h2>
              
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="summary-label">İşletme</span>
                  <span className="summary-value">{business.businessName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Hizmet</span>
                  <span className="summary-value">{selectedService?.name} ({selectedService?.duration} dk)</span>
                </div>
                {selectedStaff && (
                  <div className="summary-item">
                    <span className="summary-label">Personel</span>
                    <span className="summary-value">{selectedStaff.name}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">Tarih</span>
                  <span className="summary-value">
                    {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Saat</span>
                  <span className="summary-value">{selectedSlot?.start}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Fiyat</span>
                  <span className="summary-value">{selectedService?.price} TL</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Müşteri</span>
                  <span className="summary-value">{customer.fullName} - {customer.phone}</span>
                </div>
              </div>

              <div className="step-buttons">
                <button type="button" className="btn-secondary" onClick={() => setStep(4)}>
                  Geri
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Gönderiliyor...' : 'Randevu Oluştur'}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && bookingSuccess && (
            <div className="booking-step success-step">
              <div className="success-icon">✅</div>
              <h2>Randevunuz Oluşturuldu!</h2>
              <p>Randevunuz başarıyla oluşturuldu. İşletme en kısa sürede onaylayacaktır.</p>
              
              <div className="success-details">
                <p><strong>Randevu No:</strong> #{bookingSuccess._id.slice(-6)}</p>
                <p><strong>Tarih:</strong> {new Date(bookingSuccess.date).toLocaleDateString('tr-TR')}</p>
                <p><strong>Saat:</strong> {bookingSuccess.startTime}</p>
                <p><strong>Hizmet:</strong> {bookingSuccess.serviceId?.name}</p>
              </div>

              <button 
                type="button" 
                className="btn-primary"
                onClick={() => window.location.href = '/'}
              >
                Ana Sayfaya Dön
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingPage;

