const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessSchema = new mongoose.Schema({
  businessName: { 
    type: String, 
    required: [true, 'İşletme adı zorunludur'], 
    trim: true 
  },
  // Müşterilerin gireceği özel link (örn: randevumcepte.com/vibe-salon)
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'E-posta adresi zorunludur'], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Şifre zorunludur'], 
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'] 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  logoUrl: { 
    type: String, 
    default: '' // Cloudinary'den gelecek link buraya kaydedilecek
  },

  // ==========================================
  // 💰 ABONELİK VE PAKET SİSTEMİ (YENİ EKLENDİ)
  // ==========================================
  plan: { 
    type: String, 
    enum: ['free', 'basic', 'pro', 'enterprise'], 
    default: 'free' // Herkes 14 günlük ücretsiz deneme ile başlar
  },
  subscriptionEndDate: {
    type: Date,
    // Kayıt olunan andan itibaren tam 14 gün sonrasını hesaplar
    default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000) 
  },
  staffLimit: {
    type: Number,
    default: 1 // Free ve Basic pakette sadece 1 personel (işletme sahibi) eklenebilir
  },
  iyzicoCustomerId: {
    type: String // Ödeme yapan müşterinin Iyzico tarafındaki ID'si (Tek tıkla ödeme için)
  },
  // ==========================================

  businessType: {
    type: String,
    trim: true
  },
  isOnboardingComplete: {
    type: Boolean,
    default: false
  },
  
  // Çalışma Saatleri
  workingHours: {
    monday: { active: { type: Boolean, default: true }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
    tuesday: { active: { type: Boolean, default: true }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
    wednesday: { active: { type: Boolean, default: true }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
    thursday: { active: { type: Boolean, default: true }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
    friday: { active: { type: Boolean, default: true }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
    saturday: { active: { type: Boolean, default: false }, start: { type: String, default: '10:00' }, end: { type: String, default: '16:00' } },
    sunday: { active: { type: Boolean, default: false }, start: { type: String, default: '10:00' }, end: { type: String, default: '16:00' } }
  }
}, { 
  timestamps: true // Bu ayar, kaydın ne zaman oluşturulduğunu (createdAt) ve güncellendiğini (updatedAt) otomatik tutar.
});

businessSchema.pre('save', async function() {
  // Eğer şifre alanı değiştirilmediyse tekrar şifreleme yapma
  if (!this.isModified('password')) {
    return; 
  }
  
  // Şifreyi 10 tur karıştır (salt) ve kriptola
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Giriş yaparken kullanıcının girdiği şifre ile veritabanındaki kriptolu şifreyi karşılaştıran metod
businessSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Business', businessSchema);