// API utility functions for Kelompok management

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {let token = localStorage.getItem('token');if (!token) {
    const userStr = localStorage.getItem('user');if (userStr) {
      try {
        const user = JSON.parse(userStr);token = user.token;
        if (token) {
          localStorage.setItem('token', token);}
      } catch (error) {}
    }
  }
  
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required. Please login again.');
  }const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Server error' }));
    console.error('Response error data:', errorData);
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();return responseData;
};

// Get all kelompok for a tugas
export const getKelompok = async (tugasId) => {const data = await makeRequest(`${API_BASE_URL}/auth/dosen/tugas-besar/${tugasId}/kelompok`);// Transform data untuk compatibility dengan frontend
  const transformedKelompok = (data.kelompok || []).map(group => {return {
      // Keep original fields
      ...group,
      // Add transformed fields untuk compatibility
      taskId: group.tugas_besar_id || group.taskId,
      name: group.nama_kelompok || group.name,
      leaderId: group.leader_id || group.leaderId || (group.members && group.members.find(m => m.role === 'leader')?.id),
      members: group.members || [],
      createdBy: group.created_by || group.createdBy,
      creationMethod: group.creation_method || group.creationMethod,
      createdAt: group.created_at || group.createdAt
    };
  });// Return proper response structure expected by DosenGroupManagement
  return {
    success: data.success || (data.kelompok !== undefined),
    data: transformedKelompok,
    message: data.message || (data.kelompok ? 'Kelompok loaded successfully' : 'No kelompok found')
  };
};

// Get available students for grouping
export const getMahasiswaForGrouping = async (tugasId) => {const data = await makeRequest(`${API_BASE_URL}/auth/dosen/tugas-besar/${tugasId}/mahasiswa-available`);// Return response in same format as received from server to avoid confusion
  return {
    success: data.success || (data.mahasiswa !== undefined),
    mahasiswa: data.mahasiswa || [],
    message: data.message || (data.mahasiswa ? 'Mahasiswa loaded successfully' : 'No mahasiswa found')
  };
};

// Create group manually (Method 1)
export const createManualGroup = async (groupData) => {const { taskId, name, members, leaderId } = groupData;
  
  if (!taskId) {
    throw new Error('taskId is required');
  }const data = await makeRequest(`${API_BASE_URL}/auth/dosen/tugas-besar/${taskId}/kelompok/manual`, {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      members: members,
      leaderId: leaderId
    }),
  });
  return data;
};

// Create groups automatically (Method 2)
export const createAutomaticGroups = async (tugasId, groupSize) => {// Check token before request
  const token = localStorage.getItem('token') || 
                (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null);const url = `${API_BASE_URL}/auth/dosen/tugas-besar/${tugasId}/kelompok/automatic`;try {
    const data = await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ groupSize: groupSize }),
    });return data;
  } catch (error) {
    console.error('createAutomaticGroups ERROR:', error);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Delete kelompok
export const deleteKelompok = async (kelompokId) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/dosen/kelompok/${kelompokId}`, {
    method: 'DELETE',
  });
  return data;
};

// For dosen - enable student choice mode
export const enableStudentChoice = async (tugasId, settings) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/dosen/tugas-besar/${tugasId}/kelompok/enable-student-choice`, {
    method: 'POST',
    body: JSON.stringify(settings),
  });
  return data;
};

// For mahasiswa - get available groups for student choice
export const getAvailableGroups = async (tugasId) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/mahasiswa/tugas-besar/${tugasId}/kelompok-available`);
  return data;
};

// For mahasiswa - join a group in student choice mode
export const joinGroup = async (kelompokId) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/mahasiswa/kelompok/${kelompokId}/join`, {
    method: 'POST',
  });
  return data;
};

// For mahasiswa - leave a group in student choice mode
export const leaveStudentGroup = async (kelompokId) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/mahasiswa/kelompok/${kelompokId}/leave`, {
    method: 'POST',
  });
  return data;
};

// For mahasiswa - get current group for a tugas besar
export const getCurrentGroup = async (tugasId) => {
  const data = await makeRequest(`${API_BASE_URL}/auth/mahasiswa/tugas-besar/${tugasId}/kelompok-current`);
  return data;
};