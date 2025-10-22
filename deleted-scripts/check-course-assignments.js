const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkCourseAssignments() {
  try {
    console.log('=== Checking Course Assignments ===');
    
    // Check Agus courses
    const agusResult = await pool.query(`
      SELECT u.email, c.id, c.nama 
      FROM users u 
      JOIN courses c ON c.dosen_id = u.id 
      WHERE u.email = $1
    `, ['agus.dosen@unpar.ac.id']);
    
    console.log('\nAgus courses:');
    agusResult.rows.forEach(row => {
      console.log(`- Course ID: ${row.id}, Name: ${row.nama}`);
    });
    
    // Check Sagab courses  
    const sagabResult = await pool.query(`
      SELECT u.email, c.id, c.nama 
      FROM users u 
      JOIN courses c ON c.dosen_id = u.id 
      WHERE u.email = $1
    `, ['sagab.dosen@unpar.ac.id']);
    
    console.log('\nSagab courses:');
    sagabResult.rows.forEach(row => {
      console.log(`- Course ID: ${row.id}, Name: ${row.nama}`);
    });
    
    // Check specific course ID 11
    const course11Result = await pool.query(`
      SELECT c.id, c.nama, c.dosen_id, u.email 
      FROM courses c 
      JOIN users u ON u.id = c.dosen_id 
      WHERE c.id = $1
    `, [11]);
    
    console.log('\nCourse ID 11 details:');
    if (course11Result.rows.length > 0) {
      const course = course11Result.rows[0];
      console.log(`- Course: ${course.nama}`);
      console.log(`- Assigned to: ${course.email}`);
      console.log(`- Dosen ID: ${course.dosen_id}`);
    } else {
      console.log('- Course ID 11 not found');
    }
    
    // Get user IDs
    const usersResult = await pool.query(`
      SELECT id, email FROM users WHERE role = 'dosen'
    `);
    
    console.log('\nDosen user IDs:');
    usersResult.rows.forEach(row => {
      console.log(`- ${row.email}: ID ${row.id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCourseAssignments();