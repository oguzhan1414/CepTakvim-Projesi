const Business = require('../models/Business');
const bcrypt = require('bcryptjs'); // Şifre şifreleme için gerekli

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
    const { businessName, phone, address, website, description, workingHours, settings, logoUrl, slug } = req.body;

    // Slug kontrolü: Eğer slug geldiyse boşlukları vb temizleyip küçük harfe çevirebiliriz
    let updateFields = {
      businessName,
      phone,
      address,
      website,
      description,
      workingHours,
      settings,
      logoUrl
    };

    if (slug) {
      updateFields.slug = slug.toLowerCase().replace(/\s+/g, '-');
    }

    // { returnDocument: 'after' } kullanımı Mongoose 'new' uyarısını ortadan kaldırır!
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business._id,
      {
        $set: updateFields
      },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: updatedBusiness
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu işletme profil linki (slug) başka bir işletme tarafından kullanılıyor. Lütfen farklı bir link belirleyin.' 
      });
    }

    res.status(500).json({ success: false, message: 'Profil güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Şifre Değiştirme
// @route   PUT /api/business/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. İşletmeyi veritabanında bul (Şifreyi de getirmesi için select('+password') kullanıyoruz)
    const business = await Business.findById(req.business._id).select('+password');

    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    // 2. Mevcut şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(currentPassword, business.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mevcut şifreniz yanlış!' });
    }

    // 3. Yeni şifreyi şifrele (Hash) ve veritabanına kaydet
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Business.findByIdAndUpdate(req.business._id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Şifre değiştirilirken hata oluştu.', error: error.message });
  }
};