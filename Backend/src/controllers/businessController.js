const Business = require('../models/Business');
const bcrypt = require('bcryptjs');

// @desc    Giriş yapmış işletmenin kendi profil bilgilerini getir
// @route   GET /api/business/profile
// @access  Private
exports.getBusinessProfile = async (req, res) => {
  try {
    const business = await Business.findById(req.business._id).select('-password');

    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profil getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    İşletme profilini ve çalışma saatlerini güncelle
// @route   PUT /api/business/profile
// @access  Private
exports.updateBusinessProfile = async (req, res) => {
  try {
    // Frontend'den gelen TÜM güncellenebilir alanları alıyoruz
    const { 
      businessName, 
      phone, 
      address, 
      description, 
      workingHours, 
      logoUrl, 
      slug,
      socialMedia,
      notificationSettings,
      website // Website alanını da ekledik
    } = req.body;
    
    console.log('Gelen sosyal medya verisi:', socialMedia); 
    console.log('Gelen bildirim ayarları:', notificationSettings);
    console.log('Gelen logo URL:', logoUrl);

    // Tüm güncellenebilir alanları tek bir objede topla
    let updateFields = {
      businessName,
      phone,
      address,
      description,
      workingHours,
      logoUrl, // Logo URL'ini direkt ekle
      website  // Website'i de ekle
    };

    // Sosyal medya alanlarını ekle (eğer varsa)
    if (socialMedia) {
      updateFields.socialMedia = socialMedia;
    }

    // Bildirim ayarlarını ekle (eğer varsa)
    if (notificationSettings) {
      updateFields.notificationSettings = notificationSettings;
    }

    // Slug varsa formatla ve ekle
    if (slug) {
      updateFields.slug = slug.toLowerCase().replace(/\s+/g, '-');
    }

    // undefined olan alanları temizle (opsiyonel, veritabanında güncelleme yaparken gereksiz alanları göndermemek için)
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    console.log('Güncellenecek alanlar:', updateFields);

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: updatedBusiness
    });
  } catch (error) {
    // Slug duplicate key hatası
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu işletme profil linki (slug) başka bir işletme tarafından kullanılıyor. Lütfen farklı bir link belirleyin.' 
      });
    }

    // Validasyon hatası
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validasyon hatası', 
        errors 
      });
    }

    console.error('Güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Profil güncellenirken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Şifre Değiştirme
// @route   PUT /api/business/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Şifreyi de getir
    const business = await Business.findById(req.business._id).select('+password');

    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    // Mevcut şifre kontrolü
    const isMatch = await bcrypt.compare(currentPassword, business.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mevcut şifreniz yanlış!' });
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
    await Business.findByIdAndUpdate(req.business._id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Şifre değiştirilirken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Logo yükleme URL'ini güncelle (opsiyonel - ayrı bir endpoint)
// @route   POST /api/business/upload-logo
// @access  Private
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen bir dosya yükleyin.' 
      });
    }

    // Cloudinary veya başka bir servisten gelen URL
    const logoUrl = req.file.path; // veya req.file.url

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business._id,
      { $set: { logoUrl } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Logo başarıyla yüklendi.',
      data: { logoUrl: updatedBusiness.logoUrl }
    });
  } catch (error) {
    console.error('Logo yükleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logo yüklenirken hata oluştu.', 
      error: error.message 
    });
  }
};