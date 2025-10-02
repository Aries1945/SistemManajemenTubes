const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // First get the user data
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // Check if user is active by checking the appropriate profile table
    let isActive = true; // Default for admin users
    
    if (user.role === 'dosen') {
      const dosenResult = await pool.query(
        'SELECT is_active FROM dosen_profiles WHERE user_id = $1',
        [user.id]
      );
      
      if (dosenResult.rows.length > 0) {
        isActive = dosenResult.rows[0].is_active;
      }
    } else if (user.role === 'mahasiswa') {
      const mahasiswaResult = await pool.query(
        'SELECT is_active FROM mahasiswa_profiles WHERE user_id = $1',
        [user.id]
      );
      
      if (mahasiswaResult.rows.length > 0) {
        isActive = mahasiswaResult.rows[0].is_active;
      }
    }
    
    // Prevent inactive users from logging in
    if (!isActive) {
      return res.status(403).json({ 
        error: 'Account is inactive', 
        status: 'inactive' 
      });
    }
    
    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user data with active status
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: isActive,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // Get additional profile information based on role
    let profileInfo = {};
    
    if (user.role === 'dosen') {
      const dosenResult = await pool.query(
        'SELECT nip, nama_lengkap, departemen FROM dosen_profiles WHERE user_id = $1',
        [user.id]
      );
      if (dosenResult.rows.length > 0) {
        profileInfo = dosenResult.rows[0];
      }
    } else if (user.role === 'mahasiswa') {
      const mahasiswaResult = await pool.query(
        'SELECT nim, nama_lengkap, angkatan FROM mahasiswa_profiles WHERE user_id = $1',
        [user.id]
      );
      if (mahasiswaResult.rows.length > 0) {
        profileInfo = mahasiswaResult.rows[0];
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...profileInfo
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get enrolled classes for mahasiswa
router.get('/mahasiswa/classes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is mahasiswa
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'mahasiswa') {
      return res.status(403).json({ error: 'Access denied. Mahasiswa role required.' });
    }
    
    // Get enrolled classes with course and lecturer information
    // Note: mahasiswa_id in class_enrollments refers to user_id, not mahasiswa_profiles.id
    const classesResult = await pool.query(`
      SELECT 
        c.id,
        c.nama as class_name,
        c.kode as class_code,
        c.ruangan,
        c.jadwal,
        c.kapasitas,
        co.nama as course_name,
        co.kode as course_code,
        co.sks,
        co.semester,
        co.tahun_ajaran,
        dp.nama_lengkap as dosen_nama,
        ce.enrolled_at
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN dosen_profiles dp ON c.dosen_id = dp.user_id
      WHERE ce.mahasiswa_id = $1
      ORDER BY co.nama, c.nama
    `, [userId]);
    
    res.json({
      success: true,
      classes: classesResult.rows
    });
  } catch (error) {
    console.error('Error fetching mahasiswa classes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assigned courses for dosen
router.get('/dosen/courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is dosen
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'dosen') {
      return res.status(403).json({ error: 'Access denied. Dosen role required.' });
    }
    
    // Get assigned courses with class information
    const coursesResult = await pool.query(`
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
    `, [userId]);
    
    res.json({
      success: true,
      courses: coursesResult.rows
    });
  } catch (error) {
    console.error('Error fetching dosen courses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;