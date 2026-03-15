const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // İLİŞKİ: Bu personel HANGİ işletmede çalışıyor?
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Personel adı zorunludur'],
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Uzman' // Örn: Kıdemli Stilist, Diyetisyen vb.
  },
  // Cloudinary'den gelecek personel fotoğrafı
  avatarUrl: {
    type: String,
    default: ''
  },
  // Personel şu an çalışıyor mu? (İşten çıkarsa veya izne ayrılırsa false yaparız, takvimde görünmez)
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Staff', staffSchema);