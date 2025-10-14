// API utility functions for Kelompok management

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
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
  }
  
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required. Please login again.');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Server error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Get all kelompok for a tugas
export const getKelompok = async (tugasId) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/kelompok`);
  return data.kelompok || [];
};

// Get available students for grouping
export const getMahasiswaForGrouping = async (tugasId) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/mahasiswa`);
  return data.mahasiswa || [];
};

// Create group manually (Method 1)
export const createManualGroup = async (tugasId, groupData) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/kelompok/manual`, {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
  return data;
};

// Create groups automatically (Method 2)
export const createAutomaticGroups = async (tugasId, groupSize) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/kelompok/otomatis`, {
    method: 'POST',
    body: JSON.stringify({ ukuranKelompok: groupSize }),
  });
  return data;
};

// Enable student choice mode (Method 3)
export const enableStudentChoice = async (tugasId, { maxGroupSize, minGroupSize }) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/kelompok/enable-student-choice`, {
    method: 'POST',
    body: JSON.stringify({ maxGroupSize, minGroupSize }),
  });
  return data;
};

// Delete kelompok
export const deleteKelompok = async (kelompokId) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/kelompok/${kelompokId}`, {
    method: 'DELETE',
  });
  return data;
};

// For mahasiswa - join/create group in student choice mode
export const joinOrCreateGroup = async (tugasId, groupData) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/tugas/${tugasId}/kelompok/student-join`, {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
  return data;
};

// For mahasiswa - leave group
export const leaveGroup = async (kelompokId) => {
  const data = await makeRequest(`${API_BASE_URL}/kelompok/kelompok/${kelompokId}/leave`, {
    method: 'POST',
  });
  return data;
};