const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 15*60*1000) // 15 dakika
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Otomatik temizleme (15 dakikadan eski tokenlar)
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);