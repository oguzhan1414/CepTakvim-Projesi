const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const PasswordReset = require('../models/PasswordReset'); // Yeni modelimizi ekledik
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Şifreleme için gerekli
const sendEmail = require('../utils/sendMail'); // Email gönderme util'ini ekledik (bunu oluşturduğunu varsayıyorum)
const bcrypt = require('bcryptjs');
// Token Üretme Fonksiyonları
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // 7 Gün geçerli
};

// @desc    Yeni işletme kayıt et (Register)
// @route   POST /api/auth/register
exports.registerBusiness = async (req, res) => {
  try {
    const { businessName, email, password, phone } = req.body;

    const businessExists = await Business.findOne({ email });
    if (businessExists) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    const slug = businessName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const business = await Business.create({
      businessName,
      slug,
      email,
      password,
      phone,
      isOnboardingComplete: false
    });

    if (business) {
      res.status(201).json({
        success: true,
        data: {
          _id: business._id,
          businessName: business.businessName,
          slug: business.slug,
          email: business.email,
          isOnboardingComplete: business.isOnboardingComplete
        },
        token: generateToken(business._id)
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu Hatası', error: error.message });
  }
};

// @desc    İşletme Giriş Yap (Login)
// @route   POST /api/auth/login
exports.loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    const business = await Business.findOne({ email });

    if (business && (await business.matchPassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: business._id,
          businessName: business.businessName,
          slug: business.slug,
          email: business.email,
          isOnboardingComplete: business.isOnboardingComplete
        },
        token: generateToken(business._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu Hatası', error: error.message });
  }
};

// =================================================================================
// ŞİFREMİ UNUTTUM & SIFIRLAMA İŞLEMLERİ
// =================================================================================

// @desc    Şifre sıfırlama linki gönder
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Lütfen e-posta adresinizi girin.' });
    }

    const business = await Business.findOne({ email });
    
    // Güvenlik: E-posta sistemde olmasa bile "gönderildi" mesajı dönüyoruz (hackerları yanıltmak için)
    if (!business) {
      return res.status(200).json({ success: true, message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' });
    }

    // Bu email'e ait eski kullanılmamış token'ları temizle
    await PasswordReset.deleteMany({ email, used: false });

    // Rastgele 32 bytelık token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Güvenlik için token'ı hashleyip veritabanına kaydediyoruz
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await PasswordReset.create({
      email,
      token: hashedToken,
      // expiresAt otomatik olarak modeldeki default değerden (15 dk) gelecek
    });

    // Frontend şifre sıfırlama linki
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`;

    // Mail Gönderimi
    const message = `
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Merhaba ${business.businessName},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı 15 dakika geçerlidir.</p>
      <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Şifremi Sıfırla</a>
      <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Şifre Sıfırlama Talebi',
      html: message
    });

    res.status(200).json({ success: true, message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'İşlem sırasında bir hata oluştu.' });
  }
};

// @desc    Token geçerliliğini kontrol et
// @route   GET /api/auth/verify-reset-token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.query; // GET isteği olduğu için query'den alıyoruz

    if (!token || !email) {
      return res.status(400).json({ success: false, message: 'Geçersiz bağlantı.' });
    }

    // Frontend'den gelen düz token'ı hashle
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // DB'de süresi geçmemiş ve kullanılmamış token'ı ara
    const resetRecord = await PasswordReset.findOne({
      email,
      token: hashedToken,
      used: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Bu bağlantının süresi dolmuş veya geçersiz.' });
    }

    // Eğer buraya kadar geldiyse token sapasağlamdır!
    res.status(200).json({ success: true, message: 'Bağlantı geçerli.' });

  } catch (error) {
    console.error('Verify Token Error:', error);
    res.status(500).json({ success: false, message: 'Bağlantı kontrol edilirken hata oluştu.' });
  }
};
// @desc    Yeni şifreyi kaydet
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Lütfen tüm alanları doldurun.' });
    }

    // Frontend'den gelen düz token'ı tekrar hashle (DB'deki ile karşılaştırmak için)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // DB'de geçerli (süresi dolmamış ve kullanılmamış) bir kayıt ara
    const resetRecord = await PasswordReset.findOne({
      email,
      token: hashedToken,
      used: false,
      expiresAt: { $gt: Date.now() } // Ekstra güvenlik: Süresi geçmemiş olmalı
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş bağlantı.' });
    }

    // İşletmeyi bul
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    // Yeni şifreyi ata ve kaydet (Business modelindeki pre-save hook'u şifreyi hashleyecek)
    business.password = newPassword;
    await business.save();

    // Güvenlik: Kullanılan token'ı 'used: true' yap veya direkt DB'den sil
    resetRecord.used = true;
    await resetRecord.save();
    // Alternatif: await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Şifre güncellenirken bir hata oluştu.' });
  }
};

// =================================================================================
// ONBOARDING İŞLEMLERİ
// =================================================================================

// @desc    Onboarding'i tamamla
// @route   POST /api/auth/onboarding
exports.completeOnboarding = async (req, res) => {
  try {
    const { businessType, phone, address, services, workingHours } = req.body;
    const businessId = req.business._id;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    if (businessType) business.businessType = businessType;
    if (phone) business.phone = phone;
    if (address) business.address = address;
    if (workingHours) business.workingHours = workingHours;
    business.isOnboardingComplete = true;

    await business.save();

    if (services && services.length > 0) {
      const existingServices = await Service.find({ businessId });
      if (existingServices.length === 0) {
        const serviceObjects = services.map(serviceName => ({
          businessId,
          name: serviceName,
          duration: 30,
          price: 0
        }));
        await Service.insertMany(serviceObjects);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding başarıyla tamamlandı.',
      data: {
        _id: business._id,
        businessName: business.businessName,
        slug: business.slug,
        email: business.email,
        businessType: business.businessType,
        phone: business.phone,
        address: business.address,
        workingHours: business.workingHours,
        isOnboardingComplete: business.isOnboardingComplete
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Onboarding sırasında hata oluştu.', error: error.message });
  }
};

// @desc    Onboarding durumunu kontrol et
// @route   GET /api/auth/onboarding-status
exports.getOnboardingStatus = async (req, res) => {
  try {
    const business = await Business.findById(req.business._id).select('-password');
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: {
        isOnboardingComplete: business.isOnboardingComplete,
        businessType: business.businessType,
        businessName: business.businessName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hata oluştu.', error: error.message });
  }
};


// @desc    Giriş yapmış kullanıcının şifresini değiştir
// @route   PUT /api/auth/change-password
// @access  Private (Sadece giriş yapmış işletmeler)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Lütfen mevcut ve yeni şifrenizi girin.' });
    }

    // İşletmeyi bul ve şifresini de getirmesini söyle (+password)
    const business = await Business.findById(req.business._id).select('+password');

    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    // Mevcut şifre doğru mu diye kontrol et (bcrypt.compare kullanıyoruz)
    const isMatch = await bcrypt.compare(currentPassword, business.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mevcut şifreniz yanlış!' });
    }

    // Şifreler eşleştiyse, yeni şifreyi ata ve kaydet 
    // (Business modelindeki pre-save hook otomatik olarak hashleyecektir)
    business.password = newPassword;
    await business.save();

    res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Şifre güncellenirken bir hata oluştu.' });
  }
};