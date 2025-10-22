const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function assignCoursesToSagab() {
  try {
    console.log('=== Assigning Courses to Sagab ===');
    
    // First, let's find Sagab's correct email
    const sagabSearchResult = await pool.query(
      'SELECT id, email FROM users WHERE role = $1 AND email LIKE $2',
      ['dosen', '%sagab%']
    );
    
    console.log('Found Sagab users:', sagabSearchResult.rows);
    
    if (sagabSearchResult.rows.length === 0) {
      console.log('No Sagab user found! Let me check all dosen users...');
      const allDosen = await pool.query(
        'SELECT id, email FROM users WHERE role = $1',
        ['dosen']
      );
      console.log('All dosen users:', allDosen.rows);
      return;
    }
    
    // Use the first Sagab user found
    const sagabUser = sagabSearchResult.rows[0];
    const sagabId = sagabUser.id;
    const sagabEmail = sagabUser.email;
    
    console.log(`Using Sagab: ${sagabEmail} (ID: ${sagabId})`);
    
    // Create some courses for Sagab
    const courses = [
      {
        kode: 'IF101',
        nama: 'Pengantar Informatika',
        sks: 3,
        semester: 'Ganjil',
        tahun_ajaran: '2024/2025',
        deskripsi: 'Mata kuliah pengantar untuk mahasiswa informatika'
      },
      {
        kode: 'IF201',
        nama: 'Struktur Data',
        sks: 3,
        semester: 'Ganjil', 
        tahun_ajaran: '2024/2025',
        deskripsi: 'Mata kuliah tentang struktur data dan algoritma'
      },
      {
        kode: 'IF301',
        nama: 'Basis Data',
        sks: 3,
        semester: 'Ganjil',
        tahun_ajaran: '2024/2025', 
        deskripsi: 'Mata kuliah tentang sistem basis data'
      }
    ];
    
    console.log('\nCreating courses for Sagab...');
    
    for (const course of courses) {
      // Check if course already exists
      const existingCourse = await pool.query(
        'SELECT id FROM courses WHERE kode = $1',
        [course.kode]
      );
      
      if (existingCourse.rows.length > 0) {
        // Update existing course to assign to Sagab
        await pool.query(
          'UPDATE courses SET dosen_id = $1 WHERE kode = $2',
          [sagabId, course.kode]
        );
        console.log(`✓ Updated existing course: ${course.kode} - ${course.nama}`);
      } else {
        // Create new course
        const result = await pool.query(`
          INSERT INTO courses (kode, nama, sks, semester, tahun_ajaran, deskripsi, dosen_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
          RETURNING id
        `, [course.kode, course.nama, course.sks, course.semester, course.tahun_ajaran, course.deskripsi, sagabId]);
        
        console.log(`✓ Created new course: ${course.kode} - ${course.nama} (ID: ${result.rows[0].id})`);
      }
    }
    
    // Verify assignments
    console.log('\n=== Verification ===');
    const sagabCourses = await pool.query(`
      SELECT id, kode, nama 
      FROM courses 
      WHERE dosen_id = $1
      ORDER BY id ASC
    `, [sagabId]);
    
    console.log(`\nSagab now has ${sagabCourses.rows.length} courses:`);
    sagabCourses.rows.forEach(row => {
      console.log(`- Course ID: ${row.id}, Code: ${row.kode}, Name: ${row.nama}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

assignCoursesToSagab();