const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { filterXSS } = require('xss');

// Rotalar ve DB bağlantısı
const authRoutes = require('./src/routers/authRouters');
const connectDB = require('./src/db/dbConnection');
const serviceRoutes = require('./src/routers/serviceRoutes');
const businessRoutes = require('./src/routers/businessRoutes');
const staffRoutes = require('./src/routers/staffRouters');
const customerRoutes = require('./src/routers/customerRouters');
const appointmentRoutes = require('./src/routers/appointmentRoutes');
const dashboardRoutes = require('./src/routers/dashboardRoutes');
const publicRoutes = require('./src/routers/publicRoutes');
const notificationRoutes = require('./src/routers/notificationRoutes');
const contactRoutes = require('./src/routers/contactRoutes');
const paymentRoutes = require('./src/routers/paymentRoutes');

const app = express();

connectDB();

// 1. Temel Ayarlar ve Body Parser (ÖNCE BUNLAR GELMELİ!)
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // canlıya alırken domaini ekle
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Gelen veriyi (req.body) burada oluşturuyoruz

// 2. Güvenlik Middlewares
app.use(helmet());
app.use(hpp());

// 3. XSS TEMİZLEME MIDDLEWARE (Artık req.body dolu olduğu için çalışacak)
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const stringified = JSON.stringify(req.body);
    const cleaned = filterXSS(stringified);
    req.body = JSON.parse(cleaned);
  }
  next();
});

// 4. Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { mesaj: 'Çok fazla istek attınız, lütfen 15 dakika sonra tekrar deneyin.' }
});
app.use('/api/', limiter);

// --- ROTALAR ---
app.get('/', (req, res) => {
  res.json({ mesaj: '✨ CepTakvim API Çalışıyor ve Güvende!' }); // İsmi güncelledim :)
});

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda hata vermeden çalışıyor!`);
  
  // ⏰ CRON JOBLARI BAŞLAT
  try {
    const cronJobs = require('./src/utils/cronJobs');
    console.log('⏰ Cron joblar başarıyla başlatıldı');
  } catch (error) {
    console.error('❌ Cron joblar başlatılamadı:', error.message);
  }
});