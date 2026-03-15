const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { 
  addService, 
  getServices, 
  getServiceById,
  updateService,
  deleteService,
  bulkCreateServices 
} = require('../controllers/serviceController');

// Bulk create - Onboarding için (en üste, ID ile çakışmaması için)
router.post('/bulk', protect, bulkCreateServices);

// Diğer rotalar
router.post('/', protect, addService);
router.get('/', protect, getServices);
router.get('/:id', protect, getServiceById);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;

