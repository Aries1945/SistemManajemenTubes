// Test login and check user role
export const testLogin = async (email = 'agus.dosen@unpar.ac.id', password = '123') => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  
  try {
    console.log('=== LOGIN TEST ===');
    console.log('Testing login with:', { email, password: '***' });
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('Login failed:', errorData);
      return false;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    
    // Store token and user data
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    
    // Decode and check token
    if (loginData.token) {
      try {
        const payload = JSON.parse(atob(loginData.token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('User role:', payload.role);
        console.log('User ID:', payload.id);
      } catch (error) {
        console.log('Error decoding token:', error);
      }
    }
    
    console.log('==================');
    return true;
  } catch (error) {
    console.error('Login test failed:', error);
    return false;
  }
};

// Test dosen endpoint after login
export const testDosenEndpoint = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found. Please login first.');
    return false;
  }
  
  try {
    console.log('=== DOSEN ENDPOINT TEST ===');
    console.log('Testing dosen courses endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/auth/dosen/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Dosen endpoint failed:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Dosen endpoint successful:', data);
    console.log('============================');
    return true;
  } catch (error) {
    console.error('Dosen endpoint test failed:', error);
    return false;
  }
};