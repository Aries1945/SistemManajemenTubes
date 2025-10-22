// API utility functions for Tugas Besar management

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
  
  console.log('Making request with token:', token ? 'Token found' : 'No token');
  
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
      // 403 = Token valid but access denied to specific resource - DON'T clear tokens
      const errorData = await response.json();
      console.error('Access denied (403):', errorData.error || 'Forbidden');
      throw new Error(errorData.error || 'Access denied to this resource');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
};

// ===== TUGAS BESAR FUNCTIONS =====

export const getTugasBesar = async (courseId, classId = null) => {
  let url = `/auth/dosen/courses/${courseId}/tugas-besar`;
  if (classId) {
    url += `?class_id=${classId}`;
  }
  return makeRequest(url);
};

export const createTugasBesar = async (courseId, tugasData) => {
  // Ensure class_id is included in tugasData
  if (!tugasData.class_id) {
    throw new Error('class_id is required for creating tugas besar');
  }
  
  return makeRequest(`/auth/dosen/courses/${courseId}/tugas-besar`, {
    method: 'POST',
    body: JSON.stringify(tugasData),
  });
};

export const updateTugasBesar = async (courseId, tugasId, tugasData) => {
  return makeRequest(`/auth/dosen/courses/${courseId}/tugas-besar/${tugasId}`, {
    method: 'PUT',
    body: JSON.stringify(tugasData),
  });
};

export const deleteTugasBesar = async (courseId, tugasId) => {
  return makeRequest(`/auth/dosen/courses/${courseId}/tugas-besar/${tugasId}`, {
    method: 'DELETE',
  });
};

// ===== TUGAS PROGRES FUNCTIONS =====

export const getTugasProgres = async (tugasId) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/progres`);
};

export const createTugasProgres = async (tugasId, progresData) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/progres`, {
    method: 'POST',
    body: JSON.stringify(progresData),
  });
};

export const updateTugasProgres = async (progresId, progresData) => {
  return makeRequest(`/auth/dosen/tugas-progres/${progresId}`, {
    method: 'PUT',
    body: JSON.stringify(progresData),
  });
};

export const deleteTugasProgres = async (progresId) => {
  return makeRequest(`/auth/dosen/tugas-progres/${progresId}`, {
    method: 'DELETE',
  });
};

// ===== KELOMPOK FUNCTIONS =====

export const getKelompok = async (tugasId) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/kelompok`);
};

// ===== CONVENIENCE FUNCTIONS =====

export const getTugasBesarWithProgres = async (courseId, tugasId) => {
  try {
    const [tugasBesarResponse, progresResponse] = await Promise.all([
      getTugasBesar(courseId),
      getTugasProgres(tugasId)
    ]);

    const tugas = tugasBesarResponse.tugasBesar?.find(t => t.id === parseInt(tugasId));
    
    return {
      tugasBesar: tugas,
      tugasProgres: progresResponse.tugasProgres || []
    };
  } catch (error) {
    console.error('Error fetching tugas besar with progres:', error);
    throw error;
  }
};

export const getTugasBesarStats = async (courseId) => {
  try {
    const response = await getTugasBesar(courseId);
    const tugasList = response.tugasBesar || [];
    
    const stats = {
      total: tugasList.length,
      active: tugasList.filter(t => t.status === 'active').length,
      completed: tugasList.filter(t => t.status === 'completed').length,
      totalGroups: tugasList.reduce((sum, t) => sum + (parseInt(t.total_groups) || 0), 0),
      totalProgressTasks: tugasList.reduce((sum, t) => sum + (parseInt(t.total_progress_tasks) || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching tugas besar stats:', error);
    throw error;
  }
};