const Notification = require('../models/Notification');

// @desc    Tüm bildirimleri getir
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { 
      businessId: req.business._id,
      isDeleted: false 
    };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .populate('relatedAppointmentId')
      .populate('relatedCustomerId')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      businessId: req.business._id,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bildirimler getirilirken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Bildirimi okundu işaretle
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bildirim bulunamadı.' 
      });
    }

    res.json({
      success: true,
      message: 'Bildirim okundu işaretlendi.',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bildirim okundu işaretlenirken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Tüm bildirimleri okundu işaretle
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { businessId: req.business._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Tüm bildirimler okundu işaretlendi.'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bildirimler okundu işaretlenirken hata oluştu.', 
      error: error.message 
    });
  }
};

// @desc    Bildirimi sil (soft delete)
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business._id },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bildirim bulunamadı.' 
      });
    }

    res.json({
      success: true,
      message: 'Bildirim silindi.'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bildirim silinirken hata oluştu.', 
      error: error.message 
    });
  }
};

// ========== BİLDİRİM OLUŞTURMA FONKSİYONLARI ==========

// Yeni randevu bildirimi
exports.createNewAppointmentNotification = async (businessId, appointment, customer, service) => {
  try {
    await Notification.create({
      businessId,
      type: 'new_appointment',
      title: 'Yeni Randevu',
      message: `${customer.fullName}, ${service?.name || 'hizmet'} için randevu oluşturdu.`,
      icon: 'calendar',
      color: '#4f46e5',
      action: '/dashboard/calendar',
      relatedAppointmentId: appointment._id,
      relatedCustomerId: customer._id,
      data: { 
        appointmentId: appointment._id, 
        customerId: customer._id,
        serviceName: service?.name
      }
    });
  } catch (error) {
    console.error('Bildirim oluşturulamadı:', error);
  }
};

// Randevu onay bildirimi
exports.createAppointmentConfirmedNotification = async (businessId, appointment, customer, service) => {
  try {
    await Notification.create({
      businessId,
      type: 'appointment_confirmed',
      title: 'Randevu Onaylandı',
      message: `${customer.fullName} için randevu onaylandı.`,
      icon: 'check',
      color: '#10b981',
      action: '/dashboard/calendar',
      relatedAppointmentId: appointment._id,
      relatedCustomerId: customer._id,
      data: { 
        appointmentId: appointment._id, 
        customerId: customer._id,
        serviceName: service?.name
      }
    });
  } catch (error) {
    console.error('Bildirim oluşturulamadı:', error);
  }
};

// Randevu iptal bildirimi
exports.createAppointmentCancelledNotification = async (businessId, appointment, customer, service) => {
  try {
    await Notification.create({
      businessId,
      type: 'appointment_cancelled',
      title: 'Randevu İptal Edildi',
      message: `${customer.fullName} randevusunu iptal etti.`,
      icon: 'x',
      color: '#ef4444',
      action: '/dashboard/calendar',
      relatedAppointmentId: appointment._id,
      relatedCustomerId: customer._id,
      data: { 
        appointmentId: appointment._id, 
        customerId: customer._id,
        serviceName: service?.name
      }
    });
  } catch (error) {
    console.error('Bildirim oluşturulamadı:', error);
  }
};

// Yeni müşteri bildirimi
exports.createNewCustomerNotification = async (businessId, customer) => {
  try {
    await Notification.create({
      businessId,
      type: 'new_customer',
      title: 'Yeni Müşteri',
      message: `${customer.fullName} sisteme kayıt oldu.`,
      icon: 'user-plus',
      color: '#f59e0b',
      action: '/dashboard/customers',
      relatedCustomerId: customer._id,
      data: { customerId: customer._id }
    });
  } catch (error) {
    console.error('Bildirim oluşturulamadı:', error);
  }
};

// Randevu hatırlatma bildirimi
exports.createReminderNotification = async (businessId, appointment, customer) => {
  try {
    const tomorrow = new Date(appointment.date);
    const dayStr = tomorrow.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    
    await Notification.create({
      businessId,
      type: 'appointment_reminder',
      title: 'Randevu Hatırlatması',
      message: `${dayStr} ${appointment.startTime}'da ${customer.fullName} için randevunuz var.`,
      icon: 'clock',
      color: '#ec4899',
      action: '/dashboard/calendar',
      relatedAppointmentId: appointment._id,
      relatedCustomerId: customer._id,
      data: { 
        appointmentId: appointment._id, 
        customerId: customer._id,
        date: appointment.date,
        time: appointment.startTime
      }
    });
  } catch (error) {
    console.error('Hatırlatma bildirimi oluşturulamadı:', error);
  }
};