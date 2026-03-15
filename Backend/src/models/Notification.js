const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // İLİŞKİ: Bu bildirim kime (hangi işletmeye) gidecek?
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  
  // Bildirimin türü (İkon rengini/şeklini belirlemek için)
  type: {
    type: String,
    enum: [
      'new_appointment',    // Yeni randevu
      'appointment_confirmed', // Randevu onaylandı
      'appointment_cancelled', // Randevu iptal edildi
      'appointment_reminder',  // Randevu hatırlatma
      'new_customer',       // Yeni müşteri
      'ai_alert',          // Yapay zeka tavsiyesi
      'system'             // Sistem bildirimi
    ],
    required: true
  },
  
  // Bildirim başlığı (örnek: "Yeni Randevu")
  title: {
    type: String,
    required: true
  },
  
  // Bildirim mesajı (örnek: "Selin Aksoy, Saç Kesimi için randevu oluşturdu.")
  message: {
    type: String,
    required: true
  },
  
  // İLİŞKİ: Randevuyla ilgiliyse
  relatedAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  
  // İLİŞKİ: Müşteriyle ilgiliyse
  relatedCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  
  // Yönlendirilecek sayfa (React route)
  action: {
    type: String,
    default: null
  },
  
  // İkon rengi (frontend'de kullanmak için)
  color: {
    type: String,
    default: '#4f46e5'
  },
  
  // İkon tipi (frontend'de hangi ikon gösterilecek)
  icon: {
    type: String,
    enum: ['bell', 'calendar', 'check', 'x', 'user-plus', 'clock', 'alert'],
    default: 'bell'
  },
  
  // Ek veriler (JSON formatında)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Okundu mu?
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Silindi mi? (Soft delete)
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// İndeksler (hızlı sorgulama için)
notificationSchema.index({ businessId: 1, createdAt: -1 });
notificationSchema.index({ businessId: 1, isRead: 1 });
notificationSchema.index({ businessId: 1, isDeleted: 1 });
notificationSchema.index({ relatedAppointmentId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);