const Appointment = require('../models/Appointment');
const Business = require('../models/Business');
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const notificationController = require('./notificationController');

// @desc    Yeni randevu oluştur
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    console.log('📥 Randevu oluşturma isteği:', req.body);
    
    const { customerId, staffId, serviceId, date, startTime, endTime, notes } = req.body;

    if (!customerId || !serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen tüm zorunlu alanları doldurun.' 
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Hizmet bulunamadı.'
      });
    }

    const appointment = await Appointment.create({
      businessId: req.business._id,
      customerId,
      staffId: staffId || null,
      serviceId,
      date,
      startTime,
      endTime,
      notes: notes || '',
      price: service.price || 0,
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'fullName phone email')
      .populate('staffId', 'name title')
      .populate('serviceId', 'name price duration');

    res.status(201).json({
      success: true,
      message: 'Randevu başarıyla oluşturuldu.',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('❌ Randevu oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validasyon hatası', errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bu saat için randevu zaten alınmış.' });
    }
    res.status(500).json({ success: false, message: 'Randevu oluşturulurken hata oluştu.', error: error.message });
  }
};

// @desc    Tüm randevuları getir
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, date, startDate, endDate } = req.query;
    const filter = { businessId: req.business._id };
    
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };

    const appointments = await Appointment.find(filter)
      .populate('customerId', 'fullName phone email')
      .populate('staffId', 'name title')
      .populate('serviceId', 'name price duration')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error('❌ Randevular getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Randevular getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tek randevu getir
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      businessId: req.business._id
    })
      .populate('customerId', 'fullName phone email')
      .populate('staffId', 'name title')
      .populate('serviceId', 'name price duration');

    if (!appointment) return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error('❌ Randevu getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Randevu getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Randevu güncelle
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const { customerId, staffId, serviceId, date, startTime, endTime, notes, status } = req.body;

    let appointment = await Appointment.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!appointment) return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });

    const updateData = {};
    if (customerId) updateData.customerId = customerId;
    if (staffId) updateData.staffId = staffId;
    if (serviceId) updateData.serviceId = serviceId;
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (notes !== undefined) updateData.notes = notes;
    
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) updateData.price = service.price || 0;
    }
    
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Geçersiz durum.' });
      updateData.status = status;
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('customerId', 'fullName phone email')
      .populate('staffId', 'name title')
      .populate('serviceId', 'name price duration');

    res.status(200).json({ success: true, message: 'Randevu başarıyla güncellendi.', data: appointment });
  } catch (error) {
    console.error('❌ Randevu güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Randevu güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Randevu sil
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!appointment) return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });

    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Randevu başarıyla silindi.' });
  } catch (error) {
    console.error('❌ Randevu silme hatası:', error);
    res.status(500).json({ success: false, message: 'Randevu silinirken hata oluştu.', error: error.message });
  }
};

