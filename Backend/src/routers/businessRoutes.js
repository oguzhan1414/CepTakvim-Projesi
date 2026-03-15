const express = require('express');
const router = express.Router();

// Güvenlik görevlimiz
const { protect } = require('../middlewares/authMiddleware');

// Controller fonksiyonlarımız
const { getBusinessProfile, updateBusinessProfile ,changePassword } = require('../controllers/businessController');

// Rotalarımız
router.get('/profile', protect, getBusinessProfile);    // Profili Getir
router.put('/profile', protect, updateBusinessProfile); // Profili Güncelle (PUT metodu güncelleme için kullanılır)
router.put('/change-password', protect, changePassword);
module.exports = router;