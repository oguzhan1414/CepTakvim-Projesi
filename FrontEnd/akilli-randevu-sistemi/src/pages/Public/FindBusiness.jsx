import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, FiMapPin, FiStar, FiArrowRight,
  FiGrid, FiList, FiClock
} from 'react-icons/fi';
import { publicService } from '../../services/api';
import './FindBusiness.css';

const FindBusiness = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular'); // default sort

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'kuafor', name: 'Kuaför & Berber' },
    { id: 'guzellik', name: 'Güzellik' },
    { id: 'dental', name: 'Diş Kliniği' },
    { id: 'doktor', name: 'Doktor' },
    { id: 'spa', name: 'Spa & Masaj' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'psikolog', name: 'Psikolog' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await publicService.getAllBusinesses();
      if (res.data.success) {
        setBusinesses(res.data.data);
      }
    } catch (error) {
      console.error('Veriler çekilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.businessType === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    // popular sort by rating or randomly if no rating exists
    return (b.rating || 0) - (a.rating || 0); 
  });

  if (loading) {
    return (
      <div className="fb-loading">
        <div className="fb-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fb-layout">
      {/* Hero Section */}
      <section className="fb-hero">
        <div className="fb-hero-content">
          <h1 className="fb-hero-title">
            Mükemmel Hizmeti <br/>
            <span className="text-gray">Keşfedin ve Ayırtın.</span>
          </h1>
          <p className="fb-hero-subtitle">
            Güzellikten sağlığa binlerce işletme CepTakvim güvencesiyle tek platformda.
          </p>
          
          <div className="fb-search-bar">
            <input 
              type="text"
              placeholder="İşletme adı veya konum ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="fb-search-btn">
              <FiSearch /> Bul
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="fb-main">
        {/* Categories */}
        <div className="fb-categories-wrapper">
          <div className="fb-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`fb-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="fb-results-header">
          <h2>İşletmeler ({filteredBusinesses.length})</h2>
          <div className="fb-sort">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popular">En Popüler</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="fb-grid">
            {filteredBusinesses.map(business => (
              <Link to={`/isletme/${business.slug}`} key={business._id} className="fb-card">
                <div className="fb-card-image">
                  <div className="fb-card-initial">{business.businessName.charAt(0)}</div>
                </div>
                <div className="fb-card-content">
                  <div className="fb-card-top">
                    <span className="fb-card-category">
                      {categories.find(c => c.id === business.businessType)?.name || 'Diğer'}
                    </span>
                    <div className="fb-card-rating">
                      <FiStar className="star-icon" />
                      <span>{business.rating || '4.8'}</span>
                    </div>
                  </div>
                  <h3 className="fb-card-title">{business.businessName}</h3>
                  <p className="fb-card-meta"><FiMapPin /> {business.address || 'Konum belirtilmemiş'}</p>
                  
                  <div className="fb-card-footer">
                    <span className="fb-card-time"><FiClock /> {business.workingHours || '09:00 - 18:00'}</span>
                    <div className="fb-card-arrow"><FiArrowRight /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="fb-empty">
            <div className="empty-icon">🔍</div>
            <h3>Sonuç Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun işletme bulamadık.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FindBusiness;