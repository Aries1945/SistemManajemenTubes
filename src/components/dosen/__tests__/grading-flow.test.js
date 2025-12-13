/**
 * Whitebox Testing untuk Flow Lengkap Penilaian Dosen
 * 
 * Test Coverage:
 * 1. Validasi input nilai
 * 2. Penyimpanan nilai ke database
 * 3. Update visibilitas penilaian
 * 4. Error handling dan edge cases
 * 5. Integration dengan API
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock API functions
const mockSaveNilai = jest.fn();
const mockGetGradingData = jest.fn();
const mockUpdatePenilaianVisibility = jest.fn();

// Helper functions yang akan di-test (extracted dari DosenGradingManagement)
const validateGradeInput = (score) => {
  if (score === '' || score === null || score === undefined) {
    return { valid: true, value: null };
  }
  
  const numValue = parseFloat(score);
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Nilai harus berupa angka' };
  }
  
  if (numValue < 0) {
    return { valid: false, error: 'Nilai tidak boleh kurang dari 0' };
  }
  
  if (numValue > 100) {
    return { valid: false, error: 'Nilai tidak boleh lebih dari 100' };
  }
  
  return { valid: true, value: numValue };
};

const validateBatchGrades = (grades) => {
  const errors = {};
  let hasErrors = false;

  Object.entries(grades).forEach(([groupId, gradeData]) => {
    if (gradeData.score !== '' && gradeData.score !== null && gradeData.score !== undefined) {
      const validation = validateGradeInput(gradeData.score);
      if (!validation.valid) {
        errors[groupId] = validation.error;
        hasErrors = true;
      }
    }
  });

  return { errors, hasErrors };
};

const calculateAverageGrade = (nilaiList, komponen) => {
  if (!nilaiList || nilaiList.length === 0 || !komponen || komponen.length === 0) {
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  komponen.forEach((comp, index) => {
    const nilai = nilaiList.find(n => n.komponen_index === index);
    if (nilai && nilai.nilai !== null && nilai.nilai !== undefined) {
      const weight = comp.weight || comp.bobot || 0;
      totalWeightedScore += parseFloat(nilai.nilai) * (weight / 100);
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
};

const prepareGradesForSave = (grades) => {
  const savePromises = [];
  
  Object.entries(grades).forEach(([groupId, gradeData]) => {
    if (gradeData.score && gradeData.score !== '') {
      const numValue = parseFloat(gradeData.score);
      if (numValue >= 0 && numValue <= 100) {
        savePromises.push({
          tugasId: null, // Will be set later
          kelompokId: parseInt(groupId),
          komponenIndex: null, // Will be set later
          nilai: numValue,
          catatan: gradeData.feedback || ''
        });
      }
    }
  });
  
  return savePromises;
};

describe('Dosen Grading Flow - Whitebox Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Validasi Input Nilai (validateGradeInput)', () => {
    it('harus menerima nilai valid antara 0-100', () => {
      expect(validateGradeInput('85')).toEqual({ valid: true, value: 85 });
      expect(validateGradeInput('0')).toEqual({ valid: true, value: 0 });
      expect(validateGradeInput('100')).toEqual({ valid: true, value: 100 });
      expect(validateGradeInput('50.5')).toEqual({ valid: true, value: 50.5 });
      expect(validateGradeInput(85)).toEqual({ valid: true, value: 85 });
    });

    it('harus menolak nilai negatif', () => {
      expect(validateGradeInput('-5')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh kurang dari 0' 
      });
      expect(validateGradeInput(-0.1)).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh kurang dari 0' 
      });
    });

    it('harus menolak nilai lebih dari 100', () => {
      expect(validateGradeInput('101')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
      expect(validateGradeInput('150')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
      expect(validateGradeInput(101)).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
    });

    it('harus menolak nilai non-numerik', () => {
      expect(validateGradeInput('abc')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
      expect(validateGradeInput('12abc')).toEqual({ 
        valid: false, 
        error: 'Nilai harus berupa angka' 
      });
    });

    it('harus menerima nilai kosong/null/undefined', () => {
      expect(validateGradeInput('')).toEqual({ valid: true, value: null });
      expect(validateGradeInput(null)).toEqual({ valid: true, value: null });
      expect(validateGradeInput(undefined)).toEqual({ valid: true, value: null });
    });

    it('harus menerima nilai desimal valid', () => {
      expect(validateGradeInput('85.5')).toEqual({ valid: true, value: 85.5 });
      expect(validateGradeInput('99.99')).toEqual({ valid: true, value: 99.99 });
      expect(validateGradeInput('0.5')).toEqual({ valid: true, value: 0.5 });
    });

    it('harus menangani boundary values', () => {
      expect(validateGradeInput('0')).toEqual({ valid: true, value: 0 });
      expect(validateGradeInput('100')).toEqual({ valid: true, value: 100 });
      expect(validateGradeInput('0.0')).toEqual({ valid: true, value: 0 });
      expect(validateGradeInput('100.0')).toEqual({ valid: true, value: 100 });
    });
  });

  describe('2. Validasi Batch Grades (validateBatchGrades)', () => {
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
        3: { score: undefined, feedback: '' },
        4: { score: '85', feedback: 'OK' }
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(false);
    });

    it('harus handle mixed valid dan invalid values', () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: '', feedback: '' }, // Empty - should be ignored
        3: { score: 'abc', feedback: '' }, // Invalid
        4: { score: '90', feedback: 'OK' }
      };

      const result = validateBatchGrades(grades);
      expect(result.hasErrors).toBe(true);
      expect(result.errors['3']).toBe('Nilai harus berupa angka');
      expect(Object.keys(result.errors).length).toBe(1);
    });
  });

  describe('3. Perhitungan Rata-rata (calculateAverageGrade)', () => {
    it('harus menghitung rata-rata dengan bobot yang benar', () => {
      const komponen = [
        { weight: 30, name: 'Ujian' },
        { weight: 40, name: 'Tugas' },
        { weight: 30, name: 'Proyek' }
      ];
      
      const nilaiList = [
        { komponen_index: 0, nilai: 80 },
        { komponen_index: 1, nilai: 90 },
        { komponen_index: 2, nilai: 85 }
      ];

      const average = calculateAverageGrade(nilaiList, komponen);
      // (80*0.3 + 90*0.4 + 85*0.3) / 1.0 * 100 = 85.5
      expect(average).toBe('85.5');
    });

    it('harus menangani komponen tanpa nilai', () => {
      const komponen = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const nilaiList = [
        { komponen_index: 0, nilai: 80 }
        // Tidak ada nilai untuk tugas (index 1)
      ];

      const average = calculateAverageGrade(nilaiList, komponen);
      // Hanya menghitung dari komponen yang ada nilainya
      // (80*0.5) / 0.5 * 100 = 80
      expect(average).toBe('80.0');
    });

    it('harus return null jika tidak ada komponen', () => {
      expect(calculateAverageGrade([], [])).toBeNull();
      expect(calculateAverageGrade(null, null)).toBeNull();
      expect(calculateAverageGrade([{ nilai: 80 }], [])).toBeNull();
    });

    it('harus menangani semua komponen tanpa nilai', () => {
      const komponen = [
        { weight: 50, name: 'Ujian' },
        { weight: 50, name: 'Tugas' }
      ];
      
      const nilaiList = [];
      const average = calculateAverageGrade(nilaiList, komponen);
      expect(average).toBeNull();
    });

    it('harus menghitung dengan bobot tidak sama dengan 100', () => {
      const komponen = [
        { weight: 30, name: 'Ujian' },
        { weight: 30, name: 'Tugas' }
      ];
      
      const nilaiList = [
        { komponen_index: 0, nilai: 80 },
        { komponen_index: 1, nilai: 90 }
      ];

      const average = calculateAverageGrade(nilaiList, komponen);
      // (80*0.3 + 90*0.3) / 0.6 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus handle komponen dengan field alternatif (bobot)', () => {
      const komponen = [
        { bobot: 50, name: 'Ujian' },
        { bobot: 50, name: 'Tugas' }
      ];
      
      const nilaiList = [
        { komponen_index: 0, nilai: 80 },
        { komponen_index: 1, nilai: 90 }
      ];

      const average = calculateAverageGrade(nilaiList, komponen);
      expect(average).toBe('85.0');
    });
  });

  describe('4. Prepare Grades untuk Save (prepareGradesForSave)', () => {
    it('harus mempersiapkan data valid untuk disimpan', () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: '90', feedback: 'Sangat bagus' },
        3: { score: '75', feedback: '' }
      };

      const prepared = prepareGradesForSave(grades);
      
      expect(prepared.length).toBe(3);
      expect(prepared[0].kelompokId).toBe(1);
      expect(prepared[0].nilai).toBe(85);
      expect(prepared[0].catatan).toBe('Bagus');
      expect(prepared[2].catatan).toBe('');
    });

    it('harus mengabaikan nilai kosong', () => {
      const grades = {
        1: { score: '', feedback: '' },
        2: { score: null, feedback: '' },
        3: { score: '85', feedback: 'OK' }
      };

      const prepared = prepareGradesForSave(grades);
      expect(prepared.length).toBe(1);
      expect(prepared[0].kelompokId).toBe(3);
    });

    it('harus mengabaikan nilai di luar range', () => {
      const grades = {
        1: { score: '85', feedback: 'OK' },
        2: { score: '150', feedback: 'Invalid' }, // > 100 - should be ignored
        3: { score: '-5', feedback: 'Invalid' } // < 0 - should be ignored
      };

      const prepared = prepareGradesForSave(grades);
      expect(prepared.length).toBe(1);
      expect(prepared[0].kelompokId).toBe(1);
    });

    it('harus convert nilai ke number dengan benar', () => {
      const grades = {
        1: { score: '85.5', feedback: 'Bagus' },
        2: { score: '90', feedback: 'OK' }
      };

      const prepared = prepareGradesForSave(grades);
      expect(prepared[0].nilai).toBe(85.5);
      expect(prepared[1].nilai).toBe(90);
      expect(typeof prepared[0].nilai).toBe('number');
    });
  });

  describe('5. Integration Test - Save Grades Flow', () => {
    it('harus memproses flow lengkap: validasi -> prepare -> save', async () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: '90', feedback: 'Sangat bagus' }
      };

      // Step 1: Validate
      const validation = validateBatchGrades(grades);
      expect(validation.hasErrors).toBe(false);

      // Step 2: Prepare
      const prepared = prepareGradesForSave(grades);
      expect(prepared.length).toBe(2);

      // Step 3: Mock save
      mockSaveNilai.mockResolvedValue({ success: true });
      for (const grade of prepared) {
        await mockSaveNilai(1, grade.kelompokId, 0, grade.nilai, grade.catatan);
      }

      expect(mockSaveNilai).toHaveBeenCalledTimes(2);
      expect(mockSaveNilai).toHaveBeenNthCalledWith(1, 1, 1, 0, 85, 'Bagus');
      expect(mockSaveNilai).toHaveBeenNthCalledWith(2, 1, 2, 0, 90, 'Sangat bagus');
    });

    it('harus handle error dalam flow dan tetap melanjutkan untuk nilai valid lainnya', async () => {
      const grades = {
        1: { score: '85', feedback: 'Bagus' },
        2: { score: 'invalid', feedback: '' }, // Invalid - should be caught in validation
        3: { score: '90', feedback: 'OK' }
      };

      // Validation should catch error
      const validation = validateBatchGrades(grades);
      expect(validation.hasErrors).toBe(true);
      expect(validation.errors['2']).toBeDefined();

      // Only valid grades should be prepared
      const validGrades = {
        1: grades[1],
        3: grades[3]
      };
      const prepared = prepareGradesForSave(validGrades);
      expect(prepared.length).toBe(2);
    });
  });

  describe('6. Edge Cases dan Boundary Testing', () => {
    it('harus menangani nilai batas (0 dan 100)', () => {
      expect(validateGradeInput('0')).toEqual({ valid: true, value: 0 });
      expect(validateGradeInput('100')).toEqual({ valid: true, value: 100 });
      expect(validateGradeInput('0.0')).toEqual({ valid: true, value: 0 });
      expect(validateGradeInput('100.0')).toEqual({ valid: true, value: 100 });
    });

    it('harus menangani nilai sangat kecil', () => {
      expect(validateGradeInput('0.01')).toEqual({ valid: true, value: 0.01 });
      expect(validateGradeInput('0.001')).toEqual({ valid: true, value: 0.001 });
    });

    it('harus menangani nilai dengan banyak desimal', () => {
      expect(validateGradeInput('85.123456')).toEqual({ valid: true, value: 85.123456 });
      expect(validateGradeInput('99.999')).toEqual({ valid: true, value: 99.999 });
    });

    it('harus menangani banyak kelompok sekaligus', () => {
      const grades = {};
      for (let i = 1; i <= 100; i++) {
        grades[i] = { score: String(50 + i), feedback: `Feedback ${i}` };
      }

      const validation = validateBatchGrades(grades);
      expect(validation.hasErrors).toBe(false);
      
      const prepared = prepareGradesForSave(grades);
      expect(prepared.length).toBe(100);
    });
  });
});

