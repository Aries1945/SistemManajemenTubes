const { pool } = require('./src/db');

async function checkTableStructure() {
  try {
    console.log('=== CHECKING TABLE STRUCTURES ===');
    
    // Check tugas_besar table
    const tugasBesarColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tugas_besar' 
      ORDER BY ordinal_position
    `);
    
    console.log('\ntugas_besar table columns:');
    tugasBesarColumns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if table has data
    const tugasBesarData = await pool.query('SELECT * FROM tugas_besar LIMIT 3');
    console.log(`\ntugas_besar has ${tugasBesarData.rows.length} sample rows`);
    if (tugasBesarData.rows.length > 0) {
      console.log('Sample data:', tugasBesarData.rows[0]);
    }
    
    // Check mata_kuliah table existence
    const mataKuliahExists = await pool.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'mata_kuliah'
    `);
    
    console.log(`\nmata_kuliah table exists: ${mataKuliahExists.rows.length > 0}`);
    
    if (mataKuliahExists.rows.length > 0) {
      const mataKuliahColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'mata_kuliah' 
        ORDER BY ordinal_position
      `);
      
      console.log('\nmata_kuliah table columns:');
      mataKuliahColumns.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();