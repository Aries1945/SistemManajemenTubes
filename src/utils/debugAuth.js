// Debug utility to check authentication status
export const debugAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('=== AUTH DEBUG ===');
  console.log('Token from localStorage:', !!token);
  console.log('Token value:', token ? token.substring(0, 50) + '...' : null);
  
  let userObj = null;
  let userToken = null;
  if (user) {
    try {
      userObj = JSON.parse(user);
      userToken = userObj.token;
      console.log('User object:', userObj);
      console.log('Token from user object:', !!userToken);
      console.log('User token value:', userToken ? userToken.substring(0, 50) + '...' : null);
    } catch (error) {
      console.log('Error parsing user data:', error);
    }
  } else {
    console.log('No user data in localStorage');
  }
  
  // Check which token to use
  const finalToken = token || userToken;
  console.log('Final token to use:', !!finalToken);
  
  if (finalToken) {
    try {
      // Decode JWT without verification (just to see content)
      const payload = JSON.parse(atob(finalToken.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token expired:', Date.now() >= payload.exp * 1000);
      
      // If token is from user object but not in localStorage, fix it
      if (!token && userToken) {
        console.log('Fixing token storage...');
        localStorage.setItem('token', userToken);
      }
    } catch (error) {
      console.log('Error decoding token:', error);
    }
  }
  console.log('==================');
};

// Test API connectivity without auth
export const testApiConnection = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/db-check`);
    const data = await response.json();
    console.log('API connection test:', data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};