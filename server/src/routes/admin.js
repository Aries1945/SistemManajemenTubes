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
    // Simplified query that directly fetches all users with their profiles
    // Note: is_active is in profile tables, not in users table
    const query = `
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.created_at,
        COALESCE(
          CASE 
            WHEN u.role = 'dosen' THEN d.is_active
            WHEN u.role = 'mahasiswa' THEN m.is_active
            ELSE true
          END,
          true
        ) as is_active,
        COALESCE(
          CASE 
            WHEN u.role = 'dosen' THEN d.nama_lengkap
            WHEN u.role = 'mahasiswa' THEN m.nama_lengkap
            ELSE NULL
          END,
          u.email
        ) as nama_lengkap,
        CASE 
          WHEN u.role = 'dosen' THEN d.nip
          WHEN u.role = 'mahasiswa' THEN m.nim
          ELSE NULL
        END as identifier
      FROM users u
      LEFT JOIN dosen_profiles d ON u.id = d.user_id
      LEFT JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `;
    
    console.log('Fetching users from database...');
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} users in database`);
    
    // Transform data for frontend
    const users = result.rows.map(user => {
      const transformed = {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active !== null && user.is_active !== undefined ? Boolean(user.is_active) : true,
        created_at: user.created_at,
        nama_lengkap: user.nama_lengkap || user.email,
        nip: user.role === 'dosen' ? user.identifier : null,
        npm: user.role === 'mahasiswa' ? user.identifier : null,
        nim: user.role === 'mahasiswa' ? user.identifier : null, // Keep for backward compatibility
        status: (user.is_active !== null && user.is_active !== undefined ? Boolean(user.is_active) : true) ? 'active' : 'inactive'
      };
      return transformed;
    });
    
    console.log(`Returning ${users.length} users to frontend`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      hint: 'Check server console for more details'
    });
  }
});

// POST create dosen account
router.post('/dosen', async (req, res) => {
  const { email, nip, nama_lengkap } = req.body;
  
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
    
    // Then create dosen profile with is_active set to true (departemen removed)
    await client.query(
      `INSERT INTO dosen_profiles (user_id, nip, nama_lengkap, is_active) 
       VALUES ($1, $2, $3, true)`,
      [userId, nip, nama_lengkap]
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
  const { email, npm, nama_lengkap } = req.body;
  
  // Validate required fields
  if (!email || !npm || !nama_lengkap) {
    return res.status(400).json({ error: 'Email, NPM, and nama_lengkap are required' });
  }
  
  // Validate field lengths
  if (npm.length > 20) {
    return res.status(400).json({ error: 'NPM cannot exceed 20 characters' });
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
    
    // Then create mahasiswa profile with is_active set to true (angkatan removed, npm stored as nim in DB)
    await client.query(
      `INSERT INTO mahasiswa_profiles (user_id, nim, nama_lengkap, is_active) 
       VALUES ($1, $2, $3, true)`,
      [userId, npm, nama_lengkap]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Mahasiswa account created successfully',
      user: { id: userId, email, role: 'mahasiswa', npm, nama_lengkap }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error creating mahasiswa account:', error);
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('email')) {
        return res.status(400).json({ error: 'Email already in use' });
      } else if (error.constraint.includes('nim')) {
        return res.status(400).json({ error: 'NPM already in use' });
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

// PUT update dosen
router.put('/dosen/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { nama_lengkap, nip } = req.body;
    
    if (!nama_lengkap) {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi' });
    }
    
    if (!nip) {
      return res.status(400).json({ error: 'NIP wajib diisi' });
    }
    
    // Check if user exists and is dosen
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    if (userCheck.rows[0].role !== 'dosen') {
      return res.status(400).json({ error: 'User bukan dosen' });
    }
    
    // Update dosen profile
    const result = await pool.query(
      'UPDATE dosen_profiles SET nama_lengkap = $1, nip = $2 WHERE user_id = $3 RETURNING nama_lengkap, nip',
      [nama_lengkap, nip, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profil dosen tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Dosen berhasil diperbarui',
      user: {
        id: userId,
        nama_lengkap: result.rows[0].nama_lengkap,
        nip: result.rows[0].nip
      }
    });
  } catch (error) {
    console.error('Error updating dosen:', error);
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('nip')) {
        return res.status(400).json({ error: 'NIP sudah digunakan' });
      }
    }
    
    res.status(500).json({ error: 'Gagal memperbarui dosen: ' + error.message });
  }
});

// PUT update mahasiswa
router.put('/mahasiswa/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { nama_lengkap, npm } = req.body;
    
    if (!nama_lengkap) {
      return res.status(400).json({ error: 'Nama lengkap wajib diisi' });
    }
    
    if (!npm) {
      return res.status(400).json({ error: 'NPM wajib diisi' });
    }
    
    // Check if user exists and is mahasiswa
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    if (userCheck.rows[0].role !== 'mahasiswa') {
      return res.status(400).json({ error: 'User bukan mahasiswa' });
    }
    
    // Update mahasiswa profile (npm stored as nim in DB)
    const result = await pool.query(
      'UPDATE mahasiswa_profiles SET nama_lengkap = $1, nim = $2 WHERE user_id = $3 RETURNING nama_lengkap, nim',
      [nama_lengkap, npm, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profil mahasiswa tidak ditemukan' });
    }
    
    res.json({
      success: true,
      message: 'Mahasiswa berhasil diperbarui',
      user: {
        id: userId,
        nama_lengkap: result.rows[0].nama_lengkap,
        npm: result.rows[0].nim
      }
    });
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('nim')) {
        return res.status(400).json({ error: 'NPM sudah digunakan' });
      }
    }
    
    res.status(500).json({ error: 'Gagal memperbarui mahasiswa: ' + error.message });
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
    const { email, npm, nama_lengkap } = student;
    
    // Validate required fields for each student
    if (!email || !npm || !nama_lengkap) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'Email, NPM, and nama_lengkap are required'
      });
      continue;
    }

    // Validate field lengths
    if (npm.length > 20) {
      errors.push({
        row: i + 1,
        data: student,
        error: 'NPM cannot exceed 20 characters'
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

      // Check if email or NPM already exists
      const existingCheck = await client.query(`
        SELECT 
          u.email,
          m.nim
        FROM users u
        LEFT JOIN mahasiswa_profiles m ON u.id = m.user_id
        WHERE u.email = $1 OR m.nim = $2
      `, [email, npm]);

      if (existingCheck.rows.length > 0) {
        const existing = existingCheck.rows[0];
        if (existing.email === email) {
          errors.push({
            row: i + 1,
            data: student,
            error: 'Email already exists'
          });
        } else if (existing.nim === npm) {
          errors.push({
            row: i + 1,
            data: student,
            error: 'NPM already exists'
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

      // Create mahasiswa profile (angkatan removed, npm stored as nim in DB)
      await client.query(
        `INSERT INTO mahasiswa_profiles (user_id, nim, nama_lengkap, is_active) 
         VALUES ($1, $2, $3, true)`,
        [userId, npm, nama_lengkap]
      );

      await client.query('COMMIT');

      successfulUsers.push({
        id: userId,
        email,
        role: 'mahasiswa',
        npm,
        nama_lengkap,
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
          errorMessage = 'NPM already exists';
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

// GET all courses (join with course_name to get kode, nama, sks)
router.get('/courses', async (req, res) => {
  try {
    // Join with course_name to get kode, nama, sks
    const result = await pool.query(`
      SELECT 
        c.id,
        c.course_name_id,
        c.dosen_id,
        c.semester,
        c.tahun_ajaran,
        c.status,
        c.deskripsi,
        c.created_at,
        c.updated_at,
        cn.kode,
        cn.nama,
        cn.sks,
        d.nama_lengkap as dosen_nama,
        d.nip as dosen_nip
      FROM courses c
      LEFT JOIN course_name cn ON c.course_name_id = cn.id
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
    
    // Insert into courses (kode, nama, sks are in course_name, not in courses)
    const result = await client.query(
      `INSERT INTO courses (
        course_name_id, dosen_id, semester, 
        tahun_ajaran, deskripsi, status
      ) 
      VALUES ($1, $2, $3, $4, $5, 'active') 
      RETURNING *`,
      [
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
    course_name_id,  // If updating course_name reference
    dosen_id, 
    semester, 
    tahun_ajaran, 
    deskripsi,
    status 
  } = req.body;
  
  try {
    // Build the query dynamically based on provided fields
    // Note: kode, nama, sks are in course_name table, not in courses table
    let updateFields = [];
    let params = [];
    let paramCounter = 1;
    
    if (course_name_id !== undefined) {
      updateFields.push(`course_name_id = $${paramCounter++}`);
      params.push(course_name_id);
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
    
    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
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
    res.status(500).json({ error: 'Failed to update course: ' + error.message });
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
      SELECT c.id, c.nama, c.kode, c.kapasitas, c.dosen_id, c.course_id, c.created_at, c.updated_at,
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
  const { dosen_id, nama, kode, kapasitas } = req.body;
  
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
    
    // Create the class (ruangan and jadwal removed)
    const result = await pool.query(`
      INSERT INTO classes (course_id, dosen_id, nama, kode, kapasitas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, course_id, dosen_id, nama, kode, kapasitas, created_at, updated_at
    `, [courseId, dosen_id || null, nama, kode || null, kapasitas || 40]);
    
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
    // Note: angkatan column removed, using nim (stored as npm in frontend)
    const result = await pool.query(`
      SELECT ce.id AS enrollment_id, ce.status, ce.enrolled_at, ce.nilai_akhir,
             u.id AS user_id, u.email, u.role,
             m.nama_lengkap, m.nim
      FROM class_enrollments ce
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles m ON u.id = m.user_id
      WHERE ce.class_id = $1
      ORDER BY m.nama_lengkap ASC
    `, [classId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch students: ' + error.message });
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
    const classCheck = await client.query('SELECT id FROM classes WHERE id = $1', [classId]);
    
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
    
    // Check if student is already enrolled in this specific class
    if (enrollmentCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Mahasiswa sudah terdaftar di kelas ini' });
    }

    // Note: Removed restriction - students can now enroll in multiple classes, even for the same course
    
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

// DELETE remove all students from a class
router.delete('/classes/:classId/enrollments', async (req, res) => {
  const { classId } = req.params;
  
  try {
    // Check if the class exists
    const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [classId]);
    
    if (classCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    
    // Get count before deletion for response
    const countResult = await pool.query(
      'SELECT COUNT(*) AS count FROM class_enrollments WHERE class_id = $1',
      [classId]
    );
    const count = parseInt(countResult.rows[0].count);
    
    if (count === 0) {
      return res.status(400).json({ error: 'Tidak ada mahasiswa yang terdaftar di kelas ini' });
    }
    
    // Delete all enrollments for this class
    await pool.query('DELETE FROM class_enrollments WHERE class_id = $1', [classId]);
    
    res.json({
      message: `Semua ${count} mahasiswa berhasil dihapus dari kelas`,
      removedCount: count
    });
  } catch (error) {
    console.error('Error removing all enrollments:', error);
    res.status(500).json({ error: 'Failed to remove all students from class: ' + error.message });
  }
});

// GET list of all classes (for dropdown/selection)
router.get('/classes', async (req, res) => {
  try {
    // Join with course_name to get kode, nama, sks
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.nama, 
        c.kode,
        c.course_id,
        c.dosen_id,
        c.kapasitas,
        c.created_at,
        c.updated_at,
        cn.nama AS course_nama, 
        cn.kode AS course_kode,
        cn.sks AS course_sks,
        d.nama_lengkap AS dosen_nama,
        d.nip AS dosen_nip,
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id) AS jumlah_mahasiswa
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN course_name cn ON co.course_name_id = cn.id
      LEFT JOIN dosen_profiles d ON c.dosen_id = d.user_id
      ORDER BY cn.nama ASC, c.nama ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes: ' + error.message });
  }
});

// PATCH update class details
router.patch('/classes/:classId', async (req, res) => {
  const { classId } = req.params;
  const { dosen_id, nama, kode, kapasitas } = req.body;
  
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
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updateFields.push(`updated_at = NOW()`);
  
  try {
    const result = await pool.query(`
      UPDATE classes
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING id, course_id, dosen_id, nama, kode, kapasitas, created_at, updated_at
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }
    
    // Get updated class with additional info
    const updatedClass = await pool.query(`
      SELECT c.id, c.nama, c.kode, c.kapasitas, c.dosen_id, c.course_id, c.created_at, c.updated_at,
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
    const classCheck = await client.query('SELECT id FROM classes WHERE id = $1', [classId]);
    
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