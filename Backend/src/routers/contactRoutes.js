const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// POST isteği geldiğinde sendContactEmail fonksiyonunu çalıştır
router.post('/send', sendContactEmail);

module.exports = router;