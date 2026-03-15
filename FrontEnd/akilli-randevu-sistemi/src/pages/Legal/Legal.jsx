import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout/MainLayout';
import './Legal.css';

const Legal = () => {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    
      <div className="legal-page">
        <div className="legal-header">
          <h1>Yasal Bilgiler</h1>
          <p>Şeffaflık ve güven ilkesiyle hazırlanmış yasal metinlerimiz</p>
        </div>

        <div className="legal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Kullanım Koşulları
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Gizlilik Politikası
          </button>
          <button 
            className={`tab-btn ${activeTab === 'kvkk' ? 'active' : ''}`}
            onClick={() => setActiveTab('kvkk')}
          >
            KVKK Aydınlatma Metni
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cookie' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookie')}
          >
            Çerez Politikası
          </button>
        </div>

        <div className="legal-content">
          {activeTab === 'terms' && (
            <div className="legal-section">
              <h2>Kullanım Koşulları</h2>
              <p className="last-updated">Son güncelleme: 15 Mart 2024</p>
              
              <h3>1. Genel Hükümler</h3>
              <p>CepTakvim olarak, size en iyi hizmeti sunabilmek için çalışıyoruz. Bu kullanım koşulları, platformumuzu kullanırken uymanız gereken kuralları ve sorumlulukları belirtir.</p>
              
              <h3>2. Hesap Güvenliği</h3>
              <p>Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın ve düzenli olarak değiştirin. Şüpheli bir aktivite fark ederseniz hemen bize bildirin.</p>
              
              <h3>3. Hizmet Kullanımı</h3>
              <p>Platformumuzu yasal amaçlar dışında kullanamazsınız. Başka kullanıcıların verilerini izinsiz toplayamaz, sisteme zarar verecek işlemler yapamazsınız.</p>
              
              <h3>4. Faturalandırma</h3>
              <p>Abonelik ücretleri her ayın başında otomatik olarak tahsil edilir. İptal talepleriniz fatura dönemi bitiminde geçerli olur.</p>
              
              <h3>5. Fikri Mülkiyet</h3>
              <p>Platformda yer alan tüm içerik, yazılım, tasarım ve markalar CepTakvime aittir. İzinsiz kopyalanamaz, dağıtılamaz.</p>
              
              <h3>6. Değişiklikler</h3>
              <p>Kullanım koşullarında yapılacak değişiklikler 30 gün önceden bildirilecektir.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="legal-section">
              <h2>Gizlilik Politikası</h2>
              <p className="last-updated">Son güncelleme: 15 Mart 2024</p>
              
              <h3>Veri Toplama</h3>
              <p>Size hizmet verebilmek için ad, soyad, e-posta, telefon numarası gibi bilgilerinizi topluyoruz. Bu bilgiler sadece randevu yönetimi ve iletişim için kullanılır.</p>
              
              <h3>Veri Kullanımı</h3>
              <p>Topladığımız verileri şu amaçlarla kullanırız:
                • Randevu hatırlatmaları göndermek
                • Hizmetlerimizi iyileştirmek
                • Yasal yükümlülüklerimizi yerine getirmek
                • Müşteri desteği sağlamak</p>
              
              <h3>Veri Paylaşımı</h3>
              <p>Verileriniz üçüncü taraflarla kesinlikle paylaşılmaz. Sadece yasal zorunluluk hallerinde yetkili kurumlarla paylaşılabilir.</p>
              
              <h3>Veri Güvenliği</h3>
              <p>Verileriniz 256-bit SSL şifreleme ile korunur. Düzenli güvenlik testleri ve güncellemeler yapılır.</p>
              
              <h3>Çerezler</h3>
              <p>Site deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tarayıcı ayarlarından çerezleri yönetebilirsiniz.</p>
              
              <h3>Haklarınız</h3>
              <p>Verilerinize erişme, düzeltme, silme ve taşıma hakkına sahipsiniz. Talepleriniz için info@ceptakvim.com adresine e-posta gönderebilirsiniz.</p>
            </div>
          )}

          {activeTab === 'kvkk' && (
            <div className="legal-section">
              <h2>KVKK Aydınlatma Metni</h2>
              <p className="last-updated">Son güncelleme: 15 Mart 2024</p>
              
              <h3>Veri Sorumlusu</h3>
              <p>CepTakvim olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.</p>
              
              <h3>İşlenen Veriler</h3>
              <p>• Kimlik bilgileri (ad, soyad)
                 • İletişim bilgileri (e-posta, telefon)
                 • İşlem bilgileri (randevu geçmişi, ödeme bilgileri)
                 • Log kayıtları (IP adresi, cihaz bilgileri)</p>
              
              <h3>Veri İşleme Amaçları</h3>
              <p>Verileriniz şu amaçlarla işlenmektedir:
                 • Hizmet sunumu ve kalite takibi
                 • Müşteri memnuniyeti ve destek hizmetleri
                 • Yasal yükümlülükler
                 • Pazarlama faaliyetleri (onay verilmesi halinde)</p>
              
              <h3>Veri Aktarımı</h3>
              <p>Verileriniz yurt içinde, güvenli sunucularda saklanır. Yurt dışına veri aktarımı yapılmaz.</p>
              
              <h3>Haklarınız</h3>
              <p>KVKK'nın 11. maddesi uyarınca:
                 • Veri işlenip işlenmediğini öğrenme
                 • Verilerinize erişim talep etme
                 • Düzeltme, silme veya yok etme talep etme
                 • İtiraz etme ve zararın giderilmesini talep etme</p>
              
              <p>Talepleriniz için <a href="mailto:kvkk@ceptakvim.com">kvkk@ceptakvim.com</a> adresine e-posta gönderebilirsiniz.</p>
            </div>
          )}

          {activeTab === 'cookie' && (
            <div className="legal-section">
              <h2>Çerez Politikası</h2>
              <p className="last-updated">Son güncelleme: 15 Mart 2024</p>
              
              <h3>Çerez Nedir?</h3>
              <p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Size daha iyi bir kullanıcı deneyimi sunmak için kullanılır.</p>
              
              <h3>Kullandığımız Çerez Türleri</h3>
              <p><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için gereklidir. Oturum açma, güvenlik gibi temel işlevleri sağlar.</p>
              <p><strong>Performans Çerezleri:</strong> Sitemizin nasıl kullanıldığını analiz etmemize yardımcı olur. Hangi sayfaların daha çok ziyaret edildiğini gösterir.</p>
              <p><strong>Fonksiyonel Çerezler:</strong> Tercihlerinizi hatırlayarak size kişiselleştirilmiş bir deneyim sunar.</p>
              <p><strong>Reklam Çerezleri:</strong> İlgi alanlarınıza uygun reklamlar göstermek için kullanılır.</p>
              
              <h3>Çerez Yönetimi</h3>
              <p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda sitemizin bazı özellikleri düzgün çalışmayabilir.</p>
              
              <h3>Üçüncü Taraf Çerezleri</h3>
              <p>Analitik ve reklam hizmetleri için Google Analytics, Facebook Pixel gibi üçüncü taraf çerezleri kullanıyoruz. Bu şirketlerin kendi gizlilik politikaları geçerlidir.</p>
              
              <h3>Onayınız</h3>
              <p>İlk ziyaretinizde çerez kullanımına dair onayınızı soruyoruz. Dilediğiniz zaman tarayıcı ayarlarından onayınızı geri çekebilirsiniz.</p>
            </div>
          )}
        </div>

        <div className="legal-contact">
          <p>Herhangi bir sorunuz varsa bize ulaşın:</p>
          <a href="mailto:legal@ceptakvim.com" className="legal-email">oguzhansekerci14@gmail.com</a>
        </div>
      </div>

  );
};

export default Legal;