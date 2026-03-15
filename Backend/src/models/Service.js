const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // İLİŞKİ: Bu hizmet HANGİ işletmeye ait?
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business', // İşletme (Business) modeline referans veriyoruz
    required: true
  },
  name: {
    type: String,
    required: [true, 'Hizmet adı zorunludur'],
    trim: true
  },
  duration: {
    type: Number, // Dakika cinsinden tutuyoruz (Örn: 45)
    required: [true, 'İşlem süresi zorunludur']
  },
  price: {
    type: Number,
    required: [true, 'Hizmet fiyatı zorunludur']
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Service', serviceSchema);