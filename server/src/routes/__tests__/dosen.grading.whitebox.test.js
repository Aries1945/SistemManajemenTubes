/**
 * Whitebox Testing untuk Server-Side Logic Penilaian Dosen
 * 
 * Test Coverage:
 * 1. Validasi nilai di server (POST /tugas-besar/:tugasId/nilai)
 * 2. Verifikasi ownership dosen
 * 3. Penyimpanan nilai ke database (per anggota kelompok)
 * 4. Update visibilitas penilaian (PUT /penilaian-visibility)
 * 5. Get grading data dengan ownership check (GET /grading)
 * 6. Error handling dan edge cases
 * 
 * Pendekatan Whitebox:
 * - Menguji semua branch dalam route handlers
 * - Menguji validasi input
 * - Menguji database operations
 * - Menguji error paths
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ============================================================================
// MOCK FUNCTIONS (Simulasi dari server/src/routes/dosen.js)
// ============================================================================

/**
 * Simulasi validasi nilai di server
 */
const validateNilaiServer = (nilai) => {
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
    return { valid: true, value: numNilai };
  }
  return { valid: true, value: null };
};

/**
 * Simulasi verifikasi ownership dosen terhadap tugas besar
 */
const verifyDosenOwnership = async (tugasId, dosenId, tasks) => {
  const tugas = tasks.find(t => t.id === tugasId && t.dosen_id === dosenId);
  return tugas !== undefined;
};

/**
 * Simulasi verifikasi ownership dosen untuk mata kuliah (pengampu)
 */
const verifyCourseDosenOwnership = async (tugasId, dosenId, tasks, courses) => {
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) return false;
  
  const course = courses.find(c => c.id === tugas.course_id);
  if (!course) return false;
  
  return course.dosen_id === dosenId || tugas.dosen_id === dosenId;
};

/**
 * Simulasi parse komponen dari JSONB
 */
const parseKomponen = (komponenData) => {
  if (!komponenData) {
    return [];
  }
  
  try {
    return typeof komponenData === 'string' 
      ? JSON.parse(komponenData) 
      : komponenData;
  } catch (e) {
    return [];
  }
};

/**
 * Simulasi validasi komponen index
 */
const validateKomponenIndex = (komponenIndex, komponen) => {
  return komponenIndex >= 0 && komponenIndex < komponen.length;
};

/**
 * Simulasi get members dari kelompok
 */
const getGroupMembers = async (kelompokId, kelompokMembers) => {
  const members = kelompokMembers.filter(km => km.kelompok_id === kelompokId);
  return members.map(m => m.user_id);
};

/**
 * Simulasi save nilai ke database (per anggota)
 */
const saveNilaiToDatabase = async (komponenPenilaianId, mahasiswaId, nilai, catatan, existingNilai) => {
  // Check if nilai already exists
  const existing = existingNilai.find(
    n => n.komponen_id === komponenPenilaianId && n.mahasiswa_id === mahasiswaId
  );

  if (existing) {
    // Update existing
    return {
      id: existing.id,
      komponen_id: komponenPenilaianId,
      mahasiswa_id: mahasiswaId,
      nilai: nilai,
      catatan: catatan,
      updated: true
    };
  } else {
    // Create new
    const newId = existingNilai.length + 1;
    return {
      id: newId,
      komponen_id: komponenPenilaianId,
      mahasiswa_id: mahasiswaId,
      nilai: nilai,
      catatan: catatan,
      updated: false
    };
  }
};

/**
 * Simulasi save nilai untuk semua anggota kelompok
 */
