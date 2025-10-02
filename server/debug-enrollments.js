const { pool } = require('./src/db');

async function debugEnrollments() {
  try {
    console.log('=== Debugging Class Enrollments ===');
    
    // Check all class_enrollments data
    const enrollments = await pool.query('SELECT * FROM class_enrollments ORDER BY id');
    console.log('All class_enrollments:', enrollments.rows);
    
    // Check all mahasiswa_profiles data
    const mahasiswa = await pool.query('SELECT id, user_id, nim, nama_lengkap FROM mahasiswa_profiles ORDER BY id');
    console.log('\nAll mahasiswa_profiles:', mahasiswa.rows);
    
    // Check if there are any matches
    const matches = await pool.query(`
      SELECT 
        ce.id as enrollment_id,
        ce.class_id,
        ce.mahasiswa_id,
        mp.id as mahasiswa_profile_id,
        mp.user_id,
        mp.nim,
        mp.nama_lengkap
      FROM class_enrollments ce
      JOIN mahasiswa_profiles mp ON ce.mahasiswa_id = mp.id
      ORDER BY ce.id
    `);
    console.log('\nMatched enrollments with mahasiswa:', matches.rows);
    
    // Check users table
    const users = await pool.query("SELECT id, email, role FROM users WHERE role = 'mahasiswa' ORDER BY id");
    console.log('\nMahasiswa users:', users.rows);
    
    // Check which user_id we're testing with (first mahasiswa user)
    if (users.rows.length > 0) {
      const testUserId = users.rows[0].id;
      console.log(`\nTesting with user_id: ${testUserId}`);
      
      // Check if this user has a mahasiswa profile
      const testMahasiswa = await pool.query('SELECT * FROM mahasiswa_profiles WHERE user_id = $1', [testUserId]);
      console.log('Mahasiswa profile for test user:', testMahasiswa.rows);
      
      if (testMahasiswa.rows.length > 0) {
        const mahasiswaId = testMahasiswa.rows[0].id;
        console.log(`Mahasiswa profile ID: ${mahasiswaId}`);
        
        // Check enrollments for this mahasiswa
        const testEnrollments = await pool.query('SELECT * FROM class_enrollments WHERE mahasiswa_id = $1', [mahasiswaId]);
        console.log('Enrollments for this mahasiswa:', testEnrollments.rows);
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error debugging:', error);
    await pool.end();
  }
}

debugEnrollments();