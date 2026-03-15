import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import logo from '../../images/CepTakvim-logo-transparent.png'
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Token kontrolü (giriş yapmış mı?)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="CepTakvim Logo" className="logo-icon" />
          <span className="logo-text">CepTakvim</span>
        </Link>

        {/* Navigasyon Linkleri - SADECE MASAÜSTÜ GÖRÜNÜR */}
        <ul className="navbar-menu desktop-menu">
          <li>
            <Link to="/" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
              Ana Sayfa
            </Link>
          </li>
          
          <li>
            <a href="/#pricing" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
              Fiyatlandırma
            </a>
          </li>
          <li>
            <Link to="/contact" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
              İletişim
            </Link>
          </li>
        </ul>

        {/* Sağ Taraf - Butonlar (SADECE MASAÜSTÜ) */}
        <div className="navbar-right">
          <div className="desktop-buttons">
            {/* Randevu Al Butonu */}
            <button 
              className="btn-randevu" 
              onClick={() => navigate('/randevu-al')}
            >
              <FiCalendar /> Randevu Al
            </button>
            
            {/* Randevularım Butonu */}
            <button 
              className="btn-my-appointments" 
              onClick={() => navigate('/randevularim')}
            >
              <FiUser /> Randevularım
            </button>
            
            <button className="btn-outline" onClick={() => navigate('/login')}>
              Giriş Yap
            </button>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Ücretsiz Dene
            </button>
          </div>

          {/* Hamburger Menü İkonu (SADECE MOBİL) */}
          <button 
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menüyü aç/kapat"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobil Menü (AÇILIR) */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-list">
            <li>
              <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Ana Sayfa
              </Link>
            </li>
            
            <li>
              <a href="/#pricing" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Fiyatlandırma
              </a>
            </li>
            <li>
              <Link to="/contact" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                İletişim
              </Link>
            </li>
            
            <li className="mobile-divider"></li>
            
            <li>
              <Link to="/randevu-al" className="mobile-link with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                <FiCalendar /> Randevu Al
              </Link>
            </li>
            <li>
              <Link to="/randevularim" className="mobile-link with-icon" onClick={() => setIsMobileMenuOpen(false)}>
                <FiUser /> Randevularım
              </Link>
            </li>
            
            {!isLoggedIn ? (
              <>
                <li className="mobile-divider"></li>
                <li>
                  <Link to="/login" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Giriş Yap
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="mobile-link register" onClick={() => setIsMobileMenuOpen(false)}>
                    Ücretsiz Dene
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="mobile-divider"></li>
                <li>
                  <Link to="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;