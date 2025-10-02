// Debug script untuk memeriksa authentication
console.log('=== Debug Authentication Issue ===');

// Check localStorage content
const storedUser = localStorage.getItem('user');
console.log('Stored user in localStorage:', storedUser);

if (storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser);
    console.log('Parsed user data:', parsedUser);
    console.log('User role:', parsedUser.role);
    console.log('Token exists:', !!parsedUser.token);
    
    if (parsedUser.token) {
      // Decode JWT token manually to check expiration
      const tokenParts = parsedUser.token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
          console.log('Token expires at:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
          console.log('Token is expired:', Date.now() > (payload.exp * 1000));
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
        }
      }
    }
  } catch (parseError) {
    console.error('Failed to parse stored user:', parseError);
  }
} else {
  console.log('No user found in localStorage');
}

// Check if admin token is set in axios headers
import api from '../utils/api.js';
console.log('API default headers:', api.defaults.headers.common);

// Try a test API call to see detailed error
api.get('/admin/users')
  .then(response => {
    console.log('API call successful:', response.data.length, 'users found');
  })
  .catch(error => {
    console.error('API call failed:', error.response?.status, error.response?.data);
    console.error('Full error:', error);
  });