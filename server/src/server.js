const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { createTables } = require('./db/schema');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const dosenRoutes = require('./routes/dosen');
const kelompokRoutes = require('./routes/kelompok');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initializeDatabase() {
  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Continue server startup even if DB init fails
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/auth/dosen', authenticateToken, dosenRoutes);
app.use('/api/kelompok', authenticateToken, kelompokRoutes);

// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'success',
      message: 'Database connection successful',
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Initialize DB and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});