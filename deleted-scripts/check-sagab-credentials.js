const { Pool } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkSagabCredentials() {
  try {
    console.log('=== Checking Sagab Credentials ===');
    
    // Get Sagab's credentials
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      ['sagab@dosen.unpar.ac.id']
    );
    
    if (result.rows.length === 0) {
      console.log('Sagab user not found!');
      return;
    }
    
    const user = result.rows[0];
    console.log(`Found user: ${user.email} (ID: ${user.id})`);
    console.log(`Password hash: ${user.password_hash}`);
    
    // Test if password '123' matches
    const testPassword = '123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log(`Password '${testPassword}' is valid: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log('Password needs to be updated. Updating to "123"...');
      
      // Generate new hash for password '123'
      const saltRounds = 10;
      const newHash = await bcrypt.hash(testPassword, saltRounds);
      
      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newHash, user.id]
      );
      
      console.log('✓ Password updated successfully');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSagabCredentials();