const mongoose = require('mongoose');
const { setServers } = require('dns');

// DNS çözümleme sorunları için Google ve Cloudflare DNS sunucularını ayarla
try {
  setServers(['1.1.1.1', '8.8.8.8']);
} catch (error) {
  console.log("DNS sunucuları ayarlanamadı, sistem varsayılanları kullanılıyor.");
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`📦 MongoDB Local Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1); // Hata olursa sunucuyu güvenlice durdur
  }
};

module.exports = connectDB;