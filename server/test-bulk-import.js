// Test bulk import endpoint
const axios = require('axios');

const testData = [
  {
    email: 'test1@student.unpar.ac.id',
    nim: '2024001',
    nama_lengkap: 'Test Student 1',
    angkatan: '2024'
  },
  {
    email: 'test2@student.unpar.ac.id',
    nim: '2024002',
    nama_lengkap: 'Test Student 2',
    angkatan: '2024'
  },
  {
    email: 'invalid-email', // This should fail
    nim: '2024003',
    nama_lengkap: 'Test Student 3',
    angkatan: '2024'
  },
  {
    email: 'test4@student.unpar.ac.id',
    nim: '12345678901', // This should fail - too long
    nama_lengkap: 'Test Student 4',
    angkatan: '2024'
  }
];

async function testBulkImport() {
  try {
    // You'll need to get the auth token first
    console.log('Testing bulk import endpoint...');
    
    const response = await axios.post('http://localhost:5001/api/admin/mahasiswa/bulk', {
      students: testData
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    console.log('Successful imports:', response.data.users?.length || 0);
    console.log('Failed imports:', response.data.errors?.length || 0);
    
    if (response.data.errors && response.data.errors.length > 0) {
      console.log('Errors:');
      response.data.errors.forEach(error => {
        console.log(`  Row ${error.row}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Uncomment to run test
// testBulkImport();

module.exports = { testBulkImport, testData };