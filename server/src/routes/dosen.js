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

// Get courses taught by dosen
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

// Get all tugas besar for a course
router.get('/courses/:courseId/tugas-besar', async (req, res) => {
  try {
    const { courseId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen teaches this course
    const courseCheck = await pool.query(
      'SELECT 1 FROM courses WHERE id = $1 AND dosen_id = $2',
      [courseId, dosenId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach this course.' });
    }

    // Get tugas besar directly for this course
    const result = await pool.query(`
      SELECT 
        tb.*,
        c.nama as course_name,
        c.kode as course_code
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.course_id = $1
      ORDER BY tb.created_at DESC
    `, [courseId]);

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
    const { courseId } = req.params;
    const dosenId = req.user.id;
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

    // Verify dosen teaches this course
    const courseCheck = await pool.query(
      'SELECT 1 FROM courses WHERE id = $1 AND dosen_id = $2',
      [courseId, dosenId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach this course.' });
    }

    // Insert tugas besar directly to course
    const result = await pool.query(`
      INSERT INTO tugas_besar (course_id, judul, deskripsi, tanggal_mulai, tanggal_selesai, komponen, deliverable)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [courseId, title, description, startDate || new Date().toISOString().split('T')[0], deadline, JSON.stringify(components || []), JSON.stringify(deliverables || [])]);

    res.json({
      success: true,
      tugasBesar: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating tugas besar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tugas besar
router.put('/courses/:courseId/tugas-besar/:tugasId', async (req, res) => {
  try {
    const { courseId, tugasId } = req.params;
    const dosenId = req.user.id;
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

    // Verify dosen teaches this course
    const courseCheck = await pool.query(
      'SELECT 1 FROM courses WHERE id = $1 AND dosen_id = $2',
      [courseId, dosenId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach this course.' });
    }

    // Update tugas besar directly
    const result = await pool.query(`
      UPDATE tugas_besar 
      SET judul = $1, deskripsi = $2, tanggal_mulai = $3, tanggal_selesai = $4, komponen = $5, deliverable = $6
      WHERE id = $7 AND course_id = $8
      RETURNING *
    `, [title, description, startDate, deadline, JSON.stringify(components || []), JSON.stringify(deliverables || []), tugasId, courseId]);

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
    const { courseId, tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen teaches this course
    const courseCheck = await pool.query(
      'SELECT 1 FROM courses WHERE id = $1 AND dosen_id = $2',
      [courseId, dosenId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You do not teach this course.' });
    }

    // Get course information
    const courseInfo = await pool.query(
      'SELECT kode, nama FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete tugas besar directly using course_id
    const result = await pool.query(
      'DELETE FROM tugas_besar WHERE id = $1 AND course_id = $2 RETURNING id',
      [tugasId, courseId]
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

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await pool.query(`
      SELECT 
        kt.*,
        COUNT(ak.id) as member_count,
        STRING_AGG(
          CASE WHEN mp.nama_lengkap IS NOT NULL 
          THEN mp.nama_lengkap 
          ELSE u.email END, ', '
        ) as member_names
      FROM kelompok_tugas kt
      LEFT JOIN anggota_kelompok ak ON kt.id = ak.kelompok_id
      LEFT JOIN users u ON ak.mahasiswa_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE kt.tugas_besar_id = $1
      GROUP BY kt.id
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

module.exports = router;