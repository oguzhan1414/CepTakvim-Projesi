const Customer = require('../models/Customer');
const notificationController = require('./notificationController'); // YENİ - Bildirim controller'ını ekle
const Appointment = require('../models/Appointment')

// @desc    Yeni müşteri ekle
// @route   POST /api/customers
// @access  Private
exports.addCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, notes, specialNote, birthDate } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Müşteri adı ve telefonu zorunludur.' 
      });
    }

    // Aynı telefon numarasıyla bu işletmeye daha önce kayıtlı bir müşteri var mı kontrol et
    const existingCustomer = await Customer.findOne({ 
      businessId: req.business._id, 
      phone 
    });

    if (existingCustomer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu telefon numarasına sahip bir müşteri zaten var.' 
      });
    }

    const customer = await Customer.create({
      businessId: req.business._id,
      fullName,
      phone,
      email,
      notes,
      specialNote,
      birthDate,
      totalSpent: 0,
      status: 'Regular'
    });

    // 🔔 BİLDİRİM OLUŞTUR - Yeni müşteri eklendi
    await notificationController.createNewCustomerNotification(
      req.business._id,
      customer
    );

    res.status(201).json({
      success: true,
      message: 'Müşteri başarıyla eklendi.',
      data: customer
    });
  } catch (error) {
    console.error('Müşteri ekleme hatası:', error);
    res.status(500).json({ success: false, message: 'Müşteri eklenirken hata oluştu.', error: error.message });
  }
};

// @desc    İşletmenin tüm müşterilerini getir
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const filter = { businessId: req.business._id };
    if (status) {
      filter.status = status;
    }

    let customers = await Customer.find(filter).sort({ createdAt: -1 });

    // Arama filtresi
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        c.fullName.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(searchLower))
      );
    }

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Müşteriler getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Müşteriler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tek müşteri getir
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Müşteri getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Müşteri getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Müşteri güncelle
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, notes, status, specialNote, birthDate } = req.body;

    let customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı.' });
    }

    // Telefon değişmişse, yeni telefonun başka müşteride olup olmadığını kontrol et
    if (phone && phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ 
        businessId: req.business._id, 
        phone 
      });
      if (existingCustomer) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bu telefon numarası başka bir müşteriye ait.' 
        });
      }
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, email, notes, status, specialNote, birthDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Müşteri başarıyla güncellendi.',
      data: customer
    });
  } catch (error) {
    console.error('Müşteri güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Müşteri güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Müşteri sil
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı.' });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Müşteri başarıyla silindi.'
    });
  } catch (error) {
    console.error('Müşteri silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Müşteri silinirken hata oluştu.', error: error.message });
  }
};


// @desc    Telefon numarası ile müşteri ve randevularını getir
// @route   GET /api/customers/phone/:phone
// @access  Public
exports.getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    // Telefon numarasını temizle (boşlukları kaldır)
    const cleanPhone = phone.replace(/\s/g, '');

    // Müşteriyi bul
    const customer = await Customer.findOne({ phone: cleanPhone });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Bu telefon numarasına ait müşteri bulunamadı.'
      });
    }

    // Müşterinin randevularını bul
    const appointments = await Appointment.find({ 
      customerId: customer._id 
    })
    .populate('businessId', 'businessName address')
    .populate('serviceId', 'name duration price')
    .sort('-date -startTime');

    res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        phone: customer.phone
      },
      appointments
    });

  } catch (error) {
    console.error('Müşteri bulunamadı:', error);
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu.'
    });
  }
};

// @desc    Müşteri detayını ve randevu geçmişini getir (CRM için)
// @route   GET /api/customers/:id/details
// @access  Private
exports.getCustomerDetails = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı.' });
    }

    // Müşterinin bu işletmedeki geçmiş ve gelecek randevularını getir
    const appointments = await Appointment.find({
      customerId: customer._id,
      businessId: req.business._id
    })
    .populate('serviceId', 'name price duration')
    .populate('staffId', 'name')
    .sort({ date: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      data: {
        customer,
        appointments
      }
    });
  } catch (error) {
    console.error('Müşteri detayları getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Müşteri detayları alınamadı.', error: error.message });
  }
};