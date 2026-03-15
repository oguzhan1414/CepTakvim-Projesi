import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiBookOpen, FiVideo, FiCreditCard, 
  FiArrowLeft, FiPlayCircle, FiCheckCircle, FiChevronRight,
  FiCalendar, FiUsers, FiSettings
} from 'react-icons/fi';
import './Help.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Detaya girince en üste kaydır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedArticle]);

  // Scroll Animasyonu (Aşağı kaydırdıkça kartların belirmesi)
  useEffect(() => {
    if (selectedArticle) return; // Detay modundayken çalıştırma

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.clean-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [selectedArticle]);

  // 🚀 6 ADET DETAYLI VE ZENGİN İÇERİKLİ MAKALELER
  const helpData = [
    {
      icon: <FiSettings />,
      title: "Başlangıç ve Ayarlar",
      description: "Sistemi işletmenize uygun hale getirin.",
      articles: [
        {
          id: "start-1",
          categoryName: "Başlangıç ve Ayarlar",
          title: "Sisteme İlk Giriş ve İşletme Profili Ayarları",
          type: "video",
          readTime: "4 dk",
          content: "CepTakvim'e hoş geldiniz! İşletmenizin dijital vitrinini oluşturmak ilk ve en önemli adımdır. Müşterileriniz online randevu alırken sizin logonuzu, adresinizi ve çalışma saatlerinizi görecek. Bu videomuzda, sistemdeki temel ayarları nasıl eksiksiz yapacağınızı anlatıyoruz.",
          steps: [
            "Sol menüden 'Ayarlar' ve ardından 'İşletme Profili' sekmesine gidin.",
            "İşletme adınızı, telefonunuzu ve açık adresinizi girin.",
            "Markanızı yansıtan yüksek çözünürlüklü logonuzu yükleyin.",
            "Çalışma günlerinizi ve saatlerinizi seçip 'Kaydet' butonuna basın."
          ]
        },
        {
          id: "start-2",
          categoryName: "Başlangıç ve Ayarlar",
          title: "Personel Ekleme ve Yetkilendirme",
          type: "video",
          readTime: "5 dk",
          content: "İşletmenizde çalışan her personel için ayrı bir takvim ve performans raporu tutabilirsiniz. Personellerinizin sunduğu hizmetleri, çalışma saatlerini ve prim oranlarını ayarlayarak karmaşaya son verin.",
          steps: [
            "Ayarlar menüsünden 'Personel Yönetimi'ne tıklayın.",
            "'Yeni Personel Ekle' butonuna basarak personelin bilgilerini girin.",
            "Personelin verebileceği hizmetleri (Örn: Sadece saç kesimi ve boya) işaretleyin.",
            "Sisteme giriş yapabilmesi için ona özel bir şifre belirleyin."
          ]
        }
      ]
    },
    {
      icon: <FiCalendar />,
      title: "Takvim ve Randevu",
      description: "Randevularınızı çakışmadan yönetin.",
      articles: [
        {
          id: "cal-1",
          categoryName: "Takvim ve Randevu",
          title: "Takvim Üzerinden Yeni Randevu Oluşturma",
          type: "video",
          readTime: "3 dk",
          content: "Telefonda randevu verirken kağıt kalem aramanıza gerek yok. Gelişmiş takvim modülümüz sayesinde boş saatleri anında görebilir ve sürükle-bırak mantığıyla saniyeler içinde yeni bir randevu oluşturabilirsiniz.",
          steps: [
            "Sol menüden 'Takvim' sayfasına girin.",
            "Müşterinin istediği gün ve saate tıklayın.",
            "Açılan pencerede kayıtlı müşteriyi seçin (veya anında yenisini ekleyin).",
            "Uygulanacak hizmeti ve personeli seçip 'Randevu Oluştur'a tıklayın."
          ]
        },
        {
          id: "cal-2",
          categoryName: "Takvim ve Randevu",
          title: "Otomatik SMS ve WhatsApp Hatırlatmaları",
          type: "text",
          readTime: "4 dk",
          content: "Müşterilerin randevularına gelmemesi (no-show) ciddi bir ciro kaybıdır. CepTakvim, müşterilerinize randevudan 24 saat ve 2 saat önce otomatik hatırlatma mesajları göndererek bu oranı %98 azaltır.",
          steps: [
            "Ayarlar > Bildirimler sekmesine gidin.",
            "WhatsApp API veya SMS entegrasyonunu aktif hale getirin.",
            "'24 Saat Önce Hatırlat' ve '2 Saat Önce Hatırlat' seçeneklerini açın.",
            "Gönderilecek mesaj şablonunu işletmenize göre özelleştirin."
          ]
        }
      ]
    },
    {
      icon: <FiUsers />,
      title: "Müşteri CRM ve Finans",
      description: "Müşteri sadakatini ve gelirinizi artırın.",
      articles: [
        {
          id: "crm-1",
          categoryName: "Müşteri CRM ve Finans",
          title: "Müşteri CRM Ekranı: Sadakati Artıran Notlar",
          type: "text",
          readTime: "5 dk",
          content: "Müşteriniz kapıdan içeri girdiğinde onun kahvesini nasıl sevdiğini veya alerjisi olan ürünleri bilmeniz, harika bir prestij yaratır. CRM sistemimiz, her müşteri için özel notlar tutmanızı ve geçmişteki tüm randevularını tek ekranda görmenizi sağlar.",
          steps: [
            "Sol menüden 'Müşteriler' sekmesine girin ve bir müşterinin ismine tıklayın.",
            "Açılan detay panelinde müşterinin bugüne kadar size ne kadar kazandırdığını inceleyin.",
            "'Özel Notlar' kısmına müşteriyle ilgili önemli detayları yazın.",
            "Geçmişte aldığı hizmetlerin analizini yaparak ona yeni kampanyalar sunun."
          ]
        },
        {
          id: "fin-1",
          categoryName: "Müşteri CRM ve Finans",
          title: "Iyzico ile Online Ön Ödeme (Kapora) Alma",
          type: "video",
          readTime: "6 dk",
          content: "Özellikle bayram ve hafta sonu gibi yoğun günlerde sahte randevularla takviminizi meşgul edenleri engellemek için mükemmel bir çözüm! Iyzico altyapısıyla müşterilerinizden online randevu sırasında kapora alabilirsiniz.",
          steps: [
            "Ayarlar > Fatura ve Ödeme sekmesine girerek Iyzico API ve Secret Key bilgilerinizi yapıştırın.",
            "'Ön Ödeme (Kapora) Zorunluluğu' seçeneğini aktif edin.",
            "Alınacak kapora oranını (Örn: %20 veya %50) belirleyin.",
            "Artık müşterileriniz online randevu alırken kredi kartıyla bu bedeli güvenle ödeyecekler."
          ]
        }
      ]
    }
  ];

  // Arama Filtresi
  const filteredData = helpData.map(category => {
    const filteredArticles = category.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, articles: filteredArticles };
  }).filter(category => category.articles.length > 0);

  // === MAKALEYİ OKUMA MODU (DETAY EKRANI) ===
  if (selectedArticle) {
    return (
      <div className="help-light-theme detail-view">
        <div className="help-container">
          
          <div className="article-top-nav">
            <button className="back-link" onClick={() => setSelectedArticle(null)}>
              <FiArrowLeft /> Yardım Merkezine Dön
            </button>
            {/* Ekmek Kırıntısı (Breadcrumb) */}
            <div className="article-breadcrumb">
              Yardım Merkezi <FiChevronRight /> {selectedArticle.categoryName} <FiChevronRight /> <span className="active-bread">{selectedArticle.title.substring(0, 20)}...</span>
            </div>
          </div>

          <article className="clean-article">
            <header className="clean-article-header">
              <span className="article-type-badge">
                {selectedArticle.type === 'video' ? <><FiVideo /> Video Eğitim</> : <><FiBookOpen /> Metin Rehber</>}
              </span>
              <h1 className="clean-title">{selectedArticle.title}</h1>
              <p className="article-read-time">Tahmini Okuma Süresi: {selectedArticle.readTime}</p>
            </header>

            {/* VİDEO OYNATICI (Sadece Video türündeyse) */}
            {selectedArticle.type === 'video' && (
              <div className="video-player-mockup">
                <div className="video-overlay">
                  <button className="play-button"><FiPlayCircle /></button>
                  <p>Eğitim videosu yükleniyor...</p>
                </div>
              </div>
            )}

            <section className="clean-content">
              <p>{selectedArticle.content}</p>
              
              {selectedArticle.steps && (
                <div className="article-steps">
                  <h3>Nasıl Yapılır? (Adım Adım):</h3>
                  <ul>
                    {selectedArticle.steps.map((step, index) => (
                      <li key={index}><FiCheckCircle className="step-icon" /> {step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            
            {/* Canlı Destek Yönlendirmesi */}
            <div className="article-support-nudge">
              <div className="nudge-content">
                <h4>Sorununuzu Çözemediniz mi?</h4>
                <p>Destek ekibimiz hesap kurulumunuzu sizin için ücretsiz yapabilir.</p>
              </div>
              <button className="nudge-btn" onClick={() => window.open('https://wa.me/905304969210', '_blank')}>
                WhatsApp'tan Yaz
              </button>
            </div>

          </article>
        </div>
      </div>
    );
  }

  // === ANA LİSTE GÖRÜNÜMÜ ===
  return (
    <div className="help-light-theme">
      <div className="help-container">
        
        <header className="help-hero">
          <h1>Nasıl yardımcı olabiliriz?</h1>
          <p>CepTakvim sistemini verimli kullanmak için aradığınız tüm cevaplar burada.</p>
          
          <div className="help-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Dokümanlarda ara (Örn: Randevu, Personel, Iyzico...)" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="clean-grid">
          {filteredData.length > 0 ? (
            filteredData.map((category, index) => (
              <div key={index} className="clean-card">
                <div className="card-top-section">
                  <div className="card-icon">{category.icon}</div>
                  <h2 className="card-heading">{category.title}</h2>
                  <p className="card-summary">{category.description}</p>
                </div>
                
                <div className="card-article-list">
                  <ul>
                    {category.articles.map((article) => (
                      <li key={article.id} onClick={() => setSelectedArticle(article)}>
                        <span className="article-link">
                          {article.type === 'video' ? <FiVideo className="type-icon"/> : <FiBookOpen className="type-icon"/>}
                          {article.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <FiSearch className="no-results-icon" />
              <h3>Sonuç bulunamadı</h3>
              <p>"{searchQuery}" aramasıyla eşleşen bir eğitim bulamadık. Farklı kelimelerle deneyin.</p>
            </div>
          )}
        </div>

        <div className="help-footer">
          <h3>Hala yardıma mı ihtiyacınız var?</h3>
          <p>Müşteri temsilcilerimiz 7/24 size yardımcı olmaktan mutluluk duyacaktır.</p>
          <div className="help-buttons">
            <button className="help-btn primary" onClick={() => window.location.href = '/contact'}>
              Bize Ulaşın
            </button>
            <button className="help-btn secondary" onClick={() => window.open('https://wa.me/905304969210', '_blank')}>
              WhatsApp Destek
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;