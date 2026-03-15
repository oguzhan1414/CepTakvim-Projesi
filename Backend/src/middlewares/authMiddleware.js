const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

// protect (Koru) adında bir güvenlik fonksiyonu oluşturuyoruz
const 

protect = async (req, res, next) => {
  let token;

  // 1. İstek (Request) başlığında 'Authorization' var mı ve 'Bearer' ile mi başlıyor kontrol et
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Token'ı al (Örn: "Bearer eyJhbGci..." stringini boşluktan bölüp 2. kısmı yani token'ı alıyoruz)
      token = req.headers.authorization.split(' ')[1];

      // 3. Token'ın sahte olup olmadığını veya süresinin dolup dolmadığını gizli anahtarımızla çöz
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Token geçerliyse, içindeki ID'den işletmeyi bul ve "req.business" içine kaydet.
      // ".select('-password')" diyerek güvenlik için şifreyi dışarıda bırakıyoruz.
      req.business = await Business.findById(decoded.id).select('-password');

      // 5. Her şey yolunda! Güvenlik kontrolü bitti, sıradaki işleme (Controller'a) geçebilirsin:
      next();
      
    } catch (error) {
      console.error('Token Hatası:', error.message);
      res.status(401).json({ success: false, message: 'Yetkisiz erişim! Token geçersiz veya süresi dolmuş.' });
    }
  }

  // Eğer hiç token gönderilmemişse
  if (!token) {
    res.status(401).json({ success: false, message: 'Yetkisiz erişim! Lütfen giriş yapın (Token bulunamadı).' });
  }
};

module.exports = { protect };