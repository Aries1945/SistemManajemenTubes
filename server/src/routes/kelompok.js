const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
});

// Middleware untuk verifikasi dosen
const verifyDosen = (req, res, next) => {
  if (req.user.role !== 'dosen') {
    return res.status(403).json({ error: 'Access denied. Dosen only.' });
  }
  next();
};

// Get all groups for a specific tugas
router.get('/tugas/:tugasId/kelompok', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this tugas
    const accessCheck = await pool.query(`
      SELECT tb.id, c.dosen_id
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND (c.dosen_id = $2 OR EXISTS (
        SELECT 1 FROM class_enrollments ce
        JOIN classes cl ON ce.class_id = cl.id
        WHERE cl.course_id = c.id AND ce.mahasiswa_id = $2
      ))
    `, [tugasId, userId]);

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    const result = await pool.query(`
      SELECT 
        k.*,
        json_agg(
          json_build_object(
            'id', u.id,
            'name', COALESCE(mp.nama_lengkap, dp.nama_lengkap),
            'email', u.email,
            'npm', COALESCE(mp.nim, dp.nip),
            'role', CASE WHEN km.is_leader THEN 'leader' ELSE 'member' END
          ) ORDER BY km.is_leader DESC, COALESCE(mp.nama_lengkap, dp.nama_lengkap)
        ) as members
      FROM kelompok k
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      LEFT JOIN users u ON km.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      LEFT JOIN dosen_profiles dp ON u.id = dp.user_id
      WHERE k.tugas_besar_id = $1
      GROUP BY k.id
      ORDER BY k.nama_kelompok
    `, [tugasId]);

    res.json({
      success: true,
      kelompok: result.rows
    });
  } catch (error) {
    console.error('Error fetching kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students available for grouping in a course
router.get('/tugas/:tugasId/mahasiswa', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id, tb.course_id
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    const courseId = tugasCheck.rows[0].course_id;

    // Get all students in the course
    const result = await pool.query(`
      SELECT 
        u.id,
        mp.nama_lengkap as name,
        u.email,
        mp.nim as npm,
        CASE WHEN km.kelompok_id IS NOT NULL THEN TRUE ELSE FALSE END as has_group,
        k.nama_kelompok as group_name
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      LEFT JOIN kelompok_members km ON u.id = km.user_id 
        AND km.kelompok_id IN (SELECT id FROM kelompok WHERE tugas_besar_id = $1)
      LEFT JOIN kelompok k ON km.kelompok_id = k.id
      WHERE cl.course_id = $2 AND u.role = 'mahasiswa'
      ORDER BY has_group, mp.nama_lengkap
    `, [tugasId, courseId]);

    res.json({
      success: true,
      mahasiswa: result.rows
    });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group manually (Method 1)
router.post('/tugas/:tugasId/kelompok/manual', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { namaKelompok, members, leaderId } = req.body;
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create kelompok
      const kelompokResult = await client.query(`
        INSERT INTO kelompok (tugas_besar_id, nama_kelompok, created_by, creation_method)
        VALUES ($1, $2, $3, 'manual')
        RETURNING id
      `, [tugasId, namaKelompok, dosenId]);

      const kelompokId = kelompokResult.rows[0].id;

      // Add members
      for (const memberId of members) {
        await client.query(`
          INSERT INTO kelompok_members (kelompok_id, user_id, is_leader)
          VALUES ($1, $2, $3)
        `, [kelompokId, memberId, memberId === leaderId]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        kelompok: {
          id: kelompokId,
          nama_kelompok: namaKelompok,
          members: members
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating manual group:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create groups automatically (Method 2)
router.post('/tugas/:tugasId/kelompok/otomatis', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { ukuranKelompok } = req.body; // expected group size
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id, tb.course_id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    const courseId = tugasCheck.rows[0].course_id;

    // Get students without groups
    const studentsResult = await pool.query(`
      SELECT u.id, mp.nama_lengkap
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE cl.course_id = $1 AND u.role = 'mahasiswa'
        AND u.id NOT IN (
          SELECT km.user_id FROM kelompok_members km
          JOIN kelompok k ON km.kelompok_id = k.id
          WHERE k.tugas_besar_id = $2
        )
      ORDER BY RANDOM()
    `, [courseId, tugasId]);

    const students = studentsResult.rows;
    if (students.length === 0) {
      return res.status(400).json({ error: 'No students available for grouping' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const groups = [];
      let groupNumber = 1;

      // Create groups
      for (let i = 0; i < students.length; i += ukuranKelompok) {
        const groupMembers = students.slice(i, i + ukuranKelompok);
        const groupName = `Kelompok ${String.fromCharCode(64 + groupNumber)}`;

        // Create kelompok
        const kelompokResult = await client.query(`
          INSERT INTO kelompok (tugas_besar_id, nama_kelompok, created_by, creation_method)
          VALUES ($1, $2, $3, 'automatic')
          RETURNING id
        `, [tugasId, groupName, dosenId]);

        const kelompokId = kelompokResult.rows[0].id;

        // Add members (first member as leader)
        for (let j = 0; j < groupMembers.length; j++) {
          await client.query(`
            INSERT INTO kelompok_members (kelompok_id, user_id, is_leader)
            VALUES ($1, $2, $3)
          `, [kelompokId, groupMembers[j].id, j === 0]);
        }

        groups.push({
          id: kelompokId,
          nama_kelompok: groupName,
          members: groupMembers
        });

        groupNumber++;
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        kelompok: groups,
        totalGroups: groups.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating automatic groups:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Enable student choice mode (Method 3)
router.post('/tugas/:tugasId/kelompok/enable-student-choice', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { maxGroupSize, minGroupSize } = req.body;
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    // Update tugas to enable student choice
    await pool.query(`
      UPDATE tugas_besar 
      SET student_choice_enabled = true,
          max_group_size = $2,
          min_group_size = $3
      WHERE id = $1
    `, [tugasId, maxGroupSize, minGroupSize]);

    res.json({
      success: true,
      message: 'Student choice mode enabled'
    });
  } catch (error) {
    console.error('Error enabling student choice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kelompok
router.delete('/kelompok/:kelompokId', verifyDosen, async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen owns this kelompok
    const kelompokCheck = await pool.query(`
      SELECT k.id FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      JOIN courses c ON tb.course_id = c.id
      WHERE k.id = $1 AND c.dosen_id = $2
    `, [kelompokId, dosenId]);

    if (kelompokCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this kelompok.' });
    }

    await pool.query('DELETE FROM kelompok WHERE id = $1', [kelompokId]);

    res.json({
      success: true,
      message: 'Kelompok deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;