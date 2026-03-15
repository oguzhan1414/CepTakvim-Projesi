const Staff = require('../models/Staff');

// @desc    Yeni personel ekle
// @route   POST /api/staff
// @access  Private
exports.addStaff = async (req, res) => {
  try {
    const { name, title, avatarUrl } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Personel adı zorunludur.' 
      });
    }

    const staff = await Staff.create({
      businessId: req.business._id,
      name,
      title: title || 'Uzman',
      avatarUrl: avatarUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Personel başarıyla eklendi.',
      data: staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Personel eklenirken hata oluştu.', error: error.message });
  }
};

// @desc    İşletmenin tüm personellerini getir
// @route   GET /api/staff
// @access  Private
exports.getStaff = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = { businessId: req.business._id };
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const staffMembers = await Staff.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: staffMembers.length,
      data: staffMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Personeller getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tek personel getir
// @route   GET /api/staff/:id
// @access  Private
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Personel bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Personel getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Personel güncelle
// @route   PUT /api/staff/:id
// @access  Private
exports.updateStaff = async (req, res) => {
  try {
    const { name, title, avatarUrl, isActive } = req.body;

    let staff = await Staff.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Personel bulunamadı.' });
    }

    staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, title, avatarUrl, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Personel başarıyla güncellendi.',
      data: staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Personel güncellenirken hata oluştu.', error: error.message });
  }
};

// @desc    Personel sil
// @route   DELETE /api/staff/:id
// @access  Private
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      businessId: req.business._id
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Personel bulunamadı.' });
    }

    await Staff.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Personel başarıyla silindi.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Personel silinirken hata oluştu.', error: error.message });
  }
};

// @desc    Birden fazla personel ekle (Bulk create) - Onboarding için
// @route   POST /api/staff/bulk
// @access  Private
exports.bulkCreateStaff = async (req, res) => {
  try {
    const { staff } = req.body;

    if (!staff || !Array.isArray(staff) || staff.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lütfen en az bir personel girin.' 
      });
    }

    // Her personele businessId ekle
    const staffWithBusiness = staff.map(s => ({
      businessId: req.business._id,
      name: s.name,
      title: s.title || 'Uzman',
      avatarUrl: s.avatarUrl || '',
      isActive: true
    }));

    const createdStaff = await Staff.insertMany(staffWithBusiness);

    res.status(201).json({
      success: true,
      message: `${createdStaff.length} personel başarıyla eklendi.`,
      count: createdStaff.length,
      data: createdStaff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Toplu personel eklenirken hata oluştu.', error: error.message });
  }
};

