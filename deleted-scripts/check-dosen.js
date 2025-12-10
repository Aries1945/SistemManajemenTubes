const { pool } = require('./src/db');

async function checkDosenAssignments() {
  try {
    console.log('=== Checking Dosen Assignments ===');
    
    // Check all classes with dosen assignments
    const classesWithDosen = await pool.query(`
      SELECT 
        c.id as class_id,
        c.nama as class_name,
        c.dosen_id,
        co.id as course_id,
        co.nama as course_name,
        co.kode as course_code,
        dp.nama_lengkap as dosen_nama,
        dp.user_id as dosen_user_id
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN dosen_profiles dp ON c.dosen_id = dp.user_id
      ORDER BY co.nama, c.nama
    `);
    
    console.log('Classes with dosen assignments:', classesWithDosen.rows);
    
    // Check all dosen users
    const dosenUsers = await pool.query("SELECT id, email FROM users WHERE role = 'dosen' ORDER BY id");
    console.log('\nDosen users:', dosenUsers.rows);
    
    // Test the endpoint query for a specific dosen
    if (dosenUsers.rows.length > 0) {
      const testDosenId = dosenUsers.rows[0].id;
      console.log(`\nTesting query for dosen user_id: ${testDosenId}`);
      
      const testResult = await pool.query(`
        SELECT 
          co.id as course_id,
          co.nama as course_name,
          co.kode as course_code,
          co.sks,
          co.semester,
          co.tahun_ajaran,
          co.deskripsi,
          COUNT(DISTINCT c.id) as total_classes,
          COUNT(DISTINCT ce.mahasiswa_id) as total_students,
          STRING_AGG(DISTINCT c.nama, ', ') as class_names,
          STRING_AGG(DISTINCT CONCAT(c.ruangan, ' (', c.jadwal, ')'), ', ') as class_details
        FROM courses co
        LEFT JOIN classes c ON co.id = c.course_id AND c.dosen_id = $1
        LEFT JOIN class_enrollments ce ON c.id = ce.class_id
        WHERE co.id IN (
          SELECT DISTINCT course_id 
          FROM classes 
          WHERE dosen_id = $1
        )
        GROUP BY co.id, co.nama, co.kode, co.sks, co.semester, co.tahun_ajaran, co.deskripsi
        ORDER BY co.nama
      `, [testDosenId]);
      
      console.log('Test query result:', testResult.rows);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error checking dosen assignments:', error);
    await pool.end();
  }
}

checkDosenAssignments();