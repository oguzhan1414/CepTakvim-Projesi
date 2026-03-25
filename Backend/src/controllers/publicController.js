const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const notificationController = require('./notificationController'); // YENİ - Bildirim controller'ı eklendi

// @desc    İşletme bilgilerini slug ile getir
// @route   GET /api/public/business/:slug
// @access  Public
exports.getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await Business.findOne({ slug }).select(
      'businessName slug phone address logoUrl workingHours description website socialMedia'
    );

    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşletme bulunamadı.' 
      });
    }

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası.', 
      error: error.message 
    });
  }
};
// @desc    Tüm işletmeleri listele (Landing page için)
// @route   GET /api/public/businesses
// @access  Public
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({}).select(
      'businessName slug phone address logoUrl subscription'
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası.', 
      error: error.message 
    });
  }
};

// @desc    İşletmenin hizmetlerini getir
// @route   GET /api/public/services/:businessId
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { businessId } = req.params;

    const services = await Service.find({ 
      businessId, 
      isActive: { $ne: false } 
    }).select('name description price duration');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası.', 
      error: error.message 
    });
  }
};

// @desc    İşletmenin personelini getir
// @route   GET /api/public/staff/:businessId
// @access  Public
exports.getStaff = async (req, res) => {
  try {
    const { businessId } = req.params;

    const staff = await Staff.find({ 
      businessId, 
      isActive: true 
    }).select('name title avatarUrl');

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası.', 
      error: error.message 
    });
  }
};

