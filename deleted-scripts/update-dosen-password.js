const bcrypt = require('bcrypt');
const { pool } = require('./src/db');

async function updateDosenPassword() {
  try {
    console.log('Updating password for dosen user_id 22...');
    
    const newPassword = 'dosen123';
    const hash = await bcrypt.hash(newPassword, 10);
    
    console.log('New hash:', hash);
    
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = 22 RETURNING id, email',
      [hash]
    );
    
    console.log('Password updated successfully for:', result.rows[0]);
    console.log('New credentials:');
    console.log('Email: agus.dosen@unpar.ac.id');
    console.log('Password: dosen123');
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await pool.end();
  }
}

updateDosenPassword();