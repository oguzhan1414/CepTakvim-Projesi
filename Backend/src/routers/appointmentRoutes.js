const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { 
  createAppointment, 
  getAppointments, 
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableTimeSlots,
  updateAppointmentStatus,
  getTodayAppointments,
  getUpcomingAppointments,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/appointmentController');

// ==================== PUBLIC ROUTES (Token gerekmez) ====================
router.get('/available-slots', getAvailableTimeSlots);  // Müsait saatler - PUBLIC
router.patch('/:id/cancel', cancelAppointment);         // İptal - PUBLIC
router.put('/:id/reschedule', rescheduleAppointment);   // Değiştir - PUBLIC

// ==================== PROTECTED ROUTES (Token gerekli) ====================
router.use(protect); // Bu noktadan sonraki tüm route'lar token gerektirir

// Özel route'lar
router.get('/today', getTodayAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.patch('/:id/status', updateAppointmentStatus);

// CRUD route'ları
router.route('/')
  .post(createAppointment)
  .get(getAppointments);

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;