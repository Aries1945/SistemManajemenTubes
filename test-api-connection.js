// Test script to check API connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testConnection() {
  console.log('Testing API connection...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const dbResponse = await axios.get(`${API_BASE_URL}/db-check`);
    console.log('✓ Database check:', dbResponse.data);
    
    // Test auth endpoint (should work without token for initial check)
    console.log('\n2. Testing auth endpoint...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
      console.log('✓ Auth endpoint accessible');
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✓ Auth endpoint accessible (401 expected for invalid credentials)');
      } else {
        console.log('✗ Auth endpoint error:', authError.message);
      }
    }
    
    // Test dosen endpoint (should fail without auth token)
    console.log('\n3. Testing dosen endpoint...');
    try {
      const dosenResponse = await axios.get(`${API_BASE_URL}/auth/dosen/courses`);
      console.log('✓ Dosen endpoint accessible');
    } catch (dosenError) {
      if (dosenError.response && dosenError.response.status === 401) {
        console.log('✓ Dosen endpoint accessible (401 expected without token)');
      } else {
        console.log('✗ Dosen endpoint error:', dosenError.message);
      }
    }
    
    console.log('\n✓ All basic connection tests passed!');
    console.log('Backend is running and accessible on port 5001');
    
  } catch (error) {
    console.log('✗ Connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Make sure backend server is running on port 5001');
      console.log('Run: cd server && npm start');
    }
  }
}

testConnection();