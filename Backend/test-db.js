require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

const url = process.env.DB_URL;

// Atlas hostname'ini URL'den çıkar
const match = url && url.match(/@([^\/]+)/);
const host = match ? match[1] : null;

console.log('🔍 DB_URL:', url ? url.replace(/:([^:@]+)@/, ':***@') : 'TANIMSIZ');
console.log('🌐 Atlas Host:', host);

if (host) {
  dns.lookup(host, (err, address) => {
    if (err) {
      console.error('❌ DNS Çözümlenemedi:', err.message);
      console.log('\n📋 ÇÖZÜM ADIMI: Atlas Network Access\'e aşağıdaki IP\'yi ekleyin:');
    } else {
      console.log('✅ DNS Çözümlendi:', address);
    }
  });

  // SRV kaydını da test et
  const srvHost = `_mongodb._tcp.${host.split('.').slice(1).join('.')}`;
  dns.resolveSrv(srvHost, (err, addresses) => {
    if (err) {
      console.error('❌ SRV Kaydı Bulunamadı:', err.message);
    } else {
      console.log('✅ SRV Kayıtları:', addresses);
    }
  });
}

// Bağlantıyı dene
mongoose.connect(url, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('\n✅ MongoDB Atlas Bağlantısı BAŞARILI!');
    console.log('📦 Bağlı DB:', mongoose.connection.name);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('\n❌ Bağlantı Hatası:', err.message);
    
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.log('\n🔧 ÇÖZÜM: MongoDB Atlas \'Network Access\' bölümüne gidin ve IP\'nizi ekleyin.');
      console.log('   https://cloud.mongodb.com → Your Project → Network Access → + ADD IP ADDRESS');
      console.log('   "Allow Access from Anywhere" seçeneğini kullanarak 0.0.0.0/0 ekleyebilirsiniz (geliştirme için).');
    }
    
    if (err.message.includes('Authentication failed')) {
      console.log('\n🔧 ÇÖZÜM: Atlas\'ta kullanıcı adı/şifresi yanlış. Database Access bölümünü kontrol edin.');
    }
    
    process.exit(1);
  });
