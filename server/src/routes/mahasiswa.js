const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Require mahasiswa role for all routes in this router
router.use(authorizeRole(['mahasiswa']));

// Get mahasiswa profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`GET /profile called for user_id: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const result = await pool.query(
      'SELECT mp.nim, mp.nama_lengkap FROM mahasiswa_profiles mp WHERE mp.user_id = $1',
      [userId]
    );
    
    console.log(`Query result for user_id ${userId}:`, result.rows);
    
    if (result.rows.length === 0) {
      console.error(`Profile not found for user_id: ${userId}`);
      return res.status(404).json({ error: 'Profil tidak ditemukan' });
    }
    
    console.log(`Profile found for user_id ${userId}:`, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching mahasiswa profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update mahasiswa profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_lengkap } = req.body;
    
    console.log('PUT /profile called for user_id:', userId);
    console.log('Update profile request:', { userId, nama_lengkap });
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!nama_lengkap || nama_lengkap.trim() === '') {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi' });
    }
    
    // First check if profile exists
    const checkResult = await pool.query(
      'SELECT user_id FROM mahasiswa_profiles WHERE user_id = $1',
      [userId]
    );
    
    console.log('Profile check result:', checkResult.rows);
    
    if (checkResult.rows.length === 0) {
      console.error(`Profile not found for user_id: ${userId}`);
      return res.status(404).json({ error: 'Profil tidak ditemukan. Silakan hubungi administrator.' });
    }
    
    // Update profile
    const result = await pool.query(
      'UPDATE mahasiswa_profiles SET nama_lengkap = $1 WHERE user_id = $2 RETURNING nim, nama_lengkap',
      [nama_lengkap.trim(), userId]
    );
    
    console.log('Update result:', result.rows);
    
    if (result.rows.length === 0) {
      console.error(`Failed to update profile for user_id: ${userId}`);
      return res.status(500).json({ error: 'Gagal memperbarui profil' });
    }
    
    console.log('Profile updated successfully:', result.rows[0]);
    
    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating mahasiswa profile:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update mahasiswa password
