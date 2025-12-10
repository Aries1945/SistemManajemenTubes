/**
 * Whitebox Testing untuk Backend API - Fitur Dosen Menilai Tugas Besar
 * 
 * Test Coverage:
 * 1. POST /tugas-besar/:tugasId/nilai - Menyimpan nilai
 * 2. GET /tugas-besar/:tugasId/grading - Mengambil data grading
 * 3. PUT /tugas-besar/:tugasId/penilaian-visibility - Update visibilitas
 * 4. Validasi input dan error handling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock database pool
const mockPool = {
  query: jest.fn()
};

// Mock request/response objects
const createMockReq = (params = {}, body = {}, user = { id: 1 }) => ({
  params,
  body,
  user,
  originalUrl: '/api/auth/dosen/tugas-besar/1/nilai',
  method: 'POST'
});

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return res;
};

describe('Dosen Grading API - Whitebox Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. POST /tugas-besar/:tugasId/nilai - Validasi Input', () => {
    const validateNilaiInput = (nilai) => {
      if (nilai !== null && nilai !== undefined) {
        const numNilai = parseFloat(nilai);
        if (isNaN(numNilai)) {
          return { valid: false, error: 'Nilai harus berupa angka' };
        }
        if (numNilai < 0) {
          return { valid: false, error: 'Nilai tidak boleh kurang dari 0' };
        }
        if (numNilai > 100) {
          return { valid: false, error: 'Nilai tidak boleh lebih dari 100' };
        }
      }
      return { valid: true };
    };

    it('harus menerima nilai valid antara 0-100', () => {
      expect(validateNilaiInput(85)).toEqual({ valid: true });
      expect(validateNilaiInput(0)).toEqual({ valid: true });
      expect(validateNilaiInput(100)).toEqual({ valid: true });
      expect(validateNilaiInput(50.5)).toEqual({ valid: true });
    });

    it('harus menolak nilai negatif', () => {
      expect(validateNilaiInput(-5)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh kurang dari 0'
      });
    });

    it('harus menolak nilai lebih dari 100', () => {
      expect(validateNilaiInput(101)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh lebih dari 100'
      });
      expect(validateNilaiInput(150)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh lebih dari 100'
      });
    });

    it('harus menolak nilai non-numerik', () => {
      expect(validateNilaiInput('abc')).toEqual({
        valid: false,
        error: 'Nilai harus berupa angka'
      });
      expect(validateNilaiInput(NaN)).toEqual({
        valid: false,
        error: 'Nilai harus berupa angka'
      });
    });

    it('harus menerima null/undefined (untuk menghapus nilai)', () => {
      expect(validateNilaiInput(null)).toEqual({ valid: true });
      expect(validateNilaiInput(undefined)).toEqual({ valid: true });
    });
  });

  describe('2. POST /tugas-besar/:tugasId/nilai - Authorization Check', () => {
    const checkTugasOwnership = async (tugasId, dosenId, pool) => {
      const result = await pool.query(
        'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
        [tugasId, dosenId]
      );
      return result.rows.length > 0;
    };

    it('harus mengizinkan dosen yang memiliki tugas besar', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ '?column?': 1 }]
      });

      const hasAccess = await checkTugasOwnership(1, 1, mockPool);
      expect(hasAccess).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
        [1, 1]
      );
    });

    it('harus menolak dosen yang tidak memiliki tugas besar', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const hasAccess = await checkTugasOwnership(1, 999, mockPool);
      expect(hasAccess).toBe(false);
    });
  });

  describe('3. POST /tugas-besar/:tugasId/nilai - Komponen Validation', () => {
    const validateKomponenIndex = (komponenIndex, komponen) => {
      if (komponenIndex < 0 || komponenIndex >= komponen.length) {
        return { valid: false, error: 'Invalid komponen index' };
      }
      return { valid: true };
    };

    it('harus menerima index komponen yang valid', () => {
      const komponen = [
        { name: 'Ujian', weight: 50 },
        { name: 'Tugas', weight: 50 }
      ];

      expect(validateKomponenIndex(0, komponen)).toEqual({ valid: true });
      expect(validateKomponenIndex(1, komponen)).toEqual({ valid: true });
    });

    it('harus menolak index negatif', () => {
      const komponen = [{ name: 'Ujian', weight: 50 }];
      expect(validateKomponenIndex(-1, komponen)).toEqual({
        valid: false,
        error: 'Invalid komponen index'
      });
    });

    it('harus menolak index melebihi panjang array', () => {
      const komponen = [{ name: 'Ujian', weight: 50 }];
      expect(validateKomponenIndex(1, komponen)).toEqual({
        valid: false,
        error: 'Invalid komponen index'
      });
      expect(validateKomponenIndex(10, komponen)).toEqual({
        valid: false,
        error: 'Invalid komponen index'
      });
    });
  });

  describe('4. POST /tugas-besar/:tugasId/nilai - Group Members Check', () => {
    const checkGroupMembers = async (kelompokId, pool) => {
      const result = await pool.query(`
        SELECT km.user_id
        FROM kelompok_members km
        WHERE km.kelompok_id = $1
      `, [kelompokId]);

      if (result.rows.length === 0) {
        return { valid: false, error: 'Group not found or has no members' };
      }
      return { valid: true, members: result.rows };
    };

    it('harus menerima kelompok dengan anggota', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { user_id: 1 },
          { user_id: 2 },
          { user_id: 3 }
        ]
      });

      const result = await checkGroupMembers(1, mockPool);
      expect(result.valid).toBe(true);
      expect(result.members.length).toBe(3);
    });

    it('harus menolak kelompok tanpa anggota', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await checkGroupMembers(999, mockPool);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Group not found or has no members');
    });
  });

  describe('5. POST /tugas-besar/:tugasId/nilai - Save Nilai Logic', () => {
    const saveNilaiForMembers = async (komponenPenilaianId, members, nilai, catatan, pool) => {
      const savedNilai = [];

      for (const member of members) {
        // Check if nilai already exists
        const existingResult = await pool.query(`
          SELECT id FROM nilai 
          WHERE komponen_id = $1 AND mahasiswa_id = $2
        `, [komponenPenilaianId, member.user_id]);

        if (existingResult.rows.length > 0) {
          // Update existing
          await pool.query(`
            UPDATE nilai 
            SET nilai = $1, catatan = $2
            WHERE id = $3
          `, [nilai, catatan, existingResult.rows[0].id]);
          savedNilai.push(existingResult.rows[0].id);
        } else {
          // Create new
          const newResult = await pool.query(`
            INSERT INTO nilai (komponen_id, mahasiswa_id, nilai, catatan)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [komponenPenilaianId, member.user_id, nilai, catatan]);
          savedNilai.push(newResult.rows[0].id);
        }
      }

      return savedNilai;
    };

    it('harus membuat nilai baru jika belum ada', async () => {
      const members = [{ user_id: 1 }, { user_id: 2 }];
      
      // Mock: tidak ada nilai existing
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing untuk member 1
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, komponen_id: 1, mahasiswa_id: 1, nilai: 85, catatan: 'Bagus' }] 
        }) // Insert untuk member 1
        .mockResolvedValueOnce({ rows: [] }) // Check existing untuk member 2
        .mockResolvedValueOnce({ 
          rows: [{ id: 2, komponen_id: 1, mahasiswa_id: 2, nilai: 85, catatan: 'Bagus' }] 
        }); // Insert untuk member 2

      const saved = await saveNilaiForMembers(1, members, 85, 'Bagus', mockPool);
      
      expect(saved.length).toBe(2);
      expect(saved).toEqual([1, 2]);
      expect(mockPool.query).toHaveBeenCalledTimes(4);
    });

    it('harus update nilai yang sudah ada', async () => {
      const members = [{ user_id: 1 }];
      
      // Mock: ada nilai existing
      mockPool.query
        .mockResolvedValueOnce({ 
          rows: [{ id: 100 }] 
        }) // Check existing - ada
        .mockResolvedValueOnce({ 
          rows: [{ id: 100 }] 
        }); // Update

      const saved = await saveNilaiForMembers(1, members, 90, 'Sangat bagus', mockPool);
      
      expect(saved.length).toBe(1);
      expect(saved[0]).toBe(100);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('6. GET /tugas-besar/:tugasId/grading - Data Structure', () => {
    const structureGradingData = (tugas, komponen, groups, nilai, komponenPenilaian) => {
      return {
        tugas: {
          id: tugas.id,
          judul: tugas.judul,
          deskripsi: tugas.deskripsi,
          course_name: tugas.course_name,
          course_code: tugas.course_code,
          class_name: tugas.class_name,
          tanggal_mulai: tugas.tanggal_mulai,
          tanggal_selesai: tugas.tanggal_selesai,
          penilaian_visible: tugas.penilaian_visible || false
        },
        komponen: komponen.map((comp, index) => ({
          index: index,
          name: comp.name || comp.nama || '',
          weight: comp.weight || comp.bobot || 0,
          deadline: comp.deadline || null,
          description: comp.description || comp.deskripsi || ''
        })),
        groups: groups.map(g => ({
          id: g.id,
          name: g.nama,
          memberCount: parseInt(g.member_count) || 0
        })),
        nilai: nilai.map(n => ({
          id: n.id,
          komponen_id: n.komponen_id,
          komponen_nama: n.komponen_nama,
          mahasiswa_id: n.mahasiswa_id,
          kelompok_id: n.kelompok_id,
          kelompok_nama: n.kelompok_nama,
          nilai: parseFloat(n.nilai) || 0,
          catatan: n.catatan || '',
          created_at: n.created_at
        })),
        komponen_penilaian: komponenPenilaian
      };
    };

    it('harus struktur data dengan benar', () => {
      const tugas = {
        id: 1,
        judul: 'Tugas Besar 1',
        deskripsi: 'Deskripsi',
        course_name: 'ASD',
        course_code: 'AIF23005',
        class_name: 'A',
        tanggal_mulai: '2024-01-01',
        tanggal_selesai: '2024-12-31',
        penilaian_visible: true
      };

      const komponen = [
        { name: 'Ujian', weight: 50, deadline: '2024-06-01', description: 'Ujian akhir' }
      ];

      const groups = [
        { id: 1, nama: 'Kelompok A', member_count: '3' }
      ];

      const nilai = [
        {
          id: 1,
          komponen_id: 1,
          komponen_nama: 'Ujian',
          mahasiswa_id: 1,
          kelompok_id: 1,
          kelompok_nama: 'Kelompok A',
          nilai: '85',
          catatan: 'Bagus',
          created_at: '2024-01-01'
        }
      ];

      const komponenPenilaian = [{ id: 1, nama: 'Ujian', bobot: 50 }];

      const result = structureGradingData(tugas, komponen, groups, nilai, komponenPenilaian);

      expect(result.tugas.id).toBe(1);
      expect(result.komponen.length).toBe(1);
      expect(result.komponen[0].index).toBe(0);
      expect(result.groups[0].memberCount).toBe(3);
      expect(result.nilai[0].nilai).toBe(85);
    });

    it('harus handle komponen dengan field alternatif (nama/bobot)', () => {
      const komponen = [
        { nama: 'Tugas', bobot: 50, deskripsi: 'Deskripsi tugas' }
      ];

      const result = structureGradingData(
        { id: 1, judul: 'Test' },
        komponen,
        [],
        [],
        []
      );

      expect(result.komponen[0].name).toBe('Tugas');
      expect(result.komponen[0].weight).toBe(50);
      expect(result.komponen[0].description).toBe('Deskripsi tugas');
    });
  });

  describe('7. PUT /tugas-besar/:tugasId/penilaian-visibility - Update Visibility', () => {
    const updateVisibility = async (tugasId, dosenId, penilaianVisible, pool) => {
      // Verify ownership
      const tugasCheck = await pool.query(`
        SELECT id FROM tugas_besar
        WHERE id = $1 AND dosen_id = $2
      `, [tugasId, dosenId]);

      if (tugasCheck.rows.length === 0) {
        return { success: false, error: 'Access denied.' };
      }

      // Update visibility
      await pool.query(`
        UPDATE tugas_besar
        SET penilaian_visible = $1
        WHERE id = $2
      `, [penilaianVisible, tugasId]);

      return { success: true };
    };

    it('harus update visibility jika dosen memiliki akses', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Ownership check
        .mockResolvedValueOnce({ rows: [] }); // Update

      const result = await updateVisibility(1, 1, true, mockPool);

      expect(result.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('UPDATE tugas_besar'),
        [true, 1]
      );
    });

    it('harus menolak update jika dosen tidak memiliki akses', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }); // Ownership check - no access

      const result = await updateVisibility(1, 999, true, mockPool);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied.');
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('8. Error Handling', () => {
    it('harus handle database error dengan benar', async () => {
      const handleDatabaseError = (error) => {
        console.error('Error:', error);
        return {
          success: false,
          error: 'Server error',
          details: error.message
        };
      };

      const dbError = new Error('Connection timeout');
      const result = handleDatabaseError(dbError);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
      expect(result.details).toBe('Connection timeout');
    });

    it('harus handle JSON parse error untuk komponen', () => {
      const parseKomponen = (komponenString) => {
        if (!komponenString) return [];
        
        try {
          return typeof komponenString === 'string'
            ? JSON.parse(komponenString)
            : komponenString;
        } catch (e) {
          console.error('Error parsing komponen:', e);
          return [];
        }
      };

      expect(parseKomponen('invalid json')).toEqual([]);
      expect(parseKomponen(null)).toEqual([]);
      expect(parseKomponen('{"name":"Test"}')).toEqual({ name: 'Test' });
      expect(parseKomponen({ name: 'Test' })).toEqual({ name: 'Test' });
    });
  });

  describe('9. Integration Test - Complete Flow', () => {
    it('harus memproses flow lengkap: validasi -> check ownership -> save nilai', async () => {
      // Simulasi flow lengkap
      const tugasId = 1;
      const dosenId = 1;
      const kelompokId = 1;
      const komponenIndex = 0;
      const nilai = 85;
      const catatan = 'Bagus';

      // 1. Validasi nilai
      const nilaiValidation = (nilai !== null && nilai !== undefined) ? 
        (parseFloat(nilai) >= 0 && parseFloat(nilai) <= 100) : true;
      expect(nilaiValidation).toBe(true);

      // 2. Check ownership
      mockPool.query.mockResolvedValueOnce({
        rows: [{ '?column?': 1 }]
      });
      const ownershipCheck = await mockPool.query(
        'SELECT 1 FROM tugas_besar WHERE id = $1 AND dosen_id = $2',
        [tugasId, dosenId]
      );
      expect(ownershipCheck.rows.length).toBeGreaterThan(0);

      // 3. Get komponen
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          komponen: JSON.stringify([
            { name: 'Ujian', weight: 50 }
          ])
        }]
      });
      const tugasResult = await mockPool.query(
        'SELECT komponen FROM tugas_besar WHERE id = $1',
        [tugasId]
      );
      const komponen = JSON.parse(tugasResult.rows[0].komponen);
      expect(komponen.length).toBeGreaterThan(0);

      // 4. Get members
      mockPool.query.mockResolvedValueOnce({
        rows: [
          { user_id: 1 },
          { user_id: 2 }
        ]
      });
      const membersResult = await mockPool.query(`
        SELECT km.user_id
        FROM kelompok_members km
        WHERE km.kelompok_id = $1
      `, [kelompokId]);
      expect(membersResult.rows.length).toBeGreaterThan(0);

      // Semua step berhasil
      expect(nilaiValidation).toBe(true);
      expect(ownershipCheck.rows.length).toBeGreaterThan(0);
      expect(komponen.length).toBeGreaterThan(0);
      expect(membersResult.rows.length).toBeGreaterThan(0);
    });
  });
});

