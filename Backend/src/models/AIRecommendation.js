const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  // İLİŞKİ: Bu tavsiye hangi işletmeye özel üretildi?
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  // Üretilen kampanya başlığı ve metni
  title: {
    type: String,
    required: true
  },
  suggestionText: {
    type: String,
    required: true
  },
  // Gemini'nin önerdiği aksiyon türü (Örn: "sms_campaign", "discount")
  actionType: {
    type: String,
    default: 'sms_campaign'
  },
  // Hangi gün için üretildi? (Eski tavsiyeleri göstermemek için)
  targetDate: {
    type: Date,
    required: true
  },
  // İşletme sahibi bu tavsiyeye uyup "Kampanyayı Başlat"a bastı mı?
  isActionTaken: {
    type: Boolean,
    default: false
  },
  // Geçerliliğini yitirdi mi? (Örn: Öğleden sonra saati geçtiyse true olur)
  isExpired: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);