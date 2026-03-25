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

// Veritabanı Bağlantısı
connectDB();

// 1. CORS AYARLARI (En Geniş ve Güvenli Hali)
const allowedOrigins = [
  'https://ceptakvim.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // origin yoksa (Postman/Mobile) veya listedeyse izin ver
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS engeline takıldı!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Pre-flight (Ön kontrol) isteklerine tüm rotalarda izin ver
app.options('(.*)', cors());

// 2. Güvenlik ve Body Parser
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Helmet'in CORS ile çakışmasını önler
}));
app.use(express.json({ limit: '10kb' })); 
app.use(hpp());

// 3. XSS TEMİZLEME MIDDLEWARE
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    try {
      const stringified = JSON.stringify(req.body);
      const cleaned = filterXSS(stringified);
      req.body = JSON.parse(cleaned);
    } catch (e) {
      console.error("XSS temizleme hatası:", e);
    }
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
  res.json({ mesaj: '✨ CepTakvim API Çalışıyor ve Güvende!' });
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