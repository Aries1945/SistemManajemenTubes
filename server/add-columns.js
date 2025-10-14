const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
});

async function addColumns() {
  try {
    // Add komponen column
    await pool.query(`ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS komponen JSONB DEFAULT '[]' NOT NULL`);
    console.log('Column komponen added successfully');
    
    // Add deliverable column  
    await pool.query(`ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS deliverable JSONB DEFAULT '[]' NOT NULL`);
    console.log('Column deliverable added successfully');
    
    await pool.end();
    console.log('Database columns updated successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();