const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // İLİŞKİ: Bu müşteri HANGİ işletmenin havuzunda? (Her işletmenin müşterisi kendine özeldir)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Müşteri adı zorunludur'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  // CRM BİLGİLERİ (İstatistikler için)
  totalSpent: {
    type: Number,
    default: 0 // Müşteri her hizmet aldığında bu rakam otomatik artacak
  },
  status: {
    type: String,
    enum: ['Regular', 'VIP', 'Riskli'], // Riskli = Sürekli randevusuna gelmeyenler (No-show)
    default: 'Regular'
  },
  // İşletme sahibinin müşteri hakkında alabileceği özel notlar (Örn: "Kahvesini şekersiz içer")
  specialNote: {
    type: String,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true 
});

// Aynı işletmeye aynı telefon numarasıyla iki kez müşteri kaydı açılmasını engellemek için bileşik indeks
customerSchema.index({ businessId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);