const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const { authorizeRole } = require('../middleware/auth');

// Middleware to ensure only admins can access these routes
router.use(authorizeRole(['admin']));

// GET all users - exclude admin users
router.get('/users', async (req, res) => {
  try {
    // Query excludes users with role 'admin' and includes profile data
    const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.created_at,
             CASE 
               WHEN u.role = 'dosen' THEN d.is_active
               WHEN u.role = 'mahasiswa' THEN m.is_active
               ELSE true
             END as is_active,
             CASE 
               WHEN u.role = 'dosen' THEN d.nama_lengkap
               WHEN u.role = 'mahasiswa' THEN m.nama_lengkap
               ELSE 'Admin'
             END as nama_lengkap,
             CASE 
               WHEN u.role = 'dosen' THEN d.nip
               WHEN u.role = 'mahasiswa' THEN m.nim
               ELSE NULL
             END as identifier
      FROM users u
      LEFT JOIN dosen_profiles d ON u.id = d.user_id AND u.role = 'dosen'
      LEFT JOIN mahasiswa_profiles m ON u.id = m.user_id AND u.role = 'mahasiswa'
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `);
    
    // Transform data for frontend
    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      nama_lengkap: user.nama_lengkap,
      nip: user.role === 'dosen' ? user.identifier : null,
      nim: user.role === 'mahasiswa' ? user.identifier : null,
      status: user.is_active ? 'active' : 'inactive'
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// POST create dosen account
router.post('/dosen', async (req, res) => {
  const { email, nip, nama_lengkap, departemen } = req.body;
  
  // Validate required fields
  if (!email || !nip || !nama_lengkap) {
    return res.status(400).json({ error: 'Email, NIP, and nama_lengkap are required' });
  }
  
  // Validate field lengths
  if (nip.length > 20) { // Adjust this based on your NIP field length
    return res.status(400).json({ error: 'NIP cannot exceed 20 characters' });
  }
  
  if (email.length > 255) {
    return res.status(400).json({ error: 'Email cannot exceed 255 characters' });
  }
  
  if (nama_lengkap.length > 255) {
    return res.status(400).json({ error: 'Nama lengkap cannot exceed 255 characters' });
  }
  
  if (departemen && departemen.length > 100) {
    return res.status(400).json({ error: 'Departemen cannot exceed 100 characters' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Hash default password "123"
    const hashedPassword = await bcrypt.hash('123', 10);
    
    // Create user - CORRECTED: using password_hash instead of password
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ($1, $2, 'dosen') 
       RETURNING id`,
      [email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    
    // Then create dosen profile with is_active set to true
    await client.query(
      `INSERT INTO dosen_profiles (user_id, nip, nama_lengkap, departemen, is_active) 
       VALUES ($1, $2, $3, $4, true)`,
      [userId, nip, nama_lengkap, departemen || null]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Dosen account created successfully',
      user: { id: userId, email, role: 'dosen', nip, nama_lengkap }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error creating dosen account:', error);
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('email')) {
        return res.status(400).json({ error: 'Email already in use' });
      } else if (error.constraint.includes('nip')) {
        return res.status(400).json({ error: 'NIP already in use' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create dosen account' });
  } finally {
    client.release();
  }
});

// POST create mahasiswa account
router.post('/mahasiswa', async (req, res) => {
  const { email, nim, nama_lengkap, angkatan } = req.body;
  
  // Validate required fields
  if (!email || !nim || !nama_lengkap) {
    return res.status(400).json({ error: 'Email, NIM, and nama_lengkap are required' });
  }
  
  // Validate field lengths
  if (nim.length > 10) {
    return res.status(400).json({ error: 'NIM cannot exceed 10 characters' });
  }
  
  if (email.length > 255) {
    return res.status(400).json({ error: 'Email cannot exceed 255 characters' });
  }
  
  if (nama_lengkap.length > 255) {
    return res.status(400).json({ error: 'Nama lengkap cannot exceed 255 characters' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Hash default password "123"
    const hashedPassword = await bcrypt.hash('123', 10);
    
    // Create user - CORRECTED: using password_hash instead of password
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ($1, $2, 'mahasiswa') 
       RETURNING id`,
      [email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    
    // Then create mahasiswa profile with is_active set to true
    await client.query(
      `INSERT INTO mahasiswa_profiles (user_id, nim, nama_lengkap, angkatan, is_active) 
       VALUES ($1, $2, $3, $4, true)`,
      [userId, nim, nama_lengkap, angkatan || null]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Mahasiswa account created successfully',
      user: { id: userId, email, role: 'mahasiswa', nim, nama_lengkap }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error creating mahasiswa account:', error);
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('email')) {
        return res.status(400).json({ error: 'Email already in use' });
      } else if (error.constraint.includes('nim')) {
        return res.status(400).json({ error: 'NIM already in use' });
      }
    }
    
    // Handle character length errors
    if (error.code === '22001') {
      return res.status(400).json({ error: 'One of the fields exceeds the maximum allowed length' });
    }
    
    res.status(500).json({ error: 'Failed to create mahasiswa account' });
  } finally {
    client.release();
  }
});

// POST bulk create mahasiswa accounts
router.post('/mahasiswa/bulk', async (req, res) => {
  const { students } = req.body;
  
  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Students array is required and cannot be empty' });
  }

  const successfulUsers = [];
  const errors = [];

  // Process each student individually to avoid transaction conflicts
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const { email, nim, nama_lengkap, angkatan } = student;
    
    // Validate required fields for each student
    if (!email || !nim || !nama_lengkap) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'Email, NIM, and nama_lengkap are required'
      });
      continue;
    }

    // Validate field lengths
    if (nim.length > 10) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'NIM cannot exceed 10 characters'
      });
      continue;
    }

    if (email.length > 255) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'Email cannot exceed 255 characters'
      });
      continue;
    }

    if (nama_lengkap.length > 255) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'Nama lengkap cannot exceed 255 characters'
      });
      continue;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'Invalid email format'
      });
      continue;
    }

    // Process individual student with separate transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if email or NIM already exists
      const existingCheck = await client.query(`
        SELECT 
          u.email,
          m.nim
        FROM users u
        LEFT JOIN mahasiswa_profiles m ON u.id = m.user_id
        WHERE u.email = $1 OR m.nim = $2
      `, [email, nim]);

      if (existingCheck.rows.length > 0) {
        const existing = existingCheck.rows[0];
        if (existing.email === email) {
          errors.push({
            row: i + 1,
            data: student,
            error: 'Email already exists'
          });
        } else if (existing.nim === nim) {
          errors.push({
            row: i + 1,
            data: student,
            error: 'NIM already exists'
          });
        }
        await client.query('ROLLBACK');
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash('123', 10);

      // Create user account
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role) 
         VALUES ($1, $2, 'mahasiswa') 
         RETURNING id`,
        [email, hashedPassword]
      );

      const userId = userResult.rows[0].id;

      // Create mahasiswa profile
      await client.query(
        `INSERT INTO mahasiswa_profiles (user_id, nim, nama_lengkap, angkatan, is_active) 
         VALUES ($1, $2, $3, $4, true)`,
        [userId, nim, nama_lengkap, angkatan || null]
      );

      await client.query('COMMIT');

      successfulUsers.push({
        id: userId,
        email,
        role: 'mahasiswa',
        nim,
        nama_lengkap,
        angkatan,
        is_active: true
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error creating student ${i + 1}:`, error);
      
      // Handle specific database errors
      let errorMessage = 'Failed to create student account';
      if (error.code === '23505') { // Unique violation
        if (error.constraint && error.constraint.includes('email')) {
          errorMessage = 'Email already exists';
        } else if (error.constraint && error.constraint.includes('nim')) {
          errorMessage = 'NIM already exists';
        }
      } else if (error.code === '22001') { // Character length error
        errorMessage = 'One of the fields exceeds the maximum allowed length';
      }
      
      errors.push({
        row: i + 1,
        data: student,
        error: errorMessage
      });
    } finally {
      client.release();
    }
  }

  res.status(201).json({
    message: `Bulk import completed. ${successfulUsers.length} students created, ${errors.length} errors`,
    users: successfulUsers,
    errors: errors,
    summary: {
      total: students.length,
      successful: successfulUsers.length,
      failed: errors.length
    }
  });
});

// PATCH update user status (activate/deactivate)
router.patch('/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean value' });
  }
  
  try {
    // First, get the user's role
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { role } = userResult.rows[0];
    let result;
    
    // Update the appropriate profile table based on role
    if (role === 'dosen') {
      result = await pool.query(
        'UPDATE dosen_profiles SET is_active = $1 WHERE user_id = $2 RETURNING *',
        [is_active, id]
      );
    } else if (role === 'mahasiswa') {
      result = await pool.query(
        'UPDATE mahasiswa_profiles SET is_active = $1 WHERE user_id = $2 RETURNING *',
        [is_active, id]
      );
    } else {
      return res.status(400).json({ error: 'Cannot update status for this user type' });
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// DELETE user (soft delete by setting is_active to false, or hard delete)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, get the user's role and check if user exists
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { role } = userResult.rows[0];
    
    // Don't allow deleting admin users
    if (role === 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }
    
    // Delete related profile data first
    if (role === 'dosen') {
      // Check if dosen is assigned to any courses or classes
      const assignmentCheck = await client.query(`
        SELECT COUNT(*) as count FROM courses WHERE dosen_id = $1
        UNION ALL
        SELECT COUNT(*) as count FROM classes WHERE dosen_id = $1
      `, [id]);
      
      const hasAssignments = assignmentCheck.rows.some(row => parseInt(row.count) > 0);
      
      if (hasAssignments) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Tidak dapat menghapus dosen yang masih memiliki mata kuliah atau kelas yang terdaftar' 
        });
      }
      
      // Delete dosen profile
      await client.query('DELETE FROM dosen_profiles WHERE user_id = $1', [id]);
    } else if (role === 'mahasiswa') {
      // Check if mahasiswa is enrolled in any classes
      const enrollmentCheck = await client.query(
        'SELECT COUNT(*) as count FROM class_enrollments WHERE mahasiswa_id = $1',
        [id]
      );
      
      if (parseInt(enrollmentCheck.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Tidak dapat menghapus mahasiswa yang masih terdaftar di kelas' 
        });
      }
      
      // Delete mahasiswa profile
      await client.query('DELETE FROM mahasiswa_profiles WHERE user_id = $1', [id]);
    }
    
    // Finally, delete the user
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'User berhasil dihapus',
      deletedUserId: id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  } finally {
    client.release();
  }
});

// GET all course definitions (formerly course-templates)
router.get('/course-names', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM course_name
      ORDER BY kode ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching course names:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// POST create new course definition
router.post('/course-names', async (req, res) => {
  const { kode, nama, sks, deskripsi } = req.body;
  
  // Validate required fields
  if (!kode || !nama || !sks) {
    return res.status(400).json({ 
      error: 'Kode mata kuliah, nama, dan SKS wajib diisi' 
    });
  }
  
  try {
    // Create course template
    const result = await pool.query(
      `INSERT INTO course_name (kode, nama, sks, deskripsi) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [kode, nama, sks, deskripsi]
    );
    
    res.status(201).json({
      message: 'Data mata kuliah berhasil dibuat',
      courseName: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating course data:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint.includes('kode')) {
        return res.status(400).json({ error: 'Kode mata kuliah sudah digunakan' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create course data' });
  }
});

// GET all courses (modify this to use your existing table structure)
router.get('/courses', async (req, res) => {
  try {
    // Use the actual columns that exist in your database
    const result = await pool.query(`
      SELECT c.*, d.user_id as dosen_id, d.nama_lengkap as dosen_nama, d.nip as dosen_nip
      FROM courses c
      LEFT JOIN dosen_profiles d ON c.dosen_id = d.user_id
      ORDER BY c.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// POST create new course (update to handle course_name_id)
router.post('/courses', async (req, res) => {
  const { course_name_id, dosen_id, semester, tahun_ajaran } = req.body;
  
  // Validate required fields
  if (!course_name_id) {
    return res.status(400).json({ 
      error: 'Mata kuliah wajib diisi' 
    });
  }
  
  if (!semester || !tahun_ajaran) {
    return res.status(400).json({ 
      error: 'Semester dan tahun ajaran wajib diisi' 
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get course details from course_name
    const courseNameResult = await client.query(
      `SELECT kode, nama, sks, deskripsi FROM course_name WHERE id = $1`,
      [course_name_id]
    );
    
    if (courseNameResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Data mata kuliah tidak ditemukan' });
    }
    
    const courseDetails = courseNameResult.rows[0];
    
    // Insert into courses with values from course_name
    const result = await client.query(
      `INSERT INTO courses (
        kode, nama, sks, course_name_id, dosen_id, semester, 
        tahun_ajaran, deskripsi, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active') 
      RETURNING *`,
      [
        courseDetails.kode, 
        courseDetails.nama, 
        courseDetails.sks, 
        course_name_id, 
        dosen_id || null, 
        semester, 
        tahun_ajaran,
        courseDetails.deskripsi || null
      ]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Mata kuliah berhasil dibuat',
      course: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course: ' + error.message });
  } finally {
    client.release();
  }
});

// PATCH update course
router.patch('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    kode, 
    nama, 
    sks, 
    dosen_id, 
    semester, 
    tahun_ajaran, 
    deskripsi,
    status 
  } = req.body;
  
  try {
    // Build the query dynamically based on provided fields
    let updateFields = [];
    let params = [];
    let paramCounter = 1;
    
    if (kode !== undefined) {
      updateFields.push(`kode = $${paramCounter++}`);
      params.push(kode);
    }
    
    if (nama !== undefined) {
      updateFields.push(`nama = $${paramCounter++}`);
      params.push(nama);
    }
    
    if (sks !== undefined) {
      updateFields.push(`sks = $${paramCounter++}`);
      params.push(sks);
    }
    
    if (dosen_id !== undefined) {
      updateFields.push(`dosen_id = $${paramCounter++}`);
      params.push(dosen_id);
    }
    
    if (semester !== undefined) {
      updateFields.push(`semester = $${paramCounter++}`);
      params.push(semester);
    }
    
    if (tahun_ajaran !== undefined) {
      updateFields.push(`tahun_ajaran = $${paramCounter++}`);
      params.push(tahun_ajaran);
    }
    
    if (deskripsi !== undefined) {
      updateFields.push(`deskripsi = $${paramCounter++}`);
      params.push(deskripsi);
    }
    
    if (status !== undefined) {
      updateFields.push(`status = $${paramCounter++}`);
      params.push(status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add the id as the last parameter
    params.push(id);
    
    const result = await pool.query(
      `UPDATE courses 
       SET ${updateFields.join(', ')} 
       WHERE id = $${paramCounter} 
       RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get the dosen info if the course has a dosen
    let course = result.rows[0];
    if (course.dosen_id) {
      const dosenResult = await pool.query(
        `SELECT nama_lengkap, nip FROM dosen_profiles WHERE user_id = $1`,
        [course.dosen_id]
      );
      
      if (dosenResult.rows.length > 0) {
        course = {
          ...course,
          dosen_nama: dosenResult.rows[0].nama_lengkap,
          dosen_nip: dosenResult.rows[0].nip
        };
      }
    }
    
    res.json({ 
      message: 'Mata kuliah berhasil diperbarui',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint.includes('kode')) {
        return res.status(400).json({ error: 'Kode mata kuliah sudah digunakan' });
      }
    }
    
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE course
router.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if course exists
    const courseCheck = await client.query('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courseCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }
    
    // Check if there are any classes associated with this course
    const classCheck = await client.query(
      'SELECT COUNT(*) as count FROM classes WHERE course_id = $1',
      [id]
    );
    
    if (parseInt(classCheck.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Tidak dapat menghapus mata kuliah yang masih memiliki kelas terdaftar' 
      });
    }
    
    // Delete the course
    await client.query('DELETE FROM courses WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Mata kuliah berhasil dihapus',
      deletedCourseId: id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course: ' + error.message });
  } finally {
    client.release();
  }
});

// GET all course offerings
router.get('/course-offerings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT co.id, co.semester, co.tahun_ajaran, co.status,
             ct.id as template_id, ct.kode, ct.nama, ct.sks, ct.deskripsi,
             d.user_id as dosen_id, d.nama_lengkap as dosen_nama, d.nip as dosen_nip
      FROM course_offerings co
      JOIN course_templates ct ON co.course_template_id = ct.id
      LEFT JOIN dosen_profiles d ON co.dosen_id = d.user_id
      ORDER BY co.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching course offerings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new course offering (assigning a course to a lecturer)
router.post('/course-offerings', async (req, res) => {
  const { course_template_id, dosen_id, semester, tahun_ajaran } = req.body;
  
  // Validate required fields
  if (!course_template_id || !semester || !tahun_ajaran) {
    return res.status(400).json({ 
      error: 'Course template, semester dan tahun ajaran wajib diisi' 
    });
  }
  
  try {
    // Create course offering
    const result = await pool.query(
      `INSERT INTO course_offerings (course_template_id, dosen_id, semester, tahun_ajaran, status) 
       VALUES ($1, $2, $3, $4, 'active') 
       RETURNING *`,
      [course_template_id, dosen_id || null, semester, tahun_ajaran]
    );
    
    // Get the complete data by joining with course template
    const offeringData = await pool.query(`
      SELECT co.id, co.semester, co.tahun_ajaran, co.status,
             ct.id as template_id, ct.kode, ct.nama, ct.sks, ct.deskripsi,
             d.user_id as dosen_id, d.nama_lengkap as dosen_nama, d.nip as dosen_nip
      FROM course_offerings co
      JOIN course_templates ct ON co.course_template_id = ct.id
      LEFT JOIN dosen_profiles d ON co.dosen_id = d.user_id
      WHERE co.id = $1
    `, [result.rows[0].id]);
    
    res.status(201).json({
      message: 'Mata kuliah berhasil dibuat',
      course: offeringData.rows[0]
    });
  } catch (error) {
    console.error('Error creating course offering:', error);
    res.status(500).json({ error: 'Failed to create course offering' });
  }
});

// GET all classes for a specific course
router.get('/courses/:courseId/classes', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT c.*, 
             d.nama_lengkap AS dosen_nama,
             d.nip AS dosen_nip,
             (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id) AS jumlah_mahasiswa
      FROM classes c
      LEFT JOIN dosen_profiles d ON c.dosen_id = d.user_id
      WHERE c.course_id = $1
      ORDER BY c.nama ASC
    `, [courseId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST create a new class for a course
router.post('/courses/:courseId/classes', async (req, res) => {
  const { courseId } = req.params;
  const { dosen_id, nama, kode, kapasitas, ruangan, jadwal } = req.body;
  
  // Validate required fields
  if (!nama) {
    return res.status(400).json({ error: 'Nama kelas harus diisi' });
  }
  
  try {
    // Verify that the course exists
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }
    
    // Create the class
    const result = await pool.query(`
      INSERT INTO classes (course_id, dosen_id, nama, kode, kapasitas, ruangan, jadwal)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [courseId, dosen_id || null, nama, kode || null, kapasitas || 40, ruangan || null, jadwal || null]);
    
    const newClass = result.rows[0];
    
    // Get dosen details if assigned
    if (dosen_id) {
      const dosenResult = await pool.query(
        'SELECT nama_lengkap, nip FROM dosen_profiles WHERE user_id = $1',
        [dosen_id]
      );
      
      if (dosenResult.rows.length > 0) {
        newClass.dosen_nama = dosenResult.rows[0].nama_lengkap;
        newClass.dosen_nip = dosenResult.rows[0].nip;
      }
    }
    
    res.status(201).json({
      message: 'Kelas berhasil dibuat',
      class: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class: ' + error.message });
  }
});

// GET students in a class
router.get('/classes/:classId/students', async (req, res) => {
  const { classId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT ce.id AS enrollment_id, ce.status, ce.enrolled_at, ce.nilai_akhir,
             u.id AS user_id, u.email, u.role,
             m.nama_lengkap, m.nim, m.angkatan
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE ce.class_id = $1
      ORDER BY m.nama_lengkap ASC
    `, [classId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST enroll a student in a class
router.post('/classes/:classId/enrollments', async (req, res) => {
  const { classId } = req.params;
  const { mahasiswa_id } = req.body;
  
  if (!mahasiswa_id) {
    return res.status(400).json({ error: 'ID mahasiswa harus diisi' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if the class exists
    const classCheck = await client.query('SELECT * FROM classes WHERE id = $1', [classId]);
    
    if (classCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    
    // Check if the student exists and is a 'mahasiswa'
    const studentCheck = await client.query(`
      SELECT u.id FROM users u
      JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE u.id = $1 AND u.role = 'mahasiswa'
    `, [mahasiswa_id]);
    
    if (studentCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    }
    
    // Check if student is already enrolled in this specific class
    const enrollmentCheck = await client.query(
      'SELECT * FROM class_enrollments WHERE class_id = $1 AND mahasiswa_id = $2',
      [classId, mahasiswa_id]
    );
    
    if (enrollmentCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Mahasiswa sudah terdaftar di kelas ini' });
    }

    // Check if student is already enrolled in another class with the same course
    const courseEnrollmentCheck = await client.query(`
      SELECT c1.nama as class_name, c2.nama as course_name, c2.kode as course_code
      FROM class_enrollments ce
      JOIN classes c1 ON ce.class_id = c1.id
      JOIN courses c2 ON c1.course_id = c2.id
      WHERE ce.mahasiswa_id = $1 
        AND c1.course_id = (SELECT course_id FROM classes WHERE id = $2)
        AND ce.status = 'active'
    `, [mahasiswa_id, classId]);
    
    if (courseEnrollmentCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      const existingEnrollment = courseEnrollmentCheck.rows[0];
      return res.status(400).json({ 
        error: `Mahasiswa sudah terdaftar di kelas "${existingEnrollment.class_name}" untuk mata kuliah "${existingEnrollment.course_name} (${existingEnrollment.course_code})". Satu mahasiswa hanya bisa terdaftar di satu kelas per mata kuliah.` 
      });
    }
    
    // Check if class is at capacity
    const currentEnrollments = await client.query(
      'SELECT COUNT(*) AS count FROM class_enrollments WHERE class_id = $1',
      [classId]
    );
    
    const classDetails = classCheck.rows[0];
    
    if (classDetails.kapasitas && currentEnrollments.rows[0].count >= classDetails.kapasitas) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Kelas sudah penuh' });
    }
    
    // Enroll the student
    const result = await client.query(`
      INSERT INTO class_enrollments (class_id, mahasiswa_id, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `, [classId, mahasiswa_id]);
    
    // Get complete enrollment data including student info
    const enrollmentData = await client.query(`
      SELECT ce.id AS enrollment_id, ce.status, ce.enrolled_at,
             u.id AS user_id, u.email,
             m.nama_lengkap, m.nim
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE ce.id = $1
    `, [result.rows[0].id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Mahasiswa berhasil didaftarkan ke kelas',
      enrollment: enrollmentData.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll student: ' + error.message });
  } finally {
    client.release();
  }
});

// DELETE remove student from a class
router.delete('/classes/:classId/enrollments/:enrollmentId', async (req, res) => {
  const { classId, enrollmentId } = req.params;
  
  try {
    // Check if the enrollment exists for this class
    const check = await pool.query(
      'SELECT * FROM class_enrollments WHERE id = $1 AND class_id = $2',
      [enrollmentId, classId]
    );
    
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }
    
    // Delete the enrollment
    await pool.query('DELETE FROM class_enrollments WHERE id = $1', [enrollmentId]);
    
    res.json({
      message: 'Mahasiswa berhasil dihapus dari kelas',
      removedEnrollmentId: enrollmentId
    });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    res.status(500).json({ error: 'Failed to remove student from class' });
  }
});

// GET list of all classes (for dropdown/selection)
router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nama, c.kode, c.jadwal, c.ruangan,
             co.nama AS course_nama, co.kode AS course_kode,
             d.nama_lengkap AS dosen_nama,
             (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id) AS jumlah_mahasiswa
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN dosen_profiles d ON c.dosen_id = d.user_id
      ORDER BY co.nama ASC, c.nama ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// PATCH update class details
router.patch('/classes/:classId', async (req, res) => {
  const { classId } = req.params;
  const { dosen_id, nama, kode, kapasitas, ruangan, jadwal } = req.body;
  
  // Build update query dynamically
  let updateFields = [];
  let params = [classId]; // First parameter is the class id
  let paramCount = 2; // Start from 2 since first param is class_id
  
  if (dosen_id !== undefined) {
    updateFields.push(`dosen_id = $${paramCount++}`);
    params.push(dosen_id);
  }
  
  if (nama !== undefined) {
    updateFields.push(`nama = $${paramCount++}`);
    params.push(nama);
  }
  
  if (kode !== undefined) {
    updateFields.push(`kode = $${paramCount++}`);
    params.push(kode);
  }
  
  if (kapasitas !== undefined) {
    updateFields.push(`kapasitas = $${paramCount++}`);
    params.push(kapasitas);
  }
  
  if (ruangan !== undefined) {
    updateFields.push(`ruangan = $${paramCount++}`);
    params.push(ruangan);
  }
  
  if (jadwal !== undefined) {
    updateFields.push(`jadwal = $${paramCount++}`);
    params.push(jadwal);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updateFields.push(`updated_at = NOW()`);
  
  try {
    const result = await pool.query(`
      UPDATE classes
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    
    // Get updated class with additional info
    const updatedClass = await pool.query(`
      SELECT c.*, 
             d.nama_lengkap AS dosen_nama,
             d.nip AS dosen_nip,
             (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id) AS jumlah_mahasiswa
      FROM classes c
      LEFT JOIN dosen_profiles d ON c.dosen_id = d.user_id
      WHERE c.id = $1
    `, [classId]);
    
    res.json({
      message: 'Kelas berhasil diperbarui',
      class: updatedClass.rows[0]
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// DELETE a class
router.delete('/classes/:classId', async (req, res) => {
  const { classId } = req.params;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if class exists
    const classCheck = await client.query('SELECT * FROM classes WHERE id = $1', [classId]);
    
    if (classCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    
    // Delete all enrollments (will be cascaded but we do it explicitly for clarity)
    await client.query('DELETE FROM class_enrollments WHERE class_id = $1', [classId]);
    
    // Delete the class
    await client.query('DELETE FROM classes WHERE id = $1', [classId]);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Kelas berhasil dihapus',
      deletedClassId: classId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class: ' + error.message });
  } finally {
    client.release();
  }
});

// GET students enrolled in other classes for the same course
router.get('/classes/:classId/course-enrollments', async (req, res) => {
  const { classId } = req.params;
  
  try {
    // Get students who are enrolled in other classes for the same course
    const result = await pool.query(`
      SELECT DISTINCT u.id, mp.nama_lengkap, mp.nim, ce.class_id, c.nama as class_name
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      JOIN classes c ON ce.class_id = c.id
      WHERE c.course_id = (SELECT course_id FROM classes WHERE id = $1)
        AND ce.class_id != $1
        AND u.role = 'mahasiswa'
      ORDER BY mp.nama_lengkap
    `, [classId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch course enrollments' });
  }
});

module.exports = router;