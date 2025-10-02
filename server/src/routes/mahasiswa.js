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
    
    const result = await pool.query(
      'SELECT mp.nim, mp.nama_lengkap, mp.angkatan FROM mahasiswa_profiles mp WHERE mp.user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching mahasiswa profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get courses enrolled by mahasiswa
router.get('/courses', async (req, res) => {
  // Placeholder route - implement once you have course and enrollment tables
  res.json({ message: 'Course enrollment data will be available here' });
});

module.exports = router;