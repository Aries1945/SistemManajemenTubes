const { Pool } = require('pg');

// Use the same config as the main application
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'unpar_task_management',
  password: 'postgres',
  port: 5432,
});

async function createTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating test data for enrollment UI...');
    
    // Cek apakah sudah ada data admin
    const adminCheck = await client.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminCheck.rows.length === 0) {
      console.log('No admin found, creating admin user...');
      await client.query(`
        INSERT INTO users (email, password_hash, role, is_active)
        VALUES ('admin@test.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'admin', true)
      `);
    }
    
    // Get admin ID
    const adminUser = await client.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    const adminId = adminUser.rows[0].id;
    
    // Create course_name first (jika belum ada)
    let courseNameId;
    const existingCourseName = await client.query(`SELECT id FROM course_name WHERE kode = 'ASD101'`);
    if (existingCourseName.rows.length > 0) {
      courseNameId = existingCourseName.rows[0].id;
    } else {
      const courseNameResult = await client.query(`
        INSERT INTO course_name (nama, kode, deskripsi, sks)
        VALUES ('Algoritma dan Struktur Data', 'ASD101', 'Mata kuliah dasar algoritma', 3)
        RETURNING id
      `);
      courseNameId = courseNameResult.rows[0].id;
    }
    
    // Create test course
    let courseId;
    const existingCourse = await client.query(`
      SELECT id FROM courses WHERE course_name_id = $1 AND semester = 'Ganjil' AND tahun_ajaran = '2024/2025' AND kode = 'ASD101-2024'
    `, [courseNameId]);
    
    if (existingCourse.rows.length > 0) {
      courseId = existingCourse.rows[0].id;
    } else {
      const courseResult = await client.query(`
        INSERT INTO courses (course_name_id, dosen_id, semester, tahun_ajaran, kode, nama)
        VALUES ($1, $2, 'Ganjil', '2024/2025', 'ASD101-2024', 'ASD101 Ganjil 2024/2025')
        RETURNING id
      `, [courseNameId, adminId]);
      courseId = courseResult.rows[0].id;
    }
    console.log('Course created/updated:', courseId);
    
    // Create test dosen (use existing admin user as dosen for classes)
    await client.query(`
      UPDATE users SET role = 'dosen' WHERE id = $1
    `, [adminId]);
    
    // Create 2 classes for the same course
    let class1Id, class2Id;
    
    const existingClass1 = await client.query(`SELECT id FROM classes WHERE kode = 'ASD101A'`);
    if (existingClass1.rows.length > 0) {
      class1Id = existingClass1.rows[0].id;
    } else {
      const class1Result = await client.query(`
        INSERT INTO classes (course_id, dosen_id, nama, kode, kapasitas, ruangan, jadwal)
        VALUES ($1, $2, 'ASD101 - Kelas A', 'ASD101A', 30, 'R.101', 'Senin 08:00-10:00')
        RETURNING id
      `, [courseId, adminId]);
      class1Id = class1Result.rows[0].id;
    }
    
    const existingClass2 = await client.query(`SELECT id FROM classes WHERE kode = 'ASD101B'`);
    if (existingClass2.rows.length > 0) {
      class2Id = existingClass2.rows[0].id;
    } else {
      const class2Result = await client.query(`
        INSERT INTO classes (course_id, dosen_id, nama, kode, kapasitas, ruangan, jadwal)
        VALUES ($1, $2, 'ASD101 - Kelas B', 'ASD101B', 30, 'R.102', 'Selasa 10:00-12:00')
        RETURNING id
      `, [courseId, adminId]);
      class2Id = class2Result.rows[0].id;
    }
    
    console.log('Classes created:', class1Id, class2Id);
    
    // Create test mahasiswa
    const students = [
      { name: 'John Doe', nim: '2021001', email: 'john@test.com' },
      { name: 'Jane Smith', nim: '2021002', email: 'jane@test.com' },
      { name: 'Bob Wilson', nim: '2021003', email: 'bob@test.com' },
      { name: 'Alice Brown', nim: '2021004', email: 'alice@test.com' },
      { name: 'Charlie Davis', nim: '2021005', email: 'charlie@test.com' }
    ];
    
    const studentIds = [];
    for (const student of students) {
      // Create user
      const userResult = await client.query(`
        INSERT INTO users (email, password, role, is_active)
        VALUES ($1, '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'mahasiswa', true)
        ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
        RETURNING id
      `, [student.email]);
      
      const userId = userResult.rows[0].id;
      studentIds.push(userId);
      
      // Create mahasiswa profile
      await client.query(`
        INSERT INTO mahasiswa_profiles (user_id, nama_lengkap, nim, angkatan)
        VALUES ($1, $2, $3, 2021)
        ON CONFLICT (user_id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap
      `, [userId, student.name, student.nim]);
    }
    
    console.log('Students created:', studentIds);
    
    // Enroll first 2 students to class A
    await client.query(`
      INSERT INTO class_enrollments (class_id, mahasiswa_id)
      VALUES ($1, $2), ($1, $3)
      ON CONFLICT (class_id, mahasiswa_id) DO NOTHING
    `, [class1Id, studentIds[0], studentIds[1]]);
    
    // Enroll student 3 to class B
    await client.query(`
      INSERT INTO class_enrollments (class_id, mahasiswa_id)
      VALUES ($1, $2)
      ON CONFLICT (class_id, mahasiswa_id) DO NOTHING
    `, [class2Id, studentIds[2]]);
    
    console.log('Enrollments created');
    
    await client.query('COMMIT');
    console.log('Test data created successfully!');
    console.log('Now you can test:');
    console.log(`- Class A (ID: ${class1Id}) should show students 4-5 as available`);
    console.log(`- Class A should show student 3 as "Tidak tersedia" (enrolled in Class B)`);
    console.log(`- Class B (ID: ${class2Id}) should show students 1-2 as "Tidak tersedia" (enrolled in Class A)`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating test data:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createTestData();