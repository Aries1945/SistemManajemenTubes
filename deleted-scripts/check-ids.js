const { pool } = require('./src/db');

async function checkIds() {
  try {
    console.log('=== Checking ID Relationships ===');
    
    // Check if mahasiswa_id in class_enrollments refers to user_id instead
    const enrollmentIds = await pool.query('SELECT DISTINCT mahasiswa_id FROM class_enrollments');
    console.log('Unique mahasiswa_ids in class_enrollments:', enrollmentIds.rows.map(r => r.mahasiswa_id));
    
    // Check if these IDs exist in users table
    const userIds = await pool.query("SELECT id FROM users WHERE role = 'mahasiswa'");
    console.log('User IDs for mahasiswa:', userIds.rows.map(r => r.id));
    
    // Check if these IDs exist in mahasiswa_profiles table
    const profileIds = await pool.query('SELECT id FROM mahasiswa_profiles');
    console.log('Profile IDs in mahasiswa_profiles:', profileIds.rows.map(r => r.id));
    
    // Check if mahasiswa_id in class_enrollments matches user_id
    const enrollments = await pool.query('SELECT * FROM class_enrollments');
    console.log('\nChecking if mahasiswa_id matches user_id:');
    for (const enrollment of enrollments.rows) {
      const userExists = await pool.query('SELECT id, email FROM users WHERE id = $1', [enrollment.mahasiswa_id]);
      console.log(`mahasiswa_id ${enrollment.mahasiswa_id} -> user exists: ${userExists.rows.length > 0 ? 'YES (' + userExists.rows[0]?.email + ')' : 'NO'}`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkIds();