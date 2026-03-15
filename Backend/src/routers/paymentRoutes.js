const express = require('express');
const router = express.Router();
const { initializePayment, paymentCallback } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// 1. Ödemeyi Başlatma (Müşteri içeriden tıklayacağı için 'protect' ile korumalı)
router.post('/initialize', protect, initializePayment);

// 2. Iyzico'nun Cevap Döndüğü Yer (Iyzico'da bizim JWT tokenımız olmadığı için BURA KORUMASIZ OLMALI)
router.post('/callback', paymentCallback);

module.exports = router;