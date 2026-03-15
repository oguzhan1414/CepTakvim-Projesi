import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiCalendar, FiArrowLeft, FiShare2, FiChevronRight, FiUser } from 'react-icons/fi';
import './Blog.css';

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Sayfanın en üstüne kaydırma (Detaya girince)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPost]);

  // Scroll Animasyonu (Aşağı kaydırdıkça kartların belirmesi)
  useEffect(() => {
    if (selectedPost) return; // Sadece liste görünümünde çalışsın

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 } // Kartın %10'u ekrana girince animasyon başlar
    );

    const cards = document.querySelectorAll('.clean-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [selectedPost]);

  // Genişletilmiş ve Uzun Açıklamalı 8 Makale
  const posts = [
    {
      id: 1,
      title: "Yapay Zeka ile Randevu Yönetiminde Devrim",
      date: "15 Mart 2026",
      category: "Teknoloji",
      author: "Oğuzhan Şekerci",
      excerpt: "Geleneksel defterler tarih oluyor. CepTakvi'min yapay zeka asistanı, müşterilerinizin alışkanlıklarını analiz ederek işletmenize 7/24 hizmet veren dijital bir sekreter kazandırıyor. İşletmeniz uyurken bile randevu alın, çakışmaları önleyin ve verimliliği zirveye taşıyın.",
      image: "🤖",
      coverColor: "#f3f4f6", 
      readTime: "5 dk",
      contentBlocks: [
        { type: 'h2', text: 'Geleneksel Yöntemlerin Sonu' },
        { type: 'p', text: 'Geleneksel randevu defterleri artık tarih oldu. Müşteri bilgilerinin kaybolması, yanlış saatlere yazılan randevular ve hatırlatılmayan iptaller işletmelere her ay binlerce lira kaybettiriyor.' },
        { type: 'p', text: 'Yapay zeka destekli akıllı asistanlar, müşterilerinizin alışkanlıklarını analiz ederek onlara en uygun saatleri öneriyor. Sadece randevu vermekle kalmıyor, iptal olma ihtimali yüksek randevuları önceden tespit edip size uyarı gönderiyor.' },
        { type: 'h2', text: '7/24 Çalışan Dijital Asistanınız' },
        { type: 'p', text: 'İşletmenizde 7/24 çalışan, hiç uyumayan ve maaş istemeyen bir asistanınız olduğunu düşünün. İşte yapay zeka tam olarak bunu sağlıyor. Müşterileriniz gece yarısı bile sisteminize girip anında onay alabilir.' }
      ]
    },
    {
      id: 2,
      title: "Randevu Kaçaklarını %98 Azaltmanın Kanıtlanmış Yolları",
      date: "10 Mart 2026",
      category: "İşletme Yönetimi",
      author: "Oğuzhan Şekerci",
      excerpt: "Müşterilerin randevularına gelmemesi (no-show) işletmelerin en büyük gizli maliyetidir. İki aşamalı SMS ve WhatsApp hatırlatma kurgularıyla bu oranı nasıl sıfıra indireceğinizi ve müşteri ilişkilerinizi zedelemeden nasıl teyit alacağınızı anlatıyoruz.",
      image: "⏰",
      coverColor: "#fef2f2", 
      readTime: "4 dk",
      contentBlocks: [
        { type: 'h2', text: 'No-Show İşletmenizi Nasıl Etkiliyor?' },
        { type: 'p', text: 'Bir müşterinin randevusuna gelmemesi, o saat diliminde kazanabileceğiniz paranın doğrudan çöpe gitmesi demektir. Üstelik o saati bekleyen başka bir müşteriyi de geri çevirmiş olabilirsiniz.' },
        { type: 'h2', text: 'Çözüm: Çoklu Hatırlatma Stratejisi' },
        { type: 'p', text: 'Araştırmalara göre, randevudan 24 saat ve 2 saat önce gönderilen otomatik SMS ve WhatsApp hatırlatmaları, gelmeme oranlarını %98 oranında azaltıyor. Müşterilerinize değer verdiğinizi hissettirirken, kendi zamanınızı da güvence altına alırsınız.' }
      ]
    },
    {
      id: 3,
      title: "Iyzico ile Ön Ödeme Alarak Gelirinizi Garantileyin",
      date: "5 Mart 2026",
      category: "Finans",
      author: "Oğuzhan Şekerci",
      excerpt: "Özellikle bayram ve hafta sonu gibi yoğun dönemlerde alınan sahte randevular tüm planınızı bozabilir. Iyzico altyapısını kullanarak randevu anında kapora tahsil etmenin işletmenize kazandıracağı prestij ve finansal güvenlik adımlarını inceledik.",
      image: "💳",
      coverColor: "#f0fdf4", 
      readTime: "6 dk",
      contentBlocks: [
        { type: 'h2', text: 'Sahte Randevulara Son Verin' },
        { type: 'p', text: 'Özellikle hafta sonu ve bayram önceleri gibi yoğun dönemlerde alınan sahte randevular büyük bir problemdir. Rakiplerinizin veya kötü niyetli kişilerin takviminizi doldurmasını engellemenin tek yolu kapora (ön ödeme) sistemidir.' },
        { type: 'h2', text: 'Iyzico Güvencesi' },
        { type: 'p', text: 'Sistemimize entegre ettiğimiz Iyzico altyapısı sayesinde, müşterilerinizden randevu anında %20 veya %50 gibi oranlarda ön ödeme alabilirsiniz. Bu işlem tamamen yasal, güvenli ve 3D Secure ile korunmaktadır.' }
      ]
    },
    {
      id: 4,
      title: "Dijital Dönüşüm: Salonlar İçin Altın Rehber",
      date: "1 Mart 2026",
      category: "Rehber",
      author: "Oğuzhan Şekerci",
      excerpt: "Defter ve kalem kullanmak size nostaljik gelebilir ancak büyümeyi hedeflerken verilerinizi buluta taşımak bir lüks değil zorunluluktur. Ekibinizi dijital sisteme nasıl adapte edeceğinize dair hiçbir teknik bilgi gerektirmeyen temel bir geçiş rehberi.",
      image: "📱",
      coverColor: "#eff6ff", 
      readTime: "8 dk",
      contentBlocks: [
        { type: 'h2', text: 'Defter ve Kaleme Veda Edin' },
        { type: 'p', text: 'Ajandaya yazılan notlar, dökülen kahvelerle silinen telefon numaraları... Bunlar artık geride kaldı. Dijitalleşme lüks değil, bir zorunluluktur.' },
        { type: 'p', text: 'Bir bulut sistemine geçmek, dünyanın her yerinden cep telefonunuzla dükkanınızın cirosunu ve randevularını görebilmenizi sağlar.' }
      ]
    },
    {
      id: 5,
      title: "Sosyal Medyadan Müşteri Çekme Stratejileri",
      date: "20 Şubat 2026",
      category: "Pazarlama",
      author: "Oğuzhan Şekerci",
      excerpt: "Binlerce Instagram ve TikTok takipçiniz olabilir, peki ama bunların kaçı koltuğunuza oturup size ödeme yapıyor? Sosyal medya profillerinize ekleyeceğiniz 'Online Randevu' linkleri ile takipçileri saniyeler içinde nasıl sadık müşterilere dönüştürebilirsiniz?",
      image: "📸",
      coverColor: "#fdf4ff", // Açık pembe/mor
      readTime: "7 dk",
      contentBlocks: [
        { type: 'h2', text: 'Beğeniler Karın Doyurmaz' },
        { type: 'p', text: 'Sosyal medyada fenomen olmak güzeldir, ancak günün sonunda asıl önemli olan o insanların işletmenizden hizmet almasıdır. Instagram profiliniz sadece bir vitrin değil, aynı zamanda kasanız olmalıdır.' },
        { type: 'h2', text: 'Sürtünmesiz Randevu Deneyimi' },
        { type: 'p', text: 'Müşteri harika bir saç kesimi veya cilt bakımı videosu gördüğünde, heyecanı sönmeden hemen randevu alabilmelidir. Profilinizdeki "Bize DM atın" yazısı, müşterinin ilgisini kaybetmesine neden olur. Bunun yerine doğrudan CepTakvim linkinizi koyarak sürtünmesiz bir geçiş sağlayın.' }
      ]
    },
    {
      id: 6,
      title: "Müşteri Sadakati: Neden Geri Dönmüyorlar?",
      date: "12 Şubat 2026",
      category: "Analiz",
      author: "Oğuzhan Şekerci",
      excerpt: "İşletmenize ilk kez gelen bir müşteriyi kazanmak, onu elinizde tutmaktan beş kat daha pahalıdır. Peki bazı müşteriler neden ikinci kez sizden randevu almıyor? Detaylı CRM profillemesi ve doğum günü kampanyaları ile sadakati sağlamanın formülleri.",
      image: "❤️",
      coverColor: "#fff1f2", // Gül kurusu
      readTime: "5 dk",
      contentBlocks: [
        { type: 'h2', text: 'İlk İzlenim Önemlidir, İkincisi Hayatidir' },
        { type: 'p', text: 'Müşteri size geldiğinde sadece hizmet almaz, bir deneyim yaşar. CRM (Müşteri İlişkileri Yönetimi) sistemleri sayesinde müşterilerinizin ne kahvesi içtiğini, önceki işlemlerinde hangi ürünleri kullandığınızı not edebilirsiniz.' },
        { type: 'p', text: 'Aylarca gelmeyen müşterileri tespit edip onlara özel "Sizi özledik" kampanyaları düzenlemek, boş saatlerinizi doldurmanın en etkili yoludur.' }
      ]
    },
    {
      id: 7,
      title: "Salon ve Klinikler İçin Dekorasyon İpuçları",
      date: "5 Şubat 2026",
      category: "İlham",
      author: "Oğuzhan Şekerci",
      excerpt: "Müşterilerinizin sosyal medyada paylaşmaya doyamayacağı bir mekan tasarlamak ister misiniz? Aydınlatma seçimlerinden, bekleme salonu konforuna kadar yeni nesil işletmelerin iç mimari ve dekorasyon sırlarını derledik.",
      image: "✨",
      coverColor: "#fffbeb", // Açık sarı
      readTime: "4 dk",
      contentBlocks: [
        { type: 'h2', text: 'Işıklandırma Her Şeydir' },
        { type: 'p', text: 'Özellikle güzellik salonları ve kliniklerde doğru ışıklandırma, yapılan işlemin kalitesini doğrudan yansıtır. Sosyal medyada paylaşılacak fotoğraflar için doğru bir selfie köşesi hazırlamak size bedava reklam sağlar.' }
      ]
    },
    {
      id: 8,
      title: "2026 Güzellik ve Kişisel Bakım Trendleri",
      date: "28 Ocak 2026",
      category: "Trendler",
      author: "Oğuzhan Şekerci",
      excerpt: "Bu yıl müşterileriniz sizden hangi yeni hizmetleri talep edecek? Hızlı ekspres bakımlardan, organik ürün kullanımlarına kadar sektörün gittiği yönü önceden görüp menünüze eklemeniz gereken popüler hizmetler listesi.",
      image: "🌿",
      coverColor: "#f4fde8", // Açık doğal yeşil
      readTime: "3 dk",
      contentBlocks: [
        { type: 'h2', text: 'Doğallığa Dönüş' },
        { type: 'p', text: 'Kimyasal ürünlerden kaçış bu yıl zirveye ulaşıyor. İşletmenizde organik ve vegan hizmet menüleri oluşturarak gelir grubunu ve müşteri kitlenizi genişletebilirsiniz.' }
      ]
    }
  ];

  // PAYLAŞMA FONKSİYONU
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedPost.title,
          text: selectedPost.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Paylaşım iptal edildi.');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Makale bağlantısı kopyalandı!');
    }
  };

  // DETAY (OKUMA) MODU
  if (selectedPost) {
    return (
      <div className="blog-light-theme detail-view">
        <div className="blog-container">
          <div className="article-top-nav">
            <button className="back-link" onClick={() => setSelectedPost(null)}>
              <FiArrowLeft /> Blog Ana Sayfaya Dön
            </button>
            <button className="share-icon-btn" title="Paylaş" onClick={handleShare}>
              <FiShare2 />
            </button>
          </div>

          <article className="clean-article">
            <header className="clean-article-header">
              <span className="clean-category">{selectedPost.category}</span>
              <h1 className="clean-title">{selectedPost.title}</h1>
              <p className="clean-excerpt">{selectedPost.excerpt}</p>
              
              <div className="clean-meta">
                <div className="author-info">
                  <div className="author-avatar"><FiUser /></div>
                  <div>
                    <span className="author-name">{selectedPost.author}</span>
                    <span className="post-date">{selectedPost.date} · {selectedPost.readTime} okuma</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="clean-cover" style={{ backgroundColor: selectedPost.coverColor }}>
              <span className="cover-icon">{selectedPost.image}</span>
            </div>

            <div className="clean-content">
              {selectedPost.contentBlocks.map((block, index) => {
                if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
                if (block.type === 'p') return <p key={index}>{block.text}</p>;
                if (block.type === 'ul') return (
                  <ul key={index}>
                    {block.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                );
                return null;
              })}

              <div className="article-call-to-action">
                <h3>Siz De İşletmenizi Büyütün</h3>
                <p>Binlerce mutlu işletmenin arasına katılmak ve bu teknolojileri hemen kullanmak için CepTakvimi ücretsiz deneyin.</p>
                <button className="cta-btn" onClick={() => window.location.href = '/register'}>Ücretsiz Başla</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // LİSTE GÖRÜNÜMÜ
  return (
    <div className="blog-light-theme">
      <div className="blog-container">
        
        <header className="blog-hero">
          <h1>İşletme Rehberi ve Blog</h1>
          <p>Dijital dönüşüm, randevu yönetimi ve işinizi büyütecek en güncel stratejiler.</p>
        </header>

        <div className="clean-grid">
          {posts.map(post => (
            <article key={post.id} className="clean-card" onClick={() => setSelectedPost(post)}>
              <div className="card-image-box" style={{ backgroundColor: post.coverColor }}>
                <span className="card-emoji">{post.image}</span>
              </div>
              
              <div className="card-body">
                <span className="card-tag">{post.category}</span>
                <h2 className="card-heading">{post.title}</h2>
                <p className="card-summary">{post.excerpt}</p>
                
                <div className="card-footer">
                  <div className="card-author">
                    <span className="author-text">{post.author}</span>
                    <span className="date-text">{post.date}</span>
                  </div>
                  <span className="read-more-text">
                    Oku <FiChevronRight />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Blog;