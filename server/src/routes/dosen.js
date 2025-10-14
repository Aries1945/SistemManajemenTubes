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
  // Placeholder route - implement once you have course tables
  res.json({ message: 'Course data will be available here' });
});

module.exports = router;