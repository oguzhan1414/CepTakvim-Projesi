const nodemailer = require('nodemailer');

const sendContactEmail = async (req, res) => {
  try {
    // Frontend'den gelen verileri parçalıyoruz
    const { name, email, phone, subject, message } = req.body;

    // 1. E-posta Gönderici Ayarları (Transporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 2. Sana Gelecek Mailin İçeriği ve Tasarımı
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Sistem mailinden çıkış yapar
      replyTo: email, // Müşteriye direkt yanıt verebilmen için
      to: process.env.RECEIVER_EMAIL, // Kime gidecek? (Senin mailin)
      subject: `[RandevuMcepte] Yeni İletişim Formu: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Yeni Bir Mesajınız Var! 🚀</h2>
          <p><strong>Gönderen:</strong> ${name}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #666;">Mesaj Detayı:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px;">
            ${message}
          </p>
          <br/>
          <small style="color: #999;">Bu mesaj RandevuMcepte iletişim formundan otomatik olarak gönderilmiştir.</small>
        </div>
      `
    };

    // 3. Maili Gönder
    await transporter.sendMail(mailOptions);

    // Veritabanına kaydetmeden (şişirmeden) direkt başarılı cevabı dönüyoruz
    res.status(200).json({ 
      success: true, 
      message: 'Mesajınız başarıyla iletildi.' 
    });

  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Mesaj gönderilirken bir hata oluştu.',
      error: error.message 
    });
  }
};

module.exports = {
  sendContactEmail
};