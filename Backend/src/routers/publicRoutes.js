const express = require('express');
const router = express.Router();

const { 
  getBusinessBySlug,
  getAllBusinesses,
  getServices, 
  getStaff, 
  getAvailableSlots,
  createPublicAppointment 
} = require('../controllers/publicController');

// Public API Rotları (Token gerekmez)
router.get('/businesses', getAllBusinesses); // Tüm işletmeleri listele
router.get('/business/:slug', getBusinessBySlug);
router.get('/services/:businessId', getServices);
router.get('/staff/:businessId', getStaff);
router.get('/availability', getAvailableSlots);
router.post('/appointments', createPublicAppointment);

module.exports = router;

