const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { 
  addStaff, 
  getStaff, 
  getStaffById,
  updateStaff,
  deleteStaff,
  bulkCreateStaff 
} = require('../controllers/staffController');

// Bulk create - Onboarding için (en üste, ID ile çakışmaması için)
router.post('/bulk', protect, bulkCreateStaff);

// Diğer rotalar
router.post('/', protect, addStaff);
router.get('/', protect, getStaff);
router.get('/:id', protect, getStaffById);
router.put('/:id', protect, updateStaff);
router.delete('/:id', protect, deleteStaff);

module.exports = router;

