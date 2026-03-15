import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde kontrol et: Daha önce onay verilmiş mi?
    const hasConsent = localStorage.getItem('cookieConsent');
    
    // Eğer onay yoksa, biraz gecikmeli (daha şık bir efekt için) göster
    if (!hasConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Onay verildi, localStorage'a yaz (Bir daha görünmez)
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Opsiyonel: Sadece zorunlu çerezleri tutma durumu
    localStorage.setItem('cookieConsent', 'essential-only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrapper">
      <div className="cookie-banner-glass">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-content">
          <h4>Çerez Politikası</h4>
          <p>
            Sizlere daha iyi bir deneyim sunabilmek, site trafiğini analiz etmek ve hizmetlerimizi 
            kişiselleştirmek için çerezleri (cookies) kullanıyoruz. Sistemi kullanmaya devam ederek 
            çerez kullanımımızı kabul etmiş olursunuz.
          </p>
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn outline" onClick={handleDecline}>Sadece Zorunlu</button>
          <button className="cookie-btn primary" onClick={handleAccept}>Tümünü Kabul Et</button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;