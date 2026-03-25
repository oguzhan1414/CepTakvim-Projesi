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
  // 🌐 SOSYAL MEDYA LİNKLERİ (YENİ EKLENDİ)
  // ==========================================
  socialMedia: {
    instagram: { 
      type: String, 
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Instagram kullanıcı adı formatı kontrolü
          return !v || /^[A-Za-z0-9._]{1,30}$/.test(v);
        },
        message: 'Geçersiz Instagram kullanıcı adı'
      }
    },
    facebook: { 
      type: String, 
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Facebook sayfa adı veya kullanıcı adı
          return !v || v.length >= 3;
        },
        message: 'Geçersiz Facebook kullanıcı adı'
      }
    },
    twitter: { 
      type: String, 
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Twitter kullanıcı adı (@ işareti olmadan)
          return !v || /^[A-Za-z0-9_]{1,15}$/.test(v);
        },
        message: 'Geçersiz Twitter kullanıcı adı'
      }
    },
    website: { 
      type: String, 
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
          // Website URL formatı
          return !v || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: 'Geçersiz website URL\'si'
      }
    }
  },

  // ==========================================
  // 💰 ABONELİK VE PAKET SİSTEMİ
  // ==========================================
  plan: { 
    type: String, 
    enum: ['free', 'basic', 'pro', 'enterprise'], 
    default: 'free'
  },
  subscriptionEndDate: {
    type: Date,
    default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000) 
  },
  staffLimit: {
    type: Number,
    default: 1
  },
  iyzicoCustomerId: {
    type: String
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
  notificationSettings: {
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  whatsappNotifications: { type: Boolean, default: false },
  appointmentReminders: { type: Boolean, default: true },
  newCustomerAlerts: { type: Boolean, default: true },
  dailySummary: { type: Boolean, default: false }
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
  timestamps: true
});

businessSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; 
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

businessSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Business', businessSchema);