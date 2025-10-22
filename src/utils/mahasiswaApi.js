// API utility functions for Mahasiswa operations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  // Try to get token from localStorage first
  let token = localStorage.getItem('token');
  
  // If not found, try to get from user object in localStorage
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
        // Store the token separately for consistency
        if (token) {
          localStorage.setItem('token', token);
        }
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
  }
  
  // Validate token exists
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required. Please login again.');
  }
  
  console.log('Making mahasiswa request with token:', token ? 'Token found' : 'No token');
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      // 401 = Token invalid/expired - clear tokens and redirect to login
      console.error('Authentication failed (401), clearing tokens...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (response.status === 403) {
      // 403 = Token valid but access denied - DON'T clear tokens
      const errorData = await response.json();
      console.error('Access denied (403):', errorData.error || 'Forbidden');
      throw new Error(errorData.error || 'Access denied to this resource');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
};

// Get mahasiswa profile
export const getMahasiswaProfile = () => {
  return makeRequest('/auth/mahasiswa/profile');
};

// Get courses enrolled by mahasiswa
export const getMahasiswaCourses = () => {
  return makeRequest('/auth/mahasiswa/courses');
};

// Get tugas besar for specific course
export const getTugasBesarByCourse = (courseId) => {
  return makeRequest(`/auth/mahasiswa/courses/${courseId}/tugas-besar`);
};

// Get course detail with enrollment info
export const getCourseDetail = (courseId) => {
  return makeRequest(`/auth/mahasiswa/courses/${courseId}`);
};

// Get all tugas besar across all enrolled courses
export const getAllTugasBesarMahasiswa = () => {
  return makeRequest('/auth/mahasiswa/tugas-besar');
};

// Get kelompok for specific tugas besar
export const getKelompokByTugasBesar = (tugasBesarId) => {
  return makeRequest(`/auth/mahasiswa/tugas-besar/${tugasBesarId}/kelompok`);
};

// Join kelompok (if student choice is enabled)
export const joinKelompok = (tugasBesarId, kelompokId) => {
  return makeRequest(`/auth/mahasiswa/tugas-besar/${tugasBesarId}/kelompok/${kelompokId}/join`, {
    method: 'POST'
  });
};