// @desc    Randevu durumunu güncelle (onayla/iptal/completed)
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum bilgisi.' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business._id },
      { status },
      { new: true }
    )
      .populate('customerId', 'fullName phone')
      .populate('staffId', 'name')
      .populate('serviceId', 'name price duration');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });
    }

    if (status === 'confirmed') {
      await notificationController.createAppointmentConfirmedNotification(
        req.business._id,
        appointment,
        appointment.customerId,
        appointment.serviceId
      );
    } else if (status === 'cancelled') {
      await notificationController.createAppointmentCancelledNotification(
        req.business._id,
        appointment,
        appointment.customerId,
        appointment.serviceId
      );
    }

    if (status === 'completed') {
      const servicePrice = appointment.serviceId?.price || 0;
      await Customer.findByIdAndUpdate(appointment.customerId._id, { $inc: { totalSpent: servicePrice } });
    }

    res.status(200).json({ success: true, message: `Randevu durumu '${status}' olarak güncellendi.`, data: appointment });
  } catch (error) {
    console.error('❌ Durum güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Randevu durumu güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Bugünün randevularını getir
// @route   GET /api/appointments/today
// @access  Private
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      businessId: req.business._id,
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('customerId', 'fullName phone email')
    .populate('staffId', 'name title')
    .populate('serviceId', 'name price duration')
    .sort('startTime');

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error('❌ Today appointments hatası:', error);
    res.status(500).json({ success: false, message: 'Bugünün randevuları getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Yaklaşan randevuları getir
// @route   GET /api/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = parseInt(req.query.limit) || 5;

    const appointments = await Appointment.find({
      businessId: req.business._id,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('customerId', 'fullName phone')
    .populate('serviceId', 'name duration')
    .populate('staffId', 'name')
    .sort('date startTime')
    .limit(limit);

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error('❌ Upcoming appointments hatası:', error);
    res.status(500).json({ success: false, message: 'Yaklaşan randevular getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Müsait saatleri hesapla
// @route   GET /api/appointments/available-slots
// @access  Public
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { businessId, staffId, serviceId, date } = req.query; // body değil query!

    console.log('📥 Müsait saat isteği:', { businessId, staffId, serviceId, date });

    if (!businessId || !serviceId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'businessId, serviceId ve date gerekli.' 
      });
    }

    const business = await Business.findById(businessId);
    const service = await Service.findById(serviceId);

    if (!business || !service) {
      return res.status(404).json({ 
        success: false, 
        message: 'İşletme veya hizmet bulunamadı.' 
      });
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dateObj = new Date(date);
    const dayName = days[dateObj.getDay()];
    const daySchedule = business.workingHours?.[dayName];

    if (!daySchedule || !daySchedule.active) {
      return res.status(200).json({ 
        success: true, 
        message: 'İşletme bu gün kapalıdır.', 
        data: [] 
      });
    }

    const query = { 
      businessId, 
      date,
      status: { $in: ['pending', 'confirmed'] }
    };
    
    if (staffId && staffId !== 'undefined' && staffId !== 'null') {
      query.staffId = staffId;
    }

    const bookedAppointments = await Appointment.find(query);
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

    let currentMins = timeToMinutes(daySchedule.start);
    const closingMins = timeToMinutes(daySchedule.end);

    while (currentMins + duration <= closingMins) {
      const slotStart = minutesToTime(currentMins);
      const slotEnd = minutesToTime(currentMins + duration);

      const isOverlapping = bookedAppointments.some(appt => {
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
    console.error('❌ Saat hesaplama hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Saatler hesaplanırken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Randevu iptal et (müşteri tarafı)
// @route   PATCH /api/appointments/:id/cancel
// @access  Public
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Randevu zaten iptal edilmiş.' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Tamamlanmış randevular iptal edilemez.' });
    }

    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 2 && hoursDiff > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Randevu başlangıcına 2 saatten az kaldı, iptal edilemez. Lütfen işletme ile iletişime geçin.' 
      });
    }

    if (appointmentDate < now) {
      return res.status(400).json({ success: false, message: 'Geçmiş tarihli randevular iptal edilemez.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await notificationController.createAppointmentCancelledNotification(
      appointment.businessId,
      appointment,
      appointment.customerId,
      appointment.serviceId
    );

    res.status(200).json({ success: true, message: 'Randevunuz başarıyla iptal edildi.' });
  } catch (error) {
    console.error('İptal hatası:', error);
    res.status(500).json({ success: false, message: 'İptal işlemi sırasında bir hata oluştu.' });
  }
};

// @desc    Randevu tarih/saat değiştir (reschedule)
// @route   PUT /api/appointments/:id/reschedule
// @access  Public
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointmentId = req.params.id;

    if (!newDate || !newTime) {
      return res.status(400).json({ success: false, message: 'Yeni tarih ve saat gerekli.' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('businessId')
      .populate('serviceId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı.' });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Bu randevu değiştirilemez.' });
    }

    const [hours, minutes] = newTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + appointment.serviceId.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const newEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const existingAppointment = await Appointment.findOne({
      businessId: appointment.businessId._id,
      staffId: appointment.staffId,
      date: newDate,
      startTime: newTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Seçilen saat için randevu zaten alınmış.' });
    }

    appointment.date = newDate;
    appointment.startTime = newTime;
    appointment.endTime = newEndTime;
    appointment.status = 'pending';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Randevunuz başarıyla güncellendi. İşletme onayı bekleniyor.', data: appointment });
  } catch (error) {
    console.error('❌ Randevu değiştirme hatası:', error);
    res.status(500).json({ success: false, message: 'Randevu değiştirilirken bir hata oluştu.' });
  }
};