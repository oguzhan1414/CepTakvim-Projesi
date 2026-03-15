const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./src/routers/authRouters')
const connectDB = require('./src/db/dbConnection');
const serviceRoutes = require('./src/routers/serviceRoutes');
const businessRoutes = require('./src/routers/businessRoutes')
const staffRoutes = require('./src/routers/staffRouters')
const customerRoutes = require('./src/routers/customerRouters')
const appointmentRoutes = require('./src/routers/appointmentRoutes')
const dashboardRoutes = require('./src/routers/dashboardRoutes')
const publicRoutes = require('./src/routers/publicRoutes')
const notificationRoutes = require('./src/routers/notificationRoutes'); // YENİ
const contactRoutes = require('./src/routers/contactRoutes')
const paymentRoutes = require('./src/routers/paymentRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Veritabanına Bağlan
connectDB();

// Ana Sayfa
app.get('/', (req, res) => {
  res.json({ mesaj: '✨ RandevuMcepte API Çalışıyor!' });
});

// Public API (Token gerektirmez)
app.use('/api/public', publicRoutes);

// Auth API
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/services', serviceRoutes);
app.use('/api/business',businessRoutes)
app.use('/api/staff',staffRoutes)
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes); // YENİ
app.use('/api/contact',contactRoutes)
app.use('/api/payment', paymentRoutes);
// Sunucuyu Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor!`);
});

