const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter (Postacı) Ayarları
  // .env dosyasındaki EMAIL_USER ve EMAIL_PASS bilgilerini kullanır
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Eğer Gmail kullanmıyorsan burayı değiştir (örn: 'hotmail')
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 2. E-posta İçerik Ayarları
  const mailOptions = {
    from: `RandevuMcepte <${process.env.EMAIL_USER}>`, // Kimden gidiyor
    to: options.to,                                   // Kime gidiyor (Controller'dan gelecek)
    subject: options.subject,                         // Konu (Controller'dan gelecek)
    html: options.html                                // HTML İçerik (Controller'dan gelecek)
  };

  // 3. E-postayı Gönder
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;