import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout/MainLayout';
import DashboardLayout from './layouts/DashboardLayout/DashboardL';

// Auth Context
import { AuthProvider } from './context/authContext';

// Ana Sayfa
import Landing from './pages/Landing/Landing';

// Auth Sayfaları
import Login from './pages/Auth/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

// Onboarding
import Onboarding from './pages/Onboarding/Onboarding';

// Dashboard Sayfaları
import Dashboard from './pages/Dashboard/Dashboard';
import Calendar from './pages/Dashboard/Calendar';
import Customers from './pages/Dashboard/Customers';
import Reports from './pages/Dashboard/Reports';
import Settings from './pages/Dashboard/Settings';

// Public Sayfalar
import BookingPage from './pages/PublicBooking/BookingPage';
import Businesses from './pages/Businesses/Businesses';
import FindBusiness from './pages/Public/FindBusiness';
import BusinessDetails from './pages/Public/BusinessDetails';
import MyAppointments from './pages/Public/MyAppointments';  

// Footer Sayfaları
import Blog from './pages/Blog/Blog';
import Help from './pages/Help/Help';
import FAQ from './pages/FAQ/FAQ';
import Contact from './pages/Contact/Contact';
import Legal from './pages/Legal/Legal';

// Components
import Scrool from './components/ScrollToTop/ScrollToTop';
import ChatWidget from './components/ChatWidget/ChatWidget';
import CookieBanner from './components/CookieBanner/CookieBanner'; // Çerez banner'ı


// ==========================================
// 🛡️ AKILLI GÜVENLİK GÖREVLİLERİ (YENİ EKLENDİ)
// ==========================================

// Token var mı diye kontrol eden fonksiyon
const isAuthenticated = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// 1. Zaten giriş yapmış adamı Login/Register'a sokmayan, direkt içeri atan Rota
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// 2. Giriş yapmamış adamı Dashboard'a sokmayan, zorla Login'e atan Rota
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ==========================================


function App() {
  return (
    <BrowserRouter>
      <ChatWidget />
      <Scrool/>
      <CookieBanner />

      <Routes>
        {/* Ana Sayfa (Herkes görebilir) */}
        <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
        
        {/* İşletmeler ve Randevu */}
        <Route path="/businesses" element={<MainLayout><Businesses /></MainLayout>} />
        
        {/* === AUTH SAYFALARI (Giriş yaptıysa bir daha göremez, direkt panele uçar) === */}
        <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
        <Route path="/register" element={ <PublicRoute><Register /></PublicRoute> } />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/randevularim" element={<MyAppointments/>}></Route>
        
        {/* Public Randevu Sayfası */}
        <Route path="/booking/:slug" element={<BookingPage />} />
        <Route path="/randevu-al" element={<FindBusiness />} />
        <Route path="/isletme/:slug" element={<BusinessDetails />} />
        
        {/* === DASHBOARD ROUTES (Giriş yapmayan kimse giremez) === */}
        <Route path="/dashboard" element={ <ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute> } />
        <Route path="/dashboard/calendar" element={ <ProtectedRoute><DashboardLayout><Calendar /></DashboardLayout></ProtectedRoute> } />
        <Route path="/dashboard/customers" element={ <ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute> } />
        <Route path="/dashboard/reports" element={ <ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute> } />
        <Route path="/dashboard/settings" element={ <ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute> } />
        
        {/* Footer Sayfaları */}
        <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
        <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
        <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/legal" element={<MainLayout><Legal /></MainLayout>} />
        
        {/* Yasal Yönlendirmeler */}
        <Route path="/kvkk" element={<Navigate to="/legal" replace />} />
        <Route path="/gizlilik" element={<Navigate to="/legal" replace />} />
        <Route path="/kullanim" element={<Navigate to="/legal" replace />} />
        <Route path="/privacy" element={<Navigate to="/legal" replace />} />
        <Route path="/terms" element={<Navigate to="/legal" replace />} />

        {/* 404 - Ana Sayfaya Yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;