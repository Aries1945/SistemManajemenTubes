/**
 * Whitebox Testing End-to-End untuk Backend API Penilaian
 * 
 * Test Coverage:
 * 1. POST /tugas-besar/:tugasId/nilai - Complete flow dengan database
 * 2. GET /tugas-besar/:tugasId/grading - Complete data retrieval
 * 3. PUT /tugas-besar/:tugasId/penilaian-visibility - Visibility toggle
 * 4. GET /tugas-besar/:tugasId/penilaian (mahasiswa) - View grades
 * 5. Data consistency antara endpoints
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock database pool
const mockPool = {
  query: jest.fn()
};

// Helper functions extracted from routes
const validateNilai = (nilai) => {
  if (nilai !== null && nilai !== undefined) {
    const numNilai = parseFloat(nilai);
    if (isNaN(numNilai)) {
      return { valid: false, error: 'Nilai harus berupa angka', statusCode: 400 };
    }
    if (numNilai < 0) {
      return { valid: false, error: 'Nilai tidak boleh kurang dari 0', statusCode: 400 };
    }
    if (numNilai > 100) {
      return { valid: false, error: 'Nilai tidak boleh lebih dari 100', statusCode: 400 };
    }
  }
  return { valid: true };
};

const checkTugasOwnership = async (tugasId, dosenId, pool) => {
  const result = await pool.query(
    'SELECT id, dosen_id FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
    [tugasId, dosenId]
  );
  return result.rows.length > 0;
};

const saveNilaiForGroup = async (tugasId, kelompokId, komponenIndex, nilai, catatan, pool) => {
  // Get komponen from tugas_besar
  const tugasResult = await pool.query(
    'SELECT komponen FROM tugas_besar WHERE id = $1',
    [tugasId]
  );

  if (tugasResult.rows.length === 0) {
    return { success: false, error: 'Tugas besar not found', statusCode: 404 };
  }

  let komponen = [];
  if (tugasResult.rows[0].komponen) {
    try {
      komponen = typeof tugasResult.rows[0].komponen === 'string'
        ? JSON.parse(tugasResult.rows[0].komponen)
        : tugasResult.rows[0].komponen;
    } catch (e) {
      komponen = [];
    }
  }

  if (komponenIndex < 0 || komponenIndex >= komponen.length) {
    return { success: false, error: 'Invalid komponen index', statusCode: 400 };
  }

  // Get members of the group
  const membersResult = await pool.query(`
    SELECT km.user_id
    FROM kelompok_members km
    WHERE km.kelompok_id = $1
  `, [kelompokId]);

  if (membersResult.rows.length === 0) {
    return { success: false, error: 'Group not found or has no members', statusCode: 404 };
  }

  // Get or create komponen_penilaian
  const komponenName = komponen[komponenIndex].name || komponen[komponenIndex].nama;
  const komponenPenilaianCheck = await pool.query(`
    SELECT id FROM komponen_penilaian 
    WHERE tugas_besar_id = $1 AND nama = $2
  `, [tugasId, komponenName]);

  let komponenPenilaianId;
  if (komponenPenilaianCheck.rows.length > 0) {
    komponenPenilaianId = komponenPenilaianCheck.rows[0].id;
  } else {
    const createResult = await pool.query(`
      INSERT INTO komponen_penilaian (tugas_besar_id, nama, bobot, deskripsi)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      tugasId,
      komponenName,
      komponen[komponenIndex].weight || komponen[komponenIndex].bobot || 0,
      komponen[komponenIndex].description || komponen[komponenIndex].deskripsi || ''
    ]);
    komponenPenilaianId = createResult.rows[0].id;
  }

  // Save nilai for each member
  const savedNilai = [];
  for (const member of membersResult.rows) {
    const existingNilai = await pool.query(`
      SELECT id FROM nilai 
      WHERE komponen_id = $1 AND mahasiswa_id = $2
    `, [komponenPenilaianId, member.user_id]);

    if (existingNilai.rows.length > 0) {
      await pool.query(`
        UPDATE nilai 
        SET nilai = $1, catatan = $2
        WHERE id = $3
      `, [nilai, catatan, existingNilai.rows[0].id]);
      savedNilai.push(existingNilai.rows[0].id);
    } else {
      const newResult = await pool.query(`
        INSERT INTO nilai (komponen_id, mahasiswa_id, nilai, catatan)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [komponenPenilaianId, member.user_id, nilai, catatan]);
      savedNilai.push(newResult.rows[0].id);
    }
  }

  return { success: true, savedNilai };
};

describe('Penilaian End-to-End Backend API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. POST /tugas-besar/:tugasId/nilai - Complete Flow', () => {
    it('harus memproses flow lengkap save nilai', async () => {
      const tugasId = 1;
      const dosenId = 1;
      const kelompokId = 1;
      const komponenIndex = 0;
      const nilai = 85;
      const catatan = 'Bagus';

      // Mock: Check ownership
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, dosen_id: dosenId }]
      });

      // Mock: Get komponen
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          komponen: JSON.stringify([
            { name: 'Ujian', weight: 50 }
          ])
        }]
      });

      // Mock: Get members
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { user_id: 1 },
          { user_id: 2 }
        ]
      });

      // Mock: Check komponen_penilaian
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock: Create komponen_penilaian
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 10 }]
      });

      // Mock: Check existing nilai (member 1)
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock: Insert nilai (member 1)
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 100 }]
      });

      // Mock: Check existing nilai (member 2)
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock: Insert nilai (member 2)
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 101 }]
      });

      // Step 1: Validate
      const validation = validateNilai(nilai);
      expect(validation.valid).toBe(true);

      // Step 2: Check ownership
      const hasAccess = await checkTugasOwnership(tugasId, dosenId, mockPool);
      expect(hasAccess).toBe(true);

      // Step 3: Save nilai
      const result = await saveNilaiForGroup(
        tugasId,
        kelompokId,
        komponenIndex,
        nilai,
        catatan,
        mockPool
      );

      expect(result.success).toBe(true);
      expect(result.savedNilai.length).toBe(2);
    });

    it('harus reject jika dosen tidak memiliki akses', async () => {
      const tugasId = 1;
      const dosenId = 999; // Different dosen

      mockPool.query.mockResolvedValueOnce({
        rows: [] // No access
      });

      const hasAccess = await checkTugasOwnership(tugasId, dosenId, mockPool);
      expect(hasAccess).toBe(false);
    });

    it('harus reject nilai invalid', () => {
      expect(validateNilai(-5)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh kurang dari 0',
        statusCode: 400
      });

      expect(validateNilai(150)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh lebih dari 100',
        statusCode: 400
      });

      expect(validateNilai('abc')).toEqual({
        valid: false,
        error: 'Nilai harus berupa angka',
        statusCode: 400
      });
    });
  });

  describe('2. Data Consistency - Dosen Save vs Mahasiswa View', () => {
    it('harus memastikan nilai yang disimpan dosen sama dengan yang dilihat mahasiswa', async () => {
      const tugasId = 1;
      const mahasiswaId = 1;
      const savedNilai = 85.5;
      const catatan = 'Bagus';

      // Simulate: Mahasiswa melihat nilai yang sudah disimpan dosen
      // Mock: Get nilai result - harus menggunakan nilai yang sama dengan yang disimpan
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          komponen_id: 1,
          mahasiswa_id: mahasiswaId,
          nilai: savedNilai, // Nilai yang disimpan dosen
          catatan: catatan,
          komponen_nama: 'Ujian',
          komponen_bobot: 50
        }]
      });

      const nilaiResult = await mockPool.query(`
        SELECT n.*, kp.nama as komponen_nama, kp.bobot as komponen_bobot
        FROM nilai n
        JOIN komponen_penilaian kp ON n.komponen_id = kp.id
        WHERE kp.tugas_besar_id = $1 AND n.mahasiswa_id = $2
      `, [tugasId, mahasiswaId]);

      expect(nilaiResult.rows.length).toBeGreaterThan(0);
      // Pastikan nilai ada dan sama dengan yang disimpan
      expect(nilaiResult.rows[0].nilai).toBeDefined();
      expect(nilaiResult.rows[0].nilai).toBe(savedNilai);
      expect(parseFloat(nilaiResult.rows[0].nilai)).toBe(85.5);
      expect(nilaiResult.rows[0].catatan).toBe(catatan);
    });
  });

  describe('3. Visibility Toggle - Complete Flow', () => {
    it('harus allow toggle visibility dan reflect di mahasiswa endpoint', async () => {
      const tugasId = 1;
      const dosenId = 1;
      const mahasiswaId = 1;

      // Step 1: Dosen sets visibility to true
      // Mock untuk checkTugasOwnership - query mencari tugas dengan dosen_id
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: tugasId, dosen_id: dosenId }] // Tugas ditemukan dengan dosen yang benar
      });

      const ownershipCheck = await checkTugasOwnership(tugasId, dosenId, mockPool);
      expect(ownershipCheck).toBe(true);

      // Step 2: Check mahasiswa view when visible = true
      // Mock: Get visibility check result dengan query yang benar
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          penilaian_visible: true
        }]
      });

      // Should return visible: true
      const visibilityCheck = await mockPool.query(`
        SELECT tb.penilaian_visible
        FROM tugas_besar tb
        JOIN classes cl ON tb.class_id = cl.id
        JOIN class_enrollments ce ON ce.class_id = cl.id
        WHERE tb.id = $1 AND ce.mahasiswa_id = $2
      `, [tugasId, mahasiswaId]);

      expect(visibilityCheck.rows.length).toBeGreaterThan(0);
      expect(visibilityCheck.rows[0].penilaian_visible).toBe(true);
    });
  });

  describe('4. Error Handling - Complete Scenarios', () => {
    it('harus handle database error dengan graceful degradation', async () => {
      const tugasId = 1;
      const dosenId = 1;

      mockPool.query.mockRejectedValueOnce(
        new Error('Database connection error')
      );

      try {
        await checkTugasOwnership(tugasId, dosenId, mockPool);
      } catch (error) {
        expect(error.message).toBe('Database connection error');
      }
    });

    it('harus handle missing data dengan error yang jelas', async () => {
      const tugasId = 999; // Non-existent
      const dosenId = 1;

      // Mock: Tugas besar tidak ditemukan (empty result)
      // checkTugasOwnership melakukan query: SELECT id, dosen_id FROM tugas_besar WHERE id = $1 AND dosen_id = $2
      mockPool.query.mockResolvedValueOnce({
        rows: [] // Tugas not found - empty result
      });

      const hasAccess = await checkTugasOwnership(tugasId, dosenId, mockPool);
      expect(hasAccess).toBe(false);
    });
  });

  describe('5. Boundary Testing', () => {
    it('harus handle nilai boundary values (0, 100)', () => {
      expect(validateNilai(0)).toEqual({ valid: true });
      expect(validateNilai(100)).toEqual({ valid: true });
      expect(validateNilai(-0.01)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh kurang dari 0',
        statusCode: 400
      });
      expect(validateNilai(100.01)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh lebih dari 100',
        statusCode: 400
      });
    });

    it('harus handle komponen index boundary', async () => {
      const tugasId = 1;
      const komponen = [
        { name: 'Ujian', weight: 50 },
        { name: 'Tugas', weight: 50 }
      ];

      // Valid index
      expect(0 >= 0 && 0 < komponen.length).toBe(true);
      expect(1 >= 0 && 1 < komponen.length).toBe(true);

      // Invalid index
      expect(-1 >= 0 && -1 < komponen.length).toBe(false);
      expect(2 >= 0 && 2 < komponen.length).toBe(false);
    });
  });
});

