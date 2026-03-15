import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
// İkonları import ediyoruz
import { FiPhone, FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';
import {FaInstagram, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      
      <footer className="main-footer">
        <div className="footer-container">
          
          {/* Hakkımızda */}
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <span className="logo-icon"></span>
              <span className="logo-text">CepTakvim</span>
            </Link>
            
            <div className="footer-social">
              <a href="https://www.instagram.com/oguzhansekerci14/" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://x.com/OguzhanSekerci2" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
              <a href="https://www.linkedin.com/in/oguzhan-sekerci-1a38a0245/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>
          
          {/* Hızlı Linkler */}
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul className="footer-links">
              <li><Link to="/">Ana Sayfa</Link></li>
              {/* Sayfa içi kaydırma yapacak linkler için standart <a> etiketi daha sağlıklıdır */}
              <li><a href="/#pricing">Fiyatlandırma</a></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          
          {/* Destek */}
          <div className="footer-section">
            <h4>Destek</h4>
            <ul className="footer-links">
              <li><Link to="/help">Yardım Merkezi</Link></li>
              <li><Link to="/faq">SSS</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
              <li><Link to="/legal">Yasal</Link></li>
            </ul>
          </div>
          
          {/* İletişim & Bülten */}
          <div className="footer-section">
            <h4>İletişim</h4>
            <ul className="footer-contact">
              <li>
                <FiPhone className="contact-icon" />
                <span>0530 496 92 10</span>
              </li>
              <li>
                <FiMail className="contact-icon" />
                <span>oguzhansekerci14@gmail.com</span>
              </li>
              <li>
                <FiMapPin className="contact-icon" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>

          </div>
        </div>
        
        <div className="footer-bottom">
          <div>© {currentYear} CepTakvim. Tüm hakları saklıdır.</div>
          <div className="footer-bottom-links">
            <Link to="/legal">KVKK</Link>
            <Link to="/legal">Gizlilik</Link>
            <Link to="/legal">Kullanım</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;