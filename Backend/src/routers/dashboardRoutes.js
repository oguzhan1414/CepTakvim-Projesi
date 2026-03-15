const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Ana sayfa verilerini getiren rota
router.get('/', protect, getDashboardStats);

module.exports = router;
