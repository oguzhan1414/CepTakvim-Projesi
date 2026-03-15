const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Tüm route'lar için auth gerekli (sadece giriş yapmış işletmeler görebilir)
router.use(protect);

// Bildirimleri listele
router.get('/', getNotifications);

// Tüm bildirimleri okundu işaretle
router.patch('/read-all', markAllAsRead);

// Tek bildirimi okundu işaretle
router.patch('/:id/read', markAsRead);

// Bildirim sil
router.delete('/:id', deleteNotification);

module.exports = router;