import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, FiUserPlus, FiAlertCircle, FiUsers, FiCalendar,
  FiDollarSign, FiBriefcase, FiArrowRight, FiRefreshCw,
  FiMessageSquare, FiBarChart2, FiSettings, FiMail
} from 'react-icons/fi';
import { dashboardService, appointmentService, customerService } from '../../services/api';
import './DashboardL.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalStaff: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    todayRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsRes, todayRes, upcomingRes, customersRes] = await Promise.all([
        dashboardService.getStats().catch(err => ({ data: { success: false, data: {} } })),
        appointmentService.getToday().catch(err => ({ data: { success: false, data: [] } })),
        appointmentService.getUpcoming(5).catch(err => ({ data: { success: false, data: [] } })),
        customerService.getAll({ limit: 5 }).catch(err => ({ data: { success: false, data: [] } }))
      ]);

      if (statsRes?.data?.success) {
        const data = statsRes.data.data;
        setStats({
          totalCustomers: data.totalCustomers || 0,
          totalStaff: data.totalStaff || 0,
          totalAppointments: data.totalAppointments || 0,
          todayAppointments: data.todaysAppointmentsCount || 0,
          todayRevenue: data.todayRevenue || 0,
          pendingAppointments: data.pendingAppointments || 0,
          completedAppointments: data.completedAppointments || 0
        });
      }

      if (todayRes?.data?.success) setTodayAppointments(todayRes.data.data || []);
      if (upcomingRes?.data?.success) setUpcomingAppointments(upcomingRes.data.data || []);
      if (customersRes?.data?.success) setRecentCustomers(customersRes.data.data || []);

    } catch (err) {
      console.error('Dashboard verileri çekilemedi:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatTime = (time) => time || '--:--';

  const getStatusText = (status) => {
    const map = {
      'pending': 'Bekliyor',
      'confirmed': 'Onaylı',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal',
      'no-show': 'Gelmedi'
    };
    return map[status] || status;
  };

  const getStatusClass = (status) => {
    const map = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'no-show': 'no-show'
    };
    return map[status] || '';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Panonuz hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FiAlertCircle size={48} />
        <p>{error}</p>
        <button onClick={() => fetchDashboardData()} className="retry-btn">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="overview-page">
      
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <button 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
        >
          <FiRefreshCw className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Bekleyen Onay Uyarısı */}
      {stats.pendingAppointments > 0 && (
        <div className="pending-alert" onClick={() => navigate('/dashboard/calendar')}>
          <span className="pending-alert-icon">⚡</span>
          <span className="pending-alert-text">
            <strong>{stats.pendingAppointments} randevunuz</strong> onay bekliyor
          </span>
          <span className="pending-alert-action">Takvime Git →</span>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#4f46e515' }}>
            <FiCalendar className="stat-icon" style={{ color: '#4f46e5' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Bugünkü Randevular</span>
            <span className="stat-value">{stats.todayAppointments}</span>
            <span className="stat-change">Bekleyen: {stats.pendingAppointments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#10b98115' }}>
            <FiDollarSign className="stat-icon" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Bugünkü Ciro</span>
            <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
            <span className="stat-change">Tamamlanan: {stats.completedAppointments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f59e0b15' }}>
            <FiUsers className="stat-icon" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Toplam Müşteri</span>
            <span className="stat-value">{stats.totalCustomers}</span>
            <span className="stat-change">Aktif müşteriler</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#6366f115' }}>
            <FiBriefcase className="stat-icon" style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Toplam Randevu</span>
            <span className="stat-value">{stats.totalAppointments}</span>
            <span className="stat-change">{stats.totalStaff} personel</span>
          </div>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="dashboard-main-grid">
        
        {/* SOL KOLON: Bugünün Randevuları */}
        <div className="appointments-section">
          <div className="section-header">
            <div className="header-title-group">
              <h3>Bugünün Randevuları</h3>
              <span className="badge-count">{todayAppointments.length} randevu</span>
            </div>
            <button className="text-btn" onClick={() => navigate('/dashboard/calendar')}>
              Tümünü Gör <FiArrowRight />
            </button>
          </div>
          
          {todayAppointments.length > 0 ? (
            <div className="appointment-list">
              {todayAppointments.map(app => (
                <div key={app._id} className="appointment-item">
                  <div className="app-time-block">
                    <span className="time-main">{formatTime(app.startTime)}</span>
                    <span className="time-duration">{app.serviceId?.duration || 0} dk</span>
                  </div>
                  
                  <div className={`app-avatar ${getStatusClass(app.status)}`}>
                    {app.customerId?.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                  </div>
                  
                  <div className="app-details">
                    <h4>{app.customerId?.fullName || 'İsimsiz Müşteri'}</h4>
                    <p>{app.serviceId?.name || 'Hizmet belirtilmemiş'}</p>
                    {app.staffId && <span className="staff-badge">👤 {app.staffId.name}</span>}
                  </div>
                  
                  <div className="app-actions">
                    <span className={`app-status ${getStatusClass(app.status)}`}>
                      {getStatusText(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>Bugün için randevu bulunmuyor</p>
              <button className="primary-btn" onClick={() => navigate('/dashboard/calendar')}>
                <FiCalendar /> Randevu Oluştur
              </button>
            </div>
          )}
        </div>

        {/* SAĞ KOLON */}
        <div className="right-sidebar">
          
          {/* Yaklaşan Randevular */}
          <div className="upcoming-card">
            <div className="section-header">
              <h3>Yaklaşan Randevular</h3>
              <button className="text-btn" onClick={() => navigate('/dashboard/calendar')}>
                Takvim
              </button>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="upcoming-list">
                {upcomingAppointments.map(app => (
                  <div key={app._id} className="upcoming-item">
                    <span className="upcoming-date">
                      {new Date(app.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="upcoming-time">{formatTime(app.startTime)}</span>
                    <span className="upcoming-customer">
                      {app.customerId?.fullName?.split(' ')[0] || 'İsimsiz'}
                    </span>
                    <span className={`upcoming-status ${getStatusClass(app.status)}`}></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">Yaklaşan randevu yok</p>
            )}
          </div>

          {/* Son Eklenen Müşteriler */}
          <div className="recent-customers-card">
            <div className="section-header">
              <h3>Son Müşteriler</h3>
              <button className="text-btn" onClick={() => navigate('/dashboard/customers')}>
                Tümü
              </button>
            </div>
            
            {recentCustomers.length > 0 ? (
              <div className="customers-list">
                {recentCustomers.map(customer => (
                  <div key={customer._id} className="customer-item">
                    <div className="customer-avatar-small">
                      {customer.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                    </div>
                    <div className="customer-info">
                      <span className="customer-name">{customer.fullName}</span>
                      <span className="customer-phone">{customer.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">Müşteri bulunmuyor</p>
            )}
          </div>

          {/* HIZLI İŞLEMLER - YENİ TASARIM */}
          <div className="quick-actions-card">
            <h3>
              <FiClock /> Hızlı İşlemler
            </h3>
            
            {/* Grid görünümü - 2 kolon */}
            <div className="quick-actions-grid">
              <div 
                className="quick-action-item calendar"
                onClick={() => navigate('/dashboard/calendar')}
              >
                <div className="icon-wrapper">
                  <FiCalendar />
                </div>
                <span className="action-label">Yeni Randevu</span>
              </div>

              <div 
                className="quick-action-item customer"
                onClick={() => navigate('/dashboard/customers')}
              >
                <div className="icon-wrapper">
                  <FiUserPlus />
                </div>
                <span className="action-label">Yeni Müşteri</span>
              </div>

              <div 
                className="quick-action-item message"
                onClick={() => alert('Toplu SMS özelliği çok yakında!')}
              >
                <div className="icon-wrapper">
                  <FiMessageSquare />
                </div>
                <span className="action-label">Toplu SMS</span>
              </div>

              <div 
                className="quick-action-item report"
                onClick={() => navigate('/dashboard/reports')}
              >
                <div className="icon-wrapper">
                  <FiBarChart2 />
                </div>
                <span className="action-label">Raporlar</span>
              </div>
            </div>

            {/* Alternatif liste görünümü (istersen kullanabilirsin) */}
            {/* <div className="quick-actions-list">
              <div className="quick-action-row" onClick={() => navigate('/dashboard/calendar')}>
                <div className="icon-wrapper" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8' }}>
                  <FiCalendar />
                </div>
                <div className="action-content">
                  <span className="action-title">Yeni Randevu</span>
                  <span className="action-desc">Randevu oluştur ve takvime ekle</span>
                </div>
                <FiArrowRight className="action-arrow" />
              </div>

              <div className="quick-action-row" onClick={() => navigate('/dashboard/customers')}>
                <div className="icon-wrapper" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  <FiUserPlus />
                </div>
                <div className="action-content">
                  <span className="action-title">Yeni Müşteri</span>
                  <span className="action-desc">Müşteri bilgilerini ekle</span>
                </div>
                <FiArrowRight className="action-arrow" />
              </div>

              <div className="quick-action-row" onClick={() => alert('Toplu SMS özelliği çok yakında!')}>
                <div className="icon-wrapper" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <FiMessageSquare />
                </div>
                <div className="action-content">
                  <span className="action-title">Toplu SMS</span>
                  <span className="action-desc">Müşterilerinize toplu mesaj gönderin</span>
                </div>
                <FiArrowRight className="action-arrow" />
              </div>

              <div className="quick-action-row" onClick={() => navigate('/dashboard/reports')}>
                <div className="icon-wrapper" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
                  <FiBarChart2 />
                </div>
                <div className="action-content">
                  <span className="action-title">Raporlar</span>
                  <span className="action-desc">Performans ve gelir raporları</span>
                </div>
                <FiArrowRight className="action-arrow" />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;