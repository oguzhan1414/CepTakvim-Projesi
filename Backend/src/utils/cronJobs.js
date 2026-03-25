// backend/src/utils/cronJobs.js
const cron = require('node-cron');
const Business = require('../models/Business');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const emailNotificationController = require('../controllers/emailNotificationController');

// Her gün saat 20:00'de yarının randevu hatırlatmaları
cron.schedule('0 20 * * *', async () => {
  console.log('⏰ Randevu hatırlatmaları gönderiliyor...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const appointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: dayAfter },
      status: { $in: ['pending', 'confirmed'] }
    }).populate('businessId').populate('customerId').populate('serviceId');
    
    console.log(`📅 ${appointments.length} yarınki randevu bulundu`);
    
    for (const appointment of appointments) {
      if (appointment.businessId?.notificationSettings?.appointmentReminders) {
        await emailNotificationController.sendAppointmentReminderEmail(
          appointment.businessId._id,
          appointment,
          appointment.customerId._id,
          appointment.serviceId._id
        );
      }
    }
  } catch (error) {
    console.error('❌ Randevu hatırlatma cron job hatası:', error);
  }
});

// Her gün saat 09:00'da günlük özet
cron.schedule('0 9 * * *', async () => {
  console.log('📊 Günlük özetler gönderiliyor...');
  
  try {
    const businesses = await Business.find({ 'notificationSettings.dailySummary': true });
    console.log(`🏢 ${businesses.length} işletmeye günlük özet gönderilecek`);
    
    for (const business of businesses) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Dünün istatistikleri
      const totalAppointments = await Appointment.countDocuments({
        businessId: business._id,
        date: { $gte: yesterday, $lt: today }
      });
      
      const newCustomers = await Customer.countDocuments({
        businessId: business._id,
        createdAt: { $gte: yesterday, $lt: today }
      });
      
      const completedAppointments = await Appointment.countDocuments({
        businessId: business._id,
        date: { $gte: yesterday, $lt: today },
        status: 'completed'
      });
      
      const upcomingAppointments = await Appointment.countDocuments({
        businessId: business._id,
        date: { $gte: today },
        status: { $in: ['pending', 'confirmed'] }
      });
      
      await emailNotificationController.sendDailySummaryEmail(business._id, {
        totalAppointments,
        newCustomers,
        completedAppointments,
        upcomingAppointments
      });
    }
  } catch (error) {
    console.error('❌ Günlük özet cron job hatası:', error);
  }
});

console.log('⏰ Cron joblar yüklendi, zamanlandı!');
module.exports = cron;