/**
 * Whitebox Testing untuk Fitur Penilaian Dosen dan Tampilan Nilai Mahasiswa
 * 
 * Test Coverage:
 * 1. Validasi input nilai dosen (0-100, format, edge cases)
 * 2. Penyimpanan nilai ke database (per anggota kelompok)
 * 3. Perhitungan rata-rata nilai (dengan bobot komponen)
 * 4. Update visibilitas penilaian (show/hide untuk mahasiswa)
 * 5. Mahasiswa melihat nilai (visibility check, perhitungan, display)
 * 6. Error handling dan boundary testing
 * 
 * Pendekatan Whitebox:
 * - Menguji logika internal fungsi
 * - Menguji semua branch dan path eksekusi
 * - Menguji boundary conditions
 * - Menguji error handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ============================================================================
// HELPER FUNCTIONS YANG AKAN DI-TEST (dari DosenGradingManagement.jsx)
// ============================================================================

/**
 * Validasi nilai input (0-100)
 */
const validateNilai = (nilai) => {
  if (nilai === null || nilai === undefined || nilai === '') {
    return { valid: true, value: null };
  }
  
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
};

/**
 * Filter input nilai (hanya angka dan titik desimal)
 */
const filterNilaiInput = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  let filteredValue = value.toString().replace(/[^0-9.]/g, '');
  
  const parts = filteredValue.split('.');
  if (parts.length > 2) {
    filteredValue = parts[0] + '.' + parts.slice(1).join('');
  }

  if (filteredValue === '' || filteredValue === '.') {
    return filteredValue === '.' ? '0.' : '';
  }

  const numValue = parseFloat(filteredValue);
  
  if (isNaN(numValue)) {
    return '';
  }

  if (numValue > 100) {
    return '100';
  }

  if (numValue < 0) {
    return '0';
  }

  return filteredValue;
};

/**
 * Hitung rata-rata nilai kelompok dengan bobot komponen
 */
