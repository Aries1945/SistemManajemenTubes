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

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...profileInfo
      },
      token
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

module.exports = router;