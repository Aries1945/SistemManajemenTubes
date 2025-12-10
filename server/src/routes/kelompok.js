const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
});

// Middleware untuk verifikasi dosen
const verifyDosen = (req, res, next) => {
  if (req.user.role !== 'dosen') {
    return res.status(403).json({ error: 'Access denied. Dosen only.' });
  }
  next();
};

// Get all groups for a specific tugas
router.get('/tugas/:tugasId/kelompok', async (req, res) => {
  const requestTimestamp = new Date().toISOString();
  console.log('\n📥 ===============================================');
  console.log(`📥 GET KELOMPOK REQUEST - ${requestTimestamp}`);
  console.log('📥 ===============================================');
  
  try {
    const { tugasId } = req.params;
    const userId = req.user.id;

    console.log('📍 Request params:');
    console.log('   tugasId:', tugasId, '(type:', typeof tugasId, ')');
    console.log('   userId:', userId, '(type:', typeof userId, ')');
    console.log('   user role:', req.user.role);
    console.log('   user email:', req.user.email);

    console.log('\n🔍 STEP 1: Checking user access to tugas');
    console.log('   🔍 Executing access check query...');
    
    // Verify user has access to this tugas
    const accessCheck = await pool.query(`
      SELECT tb.id, c.dosen_id
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND (c.dosen_id = $2 OR EXISTS (
        SELECT 1 FROM class_enrollments ce
        JOIN classes cl ON ce.class_id = cl.id
        WHERE cl.course_id = c.id AND ce.mahasiswa_id = $2
      ))
    `, [tugasId, userId]);

    console.log('   📊 Access check result:', JSON.stringify(accessCheck.rows, null, 2));
    console.log('   📊 Rows returned:', accessCheck.rows.length);

    if (accessCheck.rows.length === 0) {
      console.log('   ❌ ACCESS DENIED!');
      console.log('   ❌ User', userId, 'does not have access to tugas', tugasId);
      console.log('   ❌ Returning 403 error');
      return res.status(403).json({ 
        error: 'Access denied to this tugas.',
        userId: userId,
        tugasId: tugasId,
        debug: 'User is not dosen of this course and not enrolled as student'
      });
    }
    
    console.log('   ✅ Access granted for user', userId, 'to tugas', tugasId);

    console.log('   ✅ Access granted for user', userId, 'to tugas', tugasId);

    console.log('\n🔍 STEP 2: Fetching kelompok data');
    console.log('   🔍 Executing main kelompok query...');
    console.log('   🔍 Query params: [tugasId =', tugasId, ']');

    const result = await pool.query(`
      SELECT 
        k.*,
        json_agg(
          json_build_object(
            'id', u.id,
            'name', COALESCE(mp.nama_lengkap, dp.nama_lengkap),
            'email', u.email,
            'npm', COALESCE(mp.nim, dp.nip),
            'role', CASE WHEN km.is_leader THEN 'leader' ELSE 'member' END
          ) ORDER BY km.is_leader DESC, COALESCE(mp.nama_lengkap, dp.nama_lengkap)
        ) as members
      FROM kelompok k
      LEFT JOIN kelompok_members km ON k.id = km.kelompok_id
      LEFT JOIN users u ON km.user_id = u.id
      LEFT JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      LEFT JOIN dosen_profiles dp ON u.id = dp.user_id
      WHERE k.tugas_besar_id = $1
      GROUP BY k.id
      ORDER BY k.nama_kelompok
    `, [tugasId]);

    console.log('   📊 Raw query result:', result.rows.length, 'rows');
    console.log('   📊 Raw kelompok data:');
    result.rows.forEach((group, i) => {
      console.log(`      ${i+1}. ID: ${group.id}, Name: ${group.nama_kelompok}, Members: ${group.members ? group.members.filter(m => m.id !== null).length : 0}`);
    });

    console.log('\n🔍 STEP 3: Processing results');
    // Process results to handle null members  
    const processedGroups = result.rows.map(group => {
      // Filter out null members and ensure proper structure
      const validMembers = group.members ? group.members.filter(member => member.id !== null) : [];
      
      return {
        id: group.id,
        tugas_besar_id: group.tugas_besar_id,
        nama_kelompok: group.nama_kelompok,
        created_at: group.created_at,
        created_by: group.created_by,
        creation_method: group.creation_method,
        status: group.status || 'active',
        members: validMembers
      };
    });

    console.log(`   📊 Processed ${processedGroups.length} groups for tugas ${tugasId}`);
    console.log('   📊 Final response groups:');
    processedGroups.forEach((group, i) => {
      console.log(`      ${i+1}. ${group.nama_kelompok}: ${group.members.length} members`);
    });

    const responseData = {
      success: true,
      kelompok: processedGroups
    };
    
    console.log('\n📤 SENDING RESPONSE:');
    console.log(JSON.stringify(responseData, null, 2));

    res.json(responseData);
    
  } catch (error) {
    console.log('\n❌ ERROR IN GET KELOMPOK');
    console.error('   ❌ Error details:', error);
    console.error('   ❌ Error message:', error.message);
    console.error('   ❌ Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('📥 ===============================================');
  console.log('📥 GET KELOMPOK REQUEST COMPLETED');
  console.log('📥 ===============================================\n');
});

// Get students available for grouping in a course
router.get('/tugas/:tugasId/mahasiswa', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id, tb.course_id
      FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    const courseId = tugasCheck.rows[0].course_id;

    // Get all students in the course
    const result = await pool.query(`
      SELECT 
        u.id,
        mp.nama_lengkap as name,
        u.email,
        mp.nim as npm,
        CASE WHEN km.kelompok_id IS NOT NULL THEN TRUE ELSE FALSE END as has_group,
        k.nama_kelompok as group_name
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      LEFT JOIN kelompok_members km ON u.id = km.user_id 
        AND km.kelompok_id IN (SELECT id FROM kelompok WHERE tugas_besar_id = $1)
      LEFT JOIN kelompok k ON km.kelompok_id = k.id
      WHERE cl.course_id = $2 AND u.role = 'mahasiswa'
      ORDER BY has_group, mp.nama_lengkap
    `, [tugasId, courseId]);

    res.json({
      success: true,
      mahasiswa: result.rows
    });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group manually (Method 1)
router.post('/tugas/:tugasId/kelompok/manual', verifyDosen, async (req, res) => {
  console.log('\n🚀 ===============================================');
  console.log('🚀 CREATE MANUAL GROUP REQUEST');
  console.log('🚀 ===============================================');
  console.log('📍 Request params:', JSON.stringify(req.params, null, 2));
  console.log('📍 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📍 User info:', JSON.stringify(req.user, null, 2));
  
  try {
    const { tugasId } = req.params;
    const { namaKelompok, members, leaderId } = req.body;
    const dosenId = req.user.id;

    console.log('🔍 Extracted data:');
    console.log('  tugasId:', tugasId);
    console.log('  namaKelompok:', namaKelompok);
    console.log('  members:', members);
    console.log('  leaderId:', leaderId);
    console.log('  dosenId:', dosenId);

    // Validation
    if (!namaKelompok || !members || !Array.isArray(members) || members.length === 0 || !leaderId) {
      console.log('❌ Validation failed');
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          namaKelompok: !!namaKelompok,
          members: Array.isArray(members) && members.length > 0,
          leaderId: !!leaderId
        }
      });
    }

    // Verify dosen owns this tugas
    console.log('🔍 Verifying dosen access...');
    const tugasCheck = await pool.query(`
      SELECT tb.id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      console.log('❌ Access denied - dosen does not own this tugas');
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    console.log('✅ Access verified');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('🔄 Transaction started');

      // Create kelompok
      console.log('🔄 Creating kelompok...');
      const kelompokResult = await client.query(`
        INSERT INTO kelompok (tugas_besar_id, nama_kelompok, created_by, creation_method)
        VALUES ($1, $2, $3, 'manual')
        RETURNING id
      `, [tugasId, namaKelompok, dosenId]);

      const kelompokId = kelompokResult.rows[0].id;
      console.log('✅ Kelompok created with ID:', kelompokId);

      // Add members
      console.log('🔄 Adding members...');
      for (const memberId of members) {
        console.log(`  Adding member ${memberId}, is_leader: ${memberId === leaderId}`);
        await client.query(`
          INSERT INTO kelompok_members (kelompok_id, user_id, is_leader)
          VALUES ($1, $2, $3)
        `, [kelompokId, memberId, memberId === leaderId]);
      }

      await client.query('COMMIT');
      console.log('✅ Transaction committed');

      const response = {
        success: true,
        kelompok: {
          id: kelompokId,
          nama_kelompok: namaKelompok,
          members: members
        }
      };

      console.log('📤 Sending response:', response);
      res.json(response);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('❌ Transaction rolled back');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('💥 Error creating manual group:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('🏁 ===============================================');
  console.log('🏁 CREATE MANUAL GROUP REQUEST COMPLETED');
  console.log('🏁 ===============================================\n');
});

// Create groups automatically (Method 2)
router.post('/tugas/:tugasId/kelompok/otomatis', verifyDosen, async (req, res) => {
  const requestTimestamp = new Date().toISOString();
  console.log('\n🚀 ===============================================');
  console.log(`🚀 CREATE AUTOMATIC GROUPS REQUEST - ${requestTimestamp}`);
  console.log('🚀 ===============================================');
  console.log('📍 Request params:', JSON.stringify(req.params, null, 2));
  console.log('📍 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📍 User info:', JSON.stringify(req.user, null, 2));
  console.log('📍 Request method:', req.method);
  console.log('📍 Request URL:', req.originalUrl);
  console.log('📍 Content-Type:', req.get('Content-Type'));
  console.log('📍 Authorization header:', req.get('Authorization') ? 'Present' : 'Missing');
  
  try {
    const { tugasId } = req.params;
    const { ukuranKelompok } = req.body; // expected group size
    const dosenId = req.user.id;

    console.log('\n🔍 STEP 1: Processing input parameters');
    console.log('   📊 tugasId:', tugasId, '(type:', typeof tugasId, ')');
    console.log('   📊 ukuranKelompok:', ukuranKelompok, '(type:', typeof ukuranKelompok, ')');
    console.log('   📊 dosenId:', dosenId, '(type:', typeof dosenId, ')');

    // Validate ukuranKelompok
    console.log('\n🔍 STEP 2: Validating ukuranKelompok');
    if (!ukuranKelompok || typeof ukuranKelompok !== 'number' || ukuranKelompok < 1 || ukuranKelompok > 20) {
      console.log('   ❌ Invalid ukuranKelompok detected!');
      console.log('   ❌ Value:', ukuranKelompok);
      console.log('   ❌ Type:', typeof ukuranKelompok);
      console.log('   ❌ Returning 400 error');
      return res.status(400).json({ 
        error: 'ukuranKelompok must be a number between 1 and 20',
        received: ukuranKelompok,
        type: typeof ukuranKelompok
      });
    }
    console.log('   ✅ ukuranKelompok validation passed');

    // Verify dosen owns this tugas
    console.log('\n🔍 STEP 3: Verifying tugas ownership');
    console.log('   🔍 Executing query: SELECT tb.id, tb.course_id FROM tugas_besar tb JOIN courses c ON tb.course_id = c.id WHERE tb.id = $1 AND c.dosen_id = $2');
    console.log('   🔍 Query params:', [tugasId, dosenId]);
    
    const tugasCheck = await pool.query(`
      SELECT tb.id, tb.course_id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    console.log('   📊 Tugas ownership check result:', JSON.stringify(tugasCheck.rows, null, 2));
    console.log('   📊 Rows returned:', tugasCheck.rows.length);

    if (tugasCheck.rows.length === 0) {
      console.log('   ❌ Access denied: tugas not owned by dosen');
      console.log('   ❌ Returning 403 error');
      return res.status(403).json({ 
        error: 'Access denied to this tugas.',
        tugasId: tugasId,
        dosenId: dosenId,
        debug: 'Tugas not found or not owned by this dosen'
      });
    }
    console.log('   ✅ Tugas ownership verified');

    const courseId = tugasCheck.rows[0].course_id;
    console.log('   📊 Course ID:', courseId);

    // Get students without groups
    console.log('\n🔍 STEP 4: Getting available students');
    console.log('   🔍 Executing student query for courseId:', courseId, 'tugasId:', tugasId);
    
    const studentsResult = await pool.query(`
      SELECT u.id, mp.nama_lengkap
      FROM class_enrollments ce
      JOIN classes cl ON ce.class_id = cl.id
      JOIN users u ON ce.mahasiswa_id = u.id
      JOIN mahasiswa_profiles mp ON u.id = mp.user_id
      WHERE cl.course_id = $1 AND u.role = 'mahasiswa'
        AND u.id NOT IN (
          SELECT km.user_id FROM kelompok_members km
          JOIN kelompok k ON km.kelompok_id = k.id
          WHERE k.tugas_besar_id = $2
        )
      ORDER BY RANDOM()
    `, [courseId, tugasId]);

    const students = studentsResult.rows;
    console.log('   📊 Students query result:', students.length, 'students found');
    console.log('   📊 Available students:');
    students.forEach((student, index) => {
      console.log(`      ${index + 1}. ID: ${student.id}, Name: ${student.nama_lengkap}`);
    });
    
    if (students.length === 0) {
      console.log('   ❌ No students available for grouping');
      console.log('   ❌ Returning 400 error');
      return res.status(400).json({ 
        error: 'No students available for grouping',
        courseId: courseId,
        tugasId: tugasId
      });
    }
    console.log('   ✅ Students found, proceeding to group creation');

    console.log('\n🔍 STEP 5: Starting database transaction');
    const client = await pool.connect();
    console.log('   📊 Database client connected');
    
    try {
      console.log('   🔍 Beginning transaction...');
      await client.query('BEGIN');
      console.log('   ✅ Transaction started');

      const groups = [];
      let groupNumber = 1;
      console.log('   📊 Will create groups with size:', ukuranKelompok);
      console.log('   📊 Expected number of groups:', Math.ceil(students.length / ukuranKelompok));

      // Create groups
      console.log('\n🔍 STEP 6: Creating groups in loop');
      for (let i = 0; i < students.length; i += ukuranKelompok) {
        console.log(`\n   🔄 Creating group ${groupNumber} (iteration ${i})`);
        const groupMembers = students.slice(i, i + ukuranKelompok);
        console.log(`   📊 Group members (${groupMembers.length}):`, groupMembers.map(m => `${m.nama_lengkap} (${m.id})`));
        
        // Get next available group letter for this tugas
        console.log('   🔍 Getting existing group names...');
        const existingGroupsResult = await client.query(`
          SELECT nama_kelompok FROM kelompok WHERE tugas_besar_id = $1
          ORDER BY nama_kelompok
        `, [tugasId]);
        
        console.log('   📊 Existing groups:', existingGroupsResult.rows.map(r => r.nama_kelompok));
        
        const usedLetters = existingGroupsResult.rows
          .map(row => {
            const match = row.nama_kelompok.match(/Kelompok ([A-Z])/);
            return match ? match[1] : null;
          })
          .filter(Boolean);
        
        console.log('   📊 Used letters:', usedLetters);
        
        // Find next available letter
        let groupLetter = 'A';
        for (let letter = 'A'; letter <= 'Z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
          if (!usedLetters.includes(letter)) {
            groupLetter = letter;
            break;
          }
        }
        
        const groupName = `Kelompok ${groupLetter}`;
        console.log(`   📊 Selected group name: ${groupName}`);

        // Create kelompok
        console.log('   🔍 Inserting kelompok into database...');
        const kelompokResult = await client.query(`
          INSERT INTO kelompok (tugas_besar_id, nama_kelompok, created_by, creation_method)
          VALUES ($1, $2, $3, 'automatic')
          RETURNING id
        `, [tugasId, groupName, dosenId]);
        
        const kelompokId = kelompokResult.rows[0].id;
        console.log(`   ✅ Kelompok created with ID: ${kelompokId}`);

        // Add members (first member as leader)
        console.log('   🔍 Adding members to kelompok...');
        for (let j = 0; j < groupMembers.length; j++) {
          console.log(`      Adding member ${j + 1}: ${groupMembers[j].nama_lengkap} (ID: ${groupMembers[j].id}) ${j === 0 ? '[LEADER]' : '[MEMBER]'}`);
          await client.query(`
            INSERT INTO kelompok_members (kelompok_id, user_id, is_leader)
            VALUES ($1, $2, $3)
          `, [kelompokId, groupMembers[j].id, j === 0]);
        }
        console.log(`   ✅ Added ${groupMembers.length} members to ${groupName}`);

        groups.push({
          id: kelompokId,
          nama_kelompok: groupName,
          members: groupMembers
        });

        groupNumber++;
      }

      console.log('\n🔍 STEP 7: Committing transaction');
      await client.query('COMMIT');
      console.log('   ✅ Transaction committed successfully');

      console.log('\n🎉 SUCCESS! Group creation completed');
      console.log(`   📊 Created ${groups.length} automatic groups for tugas ${tugasId}`);
      console.log('   📊 Created groups:', groups.map(g => `${g.nama_kelompok} (${g.members.length} members)`));

      const responseData = {
        success: true,
        kelompok: groups,
        totalGroups: groups.length
      };
      
      console.log('\n📤 RESPONSE DATA:');
      console.log(JSON.stringify(responseData, null, 2));
      
      res.json(responseData);
    } catch (error) {
      console.log('\n❌ TRANSACTION ERROR OCCURRED');
      console.error('   ❌ Error details:', error);
      console.error('   ❌ Error message:', error.message);
      console.error('   ❌ Error stack:', error.stack);
      
      console.log('   🔍 Rolling back transaction...');
      await client.query('ROLLBACK');
      console.log('   ✅ Transaction rolled back');
      
      throw error;
    } finally {
      console.log('\n🔍 STEP 8: Releasing database client');
      client.release();
      console.log('   ✅ Database client released');
    }
  } catch (error) {
    console.log('\n💥 FATAL ERROR IN CREATE OTOMATIS');
    console.error('   💥 Error type:', error.constructor.name);
    console.error('   💥 Error message:', error.message);
    console.error('   💥 Error code:', error.code);
    console.error('   💥 Full error:', error);
    console.error('   💥 Stack trace:', error.stack);
    
    const errorResponse = {
      error: 'Server error during group creation',
      details: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📤 ERROR RESPONSE:');
    console.log(JSON.stringify(errorResponse, null, 2));
    
    res.status(500).json(errorResponse);
  }
  
  console.log('🏁 ===============================================');
  console.log('🏁 CREATE AUTOMATIC GROUPS REQUEST COMPLETED');
  console.log('🏁 ===============================================\n');
});

// Enable student choice mode (Method 3)
router.post('/tugas/:tugasId/kelompok/enable-student-choice', verifyDosen, async (req, res) => {
  try {
    const { tugasId } = req.params;
    const { maxGroupSize, minGroupSize } = req.body;
    const dosenId = req.user.id;

    // Verify dosen owns this tugas
    const tugasCheck = await pool.query(`
      SELECT tb.id FROM tugas_besar tb
      JOIN courses c ON tb.course_id = c.id
      WHERE tb.id = $1 AND c.dosen_id = $2
    `, [tugasId, dosenId]);

    if (tugasCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this tugas.' });
    }

    // Update tugas to enable student choice
    await pool.query(`
      UPDATE tugas_besar 
      SET student_choice_enabled = true,
          max_group_size = $2,
          min_group_size = $3
      WHERE id = $1
    `, [tugasId, maxGroupSize, minGroupSize]);

    res.json({
      success: true,
      message: 'Student choice mode enabled'
    });
  } catch (error) {
    console.error('Error enabling student choice:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kelompok
router.delete('/kelompok/:kelompokId', verifyDosen, async (req, res) => {
  try {
    const { kelompokId } = req.params;
    const dosenId = req.user.id;

    // Verify dosen owns this kelompok
    const kelompokCheck = await pool.query(`
      SELECT k.id FROM kelompok k
      JOIN tugas_besar tb ON k.tugas_besar_id = tb.id
      JOIN courses c ON tb.course_id = c.id
      WHERE k.id = $1 AND c.dosen_id = $2
    `, [kelompokId, dosenId]);

    if (kelompokCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this kelompok.' });
    }

    await pool.query('DELETE FROM kelompok WHERE id = $1', [kelompokId]);

    res.json({
      success: true,
      message: 'Kelompok deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kelompok:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;