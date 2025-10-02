const { pool } = require('./src/db');

async function createTestScenario() {
  try {
    console.log('=== Creating Test Scenario for Duplicate Course Enrollment ===\n');
    
    // Find a course with multiple classes
    const coursesWithMultipleClasses = await pool.query(`
      SELECT co.id as course_id, co.nama as course_name, co.kode as course_code,
             array_agg(c.id) as class_ids,
             array_agg(c.nama) as class_names
      FROM courses co
      JOIN classes c ON co.id = c.course_id
      GROUP BY co.id, co.nama, co.kode
      HAVING COUNT(c.id) > 1
      LIMIT 1
    `);
    
    if (coursesWithMultipleClasses.rows.length === 0) {
      console.log('No courses with multiple classes found');
      await pool.end();
      return;
    }
    
    const testCourse = coursesWithMultipleClasses.rows[0];
    const classIds = testCourse.class_ids;
    
    console.log(`Testing with course: ${testCourse.course_name} (${testCourse.course_code})`);
    console.log(`Classes: ${testCourse.class_names.join(', ')}`);
    
    // Find a mahasiswa to test with
    const mahasiswa = await pool.query(`
      SELECT u.id, u.email, m.nama_lengkap
      FROM users u
      JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE u.role = 'mahasiswa'
      LIMIT 1
    `);
    
    if (mahasiswa.rows.length === 0) {
      console.log('No mahasiswa found for testing');
      await pool.end();
      return;
    }
    
    const testStudent = mahasiswa.rows[0];
    console.log(`\nTest student: ${testStudent.nama_lengkap} (${testStudent.email})`);
    
    // Step 1: Enroll student in first class
    console.log(`\nStep 1: Enrolling in first class (ID: ${classIds[0]})`);
    
    // Check if already enrolled
    const existingEnrollment = await pool.query(
      'SELECT * FROM class_enrollments WHERE mahasiswa_id = $1 AND class_id = $2',
      [testStudent.id, classIds[0]]
    );
    
    if (existingEnrollment.rows.length === 0) {
      await pool.query(
        'INSERT INTO class_enrollments (class_id, mahasiswa_id, status) VALUES ($1, $2, \'active\')',
        [classIds[0], testStudent.id]
      );
      console.log('✅ Student enrolled in first class');
    } else {
      console.log('ℹ️  Student already enrolled in first class');
    }
    
    // Step 2: Test validation for second class
    console.log(`\nStep 2: Testing validation for second class (ID: ${classIds[1]})`);
    
    const validationResult = await pool.query(`
      SELECT c1.nama as class_name, c2.nama as course_name, c2.kode as course_code
      FROM class_enrollments ce
      JOIN classes c1 ON ce.class_id = c1.id
      JOIN courses c2 ON c1.course_id = c2.id
      WHERE ce.mahasiswa_id = $1 
        AND c1.course_id = (SELECT course_id FROM classes WHERE id = $2)
        AND ce.status = 'active'
    `, [testStudent.id, classIds[1]]);
    
    if (validationResult.rows.length > 0) {
      const conflict = validationResult.rows[0];
      console.log(`✅ VALIDATION WORKS: Would block enrollment`);
      console.log(`   Reason: Student already enrolled in "${conflict.class_name}" for course "${conflict.course_name} (${conflict.course_code})"`);
    } else {
      console.log(`❌ VALIDATION FAILED: Would incorrectly allow enrollment`);
    }
    
    console.log(`\nTest scenario completed!`);
    await pool.end();
  } catch (error) {
    console.error('Error creating test scenario:', error);
    await pool.end();
  }
}

createTestScenario();