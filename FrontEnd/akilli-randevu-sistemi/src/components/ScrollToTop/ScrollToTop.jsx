import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Mevcut sayfanın yolunu (URL'sini) dinliyoruz
  const { pathname } = useLocation();

  // URL her değiştiğinde bu kod çalışır ve sayfayı en üste (0, 0 kordinatlarına) anında kaydırır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Ekranda hiçbir şey göstermeyeceği için null döndürüyoruz
  return null;
};

export default ScrollToTop;