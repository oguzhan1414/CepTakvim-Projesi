import axios from 'axios';

const API_URL = 'https://ceptakvim-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('business');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== PUBLIC API (Müşteri Tarafı) ====================
const publicAPI = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const publicService = {
  getAllBusinesses: () => publicAPI.get('/public/businesses'),
  getBusiness: (slug) => publicAPI.get(`/public/business/${slug}`),
  getServices: (businessId) => publicAPI.get(`/public/services/${businessId}`),
  getStaff: (businessId) => publicAPI.get(`/public/staff/${businessId}`),
  getAvailableSlots: (params) => publicAPI.get('/public/availability', { params }),
  createAppointment: (data) => publicAPI.post('/public/appointments', data),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
};

// ==================== AUTH SERVICES ====================
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
  getOnboardingStatus: () => api.get('/auth/onboarding-status'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetToken: (params) => api.get('/auth/verify-reset-token', { params }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
};
// ==================== BUSINESS SERVICES ====================
export const businessService = {
  getProfile: () => api.get('/business/profile'),
  updateProfile: (data) => api.put('/business/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ==================== DASHBOARD SERVICES ====================
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

// ==================== APPOINTMENT SERVICES (DÜZELTİLDİ) ====================
export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getToday: () => api.get('/appointments/today'),
  getUpcoming: (limit = 5) => api.get(`/appointments/upcoming?limit=${limit}`),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`), // Public endpoint
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data), // YENİ

  getRevenueByDate: (params) => api.get('/appointments/revenue', { params }),
  getServiceDistribution: (params) => api.get('/appointments/service-distribution', { params }),
  getHourlyDistribution: (params) => api.get('/appointments/hourly-distribution', { params }),
  getStaffPerformance: (params) => api.get('/appointments/staff-performance', { params }),
};
// ==================== CUSTOMER SERVICES ====================
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getOne: (id) => api.get(`/customers/${id}`),
  getDetails: (id) => api.get(`/customers/${id}/details`), // YENİ: CRM Detayları
  getByPhone: (phone) => api.get(`/customers/phone/${phone}`), // Public endpoint
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};


// ==================== SERVICE SERVICES ====================
export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  bulkCreate: (data) => api.post('/services/bulk', { services: data }),
};

// ==================== STAFF SERVICES ====================
export const staffService = {
  getAll: (params) => api.get('/staff', { params }),
  getOne: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  bulkCreate: (data) => api.post('/staff/bulk', { staff: data }),
};

// Notification servisleri (backend hazır olduğunda aktif edilecek)
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ==================== CONTACT SERVICES ====================
export const contactService = {
  
  sendMessage: (data) => api.post('/contact/send', data),
};

// ==================== PAYMENT SERVICES ====================
export const paymentService = {
  // Ödemeyi başlatır ve Iyzico yönlendirme linkini döner
  initialize: (data) => api.post('/payment/initialize', data),
};

export default api;