router.put('/password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, password } = req.body;
    
    if (!currentPassword || !password) {
      return res.status(400).json({ error: 'Password saat ini dan password baru wajib diisi' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    
    // Get current user password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password (assuming password is hashed with bcrypt)
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Password saat ini salah' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error updating mahasiswa password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get courses enrolled by mahasiswa
router.get('/courses', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Join with course_name to get kode, nama, sks
    const result = await pool.query(`
      SELECT DISTINCT
        c.id as course_id,
        c.course_name_id,
        cn.kode as course_code,
        cn.nama as course_name,
        cn.sks,
        c.semester,
        c.tahun_ajaran,
        c.deskripsi as course_description,
        cl.nama as class_name,
        cl.id as class_id,
        d.nama_lengkap as dosen_name,
        ce.enrolled_at,
        ce.status as enrollment_status,
        ce.nilai_akhir
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id  
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      LEFT JOIN dosen_profiles d ON cl.dosen_id = d.user_id
      WHERE ce.mahasiswa_id = $1 AND ce.status = 'active'
      ORDER BY c.semester DESC, cn.nama ASC
    `, [userId]);
    
    res.json({
      success: true,
      courses: result.rows
    });
  } catch (error) {
    console.error('Error fetching mahasiswa courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get course detail for specific course
router.get('/courses/:courseId', async (req, res) => {
  try {
    const userId = req.user.id;
    const rawCourseId = req.params.courseId;

    let courseId = parseInt(rawCourseId, 10);
    if (Number.isNaN(courseId)) {
      const m = String(rawCourseId).match(/class-(\d+)-/);
      if (m && m[1]) {
        courseId = parseInt(m[1], 10);
      } else {
        const parts = String(rawCourseId).split('-');
        if (parts.length > 0 && !Number.isNaN(parseInt(parts[0], 10))) {
          courseId = parseInt(parts[0], 10);
        } else {
          return res.status(400).json({ error: 'Invalid courseId parameter' });
        }
      }
    }
    
    // Get course detail with enrollment info
    // Use course_name join to get kode, nama, sks (same as /courses endpoint)
    const result = await pool.query(`
      SELECT DISTINCT
        c.id as course_id,
        c.course_name_id,
        cn.kode as course_code,
        cn.nama as course_name,
        cn.sks,
        c.semester,
        c.tahun_ajaran,
        c.deskripsi as course_description,
        cl.nama as class_name,
        cl.id as class_id,
        cl.kapasitas,
        d.nama_lengkap as dosen_name,
        d.nip as dosen_nip,
        ce.enrolled_at,
        ce.status as enrollment_status,
        ce.nilai_akhir
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id  
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      LEFT JOIN dosen_profiles d ON cl.dosen_id = d.user_id
      WHERE ce.mahasiswa_id = $1 AND c.id = $2 AND ce.status = 'active'
    `, [userId, courseId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found or you are not enrolled in this course.' });
    }
    
    res.json({
      success: true,
      course: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching course detail:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get tugas besar for specific course
router.get('/courses/:courseId/tugas-besar', async (req, res) => {
  try {
    const userId = req.user.id;
    const rawCourseId = req.params.courseId;
    
    console.log('GET /auth/mahasiswa/courses/:courseId/tugas-besar - userId:', userId, 'courseId:', rawCourseId);

    let courseId = parseInt(rawCourseId, 10);
    if (Number.isNaN(courseId)) {
      const m = String(rawCourseId).match(/class-(\d+)-/);
      if (m && m[1]) {
        courseId = parseInt(m[1], 10);
      } else {
        const parts = String(rawCourseId).split('-');
        if (parts.length > 0 && !Number.isNaN(parseInt(parts[0], 10))) {
          courseId = parseInt(parts[0], 10);
        } else {
          return res.status(400).json({ error: 'Invalid courseId parameter' });
        }
      }
    }
    
    console.log('Parsed courseId:', courseId);
    
    // First, verify mahasiswa is enrolled in this course and get class info
    const enrollmentCheck = await pool.query(`
      SELECT ce.class_id, cl.dosen_id 
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      WHERE ce.mahasiswa_id = $1 AND cl.course_id = $2 AND ce.status = 'active'
    `, [userId, courseId]);
    
    console.log('Enrollment check result:', enrollmentCheck.rows.length, 'rows');
    
    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
    }
    
    const classInfo = enrollmentCheck.rows[0];
    console.log('Class info:', classInfo);
    
    // Get tugas besar for this course created by the dosen of the class
    // NEW: Filter by class_id to ensure class-specific isolation
    
    // Get tugas besar with course_name join (same as other endpoints)
    const result = await pool.query(`
      SELECT 
        tb.*,
        tb.judul as title,
        tb.deskripsi as description,
        tb.tanggal_mulai as start_date,
        tb.tanggal_selesai as end_date,
        cn.nama as course_name,
        cn.kode as course_code,
        d.nama_lengkap as dosen_name,
        cl.nama as class_name,
        cl.id as class_id
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      JOIN classes cl ON tb.class_id = cl.id
      LEFT JOIN dosen_profiles d ON tb.dosen_id = d.user_id
      WHERE tb.course_id = $1 AND tb.dosen_id = $2 AND tb.class_id = $3
      ORDER BY tb.created_at DESC
    `, [courseId, classInfo.dosen_id, classInfo.class_id]);
    
    console.log(`Found ${result.rows.length} tugas besar for course ${courseId}`);
    
    res.json({
      success: true,
      tugasBesar: result.rows
    });
  } catch (error) {
    console.error('Error fetching tugas besar for mahasiswa:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      userId: req.user?.id
    });
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get all tugas besar across all enrolled courses
router.get('/tugas-besar', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        tb.id,
        tb.title,
        tb.description,
        tb.start_date,
        tb.end_date,
        tb.created_at,
        tb.komponen,
        tb.deliverable,
        tb.student_choice_enabled,
        tb.max_group_size,
        tb.min_group_size,
        tb.grouping_method,
        c.id as course_id,
        c.nama as course_name,
        c.kode as course_code,
        c.semester,
        c.tahun_ajaran,
        cl.nama as class_name,
        ce.enrolled_at
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id  
      JOIN courses c ON cl.course_id = c.id
      JOIN tugas_besar tb ON c.id = tb.course_id
      WHERE ce.mahasiswa_id = $1 AND ce.status = 'active'
      ORDER BY tb.end_date ASC, tb.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      tugasBesar: result.rows
    });
  } catch (error) {
    console.error('Error fetching all tugas besar for mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== KELOMPOK MANAGEMENT FOR MAHASISWA =====

// Get available kelompok for student choice tugas besar
router.get('/tugas-besar/:tugasId/kelompok-available', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const mahasiswaId = req.user.id;

    // Verify student is enrolled in the course
    const enrollmentCheck = await pool.query(`
      SELECT 1 FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id
      WHERE tb.id = $1 AND ce.mahasiswa_id = $2 AND ce.status = 'active'
    `, [tugasId, mahasiswaId]);

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
    }

    // Check if student is already in a group for this tugas
    const existingGroupCheck = await pool.query(`
      SELECT k.id, k.nama_kelompok 
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      WHERE k.tugas_besar_id = $1 AND km.user_id = $2
    `, [tugasId, mahasiswaId]);

    if (existingGroupCheck.rows.length > 0) {
      return res.json({
        success: true,
        alreadyInGroup: true,
        currentGroup: existingGroupCheck.rows[0],
        message: `Anda sudah tergabung dalam ${existingGroupCheck.rows[0].nama_kelompok}`
      });
    }

    // Get available groups for student choice
    const result = await pool.query(`
      SELECT 
        k.*,
        COUNT(DISTINCT km.id) as current_members,
        COALESCE(k.max_members, tb.max_group_size, 4) as max_members,
        COALESCE(
          ARRAY_AGG(
            jsonb_build_object(
              'id', u.id,
              'name', mp.nama_lengkap,
              'npm', mp.nim,
              'isLeader', CASE WHEN km.user_id = k.leader_id THEN true ELSE false END
            ) ORDER BY mp.nama_lengkap
          ) FILTER (WHERE u.id IS NOT NULL),
          '{}'::jsonb[]
        ) as members
      FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      LEFT JOIN users u ON km.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE k.tugas_besar_id = $1 
        AND (k.is_student_choice = true OR tb.student_choice_enabled = true)
      GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id, k.leader_id, k.creation_method, k.max_members, k.is_student_choice, k.created_at, tb.max_group_size
      HAVING COUNT(DISTINCT km.id) < COALESCE(k.max_members, tb.max_group_size, 4)
      ORDER BY k.nama_kelompok ASC
    `, [tugasId]);

    res.json({
      success: true,
      alreadyInGroup: false,
      kelompok: result.rows
    });
  } catch (error) {
    console.error('Error fetching available kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join a kelompok (student choice)
router.post('/kelompok/:kelompokId/join', async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const mahasiswaId = req.user.id;

    // Get kelompok details and verify it's available for student choice
    const kelompokCheck = await pool.query(`
      SELECT 
        k.id,
        k.nama_kelompok,
        k.tugas_besar_id,
        k.leader_id,
        k.creation_method,
        k.max_members,
        k.is_student_choice,
        k.created_at,
        tb.max_group_size,
        tb.min_group_size,
        tb.student_choice_enabled,
        COUNT(DISTINCT km.id) as current_members
      FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      WHERE k.id = $1 
      GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id, k.leader_id, k.creation_method, k.max_members, k.is_student_choice, k.created_at, tb.max_group_size, tb.min_group_size, tb.student_choice_enabled
    `, [kelompokId]);

    if (kelompokCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kelompok tidak ditemukan' });
    }

    const kelompok = kelompokCheck.rows[0];
    
    if (!kelompok.student_choice_enabled && !kelompok.is_student_choice) {
      return res.status(403).json({ error: 'Kelompok ini tidak terbuka untuk pilihan mahasiswa' });
    }

    // Check if group is full
    const maxMembers = kelompok.max_members || kelompok.max_group_size || 4;
    if (kelompok.current_members >= maxMembers) {
      return res.status(400).json({ error: 'Kelompok sudah penuh' });
    }

    // Verify student is enrolled in the course
    const enrollmentCheck = await pool.query(`
      SELECT 1 FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id
      WHERE tb.id = $1 AND ce.mahasiswa_id = $2 AND ce.status = 'active'
    `, [kelompok.tugas_besar_id, mahasiswaId]);

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Anda tidak terdaftar di mata kuliah ini' });
    }

    // Check if student is already in a group for this tugas
    const existingGroupCheck = await pool.query(`
      SELECT k.nama_kelompok 
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      WHERE k.tugas_besar_id = $1 AND km.user_id = $2
    `, [kelompok.tugas_besar_id, mahasiswaId]);

    if (existingGroupCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Anda sudah tergabung dalam ${existingGroupCheck.rows[0].nama_kelompok}` 
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Add student to group
      await client.query(
        'INSERT INTO kelompok_members (kelompok_id, user_id, joined_at) VALUES ($1, $2, NOW())',
        [kelompokId, mahasiswaId]
      );

      // Check if group is now full and needs a leader
      const newMemberCount = kelompok.current_members + 1;
      if (newMemberCount >= maxMembers && !kelompok.leader_id) {
        // Randomly select a leader from all members
        const membersResult = await client.query(`
          SELECT user_id FROM kelompok_members WHERE kelompok_id = $1
        `, [kelompokId]);
        
        const allMembers = membersResult.rows.map(row => row.user_id);
        const randomLeaderId = allMembers[Math.floor(Math.random() * allMembers.length)];
        
        await client.query(
          'UPDATE kelompok SET leader_id = $1 WHERE id = $2',
          [randomLeaderId, kelompokId]
        );
      }

      await client.query('COMMIT');

      // Get updated group info
      const updatedGroupResult = await client.query(`
        SELECT 
          k.*,
          COUNT(DISTINCT km.id) as member_count,
          COALESCE(
            ARRAY_AGG(
              jsonb_build_object(
                'id', u.id,
                'name', mp.nama_lengkap,
                'npm', mp.nim,
                'isLeader', CASE WHEN km.user_id = k.leader_id THEN true ELSE false END
              ) ORDER BY mp.nama_lengkap
            ) FILTER (WHERE u.id IS NOT NULL),
            '{}'::jsonb[]
          ) as members
        FROM kelompok k
        LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
        LEFT JOIN users u ON km.user_id = u.id
        LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
        WHERE k.id = $1
        GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id, k.leader_id, k.creation_method, k.max_members, k.is_student_choice, k.created_at
      `, [kelompokId]);

      res.json({
        success: true,
        message: `Berhasil bergabung dengan ${kelompok.name}`,
        kelompok: updatedGroupResult.rows[0],
        isGroupFull: newMemberCount >= maxMembers
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error joining kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave a kelompok (student choice)
router.post('/kelompok/:kelompokId/leave', async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const mahasiswaId = req.user.id;

    // Verify student is in this group
    const memberCheck = await pool.query(`
      SELECT 
        km.*,
        k.nama_kelompok,
        k.leader_id,
        k.tugas_besar_id,
        tb.student_choice_enabled
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      WHERE km.kelompok_id = $1 AND km.user_id = $2
    `, [kelompokId, mahasiswaId]);

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Anda tidak tergabung dalam kelompok ini' });
    }

    const membership = memberCheck.rows[0];

    if (!membership.student_choice_enabled) {
      return res.status(403).json({ error: 'Tidak dapat keluar dari kelompok yang bukan student choice' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove student from group
      await client.query(
        'DELETE FROM kelompok_members WHERE kelompok_id = $1 AND user_id = $2',
        [kelompokId, mahasiswaId]
      );

      // If this student was the leader, clear leader or assign new one
      if (membership.leader_id === mahasiswaId) {
        const remainingMembers = await client.query(
          'SELECT user_id FROM kelompok_members WHERE kelompok_id = $1',
          [kelompokId]
        );

        if (remainingMembers.rows.length > 0) {
          // Assign random new leader
          const newLeaderId = remainingMembers.rows[0].user_id;
          await client.query(
            'UPDATE kelompok SET leader_id = $1 WHERE id = $2',
            [newLeaderId, kelompokId]
          );
        } else {
          // No members left, clear leader
          await client.query(
            'UPDATE kelompok SET leader_id = NULL WHERE id = $2',
            [kelompokId]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Berhasil keluar dari ${membership.nama_kelompok}`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error leaving kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current kelompok for a tugas besar
router.get('/tugas-besar/:tugasId/kelompok-current', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const mahasiswaId = req.user.id;

    const result = await pool.query(`
      SELECT 
        k.*,
        COUNT(DISTINCT km_all.id) as member_count,
        COALESCE(
          ARRAY_AGG(
            jsonb_build_object(
              'id', u.id,
              'name', mp.nama_lengkap,
              'npm', mp.nim,
              'isLeader', CASE WHEN km_all.user_id = k.leader_id THEN true ELSE false END
            ) ORDER BY mp.nama_lengkap
          ) FILTER (WHERE u.id IS NOT NULL),
          '{}'::jsonb[]
        ) as members
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      LEFT JOIN kelompok_members km_all ON k.id = km_all.kelompok_id
      LEFT JOIN users u ON km_all.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE k.tugas_besar_id = $1 AND km.user_id = $2
      GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id, k.leader_id, k.creation_method, k.max_members, k.is_student_choice, k.created_at
    `, [tugasId, mahasiswaId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        hasGroup: false,
        kelompok: null
      });
    }

    res.json({
      success: true,
      hasGroup: true,
      kelompok: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching current kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get penilaian (grades) for a tugas besar (only if visible to students)
router.get('/tugas-besar/:tugasId/penilaian', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const mahasiswaId = req.user.id;

    // Verify student is enrolled in the course and tugas besar exists
    const enrollmentCheck = await pool.query(`
      SELECT ce.class_id, cl.dosen_id, tb.penilaian_visible
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id AND tb.class_id = cl.id
      WHERE tb.id = $1 AND ce.mahasiswa_id = $2 AND ce.status = 'active'
    `, [tugasId, mahasiswaId]);

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this course.' });
    }

    const { penilaian_visible } = enrollmentCheck.rows[0];

    // Check if penilaian is visible to students
    if (!penilaian_visible) {
      return res.json({
        success: true,
        visible: false,
        message: 'Penilaian belum ditampilkan oleh dosen',
        data: null
      });
    }

    // Get tugas besar info
    const tugasResult = await pool.query(`
      SELECT tb.id, tb.judul, tb.deskripsi, tb.tanggal_mulai, tb.tanggal_selesai,
        cn.nama AS course_name, cn.kode AS course_code,
        cl.nama AS class_name
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      LEFT JOIN classes cl ON tb.class_id = cl.id
      WHERE tb.id = $1
    `, [tugasId]);

    if (tugasResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas besar not found' });
    }

    const tugas = tugasResult.rows[0];

    // Parse komponen from JSONB
    let komponen = [];
    const tugasFull = await pool.query(`SELECT komponen FROM tugas_besar WHERE id = $1`, [tugasId]);
    if (tugasFull.rows[0]?.komponen) {
      try {
        komponen = typeof tugasFull.rows[0].komponen === 'string' 
          ? JSON.parse(tugasFull.rows[0].komponen) 
          : tugasFull.rows[0].komponen;
      } catch (e) {
        komponen = [];
      }
    }

    // Get student's group for this tugas
    const groupResult = await pool.query(`
      SELECT k.id, k.nama_kelompok
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      WHERE k.tugas_besar_id = $1 AND km.user_id = $2
    `, [tugasId, mahasiswaId]);

    const kelompokId = groupResult.rows.length > 0 ? groupResult.rows[0].id : null;
    const kelompokNama = groupResult.rows.length > 0 ? groupResult.rows[0].nama_kelompok : null;

    // Get nilai for this student
    const nilaiResult = await pool.query(`
      SELECT n.*, 
        kp.nama as komponen_nama,
        kp.bobot as komponen_bobot
      FROM nilai n
      JOIN komponen_penilaian kp ON n.komponen_id = kp.id
      WHERE kp.tugas_besar_id = $1 AND n.mahasiswa_id = $2
      ORDER BY kp.nama
    `, [tugasId, mahasiswaId]);

    // Calculate average
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const nilaiList = nilaiResult.rows.map(n => {
      const nilai = parseFloat(n.nilai) || 0;
      const bobot = parseFloat(n.komponen_bobot) || 0;
      totalWeightedScore += nilai * (bobot / 100);
      totalWeight += bobot;
      return {
        komponen_nama: n.komponen_nama,
        nilai: nilai,
        bobot: bobot,
        catatan: n.catatan || ''
      };
    });

    const average = totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;

    res.json({
      success: true,
      visible: true,
      data: {
        tugas: {
          id: tugas.id,
          judul: tugas.judul,
          deskripsi: tugas.deskripsi,
          course_name: tugas.course_name,
          course_code: tugas.course_code,
          class_name: tugas.class_name,
          tanggal_mulai: tugas.tanggal_mulai,
          tanggal_selesai: tugas.tanggal_selesai
        },
        komponen: komponen.map((comp, index) => ({
          index: index,
          name: comp.name || comp.nama || '',
          weight: comp.weight || comp.bobot || 0,
          deadline: comp.deadline || null,
          description: comp.description || comp.deskripsi || ''
        })),
        kelompok: kelompokId ? {
          id: kelompokId,
          nama: kelompokNama
        } : null,
        nilai: nilaiList,
        average: average ? parseFloat(average) : null
      }
    });
  } catch (error) {
    console.error('Error fetching penilaian for mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;