// @desc    Müsait saatleri hesapla
// @route   GET /api/public/availability
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { businessId, serviceId, staffId, date } = req.query;

    console.log('📥 Müsait saat isteği:', { businessId, serviceId, staffId, date });

    // Validasyon
    if (!businessId || !serviceId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'İşletme ID, hizmet ID ve tarih gerekli.' 
      });
    }

    // İşletme ve hizmet bilgilerini al
    const business = await Business.findById(businessId);
    const service = await Service.findById(serviceId);

    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşletme bulunamadı.' 
      });
    }

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hizmet bulunamadı.' 
      });
    }

    // Günü bul
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dateObj = new Date(date);
    const dayName = days[dateObj.getDay()];
    
    console.log('📅 Gün:', dayName);

    // İşletmenin çalışma saatleri var mı kontrol et
    if (!business.workingHours) {
      return res.status(200).json({
        success: true,
        message: 'Çalışma saatleri tanımlanmamış.',
        data: []
      });
    }

    const daySchedule = business.workingHours[dayName];

    // İşletme kapalı mı kontrol et
    if (!daySchedule || !daySchedule.active) {
      return res.status(200).json({
        success: true,
        message: 'İşletme bu gün kapalıdır.',
        data: []
      });
    }

    // Randevuları al
    const query = { 
      businessId, 
      date,
      status: { $in: ['pending', 'confirmed'] }
    };
    
    if (staffId && staffId !== 'undefined') {
      query.staffId = staffId;
    }

    console.log('🔍 Randevu sorgusu:', query);

    const appointments = await Appointment.find(query).sort('startTime');
    console.log(`📅 ${appointments.length} randevu bulundu`);

    // Müsait saatleri hesapla
    const availableSlots = [];
    const duration = service.duration;

    const timeToMinutes = (time) => {
      if (!time) return 0;
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (mins) => {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      return `${h}:${m}`;
    };

    // Çalışma saatlerini kontrol et
    if (!daySchedule.start || !daySchedule.end) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    let currentMins = timeToMinutes(daySchedule.start);
    const closingMins = timeToMinutes(daySchedule.end);

    console.log('⏰ Çalışma saatleri:', daySchedule.start, '-', daySchedule.end);

    while (currentMins + duration <= closingMins) {
      const slotStart = minutesToTime(currentMins);
      const slotEnd = minutesToTime(currentMins + duration);

      // Çakışma kontrolü
      const isOverlapping = appointments.some(appt => {
        const apptStart = timeToMinutes(appt.startTime);
        const apptEnd = timeToMinutes(appt.endTime);
        return (currentMins < apptEnd && (currentMins + duration) > apptStart);
      });

      if (!isOverlapping) {
        availableSlots.push({ 
          start: slotStart, 
          end: slotEnd,
          display: slotStart
        });
      }

      currentMins += 30; // 30 dakika aralıklarla kontrol et
    }

    console.log(`✅ ${availableSlots.length} müsait saat bulundu`);

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });

  } catch (error) {
    console.error('❌ Müsait saat hesaplama hatası:', error);
    console.error('Hata detayı:', error.message);
    console.error('Hata stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası.', 
      error: error.message 
    });
  }
};
// @desc    Müşteri randevu oluştur (Public)
// @route   POST /api/public/appointments
// @access  Public
exports.createPublicAppointment = async (req, res) => {
  try {
    console.log('📥 Randevu oluşturma isteği:', JSON.stringify(req.body, null, 2));

    const { businessId, serviceId, staffId, date, time, customer } = req.body;

    // Detaylı validasyon
    if (!businessId || !serviceId || !date || !time || !customer) {
      console.log('❌ Eksik alanlar:', { businessId, serviceId, date, time, customer });
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen tüm alanları doldurun.' 
      });
    }

    if (!customer.fullName || !customer.phone) {
      console.log('❌ Eksik müşteri bilgisi:', customer);
      return res.status(400).json({ 
        success: false, 
        message: 'Müşteri adı ve telefonu gerekli.' 
      });
    }

    // İşletme bilgilerini al (E-POSTA İÇİN LAZIM)
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşletme bulunamadı.' 
      });
    }

    // Hizmet süresini al
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log('❌ Hizmet bulunamadı:', serviceId);
      return res.status(404).json({ 
        success: false, 
        message: 'Hizmet bulunamadı.' 
      });
    }
    console.log('✅ Hizmet bulundu:', service.name, service.duration, 'dk');

    // Bitiş saatini hesapla
    const [hours, minutes] = time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    console.log('⏰ Bitiş saati:', endTime);

    // Müşteriyi bul veya oluştur
    console.log('👤 Müşteri aranıyor:', customer.phone);
    let customerDoc = await Customer.findOne({ 
      businessId, 
      phone: customer.phone 
    });

   if (!customerDoc) {
  console.log('🆕 Yeni müşteri oluşturuluyor...');
  customerDoc = await Customer.create({
    businessId,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email || ''
  });
  console.log('✅ Yeni müşteri oluşturuldu:', customerDoc._id);
  
  // 📧 YENİ MÜŞTERİ MAİLİ GÖNDER
  if (business.notificationSettings?.newCustomerAlerts) {
    try {
      const emailNotificationController = require('./emailNotificationController');
      await emailNotificationController.sendNewCustomerEmail(businessId, customerDoc._id);
      console.log('📧 Yeni müşteri maili gönderildi');
    } catch (emailError) {
      console.error('❌ Yeni müşteri maili hatası:', emailError.message);
    }
  }
}

    // Randevu oluştur
    console.log('📅 Randevu oluşturuluyor...');
    const appointmentData = {
      businessId,
      customerId: customerDoc._id,
      serviceId,
      date,
      startTime: time,
      endTime,
      notes: customer.notes || '',
      status: 'pending',
      price: service.price || 0
    };

    if (staffId && staffId !== "undefined") {
      appointmentData.staffId = staffId;
    }

    console.log('📦 Randevu verisi:', appointmentData);

    const appointment = await Appointment.create(appointmentData);
    console.log('✅ Randevu oluşturuldu:', appointment._id);

    // Populate et
    await appointment.populate([
      { path: 'customerId', select: 'fullName phone' },
      { path: 'serviceId', select: 'name price duration' },
      { path: 'staffId', select: 'name' }
    ]);

    // 🔔 BİLDİRİM GÖNDER (In-app)
    const notificationController = require('./notificationController');
    await notificationController.createNewAppointmentNotification(
      businessId,
      appointment,
      customerDoc,
      service
    );
    console.log('🔔 In-app bildirim gönderildi');

    // 📧 E-POSTA BİLDİRİMİ GÖNDER (Eğer ayarlarda açıksa)
    if (business.notificationSettings?.emailNotifications) {
      try {
        const emailNotificationController = require('./emailNotificationController');
        await emailNotificationController.sendNewAppointmentEmail(
          businessId,
          appointment,
          customerDoc._id,
          serviceId
        );
        console.log('📧 E-posta bildirimi gönderildi');
      } catch (emailError) {
        console.error('❌ E-posta gönderme hatası:', emailError.message);
        // E-posta hatası olsa bile randevu oluşmuştur, devam et
      }
    } else {
      console.log('📧 E-posta bildirimleri kapalı');
    }

    res.status(201).json({
      success: true,
      message: 'Randevunuz başarıyla oluşturuldu! İşletme en kısa sürede onaylayacaktır.',
      data: appointment
    });

  } catch (error) {
    console.error('❌ Randevu oluşturma hatası:', error);
    
    // MongoDB validasyon hatası
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validasyon hatası', 
        errors 
      });
    }

    // Duplicate key hatası (aynı saatte randevu)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu saat için randevu zaten alınmış.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Randevu oluşturulurken hata oluştu.', 
      error: error.message 
    });
  }
};