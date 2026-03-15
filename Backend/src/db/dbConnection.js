const mongoose = require('mongoose');

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