const Service = require('../models/Service');

// @desc    Yeni hizmet ekle
// @route   POST /api/services
// @access  Private
exports.addService = async (req, res) => {
  try {
    const { name, duration, price, description, isActive } = req.body;

    if (!name || !duration || price === undefined || price === null || price === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen hizmet adı, süresi ve fiyatını girin.' 
      });
    }

    const service = await Service.create({
      businessId: req.business._id,
      name,
      duration,
      price,
      description,
      isActive: isActive !== false
    });

    res.status(201).json({
      success: true,
      message: 'Hizmet başarıyla eklendi.',
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hizmet eklenirken hata oluştu.', error: error.message });
  }
};

// @desc    İşletmenin tüm hizmetlerini getir
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = { businessId: req.business._id };
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hizmetler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tek hizmet getir
// @route   GET /api/services/:id
// @access  Private
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Hizmet bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hizmet getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Hizmet güncelle
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res) => {
  try {
    const { name, duration, price, description, isActive } = req.body;

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ success: false, message: 'Fiyat alanı boş bırakılamaz.' });
    }

    let service = await Service.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Hizmet bulunamadı.' });
    }

    service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, duration, price, description, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Hizmet başarıyla güncellendi.',
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hizmet güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Hizmet sil
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Hizmet bulunamadı.' });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hizmet başarıyla silindi.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hizmet silinirken hata oluştu.', error: error.message });
  }
};

// @desc    Birden fazla hizmet ekle (Bulk create) - Onboarding için
// @route   POST /api/services/bulk
// @access  Private
exports.bulkCreateServices = async (req, res) => {
  try {
    const { services } = req.body;

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen en az bir hizmet girin.' 
      });
    }

    // Her hizmete businessId ekle
    const servicesWithBusiness = services.map(s => ({
      businessId: req.business._id,
      name: s.name,
      duration: s.duration || 30,
      price: s.price,
      description: s.description || '',
      isActive: true
    }));

    const createdServices = await Service.insertMany(servicesWithBusiness);

    res.status(201).json({
      success: true,
      message: `${createdServices.length} hizmet başarıyla eklendi.`,
      count: createdServices.length,
      data: createdServices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Toplu hizmet eklenirken hata oluştu.', error: error.message });
  }
};

