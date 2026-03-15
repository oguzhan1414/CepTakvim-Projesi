const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // İLİŞKİ 1: Hangi İşletme?
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  // İLİŞKİ 2: Hangi Müşteri? 
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  // İLİŞKİ 3: Hangi Hizmet?
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  // İLİŞKİ 4: Randevuya Hangi Personel Bakacak? (Opsiyonel)
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  
  // ZAMAN BİLGİLERİ
  date: {
    type: Date, // YYYY-MM-DD formatında (Örn: 2026-03-01)
    required: true
  },
  startTime: {
    type: String, // '14:30' formatında tutacağız
    required: true
  },
  endTime: {
    type: String, // '15:15' formatında (startTime + service.duration algoritmamız hesaplayacak)
    required: true
  },
  
  // EK BİLGİLER
  notes: {
    type: String,
    default: ''
  },
  
  // FİYAT BİLGİSİ
  price: {
    type: Number,
    required: true,
    default: 0
  },
  
  // DURUM TAKİBİ
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending' // Müşteri ilk aldığında "bekliyor" düşer
  }
}, { 
  timestamps: true 
});

// Aynı saatte çift randevu engelle
appointmentSchema.index(
  { businessId: 1, staffId: 1, date: 1, startTime: 1 }, 
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);