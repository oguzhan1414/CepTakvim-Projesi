const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { 
  addCustomer, 
  getCustomers, 
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerByPhone,
  getCustomerDetails
} = require('../controllers/customerController');

// ==================== PUBLIC ROUTE (Token GEREKMEZ!) ====================
router.get('/phone/:phone', getCustomerByPhone); // En üstte ve protect dışında!

// ==================== PROTECTED ROUTES (Token gerekir) ====================
router.use(protect); // Bu noktadan sonraki tüm route'lar token gerektirir

router.post('/', addCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.get('/:id/details', getCustomerDetails); // YENİ: CRM Detayları
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;