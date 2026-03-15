const express = require('express');
const router = express.Router();

const {
  registerBusiness,
  loginBusiness, 
  completeOnboarding, 
  getOnboardingStatus,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  changePassword // <-- YENİ EKLENDİ: Controller'dan import ettik
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

// === Kayıt ve Giriş İşlemleri ===
router.post('/register', registerBusiness);
router.post('/login', loginBusiness);

// === Şifremi Unuttum İşlemleri (Giriş Yapmadan) ===
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token', verifyResetToken);

// === Şifre Değiştirme (Ayarlar Sayfasından - Giriş Yapmış Olmalı) ===
router.put('/change-password', protect, changePassword); // <-- YENİ EKLENDİ: PUT isteği ile çalışır ve protect ile korunur

// === Onboarding İşlemleri (Koruma altında) ===
router.post('/onboarding', protect, completeOnboarding);
router.get('/onboarding-status', protect, getOnboardingStatus);

module.exports = router;