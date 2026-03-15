import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, businessService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token var mı kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedBusiness = localStorage.getItem('business');
    
    if (token && savedBusiness) {
      setUser({ token });
      setBusiness(JSON.parse(savedBusiness));
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Kullanıcı verilerini getir
  const fetchUserData = async () => {
    try {
      const response = await businessService.getProfile();
      setBusiness(response.data.data);
      localStorage.setItem('business', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Giriş yap
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      
      const { token, data } = response.data;
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('business', JSON.stringify(data));
      
      setUser({ token });
      setBusiness(data);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.error || 'Giriş başarısız');
      return { success: false, error: error.response?.data?.error };
    }
  };

// Kayıt ol
  const register = async (businessData) => {
    try {
      setError(null);
      const response = await authService.register(businessData);
      
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('business', JSON.stringify(data));
      
      setUser({ token });
      setBusiness(data);
      
      // Onboarding tamamlanmadıysa onboarding sayfasına yönlendir
      if (!data.isOnboardingComplete) {
        return { success: true, needsOnboarding: true };
      }
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Kayıt başarısız');
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Onboarding'i tamamla
  const completeOnboarding = async (onboardingData) => {
    try {
      setError(null);
      const response = await authService.completeOnboarding(onboardingData);
      
      const { data } = response.data;
      
      // Güncel işletme bilgilerini kaydet
      localStorage.setItem('business', JSON.stringify(data));
      setBusiness(data);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Onboarding başarısız');
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Onboarding durumunu kontrol et
  const checkOnboardingStatus = async () => {
    try {
      const response = await authService.getOnboardingStatus();
      return response.data.data;
    } catch (error) {
      console.error('Onboarding durumu kontrol hatası:', error);
      return null;
    }
  };

  // Çıkış yap
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('business');
    setUser(null);
    setBusiness(null);
  };

  const value = {
    user,
    business,
    loading,
    error,
    login,
    register,
    logout,
    completeOnboarding,
    checkOnboardingStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};