// backend/controllers/emailNotificationController.js
const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const sendEmail = require('../utils/sendMail'); // senin email gönderme fonksiyonun

// E-posta şablonları
const emailTemplates = {
  // Yeni randevu bildirimi (işletmeye)
  newAppointmentToBusiness: (businessName, appointment, customer, service) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #4f46e5;">Yeni Randevu! 🎉</h2>
      <p><strong>${customer.fullName}</strong> size yeni bir randevu oluşturdu.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Tarih:</strong> ${new Date(appointment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>⏰ Saat:</strong> ${appointment.startTime}</p>
        <p><strong>💇 Hizmet:</strong> ${service?.name || 'Belirtilmemiş'} (${service?.duration || '?'} dk)</p>
        <p><strong>💰 Fiyat:</strong> ${service?.price || '0'} ₺</p>
        <p><strong>👤 Müşteri:</strong> ${customer.fullName}</p>
        <p><strong>📞 Telefon:</strong> ${customer.phone}</p>
        ${customer.email ? `<p><strong>✉️ E-posta:</strong> ${customer.email}</p>` : ''}
        ${appointment.notes ? `<p><strong>📝 Not:</strong> ${appointment.notes}</p>` : ''}
      </div>
      
      <a href="http://localhost:5173/dashboard/calendar" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Randevuları Görüntüle</a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Bu e-posta otomatik gönderilmiştir. Lütfen yanıtlamayınız.</p>
    </div>
  `,

  // Randevu hatırlatması (işletmeye)
  appointmentReminderToBusiness: (businessName, appointment, customer, service) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #ec4899;">Randevu Hatırlatması ⏰</h2>
      <p><strong>Yarın</strong> için randevunuz var.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Tarih:</strong> ${new Date(appointment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>⏰ Saat:</strong> ${appointment.startTime}</p>
        <p><strong>💇 Hizmet:</strong> ${service?.name || 'Belirtilmemiş'}</p>
        <p><strong>👤 Müşteri:</strong> ${customer.fullName}</p>
        <p><strong>📞 Telefon:</strong> ${customer.phone}</p>
      </div>
      
      <a href="http://localhost:5173/dashboard/calendar" style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Randevuya Git</a>
    </div>
  `,

  // Yeni müşteri bildirimi (işletmeye)
  newCustomerToBusiness: (businessName, customer) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #f59e0b;">Yeni Müşteri! 👤</h2>
      <p>Sisteminize yeni bir müşteri kaydoldu.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>👤 Ad Soyad:</strong> ${customer.fullName}</p>
        <p><strong>📞 Telefon:</strong> ${customer.phone}</p>
        ${customer.email ? `<p><strong>✉️ E-posta:</strong> ${customer.email}</p>` : ''}
      </div>
      
      <a href="http://localhost:5173/dashboard/customers" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Müşterileri Görüntüle</a>
    </div>
  `,

  // Günlük özet (işletmeye)
  dailySummary: (businessName, stats) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #10b981;">Günlük Özet 📊</h2>
      <p>Bugünün istatistikleri:</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #4f46e5;">${stats.totalAppointments}</h3>
          <p style="margin: 5px 0 0; color: #6b7280;">Toplam Randevu</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #10b981;">${stats.newCustomers}</h3>
          <p style="margin: 5px 0 0; color: #6b7280;">Yeni Müşteri</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #f59e0b;">${stats.completedAppointments}</h3>
          <p style="margin: 5px 0 0; color: #6b7280;">Tamamlanan</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0; color: #ec4899;">${stats.upcomingAppointments}</h3>
          <p style="margin: 5px 0 0; color: #6b7280;">Yaklaşan</p>
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">Detaylı raporlar için dashboard'u ziyaret edin.</p>
      <a href="http://localhost:5173/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Dashboard'a Git</a>
    </div>
  `
};

// Yeni randevu bildirimi gönder (emailNotifications)
exports.sendNewAppointmentEmail = async (businessId, appointment, customerId, serviceId) => {
  try {
    // İşletmenin bildirim ayarlarını kontrol et
    const business = await Business.findById(businessId);
    if (!business || !business.notificationSettings?.emailNotifications) {
      console.log('📧 E-posta bildirimi kapalı veya işletme bulunamadı');
      return false;
    }

    // Müşteri ve servis bilgilerini al
    const customer = await Customer.findById(customerId);
    const service = await Service.findById(serviceId);

    if (!customer) return false;

    // E-postayı gönder
    const html = emailTemplates.newAppointmentToBusiness(
      business.businessName,
      appointment,
      customer,
      service
    );

    await sendEmail({
      to: business.email,
      subject: `📅 Yeni Randevu: ${customer.fullName} - ${service?.name || 'Hizmet'}`,
      html
    });

    console.log(`📧 Yeni randevu e-postası gönderildi: ${business.email}`);
    return true;
  } catch (error) {
    console.error('📧 E-posta gönderme hatası:', error);
    return false;
  }
};

// Randevu hatırlatması gönder (appointmentReminders)
exports.sendAppointmentReminderEmail = async (businessId, appointment, customerId, serviceId) => {
  try {
    const business = await Business.findById(businessId);
    if (!business || !business.notificationSettings?.appointmentReminders) {
      return false;
    }

    const customer = await Customer.findById(customerId);
    const service = await Service.findById(serviceId);

    if (!customer) return false;

    const html = emailTemplates.appointmentReminderToBusiness(
      business.businessName,
      appointment,
      customer,
      service
    );

    await sendEmail({
      to: business.email,
      subject: `⏰ Randevu Hatırlatması: Yarın ${appointment.startTime}'da randevunuz var`,
      html
    });

    console.log(`📧 Randevu hatırlatması gönderildi: ${business.email}`);
    return true;
  } catch (error) {
    console.error('📧 Hatırlatma e-postası hatası:', error);
    return false;
  }
};

// Yeni müşteri bildirimi gönder (newCustomerAlerts)
exports.sendNewCustomerEmail = async (businessId, customerId) => {
  try {
    const business = await Business.findById(businessId);
    if (!business || !business.notificationSettings?.newCustomerAlerts) {
      return false;
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return false;

    const html = emailTemplates.newCustomerToBusiness(
      business.businessName,
      customer
    );

    await sendEmail({
      to: business.email,
      subject: `👤 Yeni Müşteri: ${customer.fullName} sisteme kaydoldu`,
      html
    });

    console.log(`📧 Yeni müşteri e-postası gönderildi: ${business.email}`);
    return true;
  } catch (error) {
    console.error('📧 Yeni müşteri e-postası hatası:', error);
    return false;
  }
};

// Günlük özet gönder (dailySummary)
exports.sendDailySummaryEmail = async (businessId, stats) => {
  try {
    const business = await Business.findById(businessId);
    if (!business || !business.notificationSettings?.dailySummary) {
      return false;
    }

    const html = emailTemplates.dailySummary(business.businessName, stats);

    await sendEmail({
      to: business.email,
      subject: `📊 Günlük Özet: ${new Date().toLocaleDateString('tr-TR')}`,
      html
    });

    console.log(`📧 Günlük özet gönderildi: ${business.email}`);
    return true;
  } catch (error) {
    console.error('📧 Günlük özet e-postası hatası:', error);
    return false;
  }
};