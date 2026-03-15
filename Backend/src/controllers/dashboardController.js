const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');

// @desc    İşletmenin ana sayfa istatistiklerini getir
// @route   GET /api/dashboard
// @access  Private (Sadece giriş yapmış işletmeler)
exports.getDashboardStats = async (req, res) => {
  try {
    const businessId = req.business._id;
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // ── 0. GEÇMİŞ TARİHLİ PENDING → NOSHOW otomatik geçiş ────────────────
    // Dashboard her açıldığında, tarihi geçmiş ama hâlâ "bekliyor" görünen
    // randevular otomatik olarak "noshow" statüsüne alınır.
    await Appointment.updateMany(
      { businessId, status: 'pending', date: { $lt: today } },
      { $set: { status: 'noshow' } }
    );

    // ── 1. Temel sayımlar ──────────────────────────────────────────────────
    const totalCustomers    = await Customer.countDocuments({ businessId });
    const totalStaff        = await Staff.countDocuments({ businessId });
    const totalAppointments = await Appointment.countDocuments({ businessId });

    // ── 2. Bugünün Randevuları ─────────────────────────────────────────────
    const todaysAppointments = await Appointment.find({ businessId, date: today })
      .populate('customerId', 'fullName phone')
      .populate('staffId', 'name')
      .populate('serviceId', 'name price duration')
      .sort({ startTime: 1 });

    // ── 3. Bekleyen onaylar (SADECE bugün ve sonrası) ──────────────────────
    // Geçmiş pending'ler zaten yukarıda noshow'a çevrildi,
    // bu yüzden artık burada yalnızca gerçekten beklenen randevular çıkar.
    const pendingAppointments = await Appointment.countDocuments({
      businessId,
      status: 'pending',
      date: { $gte: today }
    });

    // ── 4. Tamamlanan randevular (tüm zamanlar) ────────────────────────────
    const completedAppointments = await Appointment.countDocuments({
      businessId,
      status: 'completed'
    });

    // ── 5. Bugünkü Ciro (bugün tamamlanan randevuların fiyatları) ──────────
    const todayRevenueAgg = await Appointment.aggregate([
      { $match: { businessId, date: today, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalStaff,
        totalAppointments,
        todaysAppointmentsCount: todaysAppointments.length,
        todaysAppointments,
        pendingAppointments,
        completedAppointments,
        todayRevenue
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu.',
      error: error.message
    });
  }
};
