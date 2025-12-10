import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Fixed port: 5001 to match backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging and handling authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {// Handle authentication errors globally
    if (error.response?.status === 401 || error.response?.status === 403) {// Clear localStorage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// Mahasiswa API calls
export const getMahasiswaClasses = () => {
  return api.get('/auth/mahasiswa/classes');
};

// Dosen API calls
export const getDosenCourses = () => {
  return api.get('/auth/dosen/courses');
};

export const getDosenClasses = () => {
  return api.get('/auth/dosen/classes');
};

// Admin API calls
export const getUsers = () => {
  return api.get('/admin/users');
};

export const createDosen = (dosenData) => {
  return api.post('/admin/dosen', dosenData);
};

export const createMahasiswa = (mahasiswaData) => {
  return api.post('/admin/mahasiswa', mahasiswaData);
};

export const getMahasiswaCourses = async () => {
  try {
    const response = await api.get('/auth/mahasiswa/courses');
    return response;
  } catch (error) {
    console.error('Error fetching mahasiswa courses:', error);
    throw error;
  }
};

// Note: Dosen API endpoints will be added when backend routes are implemented
// For now, using existing /auth/dosen/courses endpoint

export default api;