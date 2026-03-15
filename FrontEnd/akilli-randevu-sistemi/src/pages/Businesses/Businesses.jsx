import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { publicService } from '../../services/api';
import './Businesses.css';

const Businesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await publicService.getAllBusinesses();
      
      if (response.data.success) {
        setBusinesses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('İşletmeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (slug) => {
    navigate(`/booking/${slug}`);
  };

  if (loading) {
    return (
      <div className="businesses-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>İşletmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="businesses-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchBusinesses} className="retry-btn">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="businesses-page">
      <div className="businesses-container">
        {/* Header */}
        <div className="businesses-header">
          <h1>Randevu Al</h1>
          <p>Aşağıdaki işletmelerden birini seçerek hemen randevu oluşturabilirsiniz.</p>
        </div>

        {/* Business List */}
        {businesses.length > 0 ? (
          <div className="businesses-grid">
            {businesses.map((business) => (
              <div key={business._id} className="business-card">
                {/* Logo */}
                <div className="business-logo">
                  {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.businessName} />
                  ) : (
                    <div className="logo-placeholder">
                      {business.businessName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="business-info">
                  <h3>{business.businessName}</h3>
                  
                  {business.address && (
                    <p className="business-address">
                      <FiMapPin /> {business.address}
                    </p>
                  )}
                  
                  {business.phone && (
                    <p className="business-phone">
                      <FiPhone /> {business.phone}
                    </p>
                  )}
                </div>

                {/* Action */}
                <button 
                  className="book-btn"
                  onClick={() => handleBookAppointment(business.slug)}
                >
                  <FiCalendar /> Randevu Al
                  <FiArrowRight />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>Henüz İşletme Yok</h3>
            <p>Sisteme kayıtlı işletme bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Businesses;

