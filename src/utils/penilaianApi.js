// API utility functions for Penilaian/Grading management

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
        if (token) {
          localStorage.setItem('token', token);
        }
      } catch (error) {}
    }
  }
  
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please login again.');
    }
    
    // Clone response to read it multiple times if needed
    const contentType = response.headers.get('content-type');
    let errorMessage = `Request failed with status ${response.status}`;
    
    // Try to parse error response as JSON first
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, try to get text (but we can't read body twice)
        // So we'll just use the status code
        if (response.status === 404) {
          errorMessage = 'Endpoint not found (404). Please check if the server is running and the route exists.';
        } else {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }
    } else {
      // Not JSON, handle based on status code
      if (response.status === 404) {
        errorMessage = 'Endpoint not found (404). Please check if the server is running and the route exists.';
      } else if (response.status === 500) {
        errorMessage = 'Server error (500). Please check server logs for more information.';
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};

// Get all tugas besar for a course (for task selection)
export const getTugasBesarForGrading = async (courseId, classId = null) => {
  let url = `/auth/dosen/courses/${courseId}/tugas-besar`;
  if (classId) {
    url += `?class_id=${classId}`;
  }
  return makeRequest(url);
};

// Get grading data for a specific tugas besar
export const getGradingData = async (tugasId) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/grading`);
};

// Get groups for a tugas besar
export const getGroupsForGrading = async (tugasId) => {
  return makeRequest(`/api/kelompok/tugas/${tugasId}/kelompok`);
};

// Get nilai for a komponen
export const getNilaiForKomponen = async (komponenId) => {
  return makeRequest(`/auth/dosen/komponen/${komponenId}/nilai`);
};

// Save/Update nilai for a group
export const saveNilai = async (tugasId, kelompokId, komponenIndex, nilai, catatan) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/nilai`, {
    method: 'POST',
    body: JSON.stringify({
      kelompok_id: kelompokId,
      komponen_index: komponenIndex,
      nilai: nilai,
      catatan: catatan
    }),
  });
};

// Save/Update nilai for an individual student
export const saveNilaiPerMahasiswa = async (tugasId, mahasiswaId, komponenIndex, nilai, catatan) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/nilai-per-mahasiswa`, {
    method: 'POST',
    body: JSON.stringify({
      mahasiswa_id: mahasiswaId,
      komponen_index: komponenIndex,
      nilai: nilai,
      catatan: catatan
    }),
  });
};

// Export nilai to CSV
export const exportNilai = async (tugasId) => {
  const response = await makeRequest(`/auth/dosen/tugas-besar/${tugasId}/export-nilai`);
  return response;
};

// Update visibility of penilaian (show/hide to students)
export const updatePenilaianVisibility = async (tugasId, penilaianVisible) => {
  return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/penilaian-visibility`, {
    method: 'PUT',
    body: JSON.stringify({
      penilaian_visible: penilaianVisible
    }),
  });
};

