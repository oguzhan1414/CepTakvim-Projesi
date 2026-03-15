import React, { useState, useEffect } from 'react';
import {
  FiUser, FiBriefcase, FiClock, FiBell, FiShield,
  FiCreditCard, FiUsers, FiSave, FiUpload, FiSmartphone,
  FiGlobe, FiMail, FiPhone, FiMapPin, FiRefreshCw,
  FiAlertCircle, FiCheck, FiEdit2, FiTrash2, FiPlus,
  FiDollarSign, FiClock as FiDuration, FiZap, FiLock,
  FiMessageSquare, FiStar, FiCoffee
} from 'react-icons/fi';
import { businessService, staffService, serviceService, paymentService } from '../../services/api';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState({
    businessName: '', email: '', phone: '', address: '',
    businessType: '', taxNumber: '', website: '', description: '', slug: '',
    subscription: { planType: 'free' }
  });
  
  const [initialSlug, setInitialSlug] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [workingHours, setWorkingHours] = useState({
    monday:    { active: true,  start: '09:00', end: '18:00' },
    tuesday:   { active: true,  start: '09:00', end: '18:00' },
    wednesday: { active: true,  start: '09:00', end: '18:00' },
    thursday:  { active: true,  start: '09:00', end: '18:00' },
    friday:    { active: true,  start: '09:00', end: '18:00' },
    saturday:  { active: false, start: '10:00', end: '16:00' },
    sunday:    { active: false, start: '10:00', end: '16:00' }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications:   true,
    smsNotifications:     true,
    whatsappNotifications: false,
    appointmentReminders: true,
    newCustomerAlerts:    true,
    dailySummary:         false
  });

  const [services, setServices] = useState([]);
  const [staff,    setStaff]    = useState([]);

  const [newService, setNewService] = useState({
    name: '', duration: 30, price: 0, description: '', color: '#4f46e5'
  });
  const [newStaff, setNewStaff] = useState({
    name: '', title: '', email: '', phone: '', specialties: []
  });

  const daysInTurkish = {
    monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
    thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar'
  };
  const colorOptions = ['#4f46e5','#10b981','#f59e0b','#ec4899','#ef4444','#8b5cf6','#06b6d4'];

  // ── Veri Çekme ──
  useEffect(() => { fetchSettingsData(); }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true); setError(null);
      const [profileRes, servicesRes, staffRes] = await Promise.all([
        businessService.getProfile().catch(() => ({ data: { success: false } })),
        serviceService.getAll().catch(() => ({ data: { success: false } })),
        staffService.getAll().catch(() => ({ data: { success: false } }))
      ]);
      if (profileRes.data?.success) {
        const d = profileRes.data.data;
        setProfileData({
          businessName: d.businessName || '', email: d.email || '',
          phone: d.phone || '', address: d.address || '',
          businessType: d.businessType || '', taxNumber: d.taxNumber || '',
          website: d.website || '', description: d.description || '', slug: d.slug || '',
          subscription: d.subscription || { planType: 'free' }
        });
        setInitialSlug(d.slug || '');
        if (d.workingHours) setWorkingHours(d.workingHours);
        if (d.settings) setNotificationSettings({
          emailNotifications:   d.settings.emailNotifications   ?? true,
          smsNotifications:     d.settings.smsNotifications     ?? true,
          whatsappNotifications: d.settings.whatsappNotifications ?? false,
          appointmentReminders: d.settings.appointmentReminders  ?? true,
          newCustomerAlerts:    d.settings.newCustomerAlerts     ?? true,
          dailySummary:         d.settings.dailySummary          ?? false
        });
      }
      if (servicesRes.data?.success) setServices(servicesRes.data.data || []);
      if (staffRes.data?.success)    setStaff(staffRes.data.data || []);
    } catch { setError('Veriler yüklenirken bir hata oluştu.'); }
    finally { setLoading(false); }
  };

  // ── Iyzico Ödeme ──
  const handleUpgrade = async (planType) => {
    try {
      setPaymentLoading(true);
      const res = await paymentService.initialize({ planType });
      if (res.data.success) window.location.href = res.data.paymentPageUrl;
    } catch (err) { alert(err.response?.data?.message || 'Ödeme sistemi başlatılamadı.'); }
    finally { setPaymentLoading(false); }
  };

  // ── Hizmet İşlemleri ──
  const handleAddService = async () => {
    if (!newService.name || !newService.duration || !newService.price) {
      return alert('Lütfen tüm alanları doldurun');
    }
    try {
      const r = await serviceService.create(newService);
      if (r.data.success) {
        setServices([...services, r.data.data]);
        setNewService({ name: '', duration: 30, price: 0, description: '', color: '#4f46e5' });
      }
    } catch { alert('Hizmet eklenirken bir hata oluştu.'); }
  };
  const handleDeleteService = async (id) => {
    if (!window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try { await serviceService.delete(id); setServices(services.filter(s => s._id !== id)); }
    catch { alert('Hizmet silinirken bir hata oluştu.'); }
  };

  // ── Personel İşlemleri ──
  const handleAddStaff = async () => {
    if (!newStaff.name) return alert('Personel adı zorunludur');
    try {
      const r = await staffService.create(newStaff);
      if (r.data.success) {
        setStaff([...staff, r.data.data]);
        setNewStaff({ name: '', title: '', email: '', phone: '', specialties: [] });
      }
    } catch { alert('Personel eklenirken bir hata oluştu.'); }
  };
  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
    try { await staffService.delete(id); setStaff(staff.filter(s => s._id !== id)); }
    catch { alert('Personel silinirken bir hata oluştu.'); }
  };

  // ── Input Handlers ──
  const handleProfileChange    = (e) => setProfileData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleHourChange       = (day, field, val) => setWorkingHours(p => ({ ...p, [day]: { ...p[day], [field]: val } }));
  const toggleDayActive        = (day) => setWorkingHours(p => ({ ...p, [day]: { ...p[day], active: !p[day].active } }));
  const handleNotificationChange = (k) => setNotificationSettings(p => ({ ...p, [k]: !p[k] }));

  // ── Şifre Değiştirme ──
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return alert('Yeni şifreler eşleşmiyor!');
    try {
      await businessService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Şifreniz başarıyla değiştirildi.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Şifre değiştirilirken hata oluştu.'); }
  };

  // ── Kaydet ──
  const handleSaveAll = async () => {
    // Slug değiştiyse kullanıcıya uyarı göster
    const formattedNewSlug = profileData.slug.toLowerCase().replace(/\s+/g, '-');
    if (initialSlug && initialSlug !== formattedNewSlug) {
      const confirmChange = window.confirm(
        "Dikkat: İşletme Profil Linkinizi değiştiriyorsunuz.\n\n" +
        "Eski linkiniz (\"/isletme/" + initialSlug + "\") artık çalışmayacaktır. " +
        "Sosyal medya hesaplarınızdaki veya müşterilerinizdeki eski linkler geçersiz olacaktır.\n\n" +
        "Yine de devam etmek istiyor musunuz?"
      );
      if (!confirmChange) return; // Kullanıcı iptal etti
    }

    try {
      setSaving(true); setSuccessMessage(''); setError(null);
      await businessService.updateProfile({
        businessName: profileData.businessName,
        slug: formattedNewSlug,
        phone: profileData.phone,
        address: profileData.address,
        website: profileData.website,
        description: profileData.description,
        workingHours,
        settings: notificationSettings
      });
      
      // Update the local URL preview directly
      setProfileData(prev => ({...prev, slug: formattedNewSlug}));
      setInitialSlug(formattedNewSlug);
      
      setSuccessMessage('Değişiklikler başarıyla kaydedildi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch { setError('Değişiklikler kaydedilirken bir hata oluştu.'); }
    finally { setSaving(false); }
  };

  // ── Helpers ──
  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Ayarlar yükleniyor...</p>
    </div>
  );

  // ─────────────────────── TABS CONFIG ───────────────────────
  const tabs = [
    { id: 'profile',       icon: <FiUser />,       label: 'İşletme Profili' },
    { id: 'services',      icon: <FiBriefcase />,  label: 'Hizmetler' },
    { id: 'staff',         icon: <FiUsers />,       label: 'Personel' },
    { id: 'hours',         icon: <FiClock />,       label: 'Çalışma Saatleri' },
    { id: 'notifications', icon: <FiBell />,        label: 'Bildirimler' },
    { id: 'billing',       icon: <FiCreditCard />,  label: 'Fatura & Ödeme' },
    { id: 'security',      icon: <FiShield />,      label: 'Güvenlik' },
  ];

  return (
    <div className="settings-page">

      {/* ── Header ── */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Ayarlar</h1>
          <p className="page-subtitle">İşletme bilgileri ve tercihlerinizi buradan yönetin</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchSettingsData} disabled={loading}>
            <FiRefreshCw className={loading ? 'spin' : ''} /> Yenile
          </button>
          <button className="save-btn" onClick={handleSaveAll} disabled={saving}>
            {saving ? 'Kaydediliyor…' : <><FiSave /> Değişiklikleri Kaydet</>}
          </button>
        </div>
      </div>

      {successMessage && <div className="success-message"><FiCheck /> {successMessage}</div>}
      {error          && <div className="error-message"><FiAlertCircle /> {error}</div>}

      <div className="settings-grid">
        {/* ── Sol Menü ── */}
        <nav className="settings-menu">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`menu-item ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* ── İçerik ── */}
        <div className="settings-content">

          {/* ═══════════════════════════════════ PROFİL ═══════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="settings-tab">
              {/* Avatar */}
              <div className="profile-header">
                <div className="profile-avatar">{profileData.businessName?.charAt(0) || '?'}</div>
                <div className="profile-upload">
                  <button className="upload-btn"><FiUpload /> Logo Yükle</button>
                  <p className="upload-hint">PNG, JPG (Maks. 2MB)</p>
                </div>
              </div>

              {/* Profil Linki */}
              <div className="public-url-card">
                 <div className="url-info">
                   <div className="url-icon-wrapper">
                     <FiGlobe className="url-icon" />
                   </div>
                   <div className="url-text">
                     <h4>İşletme Profiliniz</h4>
                     <p>Müşterileriniz bu linkten randevu alabilir</p>
                   </div>
                 </div>
                 <div className="url-link-box">
                    <a href={`http://localhost:5173/isletme/${profileData.slug || 'isletmem'}`} target="_blank" rel="noreferrer" className="public-url-link">
                      http://localhost:5173/isletme/<span className="url-highlight">{profileData.slug || 'isletmem'}</span>
                    </a>
                 </div>
              </div>

              {/* Temel Bilgiler */}
              <div className="st-section">
                <div className="st-section-title">Temel Bilgiler</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>İşletme Adı</label>
                    <input type="text" name="businessName" value={profileData.businessName}
                      onChange={handleProfileChange} placeholder="Örn: Vibe Salon" />
                  </div>
                  <div className="form-group">
                    <label>İşletme Profil Linki</label>
                    <input type="text" name="slug" value={profileData.slug}
                      onChange={handleProfileChange} placeholder="Örn: vibesalon" />
                  </div>
                  <div className="form-group">
                    <label><FiLock size={13} style={{marginRight:4}} />E-posta <span className="locked-label">Değiştirilemez</span></label>
                    <div className="input-wrapper">
                      <FiMail className="input-icon" />
                      <input type="email" value={profileData.email} disabled />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Telefon</label>
                    <div className="input-wrapper">
                      <FiPhone className="input-icon" />
                      <input type="tel" name="phone" value={profileData.phone}
                        onChange={handleProfileChange} placeholder="0555 123 45 67" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label><FiLock size={13} style={{marginRight:4}} />Vergi No <span className="locked-label">Değiştirilemez</span></label>
                    <input type="text" value={profileData.taxNumber} disabled />
                  </div>
                </div>
              </div>

              {/* İletişim & Konum */}
              <div className="st-section">
                <div className="st-section-title">İletişim & Konum</div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Adres</label>
                    <div className="input-wrapper">
                      <FiMapPin className="input-icon" />
                      <input type="text" name="address" value={profileData.address}
                        onChange={handleProfileChange} placeholder="Levent, İstanbul" />
                    </div>
                  </div>
                  
              
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ HİZMETLER ═══════════════════════════════════ */}
          {activeTab === 'services' && (
            <div className="settings-tab">
              <div className="tab-header">
                <h2>Hizmetler</h2>
                <span className="item-count">{services.length} hizmet</span>
              </div>

              <div className="st-info-banner">
                <FiAlertCircle className="st-info-icon" />
                <div className="st-info-content">
                  <h4>Önemli Bilgi</h4>
                  <p>Buradaki hizmet süreleri ve fiyatları <strong>tahmini verilerdir</strong> ve randevu alırken müşteriye fikir vermek amaçlıdır.</p>
                </div>
              </div>

              {services.length === 0 ? (
                <div className="st-empty-state">
                  <FiBriefcase size={32} />
                  <p>Henüz hizmet eklenmemiş</p>
                  <small>Aşağıdan ilk hizmetinizi ekleyin</small>
                </div>
              ) : (
                <div className="services-grid">
                  {services.map(s => (
                    <div key={s._id} className="service-card">
                      <div className="service-color" style={{ background: s.color || '#4f46e5' }} />
                      <div className="service-card-content">
                        <div className="service-card-header">
                          <h3 className="service-card-title">{s.name}</h3>
                          <div className="service-card-actions">
                            <button className="icon-btn delete" onClick={() => handleDeleteService(s._id)} title="Sil">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className="service-details-grid">
                          <div className="service-detail-item"><FiDuration className="detail-icon" /><span>{s.duration} dk</span></div>
                          <div className="service-detail-item"><FiDollarSign className="detail-icon" /><span>{s.price} ₺</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-new-card">
                <div className="add-new-header">
                  <div className="add-new-icon-wrapper">
                    <FiBriefcase className="add-new-icon" />
                  </div>
                  <div>
                    <h3>Yeni Hizmet Ekle</h3>
                    <p>Müşterilerinizin alabileceği yeni bir hizmet tanımlayın.</p>
                  </div>
                </div>
                <div className="add-new-form">
                  <div className="form-group">
                    <label>Hizmet Adı</label>
                    <input type="text" placeholder="Örn: Saç Kesimi" value={newService.name}
                      onChange={e => setNewService({...newService, name: e.target.value})} />
                  </div>
                  <div className="add-new-row">
                    <div className="form-group">
                      <label>Süre (dk)</label>
                      <input type="number" placeholder="Örn: 45" value={newService.duration}
                        onChange={e => setNewService({...newService, duration: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Fiyat (₺)</label>
                      <div className="price-input-wrapper">
                        <FiDollarSign className="price-input-icon" style={{left: 10}} />
                        <input type="number" step="100" placeholder="Örn: 500" value={newService.price}
                          onChange={e => setNewService({...newService, price: e.target.value})} />
                        <span className="price-addon">₺</span>
                      </div>
                    </div>
                  </div>
                  <button className="add-btn-primary" onClick={handleAddService}>
                    <FiPlus /> Hizmet Oluştur
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════ PERSONEL ═══════════════════════════════════ */}
          {activeTab === 'staff' && (
            <div className="settings-tab">
              <div className="tab-header">
                <h2>Personel</h2>
                <span className="item-count">{staff.length} personel</span>
              </div>

              {staff.length === 0 ? (
                <div className="st-empty-state">
                  <FiUsers size={32} />
                  <p>Henüz personel eklenmemiş</p>
                  <small>Aşağıdan ilk çalışanınızı ekleyin</small>
                </div>
              ) : (
                <div className="staff-grid">
                  {staff.map(m => (
                    <div key={m._id} className="staff-card">
                      <div className="staff-avatar-large">{initials(m.name)}</div>
                      <div className="staff-card-content">
                        <div className="staff-card-header">
                          <div>
                            <h3 className="staff-card-name">{m.name}</h3>
                            <p className="staff-card-title">{m.title || 'Personel'}</p>
                          </div>
                          <div className="staff-card-actions">
                            <button className="icon-btn delete" onClick={() => handleDeleteStaff(m._id)} title="Sil">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className="staff-contact-info">
                          {m.phone && <div className="contact-item"><FiPhone size={12} /> {m.phone}</div>}
                          {m.email && <div className="contact-item"><FiMail size={12} /> {m.email}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-new-card">
                <div className="add-new-header">
                  <div className="add-new-icon-wrapper staff-icon">
                    <FiUsers className="add-new-icon" />
                  </div>
                  <div>
                    <h3>Yeni Personel Ekle</h3>
                    <p>Ekibinize yeni bir uzman dahil edin.</p>
                  </div>
                </div>
                <div className="add-new-form">
                  <div className="add-new-row">
                    <div className="form-group">
                      <label>Ad Soyad</label>
                      <input type="text" placeholder="Örn: Ahmet Yılmaz" value={newStaff.name}
                        onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Ünvan</label>
                      <input type="text" placeholder="Örn: Kıdemli Kuaför" value={newStaff.title}
                        onChange={e => setNewStaff({...newStaff, title: e.target.value})} />
                    </div>
                  </div>
                  <div className="add-new-row">
                    <div className="form-group">
                      <label>Telefon</label>
                      <input type="tel" placeholder="0555 123 45 67" value={newStaff.phone}
                        onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>E-posta</label>
                      <input type="email" placeholder="ahmet@example.com" value={newStaff.email}
                        onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                    </div>
                  </div>
                  <button className="add-btn-primary" onClick={handleAddStaff}>
                    <FiPlus /> Personel Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════ ÇALIŞMA SAATLERİ ══════════════════════════════ */}
          {activeTab === 'hours' && (
            <div className="settings-tab">
              <h2>Çalışma Saatleri</h2>
              <p className="st-hint">Müşteriler randevu alırken yalnızca aktif günlerdeki saatleri görecek.</p>
              <div className="working-hours-grid">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className={`hour-row ${hours.active ? 'hour-row--open' : 'hour-row--closed'}`}>
                    <div className="day-info">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={hours.active} onChange={() => toggleDayActive(day)} />
                        <span className="toggle-slider" />
                      </label>
                      <span className="day-name">{daysInTurkish[day]}</span>
                    </div>
                    {hours.active ? (
                      <div className="time-inputs">
                        <input type="time" value={hours.start}
                          onChange={e => handleHourChange(day, 'start', e.target.value)} />
                        <span className="time-sep">→</span>
                        <input type="time" value={hours.end}
                          onChange={e => handleHourChange(day, 'end', e.target.value)} />
                      </div>
                    ) : (
                      <span className="closed-day">Kapalı</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════ BİLDİRİMLER ══════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="settings-tab">
              <h2>Bildirim Ayarları</h2>
              <p className="st-hint">Hangi durumlarda bildirim almak istediğinizi seçin.</p>
              <div className="notifications-list">
                {[
                  {
                    key: 'emailNotifications',
                    icon: <FiMail />,
                    title: 'E-posta Bildirimleri',
                    desc: 'Yeni randevu, iptal ve hatırlatmalar için e-posta alın.'
                  },
                  {
                    key: 'smsNotifications',
                    icon: <FiSmartphone />,
                    title: 'SMS Bildirimleri',
                    desc: 'Önemli güncellemeler için SMS bildirimi alın.'
                  },
                  {
                    key: 'whatsappNotifications',
                    icon: <FiMessageSquare />,
                    title: 'WhatsApp Bildirimleri',
                    desc: 'Müşteri randevuları için WhatsApp mesajı alın. (PRO)'
                  },
                  {
                    key: 'appointmentReminders',
                    icon: <FiClock />,
                    title: 'Randevu Hatırlatmaları',
                    desc: 'Yaklaşan randevulardan önce hatırlatma bildirimi alın.'
                  },
                  {
                    key: 'newCustomerAlerts',
                    icon: <FiUser />,
                    title: 'Yeni Müşteri Uyarısı',
                    desc: 'Sisteme yeni bir müşteri eklendiğinde bildirim alın.'
                  },
                  {
                    key: 'dailySummary',
                    icon: <FiStar />,
                    title: 'Günlük Özet',
                    desc: 'Her gün sonunda günlük istatistik özetini e-posta ile alın.'
                  },
                ].map(({ key, icon, title, desc }) => (
                  <div key={key} className="notification-item">
                    <div className="notif-icon">{icon}</div>
                    <div className="notification-info">
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox"
                        checked={notificationSettings[key]}
                        onChange={() => handleNotificationChange(key)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════ GÜVENLİK ═══════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div className="settings-tab">
              <h2>Güvenlik</h2>

              <div className="security-grid">
                {/* Şifre Değiştir */}
                <div className="add-section">
                  <h3><FiShield /> Şifre Değiştir</h3>
                  <form onSubmit={handlePasswordChange} className="add-form">
                    <div className="form-group">
                      <label>Mevcut Şifre</label>
                      <input type="password" placeholder="••••••••" required
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Yeni Şifre</label>
                        <input type="password" placeholder="Min 8 karakter" required
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Yeni Şifre (Tekrar)</label>
                        <input type="password" placeholder="Şifreyi tekrar girin" required
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                      </div>
                    </div>
                    {passwordData.newPassword && passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword && (
                      <div className="st-pw-mismatch">⚠ Şifreler eşleşmiyor</div>
                    )}
                    <button type="submit" className="add-btn st-danger-btn">
                      <FiShield /> Şifreyi Güncelle
                    </button>
                  </form>
                </div>

                {/* Güvenlik Bilgisi */}
                <div className="security-info-card">
                  <div className="security-info-icon"><FiLock size={24} /></div>
                  <h4>Hesap Güvenliği</h4>
                  <ul className="security-tips">
                    <li><FiCheck size={13} /> En az 8 karakter kullanın</li>
                    <li><FiCheck size={13} /> Büyük/küçük harf karışımı tercih edin</li>
                    <li><FiCheck size={13} /> Özel karakter ekleyin (! @ # $)</li>
                    <li><FiCheck size={13} /> Şifrenizi kimseyle paylaşmayın</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════ FATURA & ÖDEME ══════════════════════════════════ */}
          {activeTab === 'billing' && (() => {
            const currentPlan = profileData.subscription?.planType || 'free';
            const plans = [
              {
                id: 'free', name: 'Başlangıç', price: '₺0', period: '/ay',
                badge: null, color: '#6b7280',
                features: ['50 randevu/ay','1 personel','5 hizmet tanımı','Temel takvim','E-posta bildirimleri'],
                cta: 'Mevcut Paket', planKey: 'free'
              },
              {
                id: 'pro', name: 'Profesyonel', price: '₺599', period: '/ay',
                badge: 'En Popüler', color: '#4f46e5',
                features: ['Sınırsız randevu','Sınırsız personel','Sınırsız hizmet','Müşteri CRM paneli','WhatsApp bildirimleri','Iyzico ön ödeme sistemi','Detaylı raporlar & analiz'],
                cta: 'Hemen Yükselt', planKey: 'pro'
              },
              {
                id: 'enterprise', name: 'Kurumsal', price: '₺1.499', period: '/ay',
                badge: 'Yeni', color: '#8b5cf6',
                features: ['Pro paketteki her şey','Çoklu şube yönetimi','Özel SMS paketi','Öncelikli destek (7/24)','Özel entegrasyon','API erişimi','Beyaz etiket çözümü'],
                cta: 'İletişime Geç', planKey: 'enterprise'
              },
            ];

            return (
              <div className="settings-tab">
                <div className="billing-header">
                  <h2>Fatura &amp; Ödeme</h2>
                  <p className="billing-sub">İşletmenize en uygun paketi seçin</p>
                </div>

                <div className={`current-plan-banner current-plan-banner--${currentPlan}`}>
                  <FiZap size={20} />
                  <span>Şu an <strong>{plans.find(p => p.id === currentPlan)?.name || 'Başlangıç'}</strong> planındasınız</span>
                  {currentPlan === 'free' && (
                    <span className="upgrade-nudge">↑ Yükselt ve tüm özelliklerin kilidini aç</span>
                  )}
                </div>

                <div className="pricing-grid-3">
                  {plans.map(plan => {
                    const isCurrent = currentPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`pricing-card-v2 ${isCurrent ? 'pricing-card-v2--current' : ''} ${plan.badge === 'En Popüler' ? 'pricing-card-v2--popular' : ''}`}
                        style={{ '--plan-color': plan.color }}
                      >
                        {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                        <div className="plan-header">
                          <h3 className="plan-name">{plan.name}</h3>
                          <div className="plan-price">
                            <span className="plan-amount">{plan.price}</span>
                            <span className="plan-period">{plan.period}</span>
                          </div>
                        </div>
                        <ul className="plan-features">
                          {plan.features.map((f, i) => (
                            <li key={i}><FiCheck className="feature-check" />{f}</li>
                          ))}
                        </ul>
                        <button
                          className={`plan-cta ${isCurrent ? 'plan-cta--current' : 'plan-cta--upgrade'}`}
                          onClick={() => !isCurrent && plan.planKey !== 'enterprise' && handleUpgrade(plan.planKey)}
                          disabled={isCurrent || paymentLoading}
                        >
                          {isCurrent ? '✓ Mevcut Paket' : paymentLoading ? 'Bağlanıyor…' : plan.cta}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="billing-note">
                  Tüm ödemeler Iyzico güvencesiyle işlenir. İstediğiniz zaman iptal edebilirsiniz.
                </p>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default Settings;