const calculateGroupAverage = (groupGrades, components) => {
  if (!groupGrades || !components || components.length === 0) {
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  components.forEach((component, index) => {
    const grade = groupGrades[index];
    if (grade && grade.nilai !== null && grade.nilai !== undefined) {
      const weight = component.weight || 0;
      totalWeightedScore += parseFloat(grade.nilai) * (weight / 100);
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
};

/**
 * Hitung rata-rata nilai mahasiswa (dari server-side logic)
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
 * Validasi batch nilai untuk beberapa kelompok
 */
const validateBatchGrades = (grades) => {
  const errors = {};
  let hasErrors = false;

  Object.entries(grades).forEach(([groupId, gradeData]) => {
    if (gradeData.score !== '' && gradeData.score !== null && gradeData.score !== undefined) {
      const validation = validateNilai(gradeData.score);
      if (!validation.valid) {
        errors[groupId] = validation.error;
        hasErrors = true;
      }
    }
  });

  return { errors, hasErrors };
};

/**
 * Simulasi logika penyimpanan nilai per anggota kelompok
 */
const simulateSaveNilaiToMembers = (nilai, members) => {
  if (!members || members.length === 0) {
    return { success: false, error: 'Group has no members' };
  }

  const validation = validateNilai(nilai);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Simulasi menyimpan nilai ke semua anggota
  const savedNilai = members.map(memberId => ({
    mahasiswa_id: memberId,
    komponen_id: 1, // Mock komponen_id
    nilai: validation.value,
    saved: true
  }));

  return {
    success: true,
    saved_count: savedNilai.length,
    nilai: savedNilai
  };
};

/**
 * Check visibility penilaian untuk mahasiswa
 */
const checkPenilaianVisibility = (penilaianVisible, mahasiswaEnrolled) => {
  if (!mahasiswaEnrolled) {
    return {
      visible: false,
      message: 'Access denied. You are not enrolled in this course.'
    };
  }

  if (!penilaianVisible) {
    return {
      visible: false,
      message: 'Penilaian belum ditampilkan oleh dosen'
    };
  }

  return {
    visible: true,
    message: null
  };
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Whitebox Testing - Fitur Penilaian Dosen dan Tampilan Nilai Mahasiswa', () => {
  
  // ========================================================================
  // 1. VALIDASI INPUT NILAI DOSEN
  // ========================================================================
  
  describe('1. Validasi Input Nilai Dosen', () => {
    
    it('harus menerima nilai valid antara 0-100', () => {
      expect(validateNilai('85')).toEqual({ valid: true, value: 85 });
      expect(validateNilai('0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100')).toEqual({ valid: true, value: 100 });
      expect(validateNilai('50.5')).toEqual({ valid: true, value: 50.5 });
      expect(validateNilai(85)).toEqual({ valid: true, value: 85 });
    });

    it('harus menolak nilai negatif', () => {
      expect(validateNilai('-5')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh kurang dari 0' 
      });
      expect(validateNilai('-0.1')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh kurang dari 0' 
      });
      expect(validateNilai(-10)).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh kurang dari 0' 
      });
    });

    it('harus menolak nilai lebih dari 100', () => {
      expect(validateNilai('101')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
      expect(validateNilai('150')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
      expect(validateNilai(200)).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
    });

    it('harus menolak nilai non-numerik', () => {
      expect(validateNilai('abc')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
      expect(validateNilai('12abc')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
      expect(validateNilai('text')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
    });

    it('harus menerima nilai kosong/null/undefined (opsional)', () => {
      expect(validateNilai('')).toEqual({ valid: true, value: null });
      expect(validateNilai(null)).toEqual({ valid: true, value: null });
      expect(validateNilai(undefined)).toEqual({ valid: true, value: null });
    });

    it('harus menerima nilai desimal valid', () => {
      expect(validateNilai('85.5')).toEqual({ valid: true, value: 85.5 });
      expect(validateNilai('99.99')).toEqual({ valid: true, value: 99.99 });
      expect(validateNilai('0.5')).toEqual({ valid: true, value: 0.5 });
      expect(validateNilai('85.123456')).toEqual({ valid: true, value: 85.123456 });
    });

    // Boundary Testing
    it('harus menangani nilai batas (0 dan 100) dengan benar', () => {
      expect(validateNilai('0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100')).toEqual({ valid: true, value: 100 });
      expect(validateNilai('0.0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100.0')).toEqual({ valid: true, value: 100 });
      expect(validateNilai('0.01')).toEqual({ valid: true, value: 0.01 });
      expect(validateNilai('99.99')).toEqual({ valid: true, value: 99.99 });
    });
  });

  // ========================================================================
  // 2. FILTER INPUT NILAI
  // ========================================================================
  
  describe('2. Filter Input Nilai', () => {
    
    it('harus memfilter karakter non-numerik', () => {
      expect(filterNilaiInput('abc123')).toBe('123');
      expect(filterNilaiInput('85abc')).toBe('85');
      expect(filterNilaiInput('test')).toBe('');
      expect(filterNilaiInput('nilai85')).toBe('85');
      expect(filterNilaiInput('a1b2c3')).toBe('123');
    });

    it('harus membatasi hanya satu titik desimal', () => {
      expect(filterNilaiInput('85.5.5')).toBe('85.55');
      expect(filterNilaiInput('12.34.56')).toBe('12.3456');
      expect(filterNilaiInput('85..5')).toBe('85.5');
    });

    it('harus membatasi nilai maksimum ke 100', () => {
      expect(filterNilaiInput('150')).toBe('100');
      expect(filterNilaiInput('101')).toBe('100');
      expect(filterNilaiInput('200.5')).toBe('100');
      expect(filterNilaiInput('999')).toBe('100');
    });

    it('harus membatasi nilai minimum ke 0', () => {
      expect(filterNilaiInput('-5')).toBe('0');
      expect(filterNilaiInput('-10.5')).toBe('0');
      expect(filterNilaiInput('-1')).toBe('0');
    });

    it('harus menerima nilai valid tanpa perubahan', () => {
      expect(filterNilaiInput('85')).toBe('85');
      expect(filterNilaiInput('85.5')).toBe('85.5');
      expect(filterNilaiInput('0')).toBe('0');
      expect(filterNilaiInput('100')).toBe('100');
      expect(filterNilaiInput('50.25')).toBe('50.25');
    });

    it('harus menangani nilai kosong', () => {
      expect(filterNilaiInput('')).toBe('');
      expect(filterNilaiInput(null)).toBe('');
      expect(filterNilaiInput(undefined)).toBe('');
    });

    it('harus menangani titik desimal tunggal', () => {
      expect(filterNilaiInput('.')).toBe('0.');
      expect(filterNilaiInput('85.')).toBe('85.');
    });
  });

  // ========================================================================
  // 3. PERHITUNGAN RATA-RATA KELOMPOK DENGAN BOBOT
  // ========================================================================
  
  describe('3. Perhitungan Rata-rata Kelompok dengan Bobot', () => {
    
    it('harus menghitung rata-rata dengan bobot yang benar', () => {
      const components = [
        { weight: 30, name: 'Ujian' },
        { weight: 40, name: 'Tugas' },
        { weight: 30, name: 'Proyek' }
      ];
      
      const groupGrades = [
        { nilai: 80 },
        { nilai: 90 },
        { nilai: 85 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (80*0.3 + 90*0.4 + 85*0.3) / 1.0 * 100 = 85.5
      expect(average).toBe('85.5');
    });

    it('harus menangani komponen tanpa nilai', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const groupGrades = [
        { nilai: 80 },
        null // Tidak ada nilai untuk tugas
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // Hanya menghitung dari komponen yang ada nilainya
      // (80*0.5) / 0.5 * 100 = 80
      expect(average).toBe('80.0');
    });

    it('harus return null jika tidak ada komponen', () => {
      expect(calculateGroupAverage([], [])).toBeNull();
      expect(calculateGroupAverage(null, null)).toBeNull();
      expect(calculateGroupAverage([{ nilai: 80 }], [])).toBeNull();
      expect(calculateGroupAverage([], [{ weight: 50 }])).toBeNull();
    });

    it('harus menangani semua komponen tanpa nilai', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const groupGrades = [null, null];
      const average = calculateGroupAverage(groupGrades, components);
      expect(average).toBeNull();
    });

    it('harus menghitung dengan bobot tidak sama dengan 100', () => {
      const components = [
        { weight: 30, name: 'Ujian' },
        { weight: 30, name: 'Tugas' }
      ];
      
      const groupGrades = [
        { nilai: 80 },
        { nilai: 90 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (80*0.3 + 90*0.3) / 0.6 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menangani komponen dengan bobot 0', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 0, name: 'Extra' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const groupGrades = [
        { nilai: 80 },
        { nilai: 100 },
        { nilai: 90 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (80*0.5 + 90*0.5) / 1.0 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menangani nilai desimal dalam perhitungan', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const groupGrades = [
        { nilai: 85.5 },
        { nilai: 90.25 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (85.5*0.5 + 90.25*0.5) / 1.0 * 100 = 87.875 -> 87.9
      expect(parseFloat(average)).toBeCloseTo(87.875, 1);
    });
  });

  // ========================================================================
  // 4. PERHITUNGAN RATA-RATA NILAI MAHASISWA
  // ========================================================================
  
  describe('4. Perhitungan Rata-rata Nilai Mahasiswa (untuk Tampilan)', () => {
    
    it('harus menghitung rata-rata mahasiswa dari nilai per komponen', () => {
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
      expect(calculateMahasiswaAverage(undefined)).toBeNull();
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

    it('harus menangani nilai null atau undefined dalam list', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: null, bobot: 50 }
      ];

      const average = calculateMahasiswaAverage(nilaiList);
      // (80*0.5 + 0*0.5) / 1.0 * 100 = 40
      expect(average).toBe('40.0');
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
  // 5. VALIDASI BATCH NILAI
  // ========================================================================
  
  describe('5. Validasi Batch Nilai untuk Beberapa Kelompok', () => {
    
    it('harus valid jika semua nilai valid', () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: '90', feedback: 'Sangat bagus' },
        3: { score: '75', feedback: 'Cukup' }
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(false);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('harus detect error jika ada nilai invalid', () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: '150', feedback: 'Invalid' }, // > 100
        3: { score: '-5', feedback: 'Invalid' } // < 0
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(true);
      expect(result.errors['2']).toBe('Nilai tidak boleh lebih dari 100');
      expect(result.errors['3']).toBe('Nilai tidak boleh kurang dari 0');
    });

    it('harus mengabaikan nilai kosong', () => {
      const grades = {
        1: { score: '', feedback: '' },
        2: { score: null, feedback: '' },
        3: { score: undefined, feedback: '' }
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(false);
    });

    it('harus menangani campuran nilai valid dan invalid', () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: 'abc', feedback: 'Invalid' },
        3: { score: '90', feedback: 'Bagus' },
        4: { score: '101', feedback: 'Invalid' }
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(true);
      expect(result.errors['2']).toBe('Nilai harus berupa angka');
      expect(result.errors['4']).toBe('Nilai tidak boleh lebih dari 100');
      expect(result.errors['1']).toBeUndefined();
      expect(result.errors['3']).toBeUndefined();
    });
  });

  // ========================================================================
  // 6. SIMULASI PENYIMPANAN NILAI KE ANGGOTA KELOMPOK
  // ========================================================================
  
  describe('6. Penyimpanan Nilai ke Anggota Kelompok', () => {
    
    it('harus menyimpan nilai ke semua anggota kelompok', () => {
      const members = [101, 102, 103];
      const result = simulateSaveNilaiToMembers(85, members);

      expect(result.success).toBe(true);
      expect(result.saved_count).toBe(3);
      expect(result.nilai).toHaveLength(3);
      expect(result.nilai[0].nilai).toBe(85);
      expect(result.nilai[1].nilai).toBe(85);
      expect(result.nilai[2].nilai).toBe(85);
    });

    it('harus return error jika kelompok tidak punya anggota', () => {
      const result = simulateSaveNilaiToMembers(85, []);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Group has no members');
    });

    it('harus return error jika nilai invalid', () => {
      const members = [101, 102];
      const result = simulateSaveNilaiToMembers('150', members);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Nilai tidak boleh lebih dari 100');
    });

    it('harus menyimpan nilai desimal dengan benar', () => {
      const members = [101, 102];
      const result = simulateSaveNilaiToMembers(85.5, members);

      expect(result.success).toBe(true);
      expect(result.nilai[0].nilai).toBe(85.5);
    });

    it('harus menyimpan nilai batas dengan benar', () => {
      const members = [101];
      
      const result0 = simulateSaveNilaiToMembers(0, members);
      expect(result0.success).toBe(true);
      expect(result0.nilai[0].nilai).toBe(0);

      const result100 = simulateSaveNilaiToMembers(100, members);
      expect(result100.success).toBe(true);
      expect(result100.nilai[0].nilai).toBe(100);
    });
  });

  // ========================================================================
  // 7. CHECK VISIBILITY PENILAIAN UNTUK MAHASISWA
  // ========================================================================
  
  describe('7. Check Visibility Penilaian untuk Mahasiswa', () => {
    
    it('harus return visible=true jika penilaian visible dan mahasiswa enrolled', () => {
      const result = checkPenilaianVisibility(true, true);
      
      expect(result.visible).toBe(true);
      expect(result.message).toBeNull();
    });

    it('harus return visible=false jika mahasiswa tidak enrolled', () => {
      const result = checkPenilaianVisibility(true, false);
      
      expect(result.visible).toBe(false);
      expect(result.message).toBe('Access denied. You are not enrolled in this course.');
    });

    it('harus return visible=false jika penilaian belum visible', () => {
      const result = checkPenilaianVisibility(false, true);
      
      expect(result.visible).toBe(false);
      expect(result.message).toBe('Penilaian belum ditampilkan oleh dosen');
    });

    it('harus return visible=false jika kedua kondisi tidak terpenuhi', () => {
      const result = checkPenilaianVisibility(false, false);
      
      expect(result.visible).toBe(false);
      expect(result.message).toBe('Access denied. You are not enrolled in this course.');
    });
  });

  // ========================================================================
  // 8. INTEGRATION TEST - FLOW LENGKAP PENILAIAN
  // ========================================================================
  
  describe('8. Integration Test - Flow Lengkap Penilaian', () => {
    
    it('harus memproses flow lengkap: input -> validasi -> simpan -> hitung rata-rata', () => {
      // 1. Input nilai dari dosen
      const inputValues = {
        kelompok1: '85.5',
        kelompok2: '90',
        kelompok3: '75.25'
      };

      // 2. Filter dan validasi
      const filteredValues = {};
      const validatedValues = {};
      
      Object.entries(inputValues).forEach(([groupId, value]) => {
        const filtered = filterNilaiInput(value);
        filteredValues[groupId] = filtered;
        
        const validation = validateNilai(filtered);
        if (validation.valid && validation.value !== null) {
          validatedValues[groupId] = validation.value;
        }
      });

      // 3. Simulasi penyimpanan (mock)
      const membersPerGroup = {
        kelompok1: [101, 102],
        kelompok2: [103, 104, 105],
        kelompok3: [106]
      };

      const savedGrades = {};
      Object.entries(validatedValues).forEach(([groupId, nilai]) => {
        const result = simulateSaveNilaiToMembers(nilai, membersPerGroup[groupId]);
        if (result.success) {
          savedGrades[groupId] = result;
        }
      });

      // 4. Hitung rata-rata kelompok
      const components = [{ weight: 100, name: 'Total' }];
      const groupAverages = {};
      
      Object.entries(savedGrades).forEach(([groupId, savedData]) => {
        const groupGrades = savedData.nilai.map(n => ({ nilai: n.nilai }));
        const average = calculateGroupAverage(groupGrades, components);
        groupAverages[groupId] = average;
      });

      // Assertions
      expect(Object.keys(validatedValues).length).toBe(3);
      expect(savedGrades['kelompok1'].saved_count).toBe(2);
      expect(savedGrades['kelompok2'].saved_count).toBe(3);
      expect(savedGrades['kelompok3'].saved_count).toBe(1);
      expect(parseFloat(groupAverages['kelompok1'])).toBeCloseTo(85.5, 1);
      expect(parseFloat(groupAverages['kelompok2'])).toBeCloseTo(90, 1);
      expect(parseFloat(groupAverages['kelompok3'])).toBeCloseTo(75.25, 1);
    });

    it('harus menangani error dalam flow dan tetap melanjutkan', () => {
      const inputValues = {
        kelompok1: '85',
        kelompok2: 'invalid', // Error
        kelompok3: '90',
        kelompok4: '150' // Error
      };

      const results = {};
      const errors = {};

      Object.entries(inputValues).forEach(([groupId, value]) => {
        const validation = validateNilai(value);
        if (validation.valid && validation.value !== null) {
          results[groupId] = validation.value;
        } else if (!validation.valid) {
          errors[groupId] = validation.error;
        }
      });

      expect(Object.keys(results).length).toBe(2); // Hanya 2 yang valid
      expect(Object.keys(errors).length).toBe(2); // 2 error
      expect(results['kelompok1']).toBe(85);
      expect(results['kelompok3']).toBe(90);
      expect(errors['kelompok2']).toBe('Nilai harus berupa angka');
      expect(errors['kelompok4']).toBe('Nilai tidak boleh lebih dari 100');
    });

    it('harus memproses flow mahasiswa melihat nilai setelah dosen input', () => {
      // 1. Dosen input dan set visibility
      const penilaianVisible = true;
      const mahasiswaEnrolled = true;

      // 2. Check visibility
      const visibilityCheck = checkPenilaianVisibility(penilaianVisible, mahasiswaEnrolled);
      expect(visibilityCheck.visible).toBe(true);

      // 3. Mahasiswa mendapat nilai dari database (simulasi)
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
      ];

      // 4. Hitung rata-rata untuk ditampilkan
      const average = calculateMahasiswaAverage(nilaiList);

      // Assertions
      expect(visibilityCheck.visible).toBe(true);
      expect(average).toBe('85.0');
      expect(nilaiList.length).toBe(2);
    });
  });

  // ========================================================================
  // 9. EDGE CASES DAN BOUNDARY TESTING
  // ========================================================================
  
  describe('9. Edge Cases dan Boundary Testing', () => {
    
    it('harus menangani nilai sangat kecil', () => {
      expect(validateNilai('0.01')).toEqual({ valid: true, value: 0.01 });
      expect(validateNilai('0.001')).toEqual({ valid: true, value: 0.001 });
      expect(filterNilaiInput('0.01')).toBe('0.01');
    });

    it('harus menangani nilai sangat besar (dibatasi)', () => {
      expect(filterNilaiInput('999')).toBe('100');
      expect(filterNilaiInput('1000')).toBe('100');
      expect(validateNilai('999')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
    });

    it('harus menangani string kosong dengan spasi', () => {
      expect(filterNilaiInput('   ')).toBe('');
      expect(validateNilai('   ')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
    });

    it('harus menangani nilai dengan banyak desimal', () => {
      expect(filterNilaiInput('85.123456')).toBe('85.123456');
      expect(validateNilai('85.123456')).toEqual({ valid: true, value: 85.123456 });
    });

    it('harus menangani komponen dengan bobot total > 100', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' },
        { weight: 30, name: 'Extra' } // Total > 100
      ];
      
      const groupGrades = [
        { nilai: 80 },
        { nilai: 90 },
        { nilai: 85 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (80*0.5 + 90*0.5 + 85*0.3) / 1.3 * 100 = 83.46...
      expect(parseFloat(average)).toBeCloseTo(83.46, 1);
    });

    it('harus menangani komponen dengan bobot total < 100', () => {
      const components = [
        { weight: 30, name: 'Ujian' },
        { weight: 30, name: 'Tugas' } // Total < 100
      ];
      
      const groupGrades = [
        { nilai: 80 },
        { nilai: 90 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // (80*0.3 + 90*0.3) / 0.6 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menangani nilai null dalam perhitungan', () => {
      const components = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const groupGrades = [
        { nilai: null },
        { nilai: 90 }
      ];

      const average = calculateGroupAverage(groupGrades, components);
      // Hanya menghitung dari komponen yang ada nilainya
      expect(average).toBe('90.0');
    });
  });
});

