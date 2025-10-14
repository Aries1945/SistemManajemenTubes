// Test script to check token isolation between different users
console.log('=== Testing Token Isolation Between Users ===');

// Function to simulate login and check localStorage
function simulateLogin(userEmail, userData) {
  console.log(`\n--- Simulating login for ${userEmail} ---`);
  
  // Clear all storage first
  localStorage.clear();
  sessionStorage.clear();
  
  // Store user data like the app would
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', userData.token);
  
  console.log('Stored user data:', localStorage.getItem('user'));
  console.log('Stored token:', localStorage.getItem('token'));
  
  return userData;
}

// Function to check what's in storage
function checkStorage(description) {
  console.log(`\n--- ${description} ---`);
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage token:', localStorage.getItem('token'));
  console.log('sessionStorage user:', sessionStorage.getItem('user'));
  console.log('sessionStorage token:', sessionStorage.getItem('token'));
  
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user email:', user.email);
      console.log('Parsed user role:', user.role);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
}

// Test data for different users
const agusUser = {
  id: 1,
  email: 'agus.dosen@unpar.ac.id',
  role: 'dosen',
  token: 'jwt_token_for_agus_12345',
  nama_lengkap: 'Agus Dosen'
};

const sagabUser = {
  id: 2,
  email: 'sagab.dosen@unpar.ac.id',
  role: 'dosen',
  token: 'jwt_token_for_sagab_67890',
  nama_lengkap: 'Sagab Dosen'
};

// Initial state
checkStorage('Initial State (should be empty)');

// Login as Agus
const loggedInAgus = simulateLogin('agus.dosen@unpar.ac.id', agusUser);
checkStorage('After Agus Login');

// Now simulate what happens when Sagab logs in
// This should clear Agus's data
const loggedInSagab = simulateLogin('sagab.dosen@unpar.ac.id', sagabUser);
checkStorage('After Sagab Login (Agus data should be gone)');

// Test the logout cleanup
console.log('\n--- Testing Logout Cleanup ---');
localStorage.removeItem('user');
localStorage.removeItem('token');
localStorage.removeItem('accessToken');
localStorage.removeItem('authToken');
sessionStorage.removeItem('user');
sessionStorage.removeItem('token');
checkStorage('After Logout Cleanup');

console.log('\n=== Test Complete ===');
console.log('Key findings:');
console.log('1. Each login should clear previous user data');
console.log('2. Logout should clear ALL authentication data');
console.log('3. No user data should persist between logins');