const saveNilaiForGroup = async (tugasId, kelompokId, komponenIndex, nilai, catatan, tasks, kelompokMembers, existingNilai, komponenPenilaian) => {
  // 1. Validasi nilai
  const nilaiValidation = validateNilaiServer(nilai);
  if (!nilaiValidation.valid) {
    return { success: false, error: nilaiValidation.error, status: 400 };
  }

  // 2. Get tugas besar
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) {
    return { success: false, error: 'Tugas besar not found', status: 404 };
  }

  // 3. Parse komponen
  const komponen = parseKomponen(tugas.komponen);
  if (!validateKomponenIndex(komponenIndex, komponen)) {
    return { success: false, error: 'Invalid komponen index', status: 400 };
  }

  // 4. Get members
  const members = await getGroupMembers(kelompokId, kelompokMembers);
  if (members.length === 0) {
    return { success: false, error: 'Group not found or has no members', status: 404 };
  }

  // 5. Get or create komponen_penilaian
  const komponenName = komponen[komponenIndex].name || komponen[komponenIndex].nama;
  let komponenPenilaianId = komponenPenilaian.find(kp => 
    kp.tugas_besar_id === tugasId && kp.nama === komponenName
  )?.id;

  if (!komponenPenilaianId) {
    // Create new komponen_penilaian
    const newKpId = komponenPenilaian.length + 1;
    komponenPenilaian.push({
      id: newKpId,
      tugas_besar_id: tugasId,
      nama: komponenName,
      bobot: komponen[komponenIndex].weight || komponen[komponenIndex].bobot || 0
    });
    komponenPenilaianId = newKpId;
  }

  // 6. Save nilai for each member
  const savedNilai = [];
  for (const memberId of members) {
    const saved = await saveNilaiToDatabase(
      komponenPenilaianId,
      memberId,
      nilaiValidation.value,
      catatan,
      existingNilai
    );
    savedNilai.push(saved);
    
    // Update existingNilai untuk simulasi
    if (saved.updated) {
      const idx = existingNilai.findIndex(n => n.id === saved.id);
      if (idx >= 0) {
        existingNilai[idx] = saved;
      }
    } else {
      existingNilai.push(saved);
    }
  }

  return {
    success: true,
    message: 'Nilai berhasil disimpan',
    saved_count: savedNilai.length,
    nilai: savedNilai
  };
};

/**
 * Simulasi update visibility penilaian
 */
const updatePenilaianVisibilityHandler = async (tugasId, penilaianVisible, dosenId, tasks) => {
  // Verify ownership
  const hasOwnership = await verifyDosenOwnership(tugasId, dosenId, tasks);
  
  if (!hasOwnership) {
    return { success: false, error: 'Access denied.', status: 403 };
  }

  // Update visibility
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) {
    return { success: false, error: 'Tugas besar not found', status: 404 };
  }

  tugas.penilaian_visible = penilaianVisible;

  return {
    success: true,
    message: 'Visibility updated successfully',
    penilaian_visible: penilaianVisible
  };
};

/**
 * Simulasi get grading data dengan ownership check
 */
