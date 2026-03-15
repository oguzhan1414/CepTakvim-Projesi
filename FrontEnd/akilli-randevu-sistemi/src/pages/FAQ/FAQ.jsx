import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout/MainLayout';
import { FiChevronDown } from 'react-icons/fi';
import './FAQ.css';

const FAQ = () => {
  const [openItems, setOpenItems] = useState([]);

  const faqs = [
    {
      category: "Genel Sorular",
      items: [
        {
          question: "CepTakvim nedir?",
          answer: "CepTakvim, işletmeler için yapay zeka destekli akıllı randevu yönetim sistemidir. Müşterilerinizin online randevu almasını sağlar, otomatik hatırlatmalar gönderir ve işletme performansınızı analiz eder."
        },
        {
          question: "Ücretsiz deneme süresi var mı?",
          answer: "Evet! 14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz. Kredi kartı bilgisi gerekmez."
        },
        {
          question: "Hangi işletmeler kullanabilir?",
          answer: "Kuaför, güzellik merkezi, diş kliniği, doktor muayenehanesi, spa, fitness salonu gibi randevuyla çalışan tüm işletmeler kullanabilir."
        }
      ]
    },
    {
      category: "Özellikler",
      items: [
        {
          question: "Yapay zeka asistanı ne işe yarar?",
          answer: "AI asistanımız, randevu çakışmalarını önler, boş saatleri doldurmak için öneriler sunar, no-show riskini hesaplar ve müşteri davranışlarını analiz eder."
        },
        {
          question: "WhatsApp entegrasyonu nasıl çalışır?",
          answer: "Müşterileriniz WhatsApp üzerinden randevu alabilir, hatırlatma mesajları alabilir ve sizinle iletişime geçebilir. Tüm yazışmalar tek panelden yönetilir."
        },
        {
          question: "Raporlama özellikleri nelerdir?",
          answer: "Günlük, haftalık, aylık gelir raporları, en çok tercih edilen hizmetler, müşteri sadakat analizi, doluluk oranları ve personel performans raporları."
        }
      ]
    },
    {
      category: "Fiyatlandırma",
      items: [
        {
          question: "Fiyatlar KDV dahil mi?",
          answer: "Evet, tüm fiyatlarımıza KDV dahildir."
        },
        {
          question: "İptal ve iade politikası nedir?",
          answer: "14 gün içinde memnun kalmazsanız, koşulsuz iade garantisi veriyoruz. İptal talebiniz anında işleme alınır."
        },
        {
          question: "Yıllık ödemede indirim var mı?",
          answer: "Evet, yıllık ödemelerde 2 ay ücretsiz! Yani yıllık paketlerde %16 indirim kazanırsınız."
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  return (
    
      <div className="faq-page">
        <div className="faq-header">
          <h1>Sık Sorulan Sorular</h1>
          <p>Aklınıza takılan her şeyin cevabı burada</p>
        </div>

        <div className="faq-container">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.items.map((item, itemIndex) => {
                  const isOpen = openItems.includes(`${categoryIndex}-${itemIndex}`);
                  return (
                    <div key={itemIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                      <button 
                        className="faq-question"
                        onClick={() => toggleItem(categoryIndex, itemIndex)}
                      >
                        <span>{item.question}</span>
                        <FiChevronDown className={`arrow ${isOpen ? 'open' : ''}`} />
                      </button>
                      <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>Hala sorunuz mu var?</h3>
          <p>Size yardımcı olmaktan mutluluk duyarız.</p>
          <button className="contact-btn" onClick={() => window.location.href = '/contact'}>
            İletişime Geç
          </button>
        </div>
      </div>
    
  );
};

export default FAQ;