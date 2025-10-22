const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Require dosen role for all routes in this router
router.use(authorizeRole(['dosen']));

// Get dosen profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT dp.nip, dp.nama_lengkap, dp.departemen FROM dosen_profiles dp WHERE dp.user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching dosen profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get classes taught by dosen (NEW CLASS-BASED ENDPOINT)
router.get('/classes', async (req, res) => {
  try {
    const dosenId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        cl.id as class_id,
        cl.nama as class_name,
        cl.kode as class_code,
        cl.kapasitas,
        cl.ruangan,
        cl.jadwal,
        c.id as course_id,
        c.kode as course_code, 
        c.nama as course_name, 
        c.sks, 
        c.semester, 
        c.tahun_ajaran,
        dp.nama_lengkap as dosen_name,
        dp.nip as dosen_nip,
        COUNT(DISTINCT ce.mahasiswa_id) as student_count,
        COUNT(DISTINCT tb.id) as tugas_besar_count
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      JOIN users u ON cl.dosen_id = u.id
      JOIN dosen_profiles dp ON u.id = dp.user_id
      LEFT JOIN class_enrollments ce ON cl.id = ce.class_id AND ce.status = 'active'
      LEFT JOIN tugas_besar tb ON c.id = tb.course_id AND tb.dosen_id = cl.dosen_id
      WHERE cl.dosen_id = $1
      GROUP BY 
        cl.id, cl.nama, cl.kode, cl.kapasitas, cl.ruangan, cl.jadwal,
        c.id, c.kode, c.nama, c.sks, c.semester, c.tahun_ajaran,
        dp.nama_lengkap, dp.nip
      ORDER BY c.nama ASC, cl.nama ASC
    `, [dosenId]);

    // Transform data to match frontend expectations
    const transformedClasses = result.rows.map(row => ({
      classId: `class-${row.course_id}-${row.class_name}`,
      id: row.class_id,
      courseId: row.course_id,
      courseName: row.course_name,
      courseCode: row.course_code,
      className: row.class_name,
      classCode: row.class_code,
      sks: row.sks,
      semester: row.semester,
      tahunAjaran: row.tahun_ajaran,
      kapasitas: row.kapasitas,
      ruangan: row.ruangan,
      schedule: row.jadwal,
      dosenId: dosenId,
      dosenName: row.dosen_name,
      dosenNip: row.dosen_nip,
      studentCount: parseInt(row.student_count) || 0,
      tugasBesar: parseInt(row.tugas_besar_count) || 0
    }));

    res.json({
      success: true,
      classes: transformedClasses
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get courses taught by dosen (LEGACY - for backward compatibility)
router.get('/courses', async (req, res) => {
  try {
    const dosenId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.kode, 
        c.nama, 
        c.sks, 
        c.semester, 
        c.tahun_ajaran,
        c.deskripsi,
        c.status
      FROM courses c 
      WHERE c.dosen_id = $1
      ORDER BY c.nama ASC
    `, [dosenId]);

    res.json({
      success: true,
      courses: result.rows
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== TUGAS BESAR MANAGEMENT =====

// Get all tugas besar for a specific class (not just course)
router.get('/courses/:courseId/tugas-besar', async (req, res) => {
  try {
    const rawCourseId = req.params.courseId;
    const dosenId = req.user.id;
    const classId = req.query.class_id; // NEW: Accept class_id as query parameter

    // Defensive parsing: accept numeric id or class-<courseId>-... shapes
    let courseId = parseInt(rawCourseId, 10);
    if (Number.isNaN(courseId)) {
      const m = String(rawCourseId).match(/class-(\d+)-/);
      if (m && m[1]) {
        courseId = parseInt(m[1], 10);
      } else {
        // Try prefix like '<courseId>-A'
        const parts = String(rawCourseId).split('-');
        if (parts.length > 0 && !Number.isNaN(parseInt(parts[0], 10))) {
          courseId = parseInt(parts[0], 10);
        } else {
          return res.status(400).json({ error: 'Invalid courseId parameter' });
        }
      }
    }

    // NEW: If classId provided, parse and verify dosen teaches this specific class
    if (classId) {
      // Parse classId: accept numeric ID or "class-courseId-className" format
      let parsedClassId = parseInt(classId, 10);
      if (Number.isNaN(parsedClassId)) {
        // Handle class-14-Kelas STEH format: extract actual class ID from database
        const classMatch = await pool.query(
          'SELECT id FROM classes WHERE course_id = $1 AND dosen_id = $2 AND nama ILIKE $3',
          [courseId, dosenId, '%' + classId.split('-').slice(2).join(' ') + '%']
        );
        
        if (classMatch.rows.length === 0) {
          return res.status(400).json({ 
            error: 'Invalid class_id format or class not found',
            debug: { originalClassId: classId, courseId, dosenId }
          });
        }
        parsedClassId = classMatch.rows[0].id;
      }

      const classOwnership = await pool.query(
        'SELECT id, nama FROM classes WHERE id = $1 AND course_id = $2 AND dosen_id = $3',
        [parsedClassId, courseId, dosenId]
      );

      if (classOwnership.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Access denied. You do not teach this specific class.',
          debug: { courseId, classId, dosenId }
        });
      }

      // CLASS-SPECIFIC: Only return tugas_besar for this specific class
      const result = await pool.query(`
        SELECT 
          tb.id, 
          tb.judul as title, 
          tb.deskripsi as description, 
          tb.tanggal_selesai as deadline, 
          tb.max_group_size as max_members,
          tb.student_choice_enabled as is_student_choice,
          tb.course_id,
          tb.dosen_id,
          tb.class_id,
          tb.created_at,
          c.nama AS course_name,
          cl.nama AS class_name,
          dp.nama_lengkap AS dosen_name
        FROM tugas_besar tb
        JOIN courses c ON tb.course_id = c.id
        JOIN classes cl ON tb.class_id = cl.id
        LEFT JOIN dosen_profiles dp ON tb.dosen_id = dp.user_id
        WHERE tb.course_id = $1 AND tb.dosen_id = $2 AND tb.class_id = $3
        ORDER BY tb.created_at DESC
      `, [courseId, dosenId, parsedClassId]);

      return res.json({
        success: true,
        tugasBesar: result.rows,
        classInfo: {
          classId: parsedClassId,
          className: classOwnership.rows[0].nama
        }
      });
    }

    // FALLBACK: If no classId, verify dosen teaches at least one class in this course
    const classCheck = await pool.query(
      'SELECT id, nama FROM classes WHERE course_id = $1 AND dosen_id = $2',
      [courseId, dosenId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach any class in this course.' });
    }

    // LEGACY: Return tugas_besar for all classes this dosen teaches in this course
    const result = await pool.query(`
      SELECT 
        tb.id, 
        tb.judul as title, 
        tb.deskripsi as description, 
        tb.tanggal_selesai as deadline, 
        tb.max_group_size as max_members,
        tb.student_choice_enabled as is_student_choice,
        tb.course_id,
        tb.dosen_id,
        tb.class_id,
        tb.created_at,
        c.nama AS course_name,
        cl.nama AS class_name,
        dp.nama_lengkap AS dosen_name
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      JOIN classes cl ON tb.class_id = cl.id
      LEFT JOIN dosen_profiles dp ON tb.dosen_id = dp.user_id
      WHERE tb.course_id = $1 AND tb.dosen_id = $2
      ORDER BY tb.created_at DESC
    `, [courseId, dosenId]);

    res.json({
      success: true,
      tugasBesar: result.rows
    });
  } catch (error) {
    console.error('Error fetching tugas besar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new tugas besar
router.post('/courses/:courseId/tugas-besar', async (req, res) => {
  try {
    const rawCourseId = req.params.courseId;
    const dosenId = req.user.id;

    // Defensive parsing same as GET
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
    
    const { 
      title, 
      description, 
      deadline, 
      startDate,
      groupFormation,
      minGroupSize,
      maxGroupSize,
      components,
      deliverables,
      class_id // NEW: Accept class_id from request body
    } = req.body;

    // REQUIRED: class_id must be provided for new tugas_besar
    if (!class_id) {
      return res.status(400).json({ 
        error: 'class_id is required. Tugas besar must be associated with a specific class.' 
      });
    }

    // NEW: Verify dosen teaches this specific class
    const classOwnership = await pool.query(
      'SELECT id, nama FROM classes WHERE id = $1 AND course_id = $2 AND dosen_id = $3',
      [class_id, courseId, dosenId]
    );

    if (classOwnership.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied. You do not teach this specific class.',
        debug: { courseId, class_id, dosenId }
      });
    }

    // Insert tugas besar with class_id
    const result = await pool.query(`
      INSERT INTO tugas_besar (course_id, dosen_id, class_id, judul, deskripsi, tanggal_mulai, tanggal_selesai, komponen, deliverable, grouping_method, min_group_size, max_group_size, student_choice_enabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      courseId, 
      dosenId,
      class_id, // NEW: Include class_id
      title, 
      description, 
      startDate || new Date().toISOString().split('T')[0], 
      deadline, 
      JSON.stringify(components || []), 
      JSON.stringify(deliverables || []), 
      groupFormation || 'manual', 
      minGroupSize || 2, 
      maxGroupSize || 4,
      (groupFormation === 'student_choice') // Set student_choice_enabled based on grouping_method
    ]);

    res.json({
      success: true,
      tugasBesar: result.rows[0],
      classInfo: {
        classId: class_id,
        className: classOwnership.rows[0].nama
      }
    });
  } catch (error) {
    console.error('Error creating tugas besar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tugas besar
router.put('/courses/:courseId/tugas-besar/:tugasId', async (req, res) => {
  try {
    const rawCourseId = req.params.courseId;
    const tugasId = req.params.tugasId;
    const dosenId = req.user.id;

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
    const { 
      title, 
      description, 
      deadline, 
      startDate,
      groupFormation,
      minGroupSize,
      maxGroupSize,
      components,
      deliverables
    } = req.body;

    // NEW: Verify dosen teaches at least one class in this course
    const classCheck = await pool.query(
      'SELECT 1 FROM classes WHERE course_id = $1 AND dosen_id = $2 LIMIT 1',
      [courseId, dosenId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach any class in this course.' });
    }

    // Update tugas besar only if created by this dosen (CLASS-SPECIFIC)
    const result = await pool.query(`
      UPDATE tugas_besar 
      SET judul = $1, deskripsi = $2, tanggal_mulai = $3, tanggal_selesai = $4, komponen = $5, deliverable = $6, 
          grouping_method = $7, min_group_size = $8, max_group_size = $9, student_choice_enabled = $10
      WHERE id = $11 AND course_id = $12 AND dosen_id = $13
      RETURNING *
    `, [
      title, 
      description, 
      startDate, 
      deadline, 
      JSON.stringify(components || []), 
      JSON.stringify(deliverables || []), 
      groupFormation || 'manual', 
      minGroupSize || 2, 
      maxGroupSize || 4,
      (groupFormation === 'student_choice'), // Ensure consistency
      tugasId, 
      courseId,
      dosenId  // Add dosen_id check for class-specific access
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas besar not found' });
    }

    res.json({
      success: true,
      tugasBesar: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating tugas besar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete tugas besar
router.delete('/courses/:courseId/tugas-besar/:tugasId', async (req, res) => {
  try {
    const rawCourseId = req.params.courseId;
    const tugasId = req.params.tugasId;
    const dosenId = req.user.id;

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

    // NEW: Verify dosen teaches at least one class in this course
    const classCheck = await pool.query(
      'SELECT 1 FROM classes WHERE course_id = $1 AND dosen_id = $2 LIMIT 1',
      [courseId, dosenId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach any class in this course.' });
    }

    // Get course information
    const courseInfo = await pool.query(
      'SELECT kode, nama FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete tugas besar only if created by this dosen (CLASS-SPECIFIC)
    const result = await pool.query(
      'DELETE FROM tugas_besar WHERE id = $1 AND course_id = $2 AND dosen_id = $3 RETURNING id',
      [tugasId, courseId, dosenId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas besar not found' });
    }

    res.json({
      success: true,
      message: 'Tugas besar deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tugas besar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== TUGAS PROGRES MANAGEMENT =====

// Get tugas progres for a tugas besar
router.get('/tugas-besar/:tugasId/progres', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(`
      SELECT tp.*,
        COUNT(pp.id) as total_submissions,
        COUNT(CASE WHEN pp.status = 'graded' THEN 1 END) as graded_submissions
      FROM tugas_progres tp
      LEFT JOIN pengumpulan_progres pp ON tp.id = pp.tugas_progres_id
      WHERE tp.tugas_besar_id = $1
      GROUP BY tp.id
      ORDER BY tp.deadline ASC
    `, [tugasId]);

    res.json({
      success: true,
      tugasProgres: result.rows
    });
  } catch (error) {
    console.error('Error fetching tugas progres:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create tugas progres
router.post('/tugas-besar/:tugasId/progres', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;
    const { title, description, deadline, weight } = req.body;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(`
      INSERT INTO tugas_progres (tugas_besar_id, title, description, deadline, weight)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [tugasId, title, description, deadline, weight]);

    res.json({
      success: true,
      tugasProgres: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating tugas progres:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tugas progres
router.put('/tugas-progres/:progresId', async (req, res) => {
  try {
    const { progresId } = req.params;
    const dosenId = req.user.id;
    const { title, description, deadline, weight, status } = req.body;

    // Verify ownership through tugas_besar
    const ownerCheck = await pool.query(`
      SELECT 1 FROM tugas_progres tp
      JOIN tugas_besar tb ON tp.tugas_besar_id = tb.id
      WHERE tp.id = $1 AND tb.dosen_id = $2
    `, [progresId, dosenId]);

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(`
      UPDATE tugas_progres 
      SET title = $1, description = $2, deadline = $3, weight = $4, status = $5
      WHERE id = $6
      RETURNING *
    `, [title, description, deadline, weight, status, progresId]);

    res.json({
      success: true,
      tugasProgres: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating tugas progres:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete tugas progres
router.delete('/tugas-progres/:progresId', async (req, res) => {
  try {
    const { progresId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership through tugas_besar
    const ownerCheck = await pool.query(`
      SELECT 1 FROM tugas_progres tp
      JOIN tugas_besar tb ON tp.tugas_besar_id = tb.id
      WHERE tp.id = $1 AND tb.dosen_id = $2
    `, [progresId, dosenId]);

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await pool.query('DELETE FROM tugas_progres WHERE id = $1', [progresId]);

    res.json({
      success: true,
      message: 'Tugas progres deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tugas progres:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== KELOMPOK MANAGEMENT =====

// Get kelompok for tugas besar
router.get('/tugas-besar/:tugasId/kelompok', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // ENHANCED: Verify ownership AND class access
    const ownerCheck = await pool.query(`
      SELECT tb.id, tb.course_id, tb.dosen_id 
      FROM tugas_besar tb
      WHERE tb.id = $1 AND tb.dosen_id = $2
    `, [tugasId, dosenId]);

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You can only access tugas besar you created.' });
    }

    // Additional validation: Ensure dosen teaches in this course
    const classCheck = await pool.query(
      'SELECT 1 FROM classes WHERE course_id = $1 AND dosen_id = $2 LIMIT 1',
      [ownerCheck.rows[0].course_id, dosenId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach any class in this course.' });
    }

    const result = await pool.query(`
      SELECT 
        kt.id,
        kt.name as nama_kelompok,
        kt.tugas_besar_id,
        kt.leader_id,
        kt.creation_method,
        kt.max_members,
        kt.is_student_choice,
        kt.created_at,
        COUNT(DISTINCT km.id) as member_count,
        STRING_AGG(
          DISTINCT CASE WHEN mp.nama_lengkap IS NOT NULL 
          THEN mp.nama_lengkap 
          ELSE u.email END, ', '
        ) as member_names
      FROM kelompok_tugas kt
      LEFT JOIN kelompok_members km ON kt.id = km.kelompok_id
      LEFT JOIN users u ON km.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE kt.tugas_besar_id = $1
      GROUP BY kt.id, kt.name, kt.tugas_besar_id, kt.leader_id, kt.creation_method, kt.max_members, kt.is_student_choice, kt.created_at
      ORDER BY kt.created_at ASC
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

// Create manual group
router.post('/tugas-besar/:tugasId/kelompok/manual', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { name, members, leaderId } = req.body;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create kelompok
      const kelompokResult = await client.query(
        'INSERT INTO kelompok_tugas (tugas_besar_id, name, leader_id, creation_method) VALUES ($1, $2, $3, $4) RETURNING *',
        [tugasId, name, leaderId, 'manual']
      );

      const kelompokId = kelompokResult.rows[0].id;

      // Add members
      for (const memberId of members) {
        await client.query(
          'INSERT INTO kelompok_members (kelompok_id, user_id) VALUES ($1, $2)',
          [kelompokId, memberId]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Kelompok berhasil dibuat',
        kelompok: kelompokResult.rows[0]
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

// Create automatic groups
router.post('/tugas-besar/:tugasId/kelompok/automatic', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { groupSize } = req.body;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Get available students
    const studentsResult = await pool.query(`
      SELECT u.id, mp.nama_lengkap, mp.nim as npm
      FROM users u
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id
      WHERE tb.id = $1 AND ce.status = 'active' 
        AND u.id NOT IN (
          SELECT km.user_id 
          FROM kelompok_members km 
          JOIN kelompok_tugas kt ON km.kelompok_id = kt.id 
          WHERE kt.tugas_besar_id = $1
        )
      ORDER BY mp.nama_lengkap
    `, [tugasId]);

    const students = studentsResult.rows;
    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'Tidak ada mahasiswa yang tersedia untuk pembentukan kelompok',
        groups: []
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const groups = [];
      let currentGroup = [];
      let groupLetter = 'A';

      for (let i = 0; i < students.length; i++) {
        currentGroup.push(students[i]);

        if (currentGroup.length === groupSize || i === students.length - 1) {
          // Create kelompok
          const randomLeaderId = currentGroup[Math.floor(Math.random() * currentGroup.length)].id;
          
          const kelompokResult = await client.query(
            'INSERT INTO kelompok_tugas (tugas_besar_id, name, leader_id, creation_method) VALUES ($1, $2, $3, $4) RETURNING *',
            [tugasId, `Kelompok ${groupLetter}`, randomLeaderId, 'automatic']
          );

          const kelompokId = kelompokResult.rows[0].id;

          // Add members
          for (const member of currentGroup) {
            await client.query(
              'INSERT INTO kelompok_members (kelompok_id, user_id) VALUES ($1, $2)',
              [kelompokId, member.id]
            );
          }

          groups.push({
            ...kelompokResult.rows[0],
            members: currentGroup
          });

          currentGroup = [];
          groupLetter = String.fromCharCode(groupLetter.charCodeAt(0) + 1);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Berhasil membuat ${groups.length} kelompok otomatis`,
        groups
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

// Enable student choice mode - Create empty groups for students to choose from
router.post('/tugas-besar/:tugasId/kelompok/enable-student-choice', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { maxGroupSize, minGroupSize, numberOfGroups } = req.body;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Get student count to estimate number of groups needed
    const studentCountResult = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as student_count
      FROM users u
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id
      WHERE tb.id = $1 AND ce.status = 'active'
    `, [tugasId]);

    const studentCount = parseInt(studentCountResult.rows[0].student_count);
    const estimatedGroups = numberOfGroups || Math.ceil(studentCount / maxGroupSize);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update tugas besar to enable student choice
      await client.query(
        'UPDATE tugas_besar SET grouping_method = $1, student_choice_enabled = true, max_group_size = $2, min_group_size = $3 WHERE id = $4',
        ['student_choice', maxGroupSize, minGroupSize, tugasId]
      );

      // Create empty groups for students to choose from
      const groups = [];
      for (let i = 0; i < estimatedGroups; i++) {
        const groupLetter = String.fromCharCode(65 + i); // A, B, C, etc.
        
        const kelompokResult = await client.query(
          'INSERT INTO kelompok_tugas (tugas_besar_id, name, creation_method, max_members, is_student_choice) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [tugasId, `Kelompok ${groupLetter}`, 'student_choice', maxGroupSize, true]
        );

        groups.push(kelompokResult.rows[0]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Mode pilihan mahasiswa diaktifkan. ${groups.length} kelompok kosong telah dibuat`,
        groups,
        settings: {
          maxGroupSize,
          minGroupSize,
          studentCount,
          estimatedGroups
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error enabling student choice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kelompok
router.delete('/kelompok/:kelompokId', async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(`
      SELECT 1 FROM kelompok_tugas kt
      JOIN tugas_besar tb ON kt.tugas_besar_id = tb.id
      WHERE kt.id = $1 AND tb.dosen_id = $2
    `, [kelompokId, dosenId]);

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete members first
      await client.query('DELETE FROM kelompok_members WHERE kelompok_id = $1', [kelompokId]);
      
      // Delete kelompok
      await client.query('DELETE FROM kelompok_tugas WHERE id = $1', [kelompokId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Kelompok berhasil dihapus'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available students for grouping
router.get('/tugas-besar/:tugasId/mahasiswa-available', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(`
      SELECT u.id, mp.nama_lengkap as name, mp.nim as npm, u.email
      FROM users u
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
      JOIN classes cl ON ce.class_id = cl.id
      JOIN tugas_besar tb ON cl.course_id = tb.course_id
      WHERE tb.id = $1 
        AND ce.status = 'active'
        AND u.id NOT IN (
          SELECT km.user_id 
          FROM kelompok_members km 
          JOIN kelompok_tugas kt ON km.kelompok_id = kt.id 
          WHERE kt.tugas_besar_id = $1
        )
      ORDER BY mp.nama_lengkap
    `, [tugasId]);

    res.json({
      success: true,
      mahasiswa: result.rows
    });
  } catch (error) {
    console.error('Error fetching available mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;