const getGradingDataHandler = async (tugasId, dosenId, tasks, courses) => {
  // Verify ownership (dosen pengajar atau pengampu)
  const hasOwnership = await verifyCourseDosenOwnership(tugasId, dosenId, tasks, courses);
  
  if (!hasOwnership) {
    return {
      success: false,
      error: 'Access denied. You can only view penilaian untuk tugas besar yang Anda ajar atau mata kuliah yang Anda pengampu.',
      status: 403
    };
  }

  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) {
    return { success: false, error: 'Tugas besar not found', status: 404 };
  }

  const komponen = parseKomponen(tugas.komponen);

  return {
    success: true,
    data: {
      tugas: {
        id: tugas.id,
        judul: tugas.judul,
        penilaian_visible: tugas.penilaian_visible || false
      },
      komponen: komponen.map((comp, index) => ({
        index: index,
        name: comp.name || comp.nama || '',
        weight: comp.weight || comp.bobot || 0
      }))
    }
  };
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Whitebox Testing - Server-Side Logic Penilaian Dosen', () => {
  
  // Mock data
  let mockTasks, mockCourses, mockKelompokMembers, mockExistingNilai, mockKomponenPenilaian;

  beforeEach(() => {
    mockTasks = [
      {
        id: 1,
        judul: 'Tugas Besar 1',
        dosen_id: 1,
        course_id: 1,
        komponen: JSON.stringify([
          { name: 'Ujian', weight: 50 },
          { name: 'Tugas', weight: 50 }
        ]),
        penilaian_visible: false
      },
      {
        id: 2,
        judul: 'Tugas Besar 2',
        dosen_id: 2,
        course_id: 2,
        komponen: JSON.stringify([
          { name: 'Ujian', weight: 40 },
          { name: 'Tugas', weight: 60 }
        ]),
        penilaian_visible: true
      }
    ];

    mockCourses = [
      { id: 1, dosen_id: 1 },
      { id: 2, dosen_id: 2 }
    ];

    mockKelompokMembers = [
      { kelompok_id: 1, user_id: 101 },
      { kelompok_id: 1, user_id: 102 },
      { kelompok_id: 2, user_id: 103 }
    ];

    mockExistingNilai = [];

    mockKomponenPenilaian = [];
  });

  // ========================================================================
  // 1. VALIDASI NILAI DI SERVER
  // ========================================================================
  
  describe('1. Validasi Nilai di Server', () => {
    
    it('harus menerima nilai valid', () => {
      expect(validateNilaiServer(85)).toEqual({ valid: true, value: 85 });
      expect(validateNilaiServer('85')).toEqual({ valid: true, value: 85 });
      expect(validateNilaiServer(0)).toEqual({ valid: true, value: 0 });
      expect(validateNilaiServer(100)).toEqual({ valid: true, value: 100 });
    });

    it('harus menolak nilai non-numerik', () => {
      expect(validateNilaiServer('abc')).toEqual({
        valid: false,
        error: 'Nilai harus berupa angka'
      });
    });

    it('harus menolak nilai negatif', () => {
      expect(validateNilaiServer(-5)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh kurang dari 0'
      });
    });

    it('harus menolak nilai lebih dari 100', () => {
      expect(validateNilaiServer(150)).toEqual({
        valid: false,
        error: 'Nilai tidak boleh lebih dari 100'
      });
    });

    it('harus menerima null/undefined', () => {
      expect(validateNilaiServer(null)).toEqual({ valid: true, value: null });
      expect(validateNilaiServer(undefined)).toEqual({ valid: true, value: null });
    });
  });

  // ========================================================================
  // 2. VERIFIKASI OWNERSHIP DOSEN
  // ========================================================================
  
  describe('2. Verifikasi Ownership Dosen', () => {
    
    it('harus return true jika dosen adalah pengajar tugas besar', async () => {
      const hasOwnership = await verifyDosenOwnership(1, 1, mockTasks);
      expect(hasOwnership).toBe(true);
    });

    it('harus return false jika dosen bukan pengajar tugas besar', async () => {
      const hasOwnership = await verifyDosenOwnership(1, 2, mockTasks);
      expect(hasOwnership).toBe(false);
    });

    it('harus return true jika dosen adalah pengampu mata kuliah', async () => {
      const hasOwnership = await verifyCourseDosenOwnership(1, 1, mockTasks, mockCourses);
      expect(hasOwnership).toBe(true);
    });

    it('harus return false jika dosen bukan pengampu atau pengajar', async () => {
      const hasOwnership = await verifyCourseDosenOwnership(1, 3, mockTasks, mockCourses);
      expect(hasOwnership).toBe(false);
    });

    it('harus return false jika tugas besar tidak ditemukan', async () => {
      const hasOwnership = await verifyDosenOwnership(999, 1, mockTasks);
      expect(hasOwnership).toBe(false);
    });
  });

  // ========================================================================
  // 3. PARSE KOMPONEN DARI JSONB
  // ========================================================================
  
  describe('3. Parse Komponen dari JSONB', () => {
    
    it('harus parse komponen dari JSON string', () => {
      const komponenStr = JSON.stringify([{ name: 'Ujian', weight: 50 }]);
      const komponen = parseKomponen(komponenStr);
      
      expect(komponen).toEqual([{ name: 'Ujian', weight: 50 }]);
    });

    it('harus return komponen langsung jika sudah object', () => {
      const komponenObj = [{ name: 'Ujian', weight: 50 }];
      const komponen = parseKomponen(komponenObj);
      
      expect(komponen).toEqual(komponenObj);
    });

    it('harus return empty array jika komponen null/undefined', () => {
      expect(parseKomponen(null)).toEqual([]);
      expect(parseKomponen(undefined)).toEqual([]);
    });

    it('harus return empty array jika JSON invalid', () => {
      const invalidJson = '{ invalid json }';
      const komponen = parseKomponen(invalidJson);
      
      expect(komponen).toEqual([]);
    });
  });

  // ========================================================================
  // 4. VALIDASI KOMPONEN INDEX
  // ========================================================================
  
  describe('4. Validasi Komponen Index', () => {
    
    it('harus return true untuk index valid', () => {
      const komponen = [{ name: 'Ujian' }, { name: 'Tugas' }];
      expect(validateKomponenIndex(0, komponen)).toBe(true);
      expect(validateKomponenIndex(1, komponen)).toBe(true);
    });

    it('harus return false untuk index negatif', () => {
      const komponen = [{ name: 'Ujian' }];
      expect(validateKomponenIndex(-1, komponen)).toBe(false);
    });

    it('harus return false untuk index >= length', () => {
      const komponen = [{ name: 'Ujian' }];
      expect(validateKomponenIndex(1, komponen)).toBe(false);
      expect(validateKomponenIndex(2, komponen)).toBe(false);
    });

    it('harus return false untuk array kosong', () => {
      expect(validateKomponenIndex(0, [])).toBe(false);
    });
  });

  // ========================================================================
  // 5. GET GROUP MEMBERS
  // ========================================================================
  
  describe('5. Get Group Members', () => {
    
    it('harus return semua anggota kelompok', async () => {
      const members = await getGroupMembers(1, mockKelompokMembers);
      expect(members).toEqual([101, 102]);
    });

    it('harus return empty array jika kelompok tidak ada', async () => {
      const members = await getGroupMembers(999, mockKelompokMembers);
      expect(members).toEqual([]);
    });
  });

  // ========================================================================
  // 6. SAVE NILAI KE DATABASE
  // ========================================================================
  
  describe('6. Save Nilai ke Database', () => {
    
    it('harus create nilai baru jika belum ada', async () => {
      const result = await saveNilaiToDatabase(1, 101, 85, 'Bagus', []);
      
      expect(result.updated).toBe(false);
      expect(result.nilai).toBe(85);
      expect(result.catatan).toBe('Bagus');
      expect(result.mahasiswa_id).toBe(101);
    });

    it('harus update nilai yang sudah ada', async () => {
      const existing = [
        { id: 1, komponen_id: 1, mahasiswa_id: 101, nilai: 80, catatan: 'Cukup' }
      ];
      
      const result = await saveNilaiToDatabase(1, 101, 85, 'Bagus', existing);
      
      expect(result.updated).toBe(true);
      expect(result.id).toBe(1);
      expect(result.nilai).toBe(85);
      expect(result.catatan).toBe('Bagus');
    });
  });

  // ========================================================================
  // 7. SAVE NILAI UNTUK KELOMPOK (INTEGRATION)
  // ========================================================================
  
  describe('7. Save Nilai untuk Kelompok - Integration', () => {
    
    it('harus menyimpan nilai untuk semua anggota kelompok', async () => {
      const result = await saveNilaiForGroup(
        1, // tugasId
        1, // kelompokId
        0, // komponenIndex
        85, // nilai
        'Bagus', // catatan
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(result.saved_count).toBe(2); // 2 anggota
      expect(result.nilai).toHaveLength(2);
    });

    it('harus return error jika nilai invalid', async () => {
      const result = await saveNilaiForGroup(
        1, 1, 0, 150, 'Invalid',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Nilai tidak boleh lebih dari 100');
    });

    it('harus return error jika tugas besar tidak ditemukan', async () => {
      const result = await saveNilaiForGroup(
        999, 1, 0, 85, 'Bagus',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });

    it('harus return error jika komponen index invalid', async () => {
      const result = await saveNilaiForGroup(
        1, 1, 999, 85, 'Bagus',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid komponen index');
    });

    it('harus return error jika kelompok tidak punya anggota', async () => {
      const result = await saveNilaiForGroup(
        1, 999, 0, 85, 'Bagus',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toBe('Group not found or has no members');
    });

    it('harus create komponen_penilaian jika belum ada', async () => {
      const result = await saveNilaiForGroup(
        1, 1, 0, 85, 'Bagus',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(mockKomponenPenilaian.length).toBe(1);
      expect(mockKomponenPenilaian[0].nama).toBe('Ujian');
    });
  });

  // ========================================================================
  // 8. UPDATE PENILAIAN VISIBILITY
  // ========================================================================
  
  describe('8. Update Penilaian Visibility', () => {
    
    it('harus update visibility ke true', async () => {
      const result = await updatePenilaianVisibilityHandler(1, true, 1, mockTasks);

      expect(result.success).toBe(true);
      expect(result.penilaian_visible).toBe(true);
      expect(mockTasks[0].penilaian_visible).toBe(true);
    });

    it('harus update visibility ke false', async () => {
      mockTasks[1].penilaian_visible = true;
      const result = await updatePenilaianVisibilityHandler(2, false, 2, mockTasks);

      expect(result.success).toBe(true);
      expect(result.penilaian_visible).toBe(false);
      expect(mockTasks[1].penilaian_visible).toBe(false);
    });

    it('harus return error jika dosen tidak punya akses', async () => {
      const result = await updatePenilaianVisibilityHandler(1, true, 2, mockTasks);

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toBe('Access denied.');
    });

    it('harus return error jika tugas besar tidak ditemukan', async () => {
      const result = await updatePenilaianVisibilityHandler(999, true, 1, mockTasks);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  // ========================================================================
  // 9. GET GRADING DATA DENGAN OWNERSHIP CHECK
  // ========================================================================
  
  describe('9. Get Grading Data dengan Ownership Check', () => {
    
    it('harus return data jika dosen adalah pengajar', async () => {
      const result = await getGradingDataHandler(1, 1, mockTasks, mockCourses);

      expect(result.success).toBe(true);
      expect(result.data.tugas.id).toBe(1);
      expect(result.data.komponen).toHaveLength(2);
    });

    it('harus return error jika dosen tidak punya akses', async () => {
      const result = await getGradingDataHandler(1, 3, mockTasks, mockCourses);

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toContain('Access denied');
    });

    it('harus return error jika tugas besar tidak ditemukan', async () => {
      const result = await getGradingDataHandler(999, 1, mockTasks, mockCourses);

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });

    it('harus return komponen yang sudah di-parse', async () => {
      const result = await getGradingDataHandler(1, 1, mockTasks, mockCourses);

      expect(result.success).toBe(true);
      expect(result.data.komponen[0].name).toBe('Ujian');
      expect(result.data.komponen[0].weight).toBe(50);
      expect(result.data.komponen[1].name).toBe('Tugas');
      expect(result.data.komponen[1].weight).toBe(50);
    });
  });

  // ========================================================================
  // 10. INTEGRATION TEST - FLOW LENGKAP SERVER
  // ========================================================================
  
  describe('10. Integration Test - Flow Lengkap Server', () => {
    
    it('harus memproses flow lengkap: verify ownership -> validate -> save -> update visibility', async () => {
      // 1. Verify ownership
      const hasOwnership = await verifyDosenOwnership(1, 1, mockTasks);
      expect(hasOwnership).toBe(true);

      // 2. Save nilai
      const saveResult = await saveNilaiForGroup(
        1, 1, 0, 85, 'Bagus',
        mockTasks,
        mockKelompokMembers,
        mockExistingNilai,
        mockKomponenPenilaian
      );
      expect(saveResult.success).toBe(true);

      // 3. Update visibility
      const visibilityResult = await updatePenilaianVisibilityHandler(1, true, 1, mockTasks);
      expect(visibilityResult.success).toBe(true);
      expect(mockTasks[0].penilaian_visible).toBe(true);

      // 4. Get grading data
      const gradingResult = await getGradingDataHandler(1, 1, mockTasks, mockCourses);
      expect(gradingResult.success).toBe(true);
      expect(gradingResult.data.tugas.penilaian_visible).toBe(true);
    });

    it('harus handle error flow dengan benar', async () => {
      // 1. Invalid ownership
      const hasOwnership = await verifyDosenOwnership(1, 2, mockTasks);
      expect(hasOwnership).toBe(false);

      // 2. Try to save (should fail at ownership check if implemented)
      // 3. Try to update visibility
      const visibilityResult = await updatePenilaianVisibilityHandler(1, true, 2, mockTasks);
      expect(visibilityResult.success).toBe(false);
      expect(visibilityResult.status).toBe(403);
    });
  });
});

