const { Pool } = require('pg');

// Use the same config as the main application
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'unpar_task_management',
  password: 'Juliadi1945',
  port: 5432,
});

async function checkExistingData() {
  try {
    console.log('Checking existing data...');
    
    // Check courses
    const courses = await pool.query('SELECT * FROM courses LIMIT 5');
    console.log('Courses:', courses.rows);
    
    // Check classes
    const classes = await pool.query('SELECT * FROM classes LIMIT 5');
    console.log('Classes:', classes.rows);
    
    // Check students
    const students = await pool.query(`
      SELECT u.id, u.email, u.role, mp.nama_lengkap, mp.nim 
      FROM users u 
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id 
      WHERE u.role = 'mahasiswa' 
      LIMIT 5
    `);
    console.log('Students:', students.rows);
    
    // Check enrollments
    const enrollments = await pool.query('SELECT * FROM class_enrollments LIMIT 5');
    console.log('Enrollments:', enrollments.rows);
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    process.exit(0);
  }
}

checkExistingData();