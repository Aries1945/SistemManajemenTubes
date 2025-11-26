const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Require dosen role for all routes in this router
router.use(authorizeRole(['dosen']));

// Get dosen profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT dp.nip, dp.nama_lengkap FROM dosen_profiles dp WHERE dp.user_id = $1',
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

// Update dosen profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_lengkap, nip, password, currentPassword } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update dosen profile
      if (nama_lengkap || nip) {
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (nama_lengkap) {
          updateFields.push(`nama_lengkap = $${paramCount++}`);
          updateValues.push(nama_lengkap);
        }
        
        if (nip) {
          updateFields.push(`nip = $${paramCount++}`);
          updateValues.push(nip);
        }
        
        updateValues.push(userId);
        
        await client.query(
          `UPDATE dosen_profiles SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${paramCount}`,
          updateValues
        );
      }
      
      // Update password if provided
      if (password) {
        // Validate current password if provided
        if (currentPassword) {
          const userResult = await client.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
          );
          
          if (userResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
          }
          
          const isValidPassword = await bcrypt.compare(
            currentPassword,
            userResult.rows[0].password_hash
          );
          
          if (!isValidPassword) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Password saat ini tidak benar' });
          }
        }
        
        // Hash and update new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
          'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [hashedPassword, userId]
        );
      }
      
      await client.query('COMMIT');
      
      // Fetch updated profile
      const result = await client.query(
        'SELECT dp.nip, dp.nama_lengkap FROM dosen_profiles dp WHERE dp.user_id = $1',
        [userId]
      );
      
      res.json({
        success: true,
        profile: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating dosen profile:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get classes taught by dosen (NEW CLASS-BASED ENDPOINT)
// IMPORTANT: One dosen can teach multiple courses and multiple classes
// This endpoint returns ALL classes where cl.dosen_id = dosenId
router.get('/classes', async (req, res) => {
  try {
    const dosenId = req.user.id;
    console.log('GET /auth/dosen/classes - dosenId:', dosenId);
    
    // Get classes with comprehensive statistics from database
    // Simplified query to avoid errors if some tables don't exist
    // Returns all classes where the dosen is assigned (cl.dosen_id = dosenId)
    const result = await pool.query(`
      SELECT 
        cl.id as class_id,
        cl.nama as class_name,
        cl.kode as class_code,
        cl.kapasitas,
        c.id as course_id,
        c.course_name_id,
        cn.kode as course_code, 
        cn.nama as course_name, 
        cn.sks, 
        c.semester, 
        c.tahun_ajaran,
        dp.nama_lengkap as dosen_name,
        dp.nip as dosen_nip,
        COUNT(DISTINCT ce.mahasiswa_id) FILTER (WHERE ce.status = 'active') as student_count,
        (SELECT COUNT(*) FROM tugas_besar WHERE class_id = cl.id AND dosen_id = cl.dosen_id) as tugas_besar_count,
        (SELECT COUNT(*) FROM tugas_besar tb 
         WHERE tb.class_id = cl.id 
           AND tb.dosen_id = cl.dosen_id 
           AND tb.tanggal_selesai >= CURRENT_DATE) as active_tasks_count,
        0 as active_groups_count,
        0 as pending_grading_count,
        COALESCE(
          (
            SELECT AVG(
              CASE 
                WHEN tb.tanggal_selesai IS NOT NULL AND tb.tanggal_mulai IS NOT NULL
                THEN GREATEST(0, LEAST(100, 
                  (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - tb.tanggal_mulai::timestamp)) / 
                   NULLIF(EXTRACT(EPOCH FROM (tb.tanggal_selesai::timestamp - tb.tanggal_mulai::timestamp)), 0)) * 100
                ))
                ELSE 0
              END
            )
            FROM tugas_besar tb
            WHERE tb.class_id = cl.id AND tb.dosen_id = cl.dosen_id
          ),
          0
        ) as average_progress
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      JOIN users u ON cl.dosen_id = u.id
      JOIN dosen_profiles dp ON u.id = dp.user_id
      LEFT JOIN class_enrollments ce ON cl.id = ce.class_id
      WHERE cl.dosen_id = $1
      GROUP BY 
        cl.id, cl.nama, cl.kode, cl.kapasitas,
        c.id, c.course_name_id, cn.kode, cn.nama, cn.sks, c.semester, c.tahun_ajaran,
        dp.nama_lengkap, dp.nip
      ORDER BY cn.nama ASC, cl.nama ASC
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
      dosenId: dosenId,
      dosenName: row.dosen_name,
      dosenNip: row.dosen_nip,
      studentCount: parseInt(row.student_count) || 0,
      tugasBesar: parseInt(row.tugas_besar_count) || 0,
      activeTasks: parseInt(row.active_tasks_count) || 0,
      activeGroups: parseInt(row.active_groups_count) || 0,
      pendingGrading: parseInt(row.pending_grading_count) || 0,
      progress: Math.round(parseFloat(row.average_progress) || 0),
      // Add lastActivity for display
      lastActivity: 'Baru saja'
    }));

    console.log(`GET /auth/dosen/classes - Found ${transformedClasses.length} classes`);
    
    res.json({
      success: true,
      classes: transformedClasses
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get courses taught by dosen (LEGACY - for backward compatibility)
// IMPORTANT: One dosen can teach multiple courses (courses.dosen_id)
// This endpoint returns ALL courses where c.dosen_id = dosenId
router.get('/courses', async (req, res) => {
  try {
    const dosenId = req.user.id;
    
    // Join with course_name to get kode, nama, sks
    // Returns all courses where the dosen is assigned (c.dosen_id = dosenId)
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.course_name_id,
        cn.kode, 
        cn.nama, 
        cn.sks, 
        c.semester, 
        c.tahun_ajaran,
        c.deskripsi,
        c.status
      FROM courses c 
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      WHERE c.dosen_id = $1
      ORDER BY cn.nama ASC
    `, [dosenId]);

    res.json({
      success: true,
      courses: result.rows
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
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
      // class_id column exists in schema - use it directly
      const result = await pool.query(`
        SELECT 
          tb.id, 
          tb.judul, 
          tb.judul as title, 
          tb.deskripsi, 
          tb.deskripsi as description, 
          tb.tanggal_mulai,
          tb.tanggal_selesai,
          tb.tanggal_selesai as deadline, 
          tb.komponen,
          tb.deliverable,
          tb.grouping_method,
          tb.min_group_size,
          tb.max_group_size,
          tb.max_group_size as max_members,
          tb.student_choice_enabled,
          tb.student_choice_enabled as is_student_choice,
          tb.course_id,
          tb.class_id,
          tb.dosen_id,
          tb.created_at,
          cn.nama AS course_name,
          cn.kode AS course_code,
          cl.nama AS class_name,
          dp.nama_lengkap AS dosen_name
        FROM tugas_besar tb
        JOIN courses c ON tb.course_id = c.id
        LEFT JOIN course_name cn ON c.course_name_id = cn.id
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
    // class_id column exists in schema - use it directly
    const result = await pool.query(`
      SELECT 
        tb.id, 
        tb.judul, 
        tb.judul as title, 
        tb.deskripsi, 
        tb.deskripsi as description, 
        tb.tanggal_mulai,
        tb.tanggal_selesai,
        tb.tanggal_selesai as deadline, 
        tb.komponen,
        tb.deliverable,
        tb.grouping_method,
        tb.min_group_size,
        tb.max_group_size,
        tb.max_group_size as max_members,
        tb.student_choice_enabled,
        tb.student_choice_enabled as is_student_choice,
        tb.course_id,
        tb.class_id,
        tb.dosen_id,
        tb.created_at,
        cn.nama AS course_name,
        cn.kode AS course_code,
        cl.nama AS class_name,
        dp.nama_lengkap AS dosen_name
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      LEFT JOIN classes cl ON tb.class_id = cl.id
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      classId: req.query.class_id,
      dosenId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Server error: ' + error.message,
      details: 'Please check server logs for more information'
    });
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

    const tugasBesarId = result.rows[0].id;

    // AUTO-CREATE GROUPS if grouping_method is 'automatic'
    if (groupFormation === 'automatic') {
      try {
        console.log(`Auto-creating groups for tugas besar ${tugasBesarId} with automatic grouping`);
        
        // Get available students for this class
        const studentsResult = await pool.query(`
          SELECT u.id, mp.nama_lengkap, mp.nim as npm
          FROM users u
          JOIN mahasiswa_profiles mp ON u.id = mp.user_id
          JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
          WHERE ce.class_id = $1 AND ce.status = 'active'
            AND u.id NOT IN (
              SELECT km.user_id 
              FROM kelompok_members km 
              JOIN kelompok k ON km.kelompok_id = k.id 
              WHERE k.tugas_besar_id = $2
            )
          ORDER BY mp.nama_lengkap
        `, [class_id, tugasBesarId]);

        const students = studentsResult.rows;
        
        if (students.length > 0) {
          // Calculate optimal group size
          const avgGroupSize = Math.ceil((minGroupSize + maxGroupSize) / 2);
          const ukuranKelompok = Math.min(Math.max(avgGroupSize, minGroupSize), maxGroupSize);
          
          console.log(`Found ${students.length} students, creating groups with size ${ukuranKelompok}`);
          
          // Start transaction for group creation
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            
            const groups = [];
            let groupNumber = 1;
            let usedLetters = [];
            
            // Divide students into groups
            for (let i = 0; i < students.length; i += ukuranKelompok) {
              const groupMembers = students.slice(i, i + ukuranKelompok);
              
              // Find next available letter
              let groupLetter = 'A';
              for (let letter = 'A'; letter <= 'Z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
                if (!usedLetters.includes(letter)) {
                  groupLetter = letter;
                  break;
                }
              }
              usedLetters.push(groupLetter);
              
              const groupName = `Kelompok ${groupLetter}`;
              
              // Create kelompok
              const kelompokResult = await client.query(`
                INSERT INTO kelompok (tugas_besar_id, nama_kelompok, created_by, creation_method)
                VALUES ($1, $2, $3, 'automatic')
                RETURNING id
              `, [tugasBesarId, groupName, dosenId]);
              
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
            console.log(`Successfully created ${groups.length} automatic groups`);
          } catch (groupError) {
            await client.query('ROLLBACK');
            console.error('Error creating automatic groups:', groupError);
            // Don't fail the entire request if group creation fails
          } finally {
            client.release();
          }
        } else {
          console.log('No students available for automatic group creation');
        }
      } catch (autoGroupError) {
        console.error('Error in automatic group creation:', autoGroupError);
        // Don't fail the entire request if group creation fails
      }
    }

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

// ===== GRADING/PENILAIAN ENDPOINTS =====
// NOTE: These routes must be placed BEFORE more general routes like /tugas-besar/:tugasId/progres
// to avoid route conflicts

// Test endpoint to verify route registration
router.get('/test-grading-route', (req, res) => {
  res.json({ message: 'Grading routes are registered correctly', timestamp: new Date().toISOString() });
});

// Get grading data for a tugas besar (tugas besar, komponen, kelompok, nilai)
router.get('/tugas-besar/:tugasId/grading', async (req, res) => {
  console.log('========================================');
  console.log('GET /tugas-besar/:tugasId/grading CALLED');
  console.log('Full URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', req.params);
  console.log('User:', req.user);
  console.log('========================================');
  
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership
    const tugasCheck = await pool.query(`
      SELECT tb.*, 
        cn.nama AS course_name,
        cn.kode AS course_code,
        cl.nama AS class_name
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      LEFT JOIN classes cl ON tb.class_id = cl.id
      WHERE tb.id = $1 AND tb.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const tugas = tugasCheck.rows[0];

    // Parse komponen from JSONB
    let komponen = [];
    if (tugas.komponen) {
      try {
        komponen = typeof tugas.komponen === 'string' 
          ? JSON.parse(tugas.komponen) 
          : tugas.komponen;
      } catch (e) {
        komponen = [];
      }
    }

    // Get groups for this tugas
    const groupsResult = await pool.query(`
      SELECT k.id, k.nama_kelompok as nama, k.tugas_besar_id,
        COUNT(km.user_id) as member_count
      FROM kelompok k
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      WHERE k.tugas_besar_id = $1
      GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id
      ORDER BY k.nama_kelompok
    `, [tugasId]);

    const groups = groupsResult.rows;

    // Get nilai for all komponen and groups
    // Get komponen_penilaian first to match with JSONB komponen
    const komponenPenilaianResult = await pool.query(`
      SELECT id, nama, bobot, deskripsi
      FROM komponen_penilaian
      WHERE tugas_besar_id = $1
    `, [tugasId]);

    // Get nilai with mahasiswa info and group info
    const nilaiResult = await pool.query(`
      SELECT n.*, 
        kp.nama as komponen_nama,
        km.kelompok_id,
        k.nama_kelompok as kelompok_nama
      FROM nilai n
      JOIN komponen_penilaian kp ON n.komponen_id = kp.id
      LEFT JOIN kelompok_members km ON n.mahasiswa_id = km.user_id
      LEFT JOIN kelompok k ON km.kelompok_id = k.id AND k.tugas_besar_id = $1
      WHERE kp.tugas_besar_id = $1
    `, [tugasId]);

    // Structure the data
    const gradingData = {
      tugas: {
        id: tugas.id,
        judul: tugas.judul,
        deskripsi: tugas.deskripsi,
        course_name: tugas.course_name,
        course_code: tugas.course_code,
        class_name: tugas.class_name,
        tanggal_mulai: tugas.tanggal_mulai,
        tanggal_selesai: tugas.tanggal_selesai,
        penilaian_visible: tugas.penilaian_visible || false
      },
      komponen: komponen.map((comp, index) => ({
        index: index,
        name: comp.name || comp.nama || '',
        weight: comp.weight || comp.bobot || 0,
        deadline: comp.deadline || null,
        description: comp.description || comp.deskripsi || ''
      })),
      groups: groups.map(g => ({
        id: g.id,
        name: g.nama,
        memberCount: parseInt(g.member_count) || 0
      })),
      nilai: nilaiResult.rows.map(n => ({
        id: n.id,
        komponen_id: n.komponen_id,
        komponen_nama: n.komponen_nama,
        mahasiswa_id: n.mahasiswa_id,
        kelompok_id: n.kelompok_id,
        kelompok_nama: n.kelompok_nama,
        nilai: parseFloat(n.nilai) || 0,
        catatan: n.catatan || '',
        created_at: n.created_at
      })),
      komponen_penilaian: komponenPenilaianResult.rows
    };

    res.json({
      success: true,
      data: gradingData
    });
  } catch (error) {
    console.error('Error fetching grading data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      tugasId: req.params.tugasId,
      dosenId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Server error: ' + error.message,
      details: 'Please check server logs for more information'
    });
  }
});

// Save nilai for a group and komponen
router.post('/tugas-besar/:tugasId/nilai', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;
    const { kelompok_id, komponen_index, nilai, catatan } = req.body;

    // Verify ownership
    const tugasCheck = await pool.query(
      'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Get komponen from tugas_besar
    const tugasResult = await pool.query(
      'SELECT komponen FROM tugas_besar WHERE id = $1',
      [tugasId]
    );

    if (tugasResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas besar not found' });
    }

    let komponen = [];
    if (tugasResult.rows[0].komponen) {
      try {
        komponen = typeof tugasResult.rows[0].komponen === 'string'
          ? JSON.parse(tugasResult.rows[0].komponen)
          : tugasResult.rows[0].komponen;
      } catch (e) {
        komponen = [];
      }
    }

    if (komponen_index < 0 || komponen_index >= komponen.length) {
      return res.status(400).json({ error: 'Invalid komponen index' });
    }

    // Get members of the group
    const membersResult = await pool.query(`
      SELECT km.user_id
      FROM kelompok_members km
      WHERE km.kelompok_id = $1
    `, [kelompok_id]);

    if (membersResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found or has no members' });
    }

    // For now, we'll save nilai per mahasiswa
    // In the future, we might want to save per kelompok
    // Check if komponen_penilaian exists, if not create it
    const komponenPenilaianCheck = await pool.query(`
      SELECT id FROM komponen_penilaian 
      WHERE tugas_besar_id = $1 AND nama = $2
    `, [tugasId, komponen[komponen_index].name || komponen[komponen_index].nama]);

    let komponenPenilaianId;
    if (komponenPenilaianCheck.rows.length > 0) {
      komponenPenilaianId = komponenPenilaianCheck.rows[0].id;
    } else {
      // Create komponen_penilaian
      const createResult = await pool.query(`
        INSERT INTO komponen_penilaian (tugas_besar_id, nama, bobot, deskripsi)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [
        tugasId,
        komponen[komponen_index].name || komponen[komponen_index].nama,
        komponen[komponen_index].weight || komponen[komponen_index].bobot || 0,
        komponen[komponen_index].description || komponen[komponen_index].deskripsi || ''
      ]);
      komponenPenilaianId = createResult.rows[0].id;
    }

    // Save nilai for each member (or average for group)
    // For simplicity, we'll save the same nilai for all members
    // In production, you might want different logic
    const savedNilai = [];
    for (const member of membersResult.rows) {
      // Check if nilai already exists
      const existingNilai = await pool.query(`
        SELECT id FROM nilai 
        WHERE komponen_id = $1 AND mahasiswa_id = $2
      `, [komponenPenilaianId, member.user_id]);

      if (existingNilai.rows.length > 0) {
        // Update existing
        await pool.query(`
          UPDATE nilai 
          SET nilai = $1, catatan = $2
          WHERE id = $3
        `, [nilai, catatan, existingNilai.rows[0].id]);
        savedNilai.push(existingNilai.rows[0].id);
      } else {
        // Create new
        const newNilai = await pool.query(`
          INSERT INTO nilai (komponen_id, mahasiswa_id, nilai, catatan)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [komponenPenilaianId, member.user_id, nilai, catatan]);
        savedNilai.push(newNilai.rows[0].id);
      }
    }

    res.json({
      success: true,
      message: 'Nilai berhasil disimpan',
      saved_count: savedNilai.length
    });
  } catch (error) {
    console.error('Error saving nilai:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update visibility of penilaian (show/hide to students)
router.put('/tugas-besar/:tugasId/penilaian-visibility', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { penilaian_visible } = req.body;
    const dosenId = req.user.id;

    // Verify ownership
    const tugasCheck = await pool.query(`
      SELECT id FROM tugas_besar
      WHERE id = $1 AND dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Update visibility
    await pool.query(`
      UPDATE tugas_besar
      SET penilaian_visible = $1
      WHERE id = $2
    `, [penilaian_visible === true, tugasId]);

    res.json({
      success: true,
      message: penilaian_visible 
        ? 'Penilaian sekarang ditampilkan ke mahasiswa' 
        : 'Penilaian sekarang disembunyikan dari mahasiswa',
      penilaian_visible: penilaian_visible === true
    });
  } catch (error) {
    console.error('Error updating penilaian visibility:', error);
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
        k.id,
        k.nama_kelompok,
        k.tugas_besar_id,
        k.leader_id,
        k.creation_method,
        k.max_members,
        k.is_student_choice,
        k.created_at,
        COUNT(DISTINCT km.id) as member_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', u.id,
              'name', COALESCE(mp.nama_lengkap, u.email),
              'email', u.email,
              'npm', COALESCE(mp.nim, ''),
              'role', CASE WHEN km.is_leader OR k.leader_id = u.id THEN 'leader' ELSE 'member' END
            ) ORDER BY km.is_leader DESC, COALESCE(mp.nama_lengkap, u.email)
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::json
        ) as members
      FROM kelompok k
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      LEFT JOIN users u ON km.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE k.tugas_besar_id = $1
      GROUP BY k.id, k.nama_kelompok, k.tugas_besar_id, k.leader_id, k.creation_method, k.max_members, k.is_student_choice, k.created_at
      ORDER BY k.created_at ASC
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
        'INSERT INTO kelompok (tugas_besar_id, nama_kelompok, leader_id, creation_method) VALUES ($1, $2, $3, $4) RETURNING *',
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
          JOIN kelompok k ON km.kelompok_id = k.id 
          WHERE k.tugas_besar_id = $1
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
            'INSERT INTO kelompok (tugas_besar_id, nama_kelompok, leader_id, creation_method) VALUES ($1, $2, $3, $4) RETURNING *',
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
          'INSERT INTO kelompok (tugas_besar_id, nama_kelompok, creation_method, max_members, is_student_choice) VALUES ($1, $2, $3, $4, $5) RETURNING *',
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
      SELECT 1 FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      WHERE k.id = $1 AND tb.dosen_id = $2
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
      await client.query('DELETE FROM kelompok WHERE id = $1', [kelompokId]);

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

// Add member to kelompok (only for manual grouping)
router.post('/kelompok/:kelompokId/members', async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const { memberId } = req.body;
    const dosenId = req.user.id;

    if (!memberId) {
      return res.status(400).json({ error: 'memberId is required' });
    }

    // Verify ownership and check grouping method
    const groupCheck = await pool.query(`
      SELECT k.*, tb.grouping_method, tb.max_group_size, tb.min_group_size
      FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      WHERE k.id = $1 AND tb.dosen_id = $2
    `, [kelompokId, dosenId]);

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const group = groupCheck.rows[0];
    
    // Only allow for manual grouping
    if (group.grouping_method !== 'manual' && group.creation_method !== 'manual') {
      return res.status(400).json({ 
        error: 'Hanya dapat menambah anggota untuk kelompok dengan metode manual' 
      });
    }

    // Check if member is already in a group for this tugas
    const existingCheck = await pool.query(`
      SELECT k.id, k.nama_kelompok
      FROM kelompok_members km
      JOIN kelompok k ON km.kelompok_id = k.id
      WHERE k.tugas_besar_id = $1 AND km.user_id = $2
    `, [group.tugas_besar_id, memberId]);

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Mahasiswa sudah tergabung dalam ${existingCheck.rows[0].nama_kelompok}` 
      });
    }

    // Check max group size
    const currentMemberCount = await pool.query(
      'SELECT COUNT(*) as count FROM kelompok_members WHERE kelompok_id = $1',
      [kelompokId]
    );
    const maxSize = group.max_members || group.max_group_size || 4;
    
    if (parseInt(currentMemberCount.rows[0].count) >= maxSize) {
      return res.status(400).json({ 
        error: `Kelompok sudah mencapai batas maksimal ${maxSize} anggota` 
      });
    }

    // Verify student is in the same class
    const studentCheck = await pool.query(`
      SELECT 1 FROM class_enrollments ce
      JOIN tugas_besar tb ON ce.class_id = tb.class_id
      WHERE tb.id = $1 AND ce.mahasiswa_id = $2 AND ce.status = 'active'
    `, [group.tugas_besar_id, memberId]);

    if (studentCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Mahasiswa tidak terdaftar di kelas yang sama' 
      });
    }

    // Add member
    await pool.query(
      'INSERT INTO kelompok_members (kelompok_id, user_id) VALUES ($1, $2)',
      [kelompokId, memberId]
    );

    res.json({
      success: true,
      message: 'Anggota berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from kelompok (only for manual grouping)
router.delete('/kelompok/:kelompokId/members/:memberId', async (req, res) => {
  try {
    const { kelompokId, memberId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership and check grouping method
    const groupCheck = await pool.query(`
      SELECT k.*, tb.grouping_method, tb.min_group_size
      FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      WHERE k.id = $1 AND tb.dosen_id = $2
    `, [kelompokId, dosenId]);

    if (groupCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const group = groupCheck.rows[0];
    
    // Only allow for manual grouping
    if (group.grouping_method !== 'manual' && group.creation_method !== 'manual') {
      return res.status(400).json({ 
        error: 'Hanya dapat menghapus anggota untuk kelompok dengan metode manual' 
      });
    }

    // Check min group size
    const currentMemberCount = await pool.query(
      'SELECT COUNT(*) as count FROM kelompok_members WHERE kelompok_id = $1',
      [kelompokId]
    );
    const minSize = group.min_group_size || 2;
    
    if (parseInt(currentMemberCount.rows[0].count) <= minSize) {
      return res.status(400).json({ 
        error: `Kelompok minimal harus memiliki ${minSize} anggota` 
      });
    }

    // Remove member
    await pool.query(
      'DELETE FROM kelompok_members WHERE kelompok_id = $1 AND user_id = $2',
      [kelompokId, memberId]
    );

    // If removed member was leader, assign new leader
    if (group.leader_id === parseInt(memberId)) {
      const remainingMembers = await pool.query(
        'SELECT user_id FROM kelompok_members WHERE kelompok_id = $1 LIMIT 1',
        [kelompokId]
      );
      
      if (remainingMembers.rows.length > 0) {
        await pool.query(
          'UPDATE kelompok SET leader_id = $1 WHERE id = $2',
          [remainingMembers.rows[0].user_id, kelompokId]
        );
      } else {
        await pool.query(
          'UPDATE kelompok SET leader_id = NULL WHERE id = $1',
          [kelompokId]
        );
      }
    }

    res.json({
      success: true,
      message: 'Anggota berhasil dihapus'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available students for grouping
router.get('/tugas-besar/:tugasId/mahasiswa-available', async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify ownership and get class_id
    const ownerCheck = await pool.query(
      'SELECT id, course_id, class_id FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
      [tugasId, dosenId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const tugas = ownerCheck.rows[0];
    const classId = tugas.class_id;

    // Get students from the specific class (if class_id exists)
    let result;
    if (classId) {
      result = await pool.query(`
        SELECT u.id, mp.nama_lengkap as name, mp.nim as npm, u.email
        FROM users u
        JOIN mahasiswa_profiles mp ON u.id = mp.user_id
        JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
        WHERE ce.class_id = $1 
          AND ce.status = 'active'
          AND u.role = 'mahasiswa'
          AND u.id NOT IN (
            SELECT km.user_id 
            FROM kelompok_members km 
            JOIN kelompok k ON km.kelompok_id = k.id 
            WHERE k.tugas_besar_id = $2
          )
        ORDER BY mp.nama_lengkap
      `, [classId, tugasId]);
    } else {
      // Fallback: get all students from course (if class_id is null)
      result = await pool.query(`
        SELECT u.id, mp.nama_lengkap as name, mp.nim as npm, u.email
        FROM users u
        JOIN mahasiswa_profiles mp ON u.id = mp.user_id
        JOIN class_enrollments ce ON u.id = ce.mahasiswa_id
        JOIN classes cl ON ce.class_id = cl.id
        WHERE cl.course_id = $1 
          AND ce.status = 'active'
          AND u.role = 'mahasiswa'
          AND u.id NOT IN (
            SELECT km.user_id 
            FROM kelompok_members km 
            JOIN kelompok k ON km.kelompok_id = k.id 
            WHERE k.tugas_besar_id = $2
          )
        ORDER BY mp.nama_lengkap
      `, [tugas.course_id, tugasId]);
    }

    res.json({
      success: true,
      mahasiswa: result.rows
    });
  } catch (error) {
    console.error('Error fetching available mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students from all classes taught by dosen
router.get('/students', async (req, res) => {
  try {
    const dosenId = req.user.id;
    console.log('GET /auth/dosen/students - dosenId:', dosenId);
    
    // Get all students from all classes taught by this dosen
    const result = await pool.query(`
      SELECT DISTINCT
        u.id as user_id,
        u.email,
        u.role,
        mp.nama_lengkap,
        mp.nim,
        ce.status as enrollment_status,
        ce.enrolled_at,
        ce.nilai_akhir,
        cl.id as class_id,
        cl.nama as class_name,
        cl.kode as class_code,
        c.id as course_id,
        cn.nama as course_name,
        cn.kode as course_code
      FROM classes cl
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
      JOIN class_enrollments ce ON cl.id = ce.class_id
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE cl.dosen_id = $1
        AND ce.status = 'active'
        AND u.role = 'mahasiswa'
      ORDER BY mp.nama_lengkap ASC, cn.nama ASC, cl.nama ASC
    `, [dosenId]);
    
    console.log(`Found ${result.rows.length} students for dosen ${dosenId}`);
    
    res.json({
      success: true,
      students: result.rows
    });
  } catch (error) {
    console.error('Error fetching students for dosen:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});


module.exports = router;