import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiMail, FiPhone, FiCalendar,
  FiX, FiEdit2, FiTrash2, FiStar, FiMessageSquare,
  FiSave, FiClock, FiGift, FiAlertCircle, FiUser, FiCheck
} from 'react-icons/fi';
import { customerService, serviceService, staffService, appointmentService } from '../../services/api';
import './Customers.css';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—';

const daysUntilBirthday = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const bd = new Date(birthDate);
  const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
};

const STATUS_LABEL = { VIP: '⭐ VIP', Regular: 'Düzenli', Riskli: '⚠️ Riskli' };
const APPT_STATUS = {
  pending:   { label: 'Bekliyor',   cls: 'pending'   },
  confirmed: { label: 'Onaylandı',  cls: 'confirmed' },
  completed: { label: 'Tamamlandı', cls: 'completed' },
  cancelled: { label: 'İptal',      cls: 'cancelled' },
  noshow:    { label: 'Gelmedi',    cls: 'noshow'    },
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // CRM drawer
  const [drawer, setDrawer]           = useState(null);   // { customer, appointments }
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [specialNote, setSpecialNote] = useState('');
  const [savingNote, setSavingNote]   = useState(false);

  // Randevu ekleme modalı (CRM içi)
  const [showApptModal, setShowApptModal] = useState(false);
  const [services, setServices]         = useState([]);
  const [staffList, setStaffList]       = useState([]);
  const [apptForm, setApptForm]         = useState({
    serviceId: '', staffId: '', date: '', startTime: '', endTime: '', notes: ''
  });
  const [apptLoading, setApptLoading]   = useState(false);

  // Edit / Create modal
  const [showModal, setShowModal]     = useState(false);
  const [modalMode, setModalMode]     = useState('create');
  const [formData, setFormData]       = useState({
    fullName: '', phone: '', email: '', notes: '',
    birthDate: '', status: 'Regular'
  });

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerService.getAll();
      if (res.data.success) setCustomers(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── filtered list ──────────────────────────────────────────────────────────
  const filtered = customers.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      c.fullName.toLowerCase().includes(s) ||
      c.phone.includes(searchTerm) ||
      (c.email || '').toLowerCase().includes(s);
    const matchStatus = filterStatus === 'all' || (c.status || '').toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── open CRM drawer ────────────────────────────────────────────────────────
  const openDrawer = async (customer) => {
    setDrawer({ customer, appointments: [] });
    setSpecialNote(customer.specialNote || '');
    setDrawerLoading(true);
    try {
      const res = await customerService.getDetails(customer._id);
      if (res.data.success) {
        setDrawer(res.data.data);
        setSpecialNote(res.data.data.customer.specialNote || '');
      }
    } catch (e) { console.error(e); }
    finally { setDrawerLoading(false); }
  };

  const closeDrawer = () => setDrawer(null);

  // ── save special note ──────────────────────────────────────────────────────
  const saveNote = async () => {
    if (!drawer) return;
    setSavingNote(true);
    try {
      await customerService.update(drawer.customer._id, { specialNote });
      setDrawer(prev => ({
        ...prev,
        customer: { ...prev.customer, specialNote }
      }));
      // Also refresh the list card
      setCustomers(prev =>
        prev.map(c => c._id === drawer.customer._id ? { ...c, specialNote } : c)
      );
    } catch (e) { console.error(e); }
    finally { setSavingNote(false); }
  };

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  const openWhatsApp = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const intl = cleaned.startsWith('0') ? '90' + cleaned.slice(1) : cleaned;
    window.open(`https://wa.me/${intl}`, '_blank');
  };

  // ── new appointment quick-action ───────────────────────────────────────────
  const openApptModal = async () => {
    setApptForm({ serviceId: '', staffId: '', date: '', startTime: '', endTime: '', notes: '' });
    // Hizmet ve Personel listelerini paralel çek
    try {
      const [svcRes, stfRes] = await Promise.all([
        serviceService.getAll(),
        staffService.getAll()
      ]);
      setServices(svcRes.data.data || []);
      setStaffList(stfRes.data.data || []);
    } catch (e) { console.error(e); }
    setShowApptModal(true);
  };

  // Saat hesaplama yardımcısı: başlangıç saatine göre bitiş saatini otomatik doldur
  const calcEndTime = (startTime, serviceId) => {
    const svc = services.find(s => s._id === serviceId);
    if (!svc || !startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + (svc.duration || 30);
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;
  };

  const handleApptFormChange = (field, value) => {
    setApptForm(prev => {
      const updated = { ...prev, [field]: value };
      // Servis veya başlangıç saati değişince bitiş saatini otomatik hesapla
      if (field === 'startTime' || field === 'serviceId') {
        updated.endTime = calcEndTime(
          field === 'startTime' ? value : prev.startTime,
          field === 'serviceId' ? value : prev.serviceId
        );
      }
      return updated;
    });
  };

  const submitAppt = async (e) => {
    e.preventDefault();
    if (!drawer) return;
    setApptLoading(true);
    try {
      await appointmentService.create({
        customerId: drawer.customer._id,
        serviceId:  apptForm.serviceId,
        staffId:    apptForm.staffId || undefined,
        date:       apptForm.date,
        startTime:  apptForm.startTime,
        endTime:    apptForm.endTime,
        notes:      apptForm.notes
      });
      setShowApptModal(false);
      // Drawer güncelle
      openDrawer(drawer.customer);
    } catch (err) {
      alert(err.response?.data?.message || 'Randevu oluşturulamadı.');
    } finally {
      setApptLoading(false);
    }
  };

  // ── create / edit modal ────────────────────────────────────────────────────
  const openCreateModal = () => {
    setFormData({ fullName: '', phone: '', email: '', notes: '', birthDate: '', status: 'Regular' });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setFormData({
      _id: c._id,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email || '',
      notes: c.notes || '',
      birthDate: c.birthDate ? new Date(c.birthDate).toISOString().split('T')[0] : '',
      status: c.status || 'Regular'
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') await customerService.create(formData);
      else await customerService.update(formData._id, formData);
      setShowModal(false);
      fetchCustomers();
    } catch (e) {
      alert(e.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try {
      await customerService.delete(id);
      fetchCustomers();
      if (drawer?.customer?._id === id) closeDrawer();
    } catch (e) { console.error(e); }
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="crm-loading">
      <div className="crm-spinner"></div>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="crm-root">

      {/* ─── Page Header ─────────────────────────────────────── */}
      <header className="crm-page-header">
        <div>
          <h1 className="crm-page-title">Müşteriler</h1>
          <p className="crm-page-sub">Müşteri veritabanınız ve ilişki yönetimi</p>
        </div>
        <button className="crm-btn-primary" onClick={openCreateModal}>
          <FiPlus size={16} /> Yeni Müşteri
        </button>
      </header>

      {/* ─── Filters ─────────────────────────────────────────── */}
      <div className="crm-filters">
        <div className="crm-search-wrap">
          <FiSearch className="crm-search-icon" />
          <input
            className="crm-search-input"
            placeholder="İsim, telefon veya e-posta ara…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="crm-tabs">
          {[['all','Tümü'], ['vip','VIP'], ['regular','Düzenli'], ['riskli','Riskli']].map(([val, lbl]) => (
            <button
              key={val}
              className={`crm-tab ${filterStatus === val ? 'active' : ''}`}
              onClick={() => setFilterStatus(val)}
            >
              {lbl}
              {val === 'all' && <span className="crm-count">{customers.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="crm-table-wrap">
        <div className="crm-table-head">
          <span>Müşteri</span>
          <span>İletişim</span>
          <span>Durum</span>
          <span>Harcama</span>
          <span>Kayıt</span>
          <span></span>
        </div>

        <div className="crm-table-body">
          {filtered.length === 0 ? (
            <div className="crm-empty">
              <FiUser size={32} />
              <p>Müşteri bulunamadı</p>
              <button className="crm-btn-primary" onClick={openCreateModal}>
                <FiPlus size={14} /> Müşteri Ekle
              </button>
            </div>
          ) : filtered.map(c => {
            const days = daysUntilBirthday(c.birthDate);
            return (
              <div
                key={c._id}
                className={`crm-row ${drawer?.customer?._id === c._id ? 'crm-row--active' : ''}`}
                onClick={() => openDrawer(c)}
              >
                <div className="crm-cell crm-cell--customer">
                  <div className={`crm-avatar crm-avatar--${(c.status || 'regular').toLowerCase()}`}>
                    {initials(c.fullName)}
                  </div>
                  <div>
                    <div className="crm-name">{c.fullName}</div>
                    <div className="crm-id">#{c._id.slice(-6)}</div>
                  </div>
                  {days !== null && days <= 7 && (
                    <span className="crm-birthday-badge" title={`Doğum gününe ${days} gün kaldı`}>🎂</span>
                  )}
                </div>

                <div className="crm-cell crm-cell--contact">
                  <span><FiPhone size={12}/> {c.phone}</span>
                  {c.email && <span><FiMail size={12}/> {c.email}</span>}
                </div>

                <div className="crm-cell">
                  <span className={`crm-badge crm-badge--${(c.status || 'regular').toLowerCase()}`}>
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </div>

                <div className="crm-cell crm-cell--spent">
                  {(c.totalSpent || 0).toLocaleString('tr-TR')} ₺
                </div>

                <div className="crm-cell crm-cell--date">
                  {fmtDate(c.createdAt)}
                </div>

                <div className="crm-cell crm-cell--actions" onClick={e => e.stopPropagation()}>
                  <button className="crm-icon-btn" onClick={() => openEditModal(c)} title="Düzenle">
                    <FiEdit2 size={15} />
                  </button>
                  <button className="crm-icon-btn crm-icon-btn--danger" onClick={() => handleDelete(c._id)} title="Sil">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CRM Drawer ──────────────────────────────────────── */}
      {drawer && (
        <>
          <div className="crm-overlay" onClick={closeDrawer} />
          <aside className="crm-drawer">
            {/* Close */}
            <button className="crm-drawer-close" onClick={closeDrawer}><FiX /></button>

            {/* Profile */}
            <div className="crm-drawer-profile">
              <div className={`crm-drawer-avatar crm-avatar--${(drawer.customer.status || 'regular').toLowerCase()}`}>
                {initials(drawer.customer.fullName)}
              </div>
              <div className="crm-drawer-info">
                <h2 className="crm-drawer-name">{drawer.customer.fullName}</h2>
                <span className={`crm-badge crm-badge--${(drawer.customer.status || 'regular').toLowerCase()}`}>
                  {STATUS_LABEL[drawer.customer.status] || drawer.customer.status}
                </span>
              </div>
            </div>

            {/* Birthday Banner */}
            {(() => {
              const d = daysUntilBirthday(drawer.customer.birthDate);
              if (d === null) return null;
              return (
                <div className={`crm-birthday-banner ${d <= 3 ? 'soon' : ''}`}>
                  <FiGift />
                  {d === 0
                    ? '🎉 Bugün doğum günü!'
                    : `Doğum gününe ${d} gün kaldı 🎂`}
                  {d <= 7 && <span className="crm-birthday-hint">İndirim teklif etmek için harika bir fırsat!</span>}
                </div>
              );
            })()}

            {/* Quick Actions */}
            <div className="crm-quick-actions">
              <button
                className="crm-qa-btn crm-qa-btn--whatsapp"
                onClick={() => openWhatsApp(drawer.customer.phone)}
              >
                <FiMessageSquare size={16} />
                <span>WhatsApp</span>
              </button>
              <button
                className="crm-qa-btn crm-qa-btn--appt"
                onClick={openApptModal}
              >
                <FiCalendar size={16} />
                <span>Randevu Ver</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="crm-drawer-section">
              <div className="crm-section-title">İletişim</div>
              <div className="crm-detail-row"><FiPhone size={14} /><span>{drawer.customer.phone}</span></div>
              {drawer.customer.email && <div className="crm-detail-row"><FiMail size={14} /><span>{drawer.customer.email}</span></div>}
              {drawer.customer.birthDate && (
                <div className="crm-detail-row"><FiGift size={14} /><span>Doğum: {fmtDate(drawer.customer.birthDate)}</span></div>
              )}
            </div>

            {/* Stats */}
            <div className="crm-drawer-section">
              <div className="crm-section-title">İstatistikler</div>
              <div className="crm-stats-grid">
                <div className="crm-stat-box">
                  <div className="crm-stat-val">{(drawer.appointments || []).length}</div>
                  <div className="crm-stat-lbl">Toplam Randevu</div>
                </div>
                <div className="crm-stat-box">
                  <div className="crm-stat-val">
                    {(drawer.appointments || []).filter(a => a.status === 'completed').length}
                  </div>
                  <div className="crm-stat-lbl">Tamamlanan</div>
                </div>
                <div className="crm-stat-box">
                  <div className="crm-stat-val">
                    {(drawer.appointments || []).filter(a => a.status === 'noshow' || a.status === 'cancelled').length}
                  </div>
                  <div className="crm-stat-lbl">İptal/Gelmedi</div>
                </div>
                <div className="crm-stat-box">
                  <div className="crm-stat-val">{(drawer.customer.totalSpent || 0).toLocaleString('tr-TR')} ₺</div>
                  <div className="crm-stat-lbl">Toplam Harcama</div>
                </div>
              </div>
            </div>

            {/* Special Note */}
            <div className="crm-drawer-section">
              <div className="crm-section-title">Özel Not</div>
              <textarea
                className="crm-note-textarea"
                rows={3}
                placeholder="Müşteri hakkında özel notlar… (örn: Kahvesini sade içer, Boyun fıtığı var)"
                value={specialNote}
                onChange={e => setSpecialNote(e.target.value)}
              />
              <button
                className="crm-save-note-btn"
                onClick={saveNote}
                disabled={savingNote || specialNote === (drawer.customer.specialNote || '')}
              >
                <FiSave size={14} />
                {savingNote ? 'Kaydediliyor…' : 'Notu Kaydet'}
              </button>
            </div>

            {/* Appointment History */}
            <div className="crm-drawer-section">
              <div className="crm-section-title">Randevu Geçmişi</div>
              {drawerLoading ? (
                <div className="crm-drawer-loading"><div className="crm-spinner crm-spinner--sm"></div></div>
              ) : (drawer.appointments || []).length === 0 ? (
                <div className="crm-no-appts">
                  <FiCalendar size={20} />
                  <p>Henüz randevu bulunmuyor</p>
                </div>
              ) : (
                <div className="crm-appt-list">
                  {(drawer.appointments || []).map(a => {
                    const st = APPT_STATUS[a.status] || { label: a.status, cls: 'pending' };
                    return (
                      <div key={a._id} className="crm-appt-item">
                        <div className="crm-appt-left">
                          <div className="crm-appt-service">
                            {a.serviceId?.name || '—'}
                          </div>
                          <div className="crm-appt-meta">
                            <FiClock size={11} /> {fmtDate(a.date)} · {a.startTime}
                            {a.staffId && ` · ${a.staffId.name}`}
                          </div>
                        </div>
                        <div className="crm-appt-right">
                          <span className={`crm-appt-status crm-appt-status--${st.cls}`}>{st.label}</span>
                          {a.serviceId?.price && (
                            <span className="crm-appt-price">{a.serviceId.price} ₺</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </aside>
        </>
      )}

      {/* ─── CRM Randevu Ekleme Modalı ───────────────────────── */}
      {showApptModal && drawer && (
        <div className="crm-modal-overlay" onClick={() => setShowApptModal(false)}>
          <div className="crm-modal crm-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="crm-modal-header">
              <div>
                <h3>Randevu Ver</h3>
                <p className="crm-modal-sub">
                  Müşteri: <strong>{drawer.customer.fullName}</strong>
                </p>
              </div>
              <button className="crm-drawer-close" onClick={() => setShowApptModal(false)}><FiX /></button>
            </div>

            <form className="crm-modal-form" onSubmit={submitAppt}>
              {/* Hizmet Seçimi */}
              <label>Hizmet *
                <select required value={apptForm.serviceId}
                  onChange={e => handleApptFormChange('serviceId', e.target.value)}>
                  <option value="">— Hizmet seçin —</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.duration} dk) — {s.price} ₺
                    </option>
                  ))}
                </select>
              </label>

              {/* Personel Seçimi */}
              <label>Personel
                <select value={apptForm.staffId}
                  onChange={e => handleApptFormChange('staffId', e.target.value)}>
                  <option value="">— Personel seçin (opsiyonel) —</option>
                  {staffList.map(st => (
                    <option key={st._id} value={st._id}>{st.name}</option>
                  ))}
                </select>
              </label>

              {/* Tarih + Saatler */}
              <div className="crm-form-row">
                <label>Tarih *
                  <input required type="date" value={apptForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => handleApptFormChange('date', e.target.value)} />
                </label>
                <label>Başlangıç *
                  <input required type="time" value={apptForm.startTime}
                    onChange={e => handleApptFormChange('startTime', e.target.value)} />
                </label>
                <label>Bitiş *
                  <input required type="time" value={apptForm.endTime}
                    onChange={e => handleApptFormChange('endTime', e.target.value)} />
                </label>
              </div>

              {apptForm.endTime && (
                <p className="crm-time-hint">
                  <FiCheck size={13} /> Bitiş saati seçilen hizmet süresine göre otomatik hesaplandı.
                </p>
              )}

              {/* Notlar */}
              <label>Notlar
                <input type="text" value={apptForm.notes}
                  onChange={e => handleApptFormChange('notes', e.target.value)}
                  placeholder="Ek notlar (opsiyonel)" />
              </label>

              <div className="crm-modal-actions">
                <button type="button" className="crm-btn-ghost" onClick={() => setShowApptModal(false)}>
                  İptal
                </button>
                <button type="submit" className="crm-btn-primary" disabled={apptLoading}>
                  <FiCalendar size={15} />
                  {apptLoading ? 'Oluşturuluyor…' : 'Randevu Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────── */}
      {showModal && (
        <div className="crm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{modalMode === 'create' ? 'Yeni Müşteri' : 'Müşteri Düzenle'}</h3>
              <button className="crm-drawer-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form className="crm-modal-form" onSubmit={handleSubmit}>
              <label>Ad Soyad *
                <input required value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Müşteri adı" />
              </label>
              <label>Telefon *
                <input required type="tel" value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="0555 123 45 67" />
              </label>
              <label>E-posta
                <input type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@ornek.com" />
              </label>
              <label>Doğum Tarihi
                <input type="date" value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})} />
              </label>
              <label>Durum
                <select value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Regular">Düzenli</option>
                  <option value="VIP">VIP</option>
                  <option value="Riskli">Riskli</option>
                </select>
              </label>
              <div className="crm-modal-actions">
                <button type="button" className="crm-btn-ghost" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="crm-btn-primary">
                  {modalMode === 'create' ? 'Müşteri Ekle' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
