import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, FiPhone, FiMail,
  FiMapPin, FiArrowLeft, FiX, FiCheck, FiAlertCircle,
  FiPhone as FiPhoneIcon, FiCalendar as FiCalendarIcon,
  FiInfo, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { appointmentService, customerService } from '../../services/api';
import './MyAppointments.css';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // login, list, detail, cancel, change
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Bildirim state'i
  const [notification, setNotification] = useState({
    show: false,
    type: 'success', // success, error, info
    message: '',
    duration: 5000 // 5 saniye
  });

  // Değiştirme için state'ler
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  // Bildirim göster
  const showNotification = (type, message, duration = 5000) => {
    setNotification({
      show: true,
      type,
      message,
      duration
    });

    // Otomatik kapanma
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, duration);
  };

  // Bildirimi manuel kapat
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Telefon ile giriş
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!phone) {
      showNotification('error', 'Telefon numarası gerekli');
      return;
    }

    setLoading(true);

    try {
      const response = await customerService.getByPhone(phone);
      
      if (response.data.success) {
        setCustomer(response.data.customer);
        setAppointments(response.data.appointments);
        setStep('list');
        showNotification('success', 'Giriş başarılı!', 3000);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Randevu iptal onayı
  const handleConfirmCancel = async () => {
    setLoading(true);
    
    try {
      await appointmentService.cancel(selectedAppointment._id);
      
      const updatedAppointments = appointments.map(app => 
        app._id === selectedAppointment._id 
          ? { ...app, status: 'cancelled' } 
          : app
      );
      
      setAppointments(updatedAppointments);
      
      // Başarılı iptal bildirimi
      showNotification('success', 'Randevunuz başarıyla iptal edildi!', 4000);
      
      setTimeout(() => {
        setStep('list');
        setSelectedAppointment(null);
      }, 1000);
      
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'İptal işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Müsait saatleri getir
  const fetchAvailableSlots = async () => {
    if (!newDate) return;
    
    setLoading(true);
    
    try {
      const params = {
        businessId: selectedAppointment.businessId._id,
        serviceId: selectedAppointment.serviceId._id,
        date: newDate
      };
      
      if (selectedAppointment.staffId?._id) {
        params.staffId = selectedAppointment.staffId._id;
      }
      
      const response = await appointmentService.getAvailableSlots(params);
      
      if (response.data.success) {
        setAvailableSlots(response.data.data || []);
        if (response.data.data.length === 0) {
          showNotification('info', 'Seçilen tarihte müsait saat bulunamadı.', 4000);
        }
      }
    } catch (err) {
      showNotification('error', 'Müsait saatler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newDate && selectedAppointment) {
      fetchAvailableSlots();
    }
  }, [newDate]);

  // Değiştirme onayı
  const handleConfirmChange = async () => {
    if (!newDate || !newTime) {
      showNotification('error', 'Lütfen tarih ve saat seçin');
      return;
    }

    setLoading(true);
    
    try {
      await appointmentService.reschedule(selectedAppointment._id, {
        newDate,
        newTime
      });
      
      // Randevu listesini güncelle
      const updatedAppointments = appointments.map(app => 
        app._id === selectedAppointment._id 
          ? { ...app, date: newDate, startTime: newTime, status: 'pending' } 
          : app
      );
      
      setAppointments(updatedAppointments);
      
      // Başarılı değişiklik bildirimi
      showNotification('success', 'Randevunuz başarıyla güncellendi! İşletme onayı bekleniyor.', 5000);
      
      setTimeout(() => {
        setStep('list');
        setSelectedAppointment(null);
        setNewDate('');
        setNewTime('');
      }, 1500);
      
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Güncelleme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Randevu durumuna göre badge rengi
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'cancelled': return 'İptal Edildi';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'cancelled': return 'cancelled';
      case 'completed': return 'completed';
      default: return '';
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Bugünün tarihi
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Bildirim tipine göre ikon seç
  const getNotificationIcon = () => {
    switch(notification.type) {
      case 'success': return <FiCheckCircle />;
      case 'error': return <FiXCircle />;
      case 'info': return <FiInfo />;
      default: return <FiInfo />;
    }
  };

  return (
    <div className="my-appointments-page">
      
      {/* GLOBAL BİLDİRİM */}
      {notification.show && (
        <div className={`global-notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">{getNotificationIcon()}</span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button className="notification-close" onClick={closeNotification}>
            <FiX />
          </button>
        </div>
      )}

      {/* Login Ekranı */}
      {step === 'login' && (
        <div className="login-container">
          <div className="login-header">
            <h1>Randevularım</h1>
            <p>Randevularınızı görüntülemek ve yönetmek için telefon numaranızı girin.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="phone-input-group">
              <label>Telefon Numarası</label>
              <div className="phone-input-wrapper">
                <FiPhoneIcon className="phone-icon" />
                <input
                  type="tel"
                  placeholder="0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : 'Devam Et'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Randevu almak için{' '}
              <Link to="/randevu-al">işletme arama sayfasına</Link> gidin.
            </p>
          </div>
        </div>
      )}

      {/* Randevu Listesi */}
      {step === 'list' && (
        <div className="appointments-container">
          <div className="appointments-header">
            <h1>Randevularım</h1>
            <div className="customer-info">
              <span>{customer?.fullName}</span>
              <strong>{customer?.phone}</strong>
            </div>
          </div>

          <div className="appointments-grid">
            {appointments.length > 0 ? (
              appointments.map(app => (
                <div key={app._id} className="appointment-card">
                  <div className="appointment-status">
                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                      {getStatusBadge(app.status)}
                    </span>
                    <span className="appointment-business">
                      <FiMapPin /> {app.businessId?.businessName || 'İşletme'}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <div className="detail-text">
                        <span className="detail-label">TARİH</span>
                        <span className="detail-value">{formatDate(app.date)}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <FiClock className="detail-icon" />
                      <div className="detail-text">
                        <span className="detail-label">SAAT</span>
                        <span className="detail-value">{app.startTime}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <FiUser className="detail-icon" />
                      <div className="detail-text">
                        <span className="detail-label">HİZMET</span>
                        <span className="detail-value">{app.serviceId?.name || 'Hizmet'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => {
                        setSelectedAppointment(app);
                        setStep('detail');
                      }}
                    >
                      Detay
                    </button>
                    
                    {app.status !== 'cancelled' && app.status !== 'completed' && (
                      <>
                        <button 
                          className="action-btn change"
                          onClick={() => {
                            setSelectedAppointment(app);
                            setStep('change');
                          }}
                        >
                          Değiştir
                        </button>
                        <button 
                          className="action-btn cancel"
                          onClick={() => {
                            setSelectedAppointment(app);
                            setStep('cancel');
                          }}
                        >
                          İptal Et
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Henüz randevunuz yok</h3>
                <p>Randevu almak için işletme arama sayfasını ziyaret edin.</p>
                <button 
                  className="login-btn"
                  onClick={() => navigate('/randevu-al')}
                >
                  İşletme Ara
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Randevu Detay */}
      {step === 'detail' && selectedAppointment && (
        <div className="detail-container">
          <button className="back-btn" onClick={() => setStep('list')}>
            <FiArrowLeft /> Listeye Dön
          </button>

          <div className="detail-card">
            <h2>Randevu Detayı</h2>

            <div className="detail-row">
              <span className="label">Durum:</span>
              <span className={`value status-badge ${getStatusClass(selectedAppointment.status)}`}>
                {getStatusBadge(selectedAppointment.status)}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">İşletme:</span>
              <span className="value">{selectedAppointment.businessId?.businessName}</span>
            </div>

            <div className="detail-row">
              <span className="label">Adres:</span>
              <span className="value">{selectedAppointment.businessId?.address || 'Belirtilmemiş'}</span>
            </div>

            <div className="detail-row">
              <span className="label">Tarih:</span>
              <span className="value">{formatDate(selectedAppointment.date)}</span>
            </div>

            <div className="detail-row">
              <span className="label">Saat:</span>
              <span className="value">{selectedAppointment.startTime}</span>
            </div>

            <div className="detail-row">
              <span className="label">Hizmet:</span>
              <span className="value">{selectedAppointment.serviceId?.name}</span>
            </div>

            <div className="detail-row">
              <span className="label">Süre:</span>
              <span className="value">{selectedAppointment.serviceId?.duration || 0} dk</span>
            </div>

            <div className="detail-row">
              <span className="label">Ücret:</span>
              <span className="value price">{selectedAppointment.price} ₺</span>
            </div>

            {selectedAppointment.notes && (
              <div className="detail-row">
                <span className="label">Notlar:</span>
                <span className="value">{selectedAppointment.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* İptal Onay Ekranı */}
      {step === 'cancel' && selectedAppointment && (
        <div className="confirm-card">
          <div className="warning-icon">⚠️</div>
          <h2>Randevuyu İptal Et</h2>
          <p>
            <strong>{selectedAppointment.businessId?.businessName}</strong> işletmesindeki<br />
            <strong>{formatDate(selectedAppointment.date)} {selectedAppointment.startTime}</strong> tarihli randevunuzu iptal etmek istediğinize emin misiniz?
          </p>

          <div className="confirm-actions">
            <button 
              className="confirm-btn secondary"
              onClick={() => setStep('list')}
              disabled={loading}
            >
              Vazgeç
            </button>
            <button 
              className="confirm-btn danger"
              onClick={handleConfirmCancel}
              disabled={loading}
            >
              {loading ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
            </button>
          </div>
        </div>
      )}

      {/* Randevu Değiştirme Ekranı */}
      {step === 'change' && selectedAppointment && (
        <div className="detail-container">
          <button className="back-btn" onClick={() => setStep('list')}>
            <FiArrowLeft /> Listeye Dön
          </button>

          <div className="detail-card">
            <h2>Randevu Değiştir</h2>
            
            <div className="current-info">
              <p>Mevcut Randevu: <strong>{formatDate(selectedAppointment.date)} {selectedAppointment.startTime}</strong></p>
            </div>

            <div className="form-group">
              <label>Yeni Tarih</label>
              <input
                type="date"
                min={getTodayDate()}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="date-input"
              />
            </div>

            {newDate && (
              <div className="form-group">
                <label>Yeni Saat</label>
                <div className="time-slots-container">
                  {loading ? (
                    <div className="time-slots-loading">
                      <div className="loading-spinner-small"></div>
                      <p>Müsait saatler yükleniyor...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="time-slots-grid">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.start}
                          className={`time-slot ${newTime === slot.start ? 'selected' : ''}`}
                          onClick={() => setNewTime(slot.start)}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="no-slots-message">
                      <FiCalendarIcon size={24} />
                      <p>Seçilen tarihte müsait saat yok</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="confirm-actions" style={{ marginTop: '2rem' }}>
              <button 
                className="confirm-btn secondary"
                onClick={() => setStep('list')}
                disabled={loading}
              >
                Vazgeç
              </button>
              <button 
                className="confirm-btn"
                style={{ background: '#4f46e5', color: 'white' }}
                onClick={handleConfirmChange}
                disabled={loading || !newDate || !newTime}
              >
                {loading ? 'Güncelleniyor...' : 'Randevuyu Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;