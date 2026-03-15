const iyzipay = require('../utils/iyzipay');
const Business = require('../models/Business');

// Paket fiyatlandırmalarımız (İleride veritabanından da çekilebilir, şimdilik sabit)
const PLANS = {
  basic: { name: 'Başlangıç Paketi', price: '299.0' },
  pro: { name: 'Profesyonel Paket', price: '599.0' },
  enterprise: { name: 'Kurumsal Paket', price: '999.0' }
};

// @desc    Iyzico Ödeme Formunu Başlat (Checkout Form Initialize)
// @route   POST /api/payment/initialize
// @access  Private (Sadece giriş yapmış işletmeler)
exports.initializePayment = async (req, res) => {
  try {
    const { planType } = req.body; // frontend'den 'pro' veya 'basic' gelecek
    const businessId = req.business._id; // Token'dan gelen işletme ID'si

    // 1. İşletmeyi ve seçilen paketi kontrol et
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
    }

    const selectedPlan = PLANS[planType];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: 'Geçersiz paket seçimi.' });
    }

    // 2. Iyzico için İstek (Request) Objesini Hazırla
    const request = {
      locale: 'tr',
      conversationId: business._id.toString(), // İşlemi takip etmek için kendi ID'mizi veriyoruz
      price: selectedPlan.price,
      paidPrice: selectedPlan.price,
      currency: 'TRY',
      basketId: `BASKET-${business._id}-${Date.now()}`,
      paymentGroup: 'SUBSCRIPTION',
      
      // Ödeme bitince Iyzico'nun sonucu göndereceği BİZİM BACKEND URL'İMİZ (Bunu birazdan yazacağız)
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/callback`,
      
      enabledInstallments: [1], // Tek çekim
      
      // ALICI BİLGİLERİ (Iyzico sahte veri bile olsa bunların dolu olmasını ister)
      buyer: {
        id: business._id.toString(),
        name: business.businessName.split(' ')[0] || 'İşletme',
        surname: business.businessName.split(' ')[1] || 'Sahibi',
        gsmNumber: business.phone || '+905555555555',
        email: business.email,
        identityNumber: '11111111111', // Test ortamı için sabit TC
        registrationAddress: business.address || 'İstanbul, Türkiye',
        ip: req.ip || '85.34.78.112', // İşlemi yapan cihazın IP'si
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      
      // FATURA VE TESLİMAT ADRESİ (Sanal ürün de olsa adres zorunludur)
      shippingAddress: {
        contactName: business.businessName,
        city: 'Istanbul',
        country: 'Turkey',
        address: business.address || 'İstanbul, Türkiye',
        zipCode: '34732'
      },
      billingAddress: {
        contactName: business.businessName,
        city: 'Istanbul',
        country: 'Turkey',
        address: business.address || 'İstanbul, Türkiye',
        zipCode: '34732'
      },
      
      // SEPET İÇERİĞİ (Neyi satın alıyor?)
      basketItems: [
        {
          id: `ITEM-${planType.toUpperCase()}`,
          name: selectedPlan.name,
          category1: 'Yazılım',
          category2: 'Abonelik',
          itemType: 'VIRTUAL', // Sanal (fiziksel kargo yok)
          price: selectedPlan.price
        }
      ]
    };

    // 3. Iyzico'ya İsteği Gönder
    iyzipay.checkoutFormInitialize.create(request, function (err, result) {
      if (err) {
        console.error('Iyzico Hatası:', err);
        return res.status(500).json({ success: false, message: 'Ödeme altyapısında bir hata oluştu.' });
      }

      // Eğer Iyzico'dan başarılı cevap geldiyse
      if (result.status === 'success') {
        res.status(200).json({
          success: true,
          // Iyzico bize bir paymentPageUrl verir. Frontend'i bu URL'e yönlendireceğiz.
          paymentPageUrl: result.paymentPageUrl,
          token: result.token // İşlemi doğrulamak için token
        });
      } else {
        // Iyzico "başarısız" derse hata mesajını dön
        res.status(400).json({
          success: false,
          message: result.errorMessage || 'Ödeme başlatılamadı.'
        });
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu Hatası', error: error.message });
  }
};

// @desc    Iyzico'dan Gelen Ödeme Sonucunu Yakala (Webhook/Callback)
// @route   POST /api/payment/callback
// @access  Public (Iyzico'nun sunucuları buraya istek atacak, o yüzden tokene gerek yok)
exports.paymentCallback = async (req, res) => {
  try {
    // Iyzico ödeme bitince bize POST ile bir 'token' gönderir
    const { token } = req.body;

    if (!token) {
      return res.status(400).send('Geçersiz işlem: Token bulunamadı.');
    }

    // 1. Iyzico'ya token'ı gönderip işlemin gerçek sonucunu soruyoruz
    iyzipay.checkoutForm.retrieve({
      locale: 'tr',
      token: token
    }, async function (err, result) {
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      if (err) {
        console.error('Iyzico Retrieve Hatası:', err);
        return res.redirect(`${frontendUrl}/dashboard?payment=error`);
      }

      // 2. Eğer ödeme GERÇEKTEN BAŞARILIYSA
      if (result.paymentStatus === 'SUCCESS') {
        
        // Ödemeyi başlatırken conversationId içine İşletme ID'sini (businessId) koymuştuk. Onu geri alıyoruz.
        const businessId = result.conversationId;
        
        // Hangi paketi aldığını sepetten (basketItems) buluyoruz. (Örn: 'ITEM-PRO' -> 'pro' olarak ayırıyoruz)
        const itemId = result.itemTransactions[0].itemId; // 'ITEM-PRO', 'ITEM-BASIC' vb.
        const planType = itemId.split('-')[1].toLowerCase(); 

        // 3. Veritabanında İşletmeyi Güncelle
        const business = await Business.findById(businessId);
        
        if (business) {
          business.plan = planType;
          
          // Abonelik süresini bugünden itibaren 30 gün uzat (Mevcut sürenin üstüne eklemiyoruz, direkt bugünden 30 gün)
          business.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          // Eğer gerekliyse personel limitlerini de pakete göre güncelleyebilirsin
          if (planType === 'pro') business.staffLimit = 5;
          if (planType === 'enterprise') business.staffLimit = 999;

          await business.save();
        }

        // 4. Müşteriyi React (Frontend) tarafındaki Dashboard'a "Ödeme Başarılı" mesajıyla geri yönlendir
        return res.redirect(`${frontendUrl}/dashboard?payment=success`);
        
      } else {
        // Ödeme başarısızsa (Kartta bakiye yoksa, 3D yanlış girildiyse vb.)
        return res.redirect(`${frontendUrl}/dashboard?payment=failed`);
      }
    });

  } catch (error) {
    console.error('Callback Sunucu Hatası:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=error`);
  }
};