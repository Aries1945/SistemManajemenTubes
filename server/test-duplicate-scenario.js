const { pool } = require('./src/db');

async function testDuplicateEnrollmentScenario() {
  try {
    console.log('=== Testing Duplicate Course Enrollment Scenario ===\n');
    
    // First, let's see current state
    console.log('1. Current enrollments:');
    const currentEnrollments = await pool.query(`
      SELECT ce.id, ce.mahasiswa_id, ce.class_id, 
             c.nama as class_name, c.course_id,
             co.nama as course_name, co.kode as course_code,
             u.email
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON ce.mahasiswa_id = u.id
      ORDER BY ce.mahasiswa_id, co.id
    `);
    
    currentEnrollments.rows.forEach(enrollment => {
      console.log(`  ${enrollment.email} -> ${enrollment.class_name} -> ${enrollment.course_name} (${enrollment.course_code})`);
    });
    
    // Find a student who is enrolled and try to enroll them in another class for the same course
    console.log('\n2. Looking for test scenario...');
    
    // Check if there are multiple classes for the same course
    const classesPerCourse = await pool.query(`
      SELECT co.id as course_id, co.nama as course_name, co.kode as course_code,
             COUNT(c.id) as class_count,
             STRING_AGG(c.nama, ', ') as class_names,
             STRING_AGG(c.id::text, ', ') as class_ids
      FROM courses co
      JOIN classes c ON co.id = c.course_id
      GROUP BY co.id, co.nama, co.kode
      HAVING COUNT(c.id) > 1
      ORDER BY class_count DESC
    `);
    
    if (classesPerCourse.rows.length > 0) {
      console.log('Courses with multiple classes:');
      classesPerCourse.rows.forEach(course => {
        console.log(`  ${course.course_name} (${course.course_code}): ${course.class_count} classes - ${course.class_names}`);
      });
      
      // Try to create a test scenario
      const testCourse = classesPerCourse.rows[0];
      const classIds = testCourse.class_ids.split(', ');
      
      console.log(`\n3. Testing with course: ${testCourse.course_name} (${testCourse.course_code})`);
      console.log(`   Available classes: ${testCourse.class_names}`);
      
      // Find a student enrolled in one class
      const enrolledInFirstClass = await pool.query(`
        SELECT ce.mahasiswa_id, u.email
        FROM class_enrollments ce
        JOIN users u ON ce.mahasiswa_id = u.id
        WHERE ce.class_id = $1
        LIMIT 1
      `, [classIds[0]]);
      
      if (enrolledInFirstClass.rows.length > 0) {
        const testStudent = enrolledInFirstClass.rows[0];
        const secondClassId = classIds[1];
        
        console.log(`   Student ${testStudent.email} is enrolled in class ${classIds[0]}`);
        console.log(`   Trying to enroll them in class ${secondClassId}...`);
        
        // Test the validation query
        const validationResult = await pool.query(`
          SELECT c1.nama as class_name, c2.nama as course_name, c2.kode as course_code
          FROM class_enrollments ce
          JOIN classes c1 ON ce.class_id = c1.id
          JOIN courses c2 ON c1.course_id = c2.id
          WHERE ce.mahasiswa_id = $1 
            AND c1.course_id = (SELECT course_id FROM classes WHERE id = $2)
            AND ce.status = 'active'
        `, [testStudent.mahasiswa_id, secondClassId]);
        
        if (validationResult.rows.length > 0) {
          const conflict = validationResult.rows[0];
          console.log(`   ✅ VALIDATION WORKS: Would be blocked because student is already enrolled in class "${conflict.class_name}" for course "${conflict.course_name} (${conflict.course_code})"`);
        } else {
          console.log(`   ❌ VALIDATION FAILED: Would incorrectly allow enrollment`);
        }
      } else {
        console.log('   No students found in first class to test with');
      }
    } else {
      console.log('No courses with multiple classes found. Creating test data...');
      
      // Create a second class for an existing course if needed
      const existingCourse = await pool.query('SELECT * FROM courses LIMIT 1');
      if (existingCourse.rows.length > 0) {
        console.log(`Creating second class for course: ${existingCourse.rows[0].nama}`);
        
        const newClass = await pool.query(`
          INSERT INTO classes (course_id, nama, kapasitas)
          VALUES ($1, $2, 30)
          RETURNING *
        `, [existingCourse.rows[0].id, 'Kelas B Test']);
        
        console.log(`Created class: ${newClass.rows[0].nama} (ID: ${newClass.rows[0].id})`);
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error testing scenario:', error);
    await pool.end();
  }
}

testDuplicateEnrollmentScenario();