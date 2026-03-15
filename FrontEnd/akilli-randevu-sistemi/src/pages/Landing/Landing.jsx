import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiCalendar, FiAlertCircle, FiShoppingBag, 
  FiCreditCard, FiUser, FiStar, FiPieChart, FiBarChart2, FiTrendingUp 
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import './Landing.css';

// API Servisimizi import ediyoruz
import { paymentService } from '../../services/api'; 

const Landing = () => {
  const navigate = useNavigate();
  
  // Ödeme (Loading) durumunu tutmak için
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Z-Pattern Özellik Verileri
  const showcaseFeatures = [
    {
      id: 1,
      title: "Randevularını Yönet",
      subtitle: "Randevularınızı tek ekrandan kontrol edin, işinizi zaman kazanarak büyütün!",
      description: "Karışık randevu takvimleri artık sorun değil! RandevuMcepte ile düzenli planlama, çakışmaları önleme ve işletme yönetimi sağlanır. Harika müşteri deneyimi sunar. Online randevuyla mesai saatleri dışında bile randevu alınabilir.",
      bullets: ["Kolay ve hızlı randevu oluştur", "Randevu kaçaklığını önle", "Otomatik randevu hatırlat"],
      buttonText: "Randevu Oluştur"
    },
    {
      id: 2,
      title: "Hatırlatma Mesajları",
      subtitle: "Kolay ve sorunsuz bir randevu yönetimi yaşayın!",
      description: "Tek platform üzerinden müşterilerinize mesaj göndermek artık çok kolay. İsterseniz hemen kampanya mesajları gönderebilir, isterseniz de otomatik planlayıcı özelliği ile randevu hatırlatma mesajları gönderebilir ve randevu kaçırmalarını önlersiniz. Müşteri memnuniyeti kazanırsınız.",
      bullets: ["Randevu zamanını otomatik hatırlat", "Kampanya mesajları hazırla", "Özel gün kutlama mesajları gönder"],
      buttonText: "Hatırlatma SMS Gönder"
    },
    {
      id: 3,
      title: "Satışlarınızı Hızlandırın",
      subtitle: "Satışlarda kolaylık ve kontrol RandevuMcepte ile bir adım önde olun!",
      description: "Satışlarınızı kolaylaştırın, karlılığınızı artırın! Mobil veya masaüstü, istediğiniz yerden satış yapın. Hataları azaltan adisyon yönetimiyle kontrol sağlayın. Detaylı raporlarla işletme performansınızı analiz edin, stok yönetimiyle süreçleri optimize edin.",
      bullets: ["Satış adisyon süreçlerini kolaylaştırma", "Tüm platformlardan satış gerçekleştirme", "Detaylı raporlama ve analiz"],
      buttonText: "Satış Yapmaya Başla"
    },
    {
      id: 4,
      title: "Kazancınızı Gözlemleyin",
      subtitle: "Kazancınızı artırmak için doğru adımları atın, finansal başarıya ulaşın!",
      description: "İşletme kazançlarınızı kontrol altına alın! Gelir-gider takibiyle finansal denge sağlayın. Detaylı raporlarla geliri analiz edin, kazanç kaynaklarınızı görün. Harcamaları izleyin, karlılığı artırın. Sağlıklı finans yönetimi, üst seviye kazanç!",
      bullets: ["Gelir / Gider dengesini koruyun", "Hesap bakiyelerini kontrol altına alın"],
      buttonText: "Kasanızı Kontrol Edin"
    },
    {
      id: 5,
      title: "Personel Yönetimi",
      subtitle: "Personel yönetimiyle işletmenizin performansını zirveye taşıyın!",
      description: "Çalışanlarınızı güncel tutun, programları düzenleyin, performansı değerlendirin. Programları etkin yöneterek verimliliği artırın. Eğitim ihtiyaçlarını belirleyin, ücretleri takip edin, ödemeleri kolaylaştırın. Karlılık ve başarı için işletmenizi güçlendirin!",
      bullets: ["Prim ve maaş hesaplamalarını kolaylaştırın", "Personel performanslarını kontrol altına alın"],
      buttonText: "Personelinizi Yönetin"
    },
    {
      id: 6,
      title: "Müşteri İlişkileri",
      subtitle: "Memnuniyeti Artırın, Sadakati Güçlendirin!",
      description: "Müşteri Yönetimiyle Başarı Yakalayın! Müşteri bilgilerini saklayın, tercihleri kaydedin ve ilişkileri etkin yönetin. Sadakat programlarıyla müşteri sadakatini artırın. Pazarlama stratejilerinizi güçlendirin!",
      bullets: ["Müşteri memnuniyetini artırın", "Müşteri verilerini güvenle saklayın"],
      buttonText: "Müşteri Kazanın"
    },
    {
      id: 7,
      title: "Detaylı Analiz",
      subtitle: "Verileri İncele, Performansı Yükselt. İleriye Adım At!",
      description: "Detaylı verilere dayanarak satışlar, gelir-gider, müşteri tercihleri, en çok satılan ürünler, randevu istatistiklerini inceleyin. Gelirleri analiz edin, stratejik kararlar alın, gelirleri artırın. Trendleri hızla fark edin, başarıyı artırın!",
      bullets: ["Detaylı raporlama yapın", "Aylık, yıllık, haftalık ve günlük raporlara erişin"],
      buttonText: "Raporları Analiz Edin"
    }
  ];

  const pricingPlans = [
    {
      name: 'Başlangıç', price: '299', popular: false,
      features: ['Aylık 100 Randevu', 'Temel Müşteri Yönetimi', 'WhatsApp Hatırlatma', 'Tek Personel', 'E-posta Desteği']
    },
    {
      name: 'Profesyonel', price: '599', popular: true,
      features: ['Sınırsız Randevu', 'Yapay Zeka Asistanı', 'Ön Ödeme (No-Show Koruması)', '5 Personel', '7/24 Öncelikli Destek', 'Detaylı Finans Raporları']
    },
    {
      name: 'Kurumsal', price: '999', popular: false,
      features: ['Sınırsız Randevu', 'Çoklu Şube Yönetimi', 'Sınırsız Personel', 'Özel API Entegrasyonu', 'Size Özel Müşteri Temsilcisi']
    }
  ];

  // 🚀 Ödeme Butonu Fonksiyonu
  const handlePricingClick = async (planName) => {
    let planType = '';
    if (planName === 'Başlangıç') planType = 'basic';
    if (planName === 'Profesyonel') planType = 'pro';
    if (planName === 'Kurumsal') planType = 'enterprise';

    const token = localStorage.getItem('token');

    if (!token || token === 'null' || token === 'undefined' || token === '') {
      navigate('/register');
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await paymentService.initialize({ planType });
      
      if (response.data.success) {
        window.location.href = response.data.paymentPageUrl;
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Ödeme sistemi başlatılamadı.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Hangi mockup'ın gösterileceğini belirleyen yardımcı fonksiyon
  const renderMockupContent = (id) => {
    switch (id) {
      case 1: 
        return (
          <div className="mockup-container calendar-mockup">
            <div className="mockup-header-simple"><FiCalendar /> Günlük Akış (Bugün)</div>
            <div className="calendar-grid">
              <div className="time-slot">09:00</div><div className="app-item occupied">Ahmet Y. - Kesim</div>
              <div className="time-slot">10:00</div><div className="app-item empty">Boş</div>
              <div className="time-slot">11:00</div><div className="app-item conflict"><FiAlertCircle /> ÇAKIŞMA! (2 Randevu)</div>
              <div className="time-slot">12:00</div><div className="app-item occupied">Ayşe K. - Boya</div>
            </div>
            <div className="conflict-alert-box">
              <FiAlertCircle className="alert-icon"/>
              <div>Israrla randevu isteyen bir müşteri var. AI, 14:30'a kaydırmayı öneriyor.</div>
            </div>
          </div>
        );
      case 2: 
        return (
          <div className="mockup-container sms-mockup">
             <div className="sms-header">
                <div className="sms-avatar">✨</div>
                <div className="sms-info"><strong>CepTakvim Bot</strong><span>Çevrimiçi</span></div>
              </div>
              <div className="sms-body">
                <div className="sms-bubble ai-bubble">
                  <p>Merhaba Ayşe Hanım! 👋 Yarın <strong>14:30</strong>'daki Cilt Bakımı randevunuzu hatırlatmak istedik.</p>
                  <div className="sms-actions"><button>✅ Onaylıyorum</button><button className="outline">İptal</button></div>
                  <span className="sms-time">10:42</span>
                </div>
                <div className="sms-bubble customer-bubble"><p>Evet, onaylıyorum. Teşekkürler! 💅</p><span className="sms-time">10:45</span></div>
              </div>
          </div>
        );
      case 3: 
        return (
          <div className="mockup-container pos-mockup">
            <div className="pos-grid">
              <div className="product-item"> Saç Kesimi<br/><span>₺150</span></div>
              <div className="product-item"> Şampuan<br/><span>₺85</span></div>
              <div className="product-item"> Manikür<br/><span>₺200</span></div>
              <div className="product-item">Cilt Bakımı<br/><span>₺350</span></div>
            </div>
            <div className="pos-cart">
              <div className="cart-header"><FiShoppingBag /> Sepet</div>
              <div className="cart-item">Saç Kesimi <span>₺150</span></div>
              <div className="cart-item">Şampuan (x2) <span>₺170</span></div>
              <div className="cart-total">Toplam: ₺320</div>
              <button className="pay-btn"><FiCreditCard /> Ödeme Al</button>
            </div>
          </div>
        );
      case 4: 
        return (
          <div className="mockup-container finance-mockup">
            <div className="finance-header">
              <div>Toplam Ciro (Bu Ay)</div>
              <div className="finance-amount">₺48.500 <span className="trend-up">+%18</span></div>
            </div>
            <div className="chart-placeholder">
              <div className="chart-bar bar-1"></div><div className="chart-bar bar-2"></div>
              <div className="chart-bar bar-3"></div><div className="chart-bar bar-4"></div>
              <div className="chart-bar bar-5"></div><div className="chart-bar bar-6"></div>
            </div>
            <div className="finance-row">
              <div className="finance-card mini">Nakit<br/><b>₺12.000</b></div>
              <div className="finance-card mini">Kredi Kartı<br/><b>₺36.500</b></div>
            </div>
          </div>
        );
      case 5: 
        return (
          <div className="mockup-container staff-mockup">
            <div className="mockup-header-simple"><FiUser /> Ekip Performansı</div>
            <div className="staff-list">
              <div className="staff-item">
                <div className="staff-avatar img-1">A.Y</div>
                <div className="staff-info">Ali Yılmaz<br/><span>Baş Uzman</span></div>
                <div className="staff-score success">9.8</div>
              </div>
              <div className="staff-item">
                <div className="staff-avatar img-2">Z.K</div>
                <div className="staff-info">Zeynep Kaya<br/><span>Estetisyen</span></div>
                <div className="staff-score average">9.2</div>
              </div>
               <div className="staff-item busy">
                <div className="staff-avatar img-3">M.D</div>
                <div className="staff-info">Mehmet Demir<br/><span>Şu an meşgul</span></div>
                <div className="staff-status-busy">Meşgul</div>
              </div>
            </div>
          </div>
        );
      case 6: 
        return (
          <div className="mockup-container crm-mockup">
            <div className="customer-profile-card">
              <div className="profile-header">
                <div className="profile-avatar"><FiUser /></div>
                <div className="profile-details">
                  <h3>Selin Aksoy</h3>
                  <span className="vip-badge"><FiStar /> VIP Müşteri</span>
                </div>
              </div>
              <div className="loyalty-box">
                 <div className="loyalty-points">1,250 <span>Puan</span></div>
                 <div className="loyalty-label">Sonraki ödüle 250 puan kaldı!</div>
                 <div className="progress-bar"><div className="progress-fill" style={{width: '80%'}}></div></div>
              </div>
              <div className="last-visit">Son Ziyaret: <b>2 gün önce</b> (Boya & Kesim)</div>
            </div>
          </div>
        );
      case 7: 
        return (
          <div className="mockup-container analytics-mockup">
             <div className="mockup-header-simple"><FiTrendingUp /> Haftalık Rapor</div>
             <div className="analytics-grid">
               <div className="analytics-card">
                 <div className="card-title"><FiPieChart /> Hizmet Dağılımı</div>
                 <div className="donut-chart-placeholder">
                   <div className="donut-slice slice-1"></div><div className="donut-slice slice-2"></div>
                   <div className="donut-center">Toplam<br/>450 İşlem</div>
                 </div>
                 <div className="chart-legend"><span>🟣 Kesim</span><span>🔵 Boya</span><span>🟢 Bakım</span></div>
               </div>
               <div className="analytics-card">
                 <div className="card-title"><FiBarChart2 /> Doluluk Oranı</div>
                 <div className="bar-chart-simple">
                   <div className="v-bar b1" style={{height: '60%'}}><span>Pzt</span></div>
                   <div className="v-bar b2" style={{height: '85%'}}><span>Sal</span></div>
                   <div className="v-bar b3" style={{height: '45%'}}><span>Çar</span></div>
                   <div className="v-bar b4" style={{height: '95%'}}><span>Per</span></div>
                 </div>
               </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="landing-page">
      
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="floating-shapes"><div className="shape shape-1"></div><div className="shape shape-2"></div><div className="shape shape-3"></div></div>
        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-badge">CepTakvim</span>
            <h1>İşletmeniz İçin <br/><span className="highlight">Akıllı Çözüm</span></h1>
            <p>Randevu yönetimini otomatikleştirin, müşteri sadakatini artırın ve boş saatlerinizi kâra dönüştürün. Üstelik 14 gün ücretsiz!</p>
            <div className="hero-buttons">
              <button className="btn-glow" onClick={() => navigate('/register')}>Ücretsiz Dene</button>
              <button className="btn-glass">Canlı Demo İzle</button>
            </div>
            <div className="hero-stats">
              <div><span className="stat-number">10K+</span><span className="stat-label">Aktif İşletme</span></div>
              <div><span className="stat-number">%98</span><span className="stat-label">Memnuniyet</span></div>
              <div><span className="stat-number">2.5M₺</span><span className="stat-label">Önlenen Zarar</span></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="glass-dashboard">
              <div className="dash-header"><div className="dots"><span/><span/><span/></div><div className="dash-title">CepTakvim Paneli</div></div>
              <div className="dash-body">
                <div className="dash-card greeting">Hoş geldin, Vibe Salon!</div>
                <div className="dash-row">
                  <div className="dash-card mini">Gelen Randevu <br/><b>+12</b></div>
                  <div className="dash-card mini highlight-card">Bugünkü Kazanç <br/><b>₺4.250</b></div>
                </div>
                <div className="dash-card chat-mockup">
                  <div className="chat-msg">Yarın 14:00 için boş yer var mı?</div>
                  <div className="chat-msg ai-msg">14:00 dolu ama 15:30 <b>Fırsat Saati!</b> %10 indirimle onaylayalım mı? </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Z-PATTERN SHOWCASE SECTION ===== */}
      <section className="showcase-section" id="features">
        {showcaseFeatures.map((feature, index) => {
          const isReverse = index % 2 !== 0; 
          return (
            <div key={feature.id} className={`showcase-row ${isReverse ? 'reverse' : ''}`}>
              <div className="showcase-text-content">
                <h2>{feature.title}</h2>
                <h3>{feature.subtitle}</h3>
                <p>{feature.description}</p>
                <ul className="showcase-bullets">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i}><FiCheckCircle className="check-icon" /> {bullet}</li>
                  ))}
                </ul>
                <button className="btn-showcase">{feature.buttonText}</button>
              </div>
              <div className="showcase-visual-content">
                <div className="mockup-frame">
                  <div className="mockup-glow"></div>
                  {renderMockupContent(feature.id)}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <h2>Fiyatlandırma</h2>
          <p>Her ölçekteki işletmeye uygun şeffaf paketler</p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">En Çok Tercih Edilen</div>}
              <div className="pricing-header">
                <h3>{plan.name}</h3>
                <div className="price">₺{plan.price}<span>/ay</span></div>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><FiCheckCircle className="check-icon" /> {feature}</li>
                ))}
              </ul>
              <div className="pricing-footer">
                <button 
                  className={plan.popular ? 'btn-primary-glow' : 'btn-outline-modern'}
                  onClick={() => handlePricingClick(plan.name)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Yönlendiriliyor...' : 'Hemen Başla'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>İşletmenizi Büyütmeye Hazır Mısınız?</h2>
          <p>Kredi kartı gerekmeden 14 gün boyunca tüm özellikleri ücretsiz deneyin.</p>
          <div className="cta-buttons">
            <button className="btn-glow-large" onClick={() => navigate('/register')}>Ücretsiz Denemeye Başla</button>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Landing;