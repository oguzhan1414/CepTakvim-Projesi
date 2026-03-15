import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiChevronLeft, FiChevronRight, FiPlus, FiCalendar,
  FiClock, FiUser, FiX, FiCheck, FiTrash2, FiEdit2, FiSearch
} from 'react-icons/fi';
import { appointmentService, customerService, serviceService, staffService } from '../../services/api';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'day'
  
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Müşteri Arama ve Hızlı Kayıt
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false); 
  const [newCustomerData, setNewCustomerData] = useState({ fullName: '', phone: '' });
  
  const [formData, setFormData] = useState({
    customerId: '', serviceId: '', staffId: '',
    date: '', startTime: '', endTime: '', notes: ''
  });

  // ========== YARDIMCI MANTIKLAR ==========
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkIsPast = (dateStr, timeStr) => {
    const now = new Date();
    const aptDateTime = new Date(`${dateStr.split('T')[0]}T${timeStr || '23:59'}`);
    return aptDateTime < now;
  };

  const getStatusText = (status) => {
    const map = {
      'pending': 'BEKLİYOR',
      'confirmed': 'ONAYLI',
      'completed': 'TAMAMLANDI',
      'cancelled': 'İPTAL',
      'no-show': 'GELMEDİ'
    };
    return map[status] || status.toUpperCase();
  };

  // ========== VERİ ÇEKME ==========
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, customersRes, servicesRes, staffRes] = await Promise.all([
        appointmentService.getAll().catch(() => ({ data: { success: false, data: [] } })),
        customerService.getAll({ limit: 500 }).catch(() => ({ data: { success: false, data: [] } })),
        serviceService.getAll().catch(() => ({ data: { success: false, data: [] } })),
        staffService.getAll().catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (appointmentsRes.data?.success) setAppointments(appointmentsRes.data.data);
      if (customersRes.data?.success) setCustomers(customersRes.data.data);
      if (servicesRes.data?.success) setServices(servicesRes.data.data);
      if (staffRes.data?.success) setStaff(staffRes.data.data);
      
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return [];
    return customers.filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    ).slice(0, 5); 
  }, [customers, searchTerm]);

  // ========== RANDEVU İŞLEMLERİ ==========
  useEffect(() => {
    if (formData.startTime && formData.serviceId) {
      const selectedService = services.find(s => s._id === formData.serviceId);
      if (selectedService && selectedService.duration) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const dateObj = new Date();
        dateObj.setHours(hours, minutes + selectedService.duration);
        
        const endH = String(dateObj.getHours()).padStart(2, '0');
        const endM = String(dateObj.getMinutes()).padStart(2, '0');
        
        setFormData(prev => ({ ...prev, endTime: `${endH}:${endM}` }));
      }
    }
  }, [formData.startTime, formData.serviceId, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalCustomerId = formData.customerId;
      if (isNewCustomer && !selectedAppointment) {
        if (!newCustomerData.fullName) return alert('Lütfen müşteri adını girin.');
        const cusRes = await customerService.create(newCustomerData);
        if (cusRes.data.success) {
          finalCustomerId = cusRes.data.data._id;
        } else {
          return alert('Müşteri oluşturulamadı.');
        }
      }

      const finalData = { 
        customerId: finalCustomerId, serviceId: formData.serviceId,
        date: formData.date, startTime: formData.startTime,
        endTime: formData.endTime, notes: formData.notes
      };

      if (formData.staffId && formData.staffId.trim() !== '') {
        finalData.staffId = formData.staffId;
      }

      if (selectedAppointment) {
        await appointmentService.update(selectedAppointment._id, finalData);
      } else {
        await appointmentService.create(finalData);
      }
      
      await fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Randevuyu silmek istediğinize emin misiniz?')) {
      try {
        await appointmentService.delete(id);
        await fetchData();
      } catch (error) { alert('Silme hatası.'); }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      await fetchData();
    } catch (error) { alert('Durum güncelleme hatası.'); }
  };

  const resetForm = () => {
    setFormData({
      customerId: '', serviceId: '', staffId: '',
      date: formatDateToString(new Date()), startTime: '', endTime: '', notes: ''
    });
    setSearchTerm('');
    setIsNewCustomer(false);
    setSelectedAppointment(null);
  };

  const openModal = (appointment = null, presetDate = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        customerId: appointment.customerId?._id || '',
        serviceId: appointment.serviceId?._id || '',
        staffId: appointment.staffId?._id || '',
        date: appointment.date.split('T')[0],
        startTime: appointment.startTime || '',
        endTime: appointment.endTime || '',
        notes: appointment.notes || ''
      });
      setSearchTerm(appointment.customerId?.fullName || '');
      setIsNewCustomer(false);
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, date: formatDateToString(presetDate || selectedDate) }));
    }
    setShowModal(true);
  };

  // ========== NAVİGASYON ==========
  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
    }
  };

  const handleToday = () => {
    const t = new Date();
    setCurrentDate(t);
    setSelectedDate(t);
  };

  // ========== TAKVİM IZGARA MANTIKLARI (AYLIK GÖRÜNÜM) ==========
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < firstDayIndex; i++) days.push({ isEmpty: true });
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dStr = formatDateToString(d);
      days.push({ day: i, date: d, dateStr: dStr, isEmpty: false, isToday: formatDateToString(new Date()) === dStr });
    }
    return days;
  };

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const selectedDayAppointments = appointments.filter(app => 
    formatDateToString(new Date(app.date)) === formatDateToString(selectedDate)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="calendar-page">
      <div className="calendar-header-section">
        <div className="header-left-group">
          <h1 className="page-title">Takvim Yönetimi</h1>
          
          <div className="view-toggle-modern">
            <button className={`toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Aylık</button>
            <button className={`toggle-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Günlük</button>
          </div>
        </div>

        <button className="primary-btn" onClick={() => openModal()}>
          <FiPlus /> Yeni Randevu
        </button>
      </div>

      <div className="calendar-global-nav">
        <button onClick={handlePrev} className="calendar-nav-btn"><FiChevronLeft /></button>
        <h2>
          {view === 'month' 
            ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `${selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
          }
        </h2>
        <button onClick={handleNext} className="calendar-nav-btn"><FiChevronRight /></button>
        <button onClick={handleToday} className="calendar-nav-btn today-btn">Bugün'e Git</button>
      </div>

      {view === 'month' ? (
        // ==========================================
        // AYLIK GÖRÜNÜM (ORİJİNAL İLK GÖNDERİLEN)
        // ==========================================
        <div className="calendar-grid-container">
          <div className="calendar-main">
            <div className="calendar-weekdays">
              {weekDays.map(d => <div key={d} className="weekday">{d}</div>)}
            </div>
            
            <div className="calendar-days-grid">
              {getDaysInMonth(currentDate).map((item, idx) => {
                const dayApts = !item.isEmpty ? appointments.filter(a => formatDateToString(new Date(a.date)) === item.dateStr) : [];
                const isSelected = !item.isEmpty && formatDateToString(selectedDate) === item.dateStr;
                return (
                  <div 
                    key={idx} 
                    onClick={() => !item.isEmpty && setSelectedDate(item.date)} 
                    onDoubleClick={() => { if(!item.isEmpty) openModal(null, item.date); }}
                    className={`calendar-day ${item.isEmpty?'empty':''} ${item.isToday?'today':''} ${isSelected?'selected':''}`}
                  >
                    {!item.isEmpty && (
                      <>
                        <span className="day-number">{item.day}</span>
                        <div className="appointment-dots">
                          {dayApts.slice(0, 4).map((a, i) => {
                            const isPast = checkIsPast(a.date, a.startTime);
                            const isOverdue = isPast && (a.status === 'pending' || a.status === 'confirmed');
                            // They want all past days to be gray? Let's just make sure "Aşım" items are gray. 
                            // Or we strictly use isPast for all. The user requested: "kullanıcı gelmiş olabilir gelmemiş olabilir fakat orda o renk gri tonlarında dursun"
                            const dotStatus = isPast ? 'cancelled' : a.status;
                            return (
                              <span key={i} className={`status-dot ${dotStatus}`} title={`${a.startTime} - ${a.customerId?.fullName}`}></span>
                            );
                          })}
                          {dayApts.length > 4 && <span className="more-dots">+{dayApts.length - 4}</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="calendar-legend">
              <div className="legend-item"><span className="legend-dot pending"></span> Bekliyor</div>
              <div className="legend-item"><span className="legend-dot confirmed"></span> Onaylı</div>
              <div className="legend-item"><span className="legend-dot completed"></span> Tamamlandı</div>
              <div className="legend-item"><span className="legend-dot cancelled"></span> İptal/Aşım</div>
            </div>
          </div>

          <div className="calendar-sidebar">
            <div className="sidebar-header">
              <div>
                <h3>{selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</h3>
                <span className="appointment-count-badge">{selectedDayAppointments.length} Randevu</span>
              </div>
            </div>

            <div className="daily-appointments">
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments.map((app) => {
                  const isPast = checkIsPast(app.date, app.startTime);
                  const isAutoCancelled = isPast && (app.status === 'pending' || app.status === 'confirmed');
                  return (
                    <div key={app._id} className={`appointment-card-modern ${isAutoCancelled ? 'expired' : ''}`}>
                      <div className="card-top">
                        <div className="card-time"><FiClock className="time-icon"/> {app.startTime}</div>
                        <div className={`status-badge-modern ${isAutoCancelled ? 'cancelled' : app.status}`}>
                          {isAutoCancelled ? 'ZAMAN AŞIMI' : getStatusText(app.status)}
                        </div>
                      </div>
                      <div className="card-middle">
                        <div className="card-avatar-modern">{app.customerId?.fullName?.charAt(0) || '?'}</div>
                        <div className="card-info-modern">
                          <span className="card-name-modern">{app.customerId?.fullName}</span>
                          <span className="card-service-modern">{app.serviceId?.name}</span>
                        </div>
                      </div>
                      <div className="card-bottom">
                        <div className="card-staff-modern"><FiUser /> {app.staffId?.name || 'Yok'}</div>
                        <div className="card-actions">
                          {!isAutoCancelled && (
                            <>
                              <button className="icon-btn edit" onClick={() => openModal(app)}><FiEdit2 /></button>
                              {app.status === 'pending' && (
                                <button className="icon-btn confirm" onClick={() => handleStatusUpdate(app._id, 'confirmed')}><FiCheck /></button>
                              )}
                            </>
                          )}
                          <button className="icon-btn delete" onClick={() => handleDelete(app._id)}><FiTrash2 /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state-modern">
                  <FiCalendar className="empty-icon-modern"/>
                  <p>Bu güne ait randevu bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // GÜNLÜK GÖRÜNÜM (BÜYÜK ALAN)
        // ==========================================
        <div className="daily-view-large">
          {selectedDayAppointments.length > 0 ? (
            <div className="large-cards-grid">
              {selectedDayAppointments.map((app) => {
                const isPast = checkIsPast(app.date, app.startTime);
                const isAutoCancelled = isPast && (app.status === 'pending' || app.status === 'confirmed');
                return (
                  <div key={app._id} className={`appointment-card-large ${isAutoCancelled ? 'expired' : ''}`}>
                    <div className="card-large-header">
                      <div className="card-time-large"><FiClock className="time-icon-large"/> {app.startTime} - {app.endTime}</div>
                      <div className={`status-badge-modern ${isAutoCancelled ? 'cancelled' : app.status}`}>
                        {isAutoCancelled ? 'ZAMAN AŞIMI' : getStatusText(app.status)}
                      </div>
                    </div>
                    
                    <div className="card-large-body">
                       <div className="card-avatar-large">{app.customerId?.fullName?.charAt(0) || '?'}</div>
                       <div className="card-info-large">
                          <h2>{app.customerId?.fullName || 'İsimsiz Müşteri'}</h2>
                          <p>{app.customerId?.phone}</p>
                          <span className="card-service-large">{app.serviceId?.name || 'Hizmet Yok'} ({app.price}₺)</span>
                       </div>
                    </div>

                    {app.notes && (
                      <div className="card-large-notes">
                        <strong>Not:</strong> {app.notes}
                      </div>
                    )}

                    <div className="card-large-footer">
                      <div className="card-staff-large"><FiUser /> {app.staffId?.name || 'Personel Seçilmedi'}</div>
                      <div className="card-actions-large">
                        {!isAutoCancelled && (
                          <>
                            <button className="btn-edit-large" onClick={() => openModal(app)}><FiEdit2 /> Düzenle</button>
                            {app.status === 'pending' && (
                              <button className="btn-confirm-large" onClick={() => handleStatusUpdate(app._id, 'confirmed')}><FiCheck /> Onayla</button>
                            )}
                          </>
                        )}
                        <button className="btn-delete-large" onClick={() => handleDelete(app._id)}><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-large">
               <FiCalendar className="empty-icon-large"/>
               <h2>Sakin Bir Gün!</h2>
               <p>{selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihi için henüz onaylanmış veya bekleyen bir randevunuz bulunmuyor.</p>
               <button className="primary-btn mt-4" onClick={() => openModal()}><FiPlus/> İlk Randevuyu Oluştur</button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAppointment ? 'Düzenle' : 'Yeni Randevu'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            {/* Same form as before */}
            <form onSubmit={handleSubmit} className="modal-form">
              {!selectedAppointment && (
                <div className="customer-selection-tabs">
                  <button type="button" className={`tab-btn ${!isNewCustomer ? 'active' : ''}`} onClick={() => setIsNewCustomer(false)}>Mevcut Müşteri</button>
                  <button type="button" className={`tab-btn ${isNewCustomer ? 'active' : ''}`} onClick={() => setIsNewCustomer(true)}>Hızlı Kayıt</button>
                </div>
              )}
              <div className="form-group">
                {!isNewCustomer ? (
                  <>
                    <label>Müşteri Ara *</label>
                    <div style={{ position: 'relative' }}>
                      <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input 
                          type="text" placeholder="İsim veya telefon yazın..." 
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      {filteredCustomers.length > 0 && !formData.customerId && (
                        <div className="search-results">
                          {filteredCustomers.map(c => (
                            <div key={c._id} className="search-item" onClick={() => { setFormData({...formData, customerId: c._id}); setSearchTerm(c.fullName); }}>
                              {c.fullName} <small>({c.phone})</small>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.customerId && (
                        <button type="button" className="change-btn" onClick={() => { setFormData({...formData, customerId: ''}); setSearchTerm(''); }}>Değiştir</button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Ad Soyad *</label>
                      <input type="text" required placeholder="Müşteri Adı" value={newCustomerData.fullName} onChange={(e) => setNewCustomerData({...newCustomerData, fullName: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Telefon</label>
                      <input type="text" placeholder="05XX XXX" value={newCustomerData.phone} onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Hizmet *</label>
                <select required value={formData.serviceId} onChange={(e) => setFormData({...formData, serviceId: e.target.value})}>
                  <option value="">Hizmet Seçin</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} ({s.price}₺)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Personel</label>
                <select value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})}>
                  <option value="">Personel Seçin</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Tarih *</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Başlangıç *</label>
                  <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Bitiş *</label>
                  <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="primary-btn" disabled={!isNewCustomer && !formData.customerId}>
                  {selectedAppointment ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;