import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiUsers, FiPieChart, FiSettings, FiLogOut, 
  FiBell, FiSearch, FiChevronLeft, FiChevronRight, FiMenu,
  FiX, FiCheck, FiClock, FiUserPlus, FiCalendar as FiCalendarIcon,
  FiAlertCircle
} from 'react-icons/fi';
import { businessService, notificationService } from '../../services/api';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Bildirimleri çek
  useEffect(() => {
    fetchNotifications();
    
    // Her 30 saniyede bir bildirimleri kontrol et
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dışarı tıklanınca bildirim panelini kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bildirimleri çek (GERÇEK BACKEND)
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await notificationService.getAll({ limit: 20 });
      
      if (response.data.success) {
        // Backend'den gelen verileri frontend'in beklediği formata çevir
        const formattedNotifications = response.data.data.map(notification => ({
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.createdAt),
          isRead: notification.isRead,
          icon: getNotificationIconComponent(notification.icon || notification.type),
          color: notification.color || getNotificationColor(notification.type),
          action: notification.action || getNotificationAction(notification.type)
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Bildirimler çekilemedi:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Zaman formatla (örnek: "5 dakika önce")
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Bildirim tipine göre ikon componenti
  const getNotificationIconComponent = (iconOrType) => {
    if (typeof iconOrType === 'string') {
      switch(iconOrType) {
        case 'calendar': return <FiCalendarIcon />;
        case 'check': return <FiCheck />;
        case 'x': return <FiX />;
        case 'user-plus': return <FiUserPlus />;
        case 'clock': return <FiClock />;
        case 'alert': return <FiAlertCircle />;
        default: return <FiBell />;
      }
    }
    return iconOrType || <FiBell />;
  };

  // Bildirim tipine göre renk
  const getNotificationColor = (type) => {
    switch(type) {
      case 'new_appointment': return '#4f46e5';
      case 'appointment_confirmed': return '#10b981';
      case 'appointment_cancelled': return '#ef4444';
      case 'new_customer': return '#f59e0b';
      case 'appointment_reminder': return '#ec4899';
      default: return '#64748b';
    }
  };

  // Bildirim tipine göre aksiyon
  const getNotificationAction = (type) => {
    switch(type) {
      case 'new_appointment':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_reminder':
        return '/dashboard/calendar';
      case 'new_customer':
        return '/dashboard/customers';
      default:
        return '/dashboard';
    }
  };

  // Bildirimi okundu olarak işaretle (GERÇEK BACKEND)
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Local state'i güncelle
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Bildirim okundu işaretlenemedi:', error);
    }
  };

  // Tüm bildirimleri okundu işaretle (GERÇEK BACKEND)
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Bildirimler okundu işaretlenemedi:', error);
    }
  };

  // Bildirime tıkla
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      navigate(notification.action);
    }
    setShowNotifications(false);
  };

  // İşletme bilgilerini localStorage'dan al
  useEffect(() => {
    const loadBusinessData = () => {
      try {
        const savedBusiness = localStorage.getItem('business');
        if (savedBusiness) {
          setBusiness(JSON.parse(savedBusiness));
        } else {
          fetchBusinessProfile();
        }
      } catch (error) {
        console.error('İşletme bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await businessService.getProfile();
      if (response.data.success) {
        const businessData = response.data.data;
        setBusiness(businessData);
        localStorage.setItem('business', JSON.stringify(businessData));
      }
    } catch (error) {
      console.error('İşletme profili çekilirken hata:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Ana Panel' },
    { path: '/dashboard/calendar', icon: <FiCalendar />, label: 'Takvim', badge: '12' },
    { path: '/dashboard/customers', icon: <FiUsers />, label: 'Müşteriler' },
    { path: '/dashboard/reports', icon: <FiPieChart />, label: 'Raporlar' },
    { path: '/dashboard/settings', icon: <FiSettings />, label: 'Ayarlar' },
  ];

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleLogout = () => {
  // Hem kalıcı hem geçici hafızayı tertemiz yapıyoruz
  localStorage.removeItem('token');
  localStorage.removeItem('business');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('business');
  
  // Login sayfasına postala
  navigate('/login');
};

  const getBusinessInitials = () => {
    if (!business?.businessName) return '?';
    return business.businessName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dashboard-layout">
      
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open' : ''}`}>
        
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-icon">✨</span>
          {!sidebarCollapsed && <span className="logo-text">CepTakvim</span>}
        </div>

        {/* Collapse Butonu (sadece desktop) */}
        <button 
          className="sidebar-collapse-btn desktop-only"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        {/* Navigasyon Menüsü */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Alt Kısım - İşletme Bilgileri ve Çıkış */}
        <div className="sidebar-bottom">
          
          {/* İşletme Profili */}
          <div className="user-profile-mini">
            <div className="user-avatar">
              {getBusinessInitials()}
            </div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <strong>{business?.businessName || 'İşletme Adı'}</strong>
                <span className="premium-badge">
                  {business?.subscription === 'premium' ? 'Premium' : 'Ücretsiz'}
                </span>
              </div>
            )}
          </div>

          {/* Çıkış Butonu */}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> 
            {!sidebarCollapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Mobil Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dash-main">
        
        {/* Top Bar - Mobil Menü Butonu */}
        <header className="dash-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <FiMenu />
            </button>
            <div className="header-greeting">
              <h1>Merhaba, {business?.businessName?.split(' ')[0] || 'İşletme'} 👋</h1>
              <p>{new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Ara..." />
            </div>
            
            {/* BİLDİRİM BUTONU - BACKEND UYUMLU */}
            <div className="notification-container" ref={notificationRef}>
              <button 
                className={`notification-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Bildirim Paneli */}
              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button className="mark-all-read" onClick={markAllAsRead}>
                        Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notificationLoading ? (
                      <div className="notification-loading">
                        <div className="loading-spinner-small"></div>
                        <p>Bildirimler yükleniyor...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon" style={{ background: `${notification.color}15`, color: notification.color }}>
                            {notification.icon}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{notification.time}</div>
                          </div>
                          {!notification.isRead && <span className="unread-dot"></span>}
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <FiBell size={24} />
                        <p>Bildirim bulunmuyor</p>
                      </div>
                    )}
                  </div>

                  <div className="notification-footer">
                    <button onClick={() => navigate('/dashboard/notifications')}>
                      Tüm Bildirimleri Gör
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dash-content scroll-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;