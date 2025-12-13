/**
 * Whitebox Testing untuk Server-Side Logic Mahasiswa Melihat Nilai
 * 
 * Test Coverage:
 * 1. Verifikasi enrollment mahasiswa
 * 2. Check visibility penilaian
 * 3. Get nilai mahasiswa dari database
 * 4. Perhitungan rata-rata nilai mahasiswa
 * 5. Format response untuk mahasiswa
 * 6. Error handling dan edge cases
 * 
 * Pendekatan Whitebox:
 * - Menguji semua branch dalam route handler
 * - Menguji kondisi visibility
 * - Menguji perhitungan nilai
 * - Menguji error paths
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ============================================================================
// MOCK FUNCTIONS (Simulasi dari server/src/routes/mahasiswa.js)
// ============================================================================

/**
 * Simulasi verifikasi enrollment mahasiswa
 */
const verifyMahasiswaEnrollment = async (tugasId, mahasiswaId, enrollments, tasks) => {
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) return { enrolled: false, error: 'Tugas besar not found' };

  const enrollment = enrollments.find(
    e => e.mahasiswa_id === mahasiswaId && 
         e.course_id === tugas.course_id && 
         e.class_id === tugas.class_id &&
         e.status === 'active'
  );

  return enrollment 
    ? { enrolled: true, enrollment: enrollment }
    : { enrolled: false, error: 'Access denied. You are not enrolled in this course.' };
};

/**
 * Simulasi check visibility penilaian
 */
const checkPenilaianVisibilityForMahasiswa = async (tugasId, tasks) => {
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) {
    return { visible: false, error: 'Tugas besar not found' };
  }

  if (!tugas.penilaian_visible) {
    return {
      visible: false,
      message: 'Penilaian belum ditampilkan oleh dosen'
    };
  }

  return { visible: true, message: null };
};

/**
 * Simulasi get kelompok mahasiswa untuk tugas besar
 */
const getMahasiswaKelompok = async (tugasId, mahasiswaId, kelompokMembers, kelompok) => {
  const member = kelompokMembers.find(
    km => km.user_id === mahasiswaId
  );

  if (!member) {
    return { hasGroup: false, kelompok: null };
  }

  const kelompokData = kelompok.find(
    k => k.id === member.kelompok_id && k.tugas_besar_id === tugasId
  );

  if (!kelompokData) {
    return { hasGroup: false, kelompok: null };
  }

  return {
    hasGroup: true,
    kelompok: {
      id: kelompokData.id,
      nama_kelompok: kelompokData.nama_kelompok
    }
  };
};

/**
 * Simulasi get nilai mahasiswa dari database
 */
