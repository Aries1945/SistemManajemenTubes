const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
});

async function createKelompokTables() {
  try {
    // Create kelompok table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kelompok (
          id SERIAL PRIMARY KEY,
          tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
          nama_kelompok VARCHAR(100) NOT NULL,
          created_by INTEGER REFERENCES users(id),
          creation_method VARCHAR(20) DEFAULT 'manual',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Kelompok table created');

    // Create kelompok_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kelompok_members (
          id SERIAL PRIMARY KEY,
          kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          is_leader BOOLEAN DEFAULT FALSE,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(kelompok_id, user_id)
      )
    `);
    console.log('Kelompok_members table created');

    // Add columns to tugas_besar
    try {
      await pool.query('ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS student_choice_enabled BOOLEAN DEFAULT FALSE');
      console.log('Added student_choice_enabled column');
    } catch (e) {
      console.log('student_choice_enabled column may already exist');
    }

    try {
      await pool.query('ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS max_group_size INTEGER DEFAULT 4');
      console.log('Added max_group_size column');
    } catch (e) {
      console.log('max_group_size column may already exist');
    }

    try {
      await pool.query('ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS min_group_size INTEGER DEFAULT 2');
      console.log('Added min_group_size column');
    } catch (e) {
      console.log('min_group_size column may already exist');
    }

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_kelompok_tugas_besar_id ON kelompok(tugas_besar_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_kelompok_members_kelompok_id ON kelompok_members(kelompok_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_kelompok_members_user_id ON kelompok_members(user_id)');
    console.log('Indexes created');

    console.log('All kelompok tables and columns created successfully');
    await pool.end();
  } catch (error) {
    console.error('Error creating kelompok tables:', error);
    process.exit(1);
  }
}

createKelompokTables();