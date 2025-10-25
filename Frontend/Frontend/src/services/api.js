import axios from 'axios';

// Create a separate axios instance for file uploads (no default headers)
const uploadApi = axios.create({
  baseURL: '/api', // Use proxy
  timeout: 30000, // Longer timeout for file uploads
  // No Content-Type header - let browser set it for FormData
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will use the proxy from package.json
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Always set Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For multipart/form-data, remove Content-Type so browser sets it correctly with boundary
    if (config.data instanceof FormData) {
      // Delete the default Content-Type header
      delete config.headers['Content-Type'];
      delete config.headers.post['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // NEVER auto-logout - let individual pages handle authentication errors
    // This prevents unwanted logouts during payment uploads and form submissions
    
    // Just log the error for debugging
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Error:', error.response?.data);
      console.warn('URL:', error.config?.url);
      console.warn('Method:', error.config?.method);
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerStudent: (studentData) => api.post('/auth/register/student', studentData),
  registerAdmin: (adminData) => api.post('/auth/register/admin', adminData),
};

// Universities API calls
export const universitiesAPI = {
  getAll: () => api.get('/universities'),
  getById: (id) => api.get(`/universities/${id}`),
  create: (universityData) => api.post('/universities', universityData),
  update: (id, universityData) => api.put(`/universities/${id}`, universityData),
  delete: (id) => api.delete(`/universities/${id}`),
};

// Programs API calls
export const programsAPI = {
  getAll: () => api.get('/programs'),
  getById: (id) => api.get(`/programs/${id}`),
  getByUniversity: (universityId) => api.get(`/programs/university/${universityId}`),
  getByDegreeType: (type) => api.get(`/programs/degree/${type}`),
  getByStatus: (status) => api.get(`/programs/status/${status}`),
  create: (programData) => api.post('/programs', programData),
  update: (id, programData) => api.put(`/programs/${id}`, programData),
  delete: (id) => api.delete(`/programs/${id}`),
};

// Applications API calls (now using students endpoint)
export const applicationsAPI = {
  getAll: () => api.get('/students/applications'),
  // Fetch all real Application entities (ApplicationController)
  getAllApplications: () => api.get('/applications'),
  // Fetch a specific application by its ID (ApplicationController)
  getById: (id) => api.get(`/applications/${id}`),
  // Fetch all applications for a given student (ApplicationController)
  getByStudent: (studentId) => api.get(`/applications/student/${studentId}`),
  getByUniversity: (universityId) => api.get(`/applications/university/${universityId}`),
  getByProgram: (programId) => api.get(`/applications/program/${programId}`),
  getByStatus: (status) => api.get(`/applications/status/${status}`),
  // Create application via StudentController convenience endpoint
  create: (applicationData) => api.post(`/students/${applicationData.studentId}/application`, applicationData),
  update: (id, applicationData) => api.put(`/applications/${id}`, applicationData),
  // Update application status for a student record (StudentController)
  updateStatus: (studentId, status) => api.patch(`/students/${studentId}/application/status?status=${status}`),
  // Update application status on Application entity (ApplicationController)
  updateApplicationStatus: (id, status) => api.patch(`/applications/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Students API calls
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getByEmail: (email) => api.get(`/students/email/${email}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
};

// Admin API calls
export const adminAPI = {
  getAll: () => api.get('/admins'),
  getById: (id) => api.get(`/admins/${id}`),
  getByEmail: (email) => api.get(`/admins/email/${email}`),
  create: (adminData) => api.post('/admins', adminData),
  update: (id, adminData) => api.put(`/admins/${id}`, adminData),
  delete: (id) => api.delete(`/admins/${id}`),
};


// Contact Messages API calls
export const contactAPI = {
  send: (messageData) => api.post('/contact-messages', messageData),
  getAll: () => api.get('/contact-messages'),
  getById: (id) => api.get(`/contact-messages/${id}`),
  getByType: (type) => api.get(`/contact-messages/type/${type}`),
  update: (id, messageData) => api.put(`/contact-messages/${id}`, messageData),
  markAsRead: (id) => api.patch(`/contact-messages/${id}/mark-read`),
  getUnreadCount: () => api.get('/contact-messages/unread-count'),
  delete: (id) => api.delete(`/contact-messages/${id}`),
};

// Payments API calls
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByApplication: (applicationId) => api.get(`/payments/application/${applicationId}`),
  // create supports FormData (with slipFile)
  create: (paymentData) => {
    // Use uploadApi which has no default Content-Type header
    const token = localStorage.getItem('token');
    return uploadApi.post('/payments/upload', paymentData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
      }
    });
  },
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  updateStatus: (id, status, reason) => api.patch(`/payments/${id}/status?status=${status}&reason=${reason || ''}`),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Notifications API calls
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  getAdminNotifications: () => api.get('/notifications/admin'),
  getStudentNotifications: (studentId) => api.get(`/notifications/student/${studentId}`),
  markAsRead: (id) => api.put(`/notifications/${id}/mark-read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  sendToStudent: (studentId, notificationData) => api.post(`/notifications/send-to-student/${studentId}`, notificationData),
};

export default api;





