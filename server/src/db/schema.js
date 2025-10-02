const { pool } = require('../db');

async function createTables() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create dosen_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dosen_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nip VARCHAR(50) UNIQUE,
        nama_lengkap VARCHAR(255) NOT NULL,
        departemen VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create mahasiswa_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mahasiswa_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nim VARCHAR(50) UNIQUE,
        nama_lengkap VARCHAR(255) NOT NULL,
        angkatan INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Master course list (formerly course_templates)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS course_name (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(20) UNIQUE NOT NULL,
        nama VARCHAR(255) NOT NULL,
        sks INTEGER NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Course offerings (formerly course_offerings)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        course_name_id INTEGER REFERENCES course_name(id),
        dosen_id INTEGER REFERENCES users(id),
        semester VARCHAR(50) NOT NULL,
        tahun_ajaran VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabel untuk kelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        dosen_id INTEGER REFERENCES users(id),
        nama VARCHAR(100) NOT NULL, -- contoh: "Kelas A", "Kelas B", dll.
        kode VARCHAR(20), -- Kode kelas (opsional)
        kapasitas INTEGER DEFAULT 40,
        ruangan VARCHAR(50),
        jadwal VARCHAR(100), -- contoh: "Senin, 08:00-10:00"
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabel untuk pendaftaran mahasiswa ke kelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        mahasiswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'completed'
        nilai_akhir DECIMAL(5,2),
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(class_id, mahasiswa_id) -- Seorang mahasiswa hanya bisa terdaftar sekali di satu kelas
      )
    `);
    
    console.log('All tables created successfully');
    
    // Add a test admin user if none exists
    const adminCheck = await pool.query(`
      SELECT * FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    if (adminCheck.rows.length === 0) {
      // Add admin user with password "admin123"
      await pool.query(`
        INSERT INTO users (email, password_hash, role)
        VALUES ('admin@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wvofPnMIHxHuhwJXIzPUhMjZVwjW0K', 'admin')
      `);
      console.log('Admin user created');
    }
    
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
}

module.exports = { createTables };