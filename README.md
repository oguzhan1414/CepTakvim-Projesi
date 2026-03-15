# CepTakvim-Projesi

📅 CepTakvim - Akıllı Randevu ve İşletme Yönetim Sistemi (Mini ERP)CepTakvim, işletmelerin ve profesyonellerin randevu süreçlerini dijitalleştiren, aynı zamanda temel işletme yönetimi (Mini ERP) ihtiyaçlarını karşılayan kapsamlı bir sistemdir. Hem web hem de mobil platformlarda entegre çalışarak işletme sahiplerine, personele ve müşterilere kesintisiz bir deneyim sunar.🚀 ÖzelliklerÇoklu Platform Desteği: Yönetim ve raporlama için güçlü bir Web paneli, günlük kullanım ve müşteriler için akıcı bir Mobil uygulama.Gelişmiş Randevu Yönetimi: Takvim üzerinden kolay randevu oluşturma, düzenleme ve iptal etme.Rol Bazlı Yetkilendirme: Yönetici, personel ve müşteri gibi farklı kullanıcı profilleri için özel erişim seviyeleri.Gerçek Zamanlı Senkronizasyon: Mobil ve web platformları arasında anlık veri akışı.İşletme Yönetimi (Mini ERP): Hizmet/ürün tanımlama, personel yönetimi ve temel performans takibi.🛠️ Kullanılan TeknolojilerProje, modern yazılım geliştirme standartlarına uygun olarak mikroservis mantığıyla ayrılmış üç ana bileşenden oluşmaktadır:Mobil Uygulama (Client)Dil: KotlinArayüz (UI): Jetpack ComposeMimari: MVVM (Model-View-ViewModel)Web Arayüzü (Frontend)Kütüphane: ReactDil: JavaScript / TypeScript (Kullanım durumuna göre güncelleyiniz)Durum Yönetimi: Redux veya Context APISunucu & Veritabanı (Backend)Çalışma Ortamı: Node.jsFramework: Express.jsVeritabanı: MongoDB (NoSQL)📁 Proje Klasör YapısıBashCepTakvim-Projesi/
├── backend/            # Node.js & Express API kaynak kodları
│   ├── models/         # MongoDB veritabanı şemaları
│   ├── routes/         # API uç noktaları (endpoints)
│   └── controllers/    # İş mantığı ve işlevler
├── frontend-web/       # React yönetim paneli kaynak kodları
│   ├── src/
│   │   ├── components/ # Yeniden kullanılabilir UI bileşenleri
│   │   └── pages/      # Web sayfaları
└── mobile-app/         # Kotlin & Jetpack Compose Android projesi
    └── app/src/main/   # Android kaynak kodları
⚙️ Kurulum ve ÇalıştırmaProjeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.Ön KoşullarNode.js (Backend ve Web için)MongoDB (Yerel veya Atlas)Android Studio (Mobil uygulama için)1. Backend KurulumuBash# Backend dizinine gidin
cd backend

# Gerekli paketleri yükleyin
npm install

# .env dosyasını oluşturun ve veritabanı bağlantı URI'nizi (MONGO_URI) ekleyin
# Sunucuyu başlatın
npm run dev
2. Web Frontend KurulumuBash# Frontend dizinine gidin
cd frontend-web

# Gerekli paketleri yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
3. Mobil Uygulama KurulumuAndroid Studio'yu açın.Open an existing Project seçeneğine tıklayın.Klonladığınız dizindeki mobile-app klasörünü seçin.Gradle senkronizasyonunun tamamlanmasını bekleyin.Bir emülatör veya fiziksel cihaz üzerinden projeyi çalıştırın (Run > Run 'app').📱 Ekran Görüntüleri(Projenin web ve mobil arayüzlerine ait ekran görüntülerini buraya ekleyebilirsin.)Web Yönetim PaneliMobil Uygulama - RandevuMobil Uygulama - Profil<img src="link_ekle" width="250"><img src="link_ekle" width="250"><img src="link_ekle" width="250">👨‍💻 GeliştiriciOğuzhan ŞekerciGitHub: @oguzhan1414LinkedIn: [Profil Linkini Buraya Ekle]📝 LisansBu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için LICENSE dosyasına göz atabilirsiniz.