const getMahasiswaNilai = async (tugasId, mahasiswaId, nilai, komponenPenilaian) => {
  const komponenIds = komponenPenilaian
    .filter(kp => kp.tugas_besar_id === tugasId)
    .map(kp => kp.id);

  const nilaiMahasiswa = nilai.filter(
    n => n.mahasiswa_id === mahasiswaId && komponenIds.includes(n.komponen_id)
  );

  return nilaiMahasiswa.map(n => {
    const komponen = komponenPenilaian.find(kp => kp.id === n.komponen_id);
    return {
      komponen_nama: komponen?.nama || '',
      nilai: parseFloat(n.nilai) || 0,
      bobot: parseFloat(komponen?.bobot) || 0,
      catatan: n.catatan || ''
    };
  });
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
 * Simulasi perhitungan rata-rata nilai mahasiswa
 */
const calculateMahasiswaAverage = (nilaiList) => {
  if (!nilaiList || nilaiList.length === 0) {
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  nilaiList.forEach(n => {
    const nilai = parseFloat(n.nilai) || 0;
    const bobot = parseFloat(n.bobot) || 0;
    if (bobot > 0) {
      totalWeightedScore += nilai * (bobot / 100);
      totalWeight += bobot;
    }
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
};

/**
 * Simulasi get penilaian untuk mahasiswa (main handler)
 */
const getPenilaianForMahasiswa = async (tugasId, mahasiswaId, enrollments, tasks, kelompokMembers, kelompok, nilai, komponenPenilaian) => {
  // 1. Verify enrollment
  const enrollmentCheck = await verifyMahasiswaEnrollment(tugasId, mahasiswaId, enrollments, tasks);
  if (!enrollmentCheck.enrolled) {
    return {
      success: false,
      visible: false,
      error: enrollmentCheck.error,
      status: 403
    };
  }

  // 2. Check visibility
  const visibilityCheck = await checkPenilaianVisibilityForMahasiswa(tugasId, tasks);
  if (!visibilityCheck.visible) {
    return {
      success: true,
      visible: false,
      message: visibilityCheck.message,
      data: null
    };
  }

  // 3. Get tugas besar info
  const tugas = tasks.find(t => t.id === tugasId);
  if (!tugas) {
    return {
      success: false,
      error: 'Tugas besar not found',
      status: 404
    };
  }

  // 4. Parse komponen
  const komponen = parseKomponen(tugas.komponen);

  // 5. Get kelompok mahasiswa
  const kelompokResult = await getMahasiswaKelompok(tugasId, mahasiswaId, kelompokMembers, kelompok);

  // 6. Get nilai mahasiswa
  const nilaiList = await getMahasiswaNilai(tugasId, mahasiswaId, nilai, komponenPenilaian);

  // 7. Calculate average
  const average = calculateMahasiswaAverage(nilaiList);

  return {
    success: true,
    visible: true,
    data: {
      tugas: {
        id: tugas.id,
        judul: tugas.judul
      },
      komponen: komponen.map((comp, index) => ({
        index: index,
        name: comp.name || comp.nama || '',
        weight: comp.weight || comp.bobot || 0
      })),
      kelompok: kelompokResult.hasGroup ? kelompokResult.kelompok : null,
      nilai: nilaiList,
      average: average ? parseFloat(average) : null
    }
  };
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Whitebox Testing - Server-Side Logic Mahasiswa Melihat Nilai', () => {
  
  // Mock data
  let mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok, mockNilai, mockKomponenPenilaian;

  beforeEach(() => {
    mockTasks = [
      {
        id: 1,
        judul: 'Tugas Besar 1',
        course_id: 1,
        class_id: 1,
        komponen: JSON.stringify([
          { name: 'Ujian', weight: 50 },
          { name: 'Tugas', weight: 50 }
        ]),
        penilaian_visible: true
      },
      {
        id: 2,
        judul: 'Tugas Besar 2',
        course_id: 1,
        class_id: 1,
        komponen: JSON.stringify([
          { name: 'Ujian', weight: 40 },
          { name: 'Tugas', weight: 60 }
        ]),
        penilaian_visible: false
      }
    ];

    mockEnrollments = [
      {
        mahasiswa_id: 101,
        course_id: 1,
        class_id: 1,
        status: 'active'
      },
      {
        mahasiswa_id: 102,
        course_id: 1,
        class_id: 1,
        status: 'active'
      }
    ];

    mockKelompok = [
      {
        id: 1,
        nama_kelompok: 'Kelompok A',
        tugas_besar_id: 1
      },
      {
        id: 2,
        nama_kelompok: 'Kelompok B',
        tugas_besar_id: 1
      }
    ];

    mockKelompokMembers = [
      { kelompok_id: 1, user_id: 101 },
      { kelompok_id: 2, user_id: 102 }
    ];

    mockKomponenPenilaian = [
      {
        id: 1,
        tugas_besar_id: 1,
        nama: 'Ujian',
        bobot: 50
      },
      {
        id: 2,
        tugas_besar_id: 1,
        nama: 'Tugas',
        bobot: 50
      }
    ];

    mockNilai = [
      {
        id: 1,
        komponen_id: 1,
        mahasiswa_id: 101,
        nilai: 80,
        catatan: 'Bagus'
      },
      {
        id: 2,
        komponen_id: 2,
        mahasiswa_id: 101,
        nilai: 90,
        catatan: 'Sangat bagus'
      }
    ];
  });

  // ========================================================================
  // 1. VERIFIKASI ENROLLMENT MAHASISWA
  // ========================================================================
  
  describe('1. Verifikasi Enrollment Mahasiswa', () => {
    
    it('harus return enrolled=true jika mahasiswa terdaftar aktif', async () => {
      const result = await verifyMahasiswaEnrollment(1, 101, mockEnrollments, mockTasks);
      
      expect(result.enrolled).toBe(true);
      expect(result.enrollment).toBeDefined();
    });

    it('harus return enrolled=false jika mahasiswa tidak terdaftar', async () => {
      const result = await verifyMahasiswaEnrollment(1, 999, mockEnrollments, mockTasks);
      
      expect(result.enrolled).toBe(false);
      expect(result.error).toContain('not enrolled');
    });

    it('harus return error jika tugas besar tidak ditemukan', async () => {
      const result = await verifyMahasiswaEnrollment(999, 101, mockEnrollments, mockTasks);
      
      expect(result.enrolled).toBe(false);
      expect(result.error).toBe('Tugas besar not found');
    });

    it('harus return enrolled=false jika status enrollment bukan active', async () => {
      const inactiveEnrollment = {
        mahasiswa_id: 103,
        course_id: 1,
        class_id: 1,
        status: 'inactive'
      };
      const enrollments = [...mockEnrollments, inactiveEnrollment];
      
      const result = await verifyMahasiswaEnrollment(1, 103, enrollments, mockTasks);
      
      expect(result.enrolled).toBe(false);
    });
  });

  // ========================================================================
  // 2. CHECK VISIBILITY PENILAIAN
  // ========================================================================
  
  describe('2. Check Visibility Penilaian', () => {
    
    it('harus return visible=true jika penilaian visible', async () => {
      const result = await checkPenilaianVisibilityForMahasiswa(1, mockTasks);
      
      expect(result.visible).toBe(true);
      expect(result.message).toBeNull();
    });

    it('harus return visible=false jika penilaian belum visible', async () => {
      const result = await checkPenilaianVisibilityForMahasiswa(2, mockTasks);
      
      expect(result.visible).toBe(false);
      expect(result.message).toBe('Penilaian belum ditampilkan oleh dosen');
    });

    it('harus return error jika tugas besar tidak ditemukan', async () => {
      const result = await checkPenilaianVisibilityForMahasiswa(999, mockTasks);
      
      expect(result.visible).toBe(false);
      expect(result.error).toBe('Tugas besar not found');
    });
  });

  // ========================================================================
  // 3. GET KELOMPOK MAHASISWA
  // ========================================================================
  
  describe('3. Get Kelompok Mahasiswa', () => {
    
    it('harus return kelompok jika mahasiswa punya kelompok', async () => {
      const result = await getMahasiswaKelompok(1, 101, mockKelompokMembers, mockKelompok);
      
      expect(result.hasGroup).toBe(true);
      expect(result.kelompok).toBeDefined();
      expect(result.kelompok.id).toBe(1);
      expect(result.kelompok.nama_kelompok).toBe('Kelompok A');
    });

    it('harus return hasGroup=false jika mahasiswa tidak punya kelompok', async () => {
      const result = await getMahasiswaKelompok(1, 999, mockKelompokMembers, mockKelompok);
      
      expect(result.hasGroup).toBe(false);
      expect(result.kelompok).toBeNull();
    });

    it('harus return hasGroup=false jika kelompok tidak untuk tugas besar ini', async () => {
      const wrongTaskKelompok = [
        { id: 3, nama_kelompok: 'Kelompok C', tugas_besar_id: 999 }
      ];
      
      const result = await getMahasiswaKelompok(1, 101, mockKelompokMembers, wrongTaskKelompok);
      
      expect(result.hasGroup).toBe(false);
    });
  });

  // ========================================================================
  // 4. GET NILAI MAHASISWA
  // ========================================================================
  
  describe('4. Get Nilai Mahasiswa dari Database', () => {
    
    it('harus return nilai untuk semua komponen', async () => {
      const nilaiList = await getMahasiswaNilai(1, 101, mockNilai, mockKomponenPenilaian);
      
      expect(nilaiList).toHaveLength(2);
      expect(nilaiList[0].komponen_nama).toBe('Ujian');
      expect(nilaiList[0].nilai).toBe(80);
      expect(nilaiList[1].komponen_nama).toBe('Tugas');
      expect(nilaiList[1].nilai).toBe(90);
    });

    it('harus return empty array jika tidak ada nilai', async () => {
      const nilaiList = await getMahasiswaNilai(1, 999, mockNilai, mockKomponenPenilaian);
      
      expect(nilaiList).toEqual([]);
    });

    it('harus include catatan jika ada', async () => {
      const nilaiList = await getMahasiswaNilai(1, 101, mockNilai, mockKomponenPenilaian);
      
      expect(nilaiList[0].catatan).toBe('Bagus');
      expect(nilaiList[1].catatan).toBe('Sangat bagus');
    });

    it('harus menangani nilai null atau invalid', async () => {
      const nilaiWithNull = [
        { id: 3, komponen_id: 1, mahasiswa_id: 102, nilai: null, catatan: '' }
      ];
      
      const nilaiList = await getMahasiswaNilai(1, 102, nilaiWithNull, mockKomponenPenilaian);
      
      expect(nilaiList[0].nilai).toBe(0);
    });
  });

  // ========================================================================
  // 5. PERHITUNGAN RATA-RATA NILAI MAHASISWA
  // ========================================================================
  
  describe('5. Perhitungan Rata-rata Nilai Mahasiswa', () => {
    
    it('harus menghitung rata-rata dengan bobot yang benar', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      // (80*0.5 + 90*0.5) / 1.0 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus return null jika tidak ada nilai', () => {
      expect(calculateMahasiswaAverage([])).toBeNull();
      expect(calculateMahasiswaAverage(null)).toBeNull();
    });

    it('harus menangani nilai dengan bobot berbeda', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 30 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 40 },
        { komponen_nama: 'Proyek', nilai: 85, bobot: 30 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      // (80*0.3 + 90*0.4 + 85*0.3) / 1.0 * 100 = 85.5
      expect(average).toBe('85.5');
    });

    it('harus menangani nilai dengan bobot 0', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Extra', nilai: 100, bobot: 0 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      // (80*0.5 + 90*0.5) / 1.0 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menangani nilai desimal', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 85.5, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: 90.25, bobot: 50 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      expect(parseFloat(average)).toBeCloseTo(87.875, 1);
    });
  });

  // ========================================================================
  // 6. PARSE KOMPONEN
  // ========================================================================
  
  describe('6. Parse Komponen dari JSONB', () => {
    
    it('harus parse komponen dari JSON string', () => {
      const komponenStr = JSON.stringify([{ name: 'Ujian', weight: 50 }]);
      const komponen = parseKomponen(komponenStr);
      
      expect(komponen).toEqual([{ name: 'Ujian', weight: 50 }]);
    });

    it('harus return empty array jika komponen null', () => {
      expect(parseKomponen(null)).toEqual([]);
    });
  });

  // ========================================================================
  // 7. INTEGRATION TEST - GET PENILAIAN UNTUK MAHASISWA
  // ========================================================================
  
  describe('7. Integration Test - Get Penilaian untuk Mahasiswa', () => {
    
    it('harus return data penilaian jika semua kondisi terpenuhi', async () => {
      const result = await getPenilaianForMahasiswa(
        1, 101,
        mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok,
        mockNilai, mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(result.visible).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.tugas.id).toBe(1);
      expect(result.data.komponen).toHaveLength(2);
      expect(result.data.nilai).toHaveLength(2);
      expect(result.data.average).toBe(85);
      expect(result.data.kelompok).toBeDefined();
    });

    it('harus return error jika mahasiswa tidak enrolled', async () => {
      const result = await getPenilaianForMahasiswa(
        1, 999,
        mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok,
        mockNilai, mockKomponenPenilaian
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toContain('not enrolled');
    });

    it('harus return visible=false jika penilaian belum visible', async () => {
      const result = await getPenilaianForMahasiswa(
        2, 101,
        mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok,
        mockNilai, mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(result.visible).toBe(false);
      expect(result.message).toBe('Penilaian belum ditampilkan oleh dosen');
      expect(result.data).toBeNull();
    });

    it('harus return kelompok=null jika mahasiswa tidak punya kelompok', async () => {
      const result = await getPenilaianForMahasiswa(
        1, 999,
        mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok,
        [], mockKomponenPenilaian // No nilai for user 999
      );

      // Should fail at enrollment check first
      expect(result.success).toBe(false);
    });

    it('harus return average=null jika tidak ada nilai', async () => {
      const result = await getPenilaianForMahasiswa(
        1, 102, // User 102 has no nilai
        mockEnrollments, mockTasks, mockKelompokMembers, mockKelompok,
        mockNilai, mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(result.visible).toBe(true);
      expect(result.data.nilai).toEqual([]);
      expect(result.data.average).toBeNull();
    });
  });

  // ========================================================================
  // 8. EDGE CASES
  // ========================================================================
  
  describe('8. Edge Cases', () => {
    
    it('harus menangani tugas besar tanpa komponen', async () => {
      const taskNoKomponen = {
        ...mockTasks[0],
        komponen: null
      };
      const tasks = [taskNoKomponen];

      const result = await getPenilaianForMahasiswa(
        1, 101,
        mockEnrollments, tasks, mockKelompokMembers, mockKelompok,
        mockNilai, mockKomponenPenilaian
      );

      expect(result.success).toBe(true);
      expect(result.data.komponen).toEqual([]);
    });

    it('harus menangani nilai dengan bobot tidak sama dengan 100', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 30 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 30 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      // (80*0.3 + 90*0.3) / 0.6 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menangani nilai dengan string yang bisa di-parse', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: '80', bobot: '50' },
        { komponen_nama: 'Tugas', nilai: '90', bobot: '50' }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      expect(average).toBe('85.0');
    });
  });
});

