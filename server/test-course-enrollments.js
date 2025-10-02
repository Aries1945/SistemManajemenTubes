const { Pool } = require('pg');

// Use the same config as the main application
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'unpar_task_management',
  password: 'postgres',
  port: 5432,
});

async function testCourseEnrollments() {
  try {
    console.log('Testing course-enrollments query...');
    
    const classId = 2; // Kelas C for OOP course
    
    // Test the query from the new endpoint
    const result = await pool.query(`
      SELECT DISTINCT u.id, mp.nama_lengkap, mp.nim, ce.class_id, c.nama as class_name
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN classes c ON ce.class_id = c.id
      WHERE c.course_id = (SELECT course_id FROM classes WHERE id = $1)
        AND ce.class_id != $1
        AND u.role = 'mahasiswa'
      ORDER BY mp.nama_lengkap
    `, [classId]);
    
    console.log('Students enrolled in OTHER classes for the same course as Class 2:');
    console.log(result.rows);
    
    // Also test the reverse - what about class 4?
    const classId2 = 4;
    const result2 = await pool.query(`
      SELECT DISTINCT u.id, mp.nama_lengkap, mp.nim, ce.class_id, c.nama as class_name
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN classes c ON ce.class_id = c.id
      WHERE c.course_id = (SELECT course_id FROM classes WHERE id = $1)
        AND ce.class_id != $1
        AND u.role = 'mahasiswa'
      ORDER BY mp.nama_lengkap
    `, [classId2]);
    
    console.log('\nStudents enrolled in OTHER classes for the same course as Class 4:');
    console.log(result2.rows);
    
  } catch (error) {
    console.error('Error testing course enrollments:', error);
  } finally {
    process.exit(0);
  }
}

testCourseEnrollments();