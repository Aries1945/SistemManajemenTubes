const { pool } = require('./src/db');

async function testDuplicateEnrollmentValidation() {
  try {
    console.log('=== Testing Duplicate Course Enrollment Validation ===\n');
    
    // First, let's see what enrollments currently exist
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
    
    console.log('Current enrollments:');
    currentEnrollments.rows.forEach(enrollment => {
      console.log(`  Student ${enrollment.email} (ID: ${enrollment.mahasiswa_id}) -> Class: ${enrollment.class_name} -> Course: ${enrollment.course_name} (${enrollment.course_code})`);
    });
    
    console.log('\n=== Checking for potential conflicts ===');
    
    // Check if any student is enrolled in multiple classes for the same course
    const duplicateCourseEnrollments = await pool.query(`
      SELECT ce.mahasiswa_id, 
             u.email,
             co.id as course_id,
             co.nama as course_name, 
             co.kode as course_code,
             COUNT(*) as enrollment_count,
             STRING_AGG(c.nama, ', ') as class_names
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON ce.mahasiswa_id = u.id
      WHERE ce.status = 'active'
      GROUP BY ce.mahasiswa_id, u.email, co.id, co.nama, co.kode
      HAVING COUNT(*) > 1
      ORDER BY ce.mahasiswa_id, co.id
    `);
    
    if (duplicateCourseEnrollments.rows.length > 0) {
      console.log('Found students enrolled in multiple classes for the same course:');
      duplicateCourseEnrollments.rows.forEach(duplicate => {
        console.log(`  ⚠️  Student ${duplicate.email} (ID: ${duplicate.mahasiswa_id}) is enrolled in ${duplicate.enrollment_count} classes for course "${duplicate.course_name} (${duplicate.course_code})": ${duplicate.class_names}`);
      });
    } else {
      console.log('✅ No duplicate course enrollments found. Good!');
    }
    
    console.log('\n=== Testing the validation query ===');
    
    // Test the validation query for a specific student and course
    const testStudentId = 20; // Use an existing student
    const testClassId = 5; // Use an existing class
    
    const validationTest = await pool.query(`
      SELECT c1.nama as class_name, c2.nama as course_name, c2.kode as course_code
      FROM class_enrollments ce
      JOIN classes c1 ON ce.class_id = c1.id
      JOIN courses c2 ON c1.course_id = c2.id
      WHERE ce.mahasiswa_id = $1 
        AND c1.course_id = (SELECT course_id FROM classes WHERE id = $2)
        AND ce.status = 'active'
    `, [testStudentId, testClassId]);
    
    console.log(`Testing validation for student ID ${testStudentId} and class ID ${testClassId}:`);
    if (validationTest.rows.length > 0) {
      console.log(`  ⚠️  Would be blocked: Student already enrolled in class "${validationTest.rows[0].class_name}" for course "${validationTest.rows[0].course_name} (${validationTest.rows[0].course_code})"`);
    } else {
      console.log(`  ✅ Would be allowed: No existing enrollment for this course`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error testing validation:', error);
    await pool.end();
  }
}

testDuplicateEnrollmentValidation();