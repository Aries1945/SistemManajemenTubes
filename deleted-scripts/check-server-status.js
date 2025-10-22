const { pool } = require('./src/db');

async function checkServerAndDB() {
  console.log('=== Checking Server and Database Status ===\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully');
    console.log('   Current time:', result.rows[0].current_time);
    
    // Check if basic tables exist
    console.log('\n2. Checking required tables...');
    const tables = ['users', 'dosen_profiles', 'mahasiswa_profiles', 'courses', 'classes', 'class_enrollments'];
    
    for (const table of tables) {
      const tableCheck = await pool.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      if (tableCheck.rows[0].exists) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`❌ Table ${table} missing`);
      }
    }
    
    // Check admin users
    console.log('\n3. Checking admin users...');
    const adminUsers = await pool.query("SELECT id, email, role FROM users WHERE role = 'admin'");
    if (adminUsers.rows.length > 0) {
      console.log('✅ Admin users found:');
      adminUsers.rows.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
    } else {
      console.log('❌ No admin users found');
      console.log('   You may need to create an admin user first');
    }
    
    // Check environment variables
    console.log('\n4. Checking environment variables...');
    const envVars = ['JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
    envVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.log(`❌ ${envVar} is missing`);
      }
    });
    
    await pool.end();
    
    console.log('\n=== Summary ===');
    console.log('If all checks pass, try starting the server with: npm start');
    console.log('If there are missing admin users, create one first');
    console.log('If environment variables are missing, check your .env file');
    
  } catch (error) {
    console.error('❌ Error during checks:', error);
    await pool.end();
  }
}

checkServerAndDB();