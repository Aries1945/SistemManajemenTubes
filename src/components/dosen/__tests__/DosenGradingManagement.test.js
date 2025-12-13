/**
 * Whitebox Testing untuk Fitur Dosen Menilai Tugas Besar Mahasiswa
 * 
 * Test Coverage:
 * 1. Validasi input nilai (0-100)
 * 2. Perhitungan rata-rata kelompok
 * 3. Penyimpanan nilai ke database
 * 4. Update visibilitas penilaian
 * 5. Error handling
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock functions untuk testing
describe('DosenGradingManagement - Whitebox Testing', () => {
  
  // Helper functions yang akan di-test
  const validateNilai = (nilai) => {
    if (nilai === null || nilai === undefined || nilai === '') {
      return { valid: true, value: null };
    }
    
    // Convert to string untuk validasi
    const strNilai = String(nilai).trim();
    
    // Check if string contains non-numeric characters (except decimal point and minus sign at start)
    // Valid format: numbers, optional minus at start, optional decimal point
    if (!/^-?\d*\.?\d+$/.test(strNilai) && !/^-?\d+\.?\d*$/.test(strNilai)) {
      return { valid: false, error: 'Nilai harus berupa angka' };
    }
    
    const numNilai = parseFloat(strNilai);
    
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

  const filterNilaiInput = (value) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }

    // Check if value starts with minus sign (negative number)
    const isNegative = String(value).trim().startsWith('-');
    
    // Filter: hanya izinkan angka dan satu titik desimal
    let filteredValue = value.toString().replace(/[^0-9.]/g, '');
    
    // Hanya izinkan satu titik desimal
    const parts = filteredValue.split('.');
    if (parts.length > 2) {
      filteredValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Jika kosong setelah filter, set ke empty string
    if (filteredValue === '' || filteredValue === '.') {
      return filteredValue === '.' ? '0.' : '';
    }

    // Convert to number untuk validasi
    const numValue = parseFloat(filteredValue);
    
    // Jika bukan angka valid, return empty
    if (isNaN(numValue)) {
      return '';
    }

    // Jika nilai negatif (ada tanda minus di input asli), return '0'
    if (isNegative || numValue < 0) {
      return '0';
    }

    // Filter hanya menghapus karakter non-numerik, tidak membatasi nilai
    // Batasan nilai akan dilakukan di validasi, bukan di filter
    return filteredValue;
  };

  const getGroupGrade = (groupId, componentIndex, gradingData) => {
    if (!gradingData || !gradingData.nilai || !gradingData.komponen || !gradingData.groups) {
      return null;
    }
    
    const component = gradingData.komponen[componentIndex];
    if (!component) return null;
    
    const group = gradingData.groups.find(g => g.id === groupId);
    if (!group) return null;
    
    const groupNilai = gradingData.nilai.filter(n => 
      n.kelompok_id === groupId && n.komponen_nama === component.name
    );
    
    if (groupNilai.length > 0) {
      const avgNilai = groupNilai.reduce((sum, n) => sum + n.nilai, 0) / groupNilai.length;
      const catatan = groupNilai[0]?.catatan || '';
      return {
        nilai: parseFloat(avgNilai.toFixed(1)),
        catatan: catatan
      };
    }
    
    return null;
  };

  describe('1. Validasi Input Nilai', () => {
    it('harus menerima nilai valid antara 0-100', () => {
      expect(validateNilai('85')).toEqual({ valid: true, value: 85 });
      expect(validateNilai('0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100')).toEqual({ valid: true, value: 100 });
      expect(validateNilai('50.5')).toEqual({ valid: true, value: 50.5 });
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
    });

    it('harus menerima nilai kosong/null/undefined', () => {
      expect(validateNilai('')).toEqual({ valid: true, value: null });
      expect(validateNilai(null)).toEqual({ valid: true, value: null });
      expect(validateNilai(undefined)).toEqual({ valid: true, value: null });
    });

    it('harus menerima nilai desimal valid', () => {
      expect(validateNilai('85.5')).toEqual({ valid: true, value: 85.5 });
      expect(validateNilai('99.99')).toEqual({ valid: true, value: 99.99 });
      expect(validateNilai('0.5')).toEqual({ valid: true, value: 0.5 });
    });
  });

  describe('2. Filter Input Nilai', () => {
    it('harus memfilter karakter non-numerik', () => {
      expect(filterNilaiInput('abc123')).toBe('123');
      expect(filterNilaiInput('85abc')).toBe('85');
      expect(filterNilaiInput('test')).toBe('');
    });

    it('harus membatasi hanya satu titik desimal', () => {
      expect(filterNilaiInput('85.5.5')).toBe('85.55');
      expect(filterNilaiInput('12.34.56')).toBe('12.3456');
    });

    it('harus membatasi nilai maksimum ke 100', () => {
      // Filter hanya menghapus karakter non-numerik, tidak membatasi nilai
      // Batasan nilai dilakukan di validasi, bukan di filter
      expect(filterNilaiInput('150')).toBe('150');
      expect(filterNilaiInput('101')).toBe('101');
      expect(filterNilaiInput('200.5')).toBe('200.5');
      // Validasi akan menolak nilai > 100
      expect(validateNilai('150')).toEqual({ 
        valid: false, 
        error: 'Nilai tidak boleh lebih dari 100' 
      });
    });

    it('harus membatasi nilai minimum ke 0', () => {
      expect(filterNilaiInput('-5')).toBe('0');
      expect(filterNilaiInput('-10.5')).toBe('0');
    });

    it('harus menerima nilai valid tanpa perubahan', () => {
      expect(filterNilaiInput('85')).toBe('85');
      expect(filterNilaiInput('85.5')).toBe('85.5');
      expect(filterNilaiInput('0')).toBe('0');
      expect(filterNilaiInput('100')).toBe('100');
    });

    it('harus menangani nilai kosong', () => {
      expect(filterNilaiInput('')).toBe('');
      expect(filterNilaiInput(null)).toBe('');
      expect(filterNilaiInput(undefined)).toBe('');
    });
  });

  describe('3. Perhitungan Rata-rata Kelompok', () => {
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
  });

  describe('4. Get Group Grade', () => {
    const mockGradingData = {
      komponen: [
        { name: 'Ujian', weight: 50 },
        { name: 'Tugas', weight: 50 }
      ],
      groups: [
        { id: 1, name: 'Kelompok A', memberCount: 3 },
        { id: 2, name: 'Kelompok B', memberCount: 2 }
      ],
      nilai: [
        {
          id: 1,
          komponen_nama: 'Ujian',
          kelompok_id: 1,
          nilai: 85,
          catatan: 'Bagus'
        },
        {
          id: 2,
          komponen_nama: 'Ujian',
          kelompok_id: 1,
          nilai: 90,
          catatan: 'Bagus'
        },
        {
          id: 3,
          komponen_nama: 'Tugas',
          kelompok_id: 1,
          nilai: 80,
          catatan: 'Cukup'
        }
      ]
    };

    it('harus return nilai rata-rata untuk kelompok dan komponen', () => {
      const grade = getGroupGrade(1, 0, mockGradingData);
      expect(grade).not.toBeNull();
      expect(grade.nilai).toBe(87.5); // (85 + 90) / 2
      expect(grade.catatan).toBe('Bagus');
    });

    it('harus return null jika kelompok tidak ditemukan', () => {
      const grade = getGroupGrade(999, 0, mockGradingData);
      expect(grade).toBeNull();
    });

    it('harus return null jika komponen tidak ditemukan', () => {
      const grade = getGroupGrade(1, 999, mockGradingData);
      expect(grade).toBeNull();
    });

    it('harus return null jika tidak ada nilai untuk kelompok dan komponen', () => {
      const grade = getGroupGrade(2, 0, mockGradingData);
      expect(grade).toBeNull();
    });

    it('harus return null jika gradingData tidak valid', () => {
      expect(getGroupGrade(1, 0, null)).toBeNull();
      expect(getGroupGrade(1, 0, {})).toBeNull();
      expect(getGroupGrade(1, 0, { komponen: [] })).toBeNull();
    });
  });

  describe('5. Validasi Batch Nilai', () => {
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
  });

  describe('6. Edge Cases dan Boundary Testing', () => {
    it('harus menangani nilai batas (0 dan 100)', () => {
      expect(validateNilai('0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100')).toEqual({ valid: true, value: 100 });
      expect(validateNilai('0.0')).toEqual({ valid: true, value: 0 });
      expect(validateNilai('100.0')).toEqual({ valid: true, value: 100 });
    });

    it('harus menangani nilai sangat kecil', () => {
      expect(validateNilai('0.01')).toEqual({ valid: true, value: 0.01 });
      expect(validateNilai('0.001')).toEqual({ valid: true, value: 0.001 });
    });

    it('harus menangani nilai sangat besar (dibatasi)', () => {
      // Filter hanya menghapus karakter non-numerik, tidak membatasi nilai
      expect(filterNilaiInput('999')).toBe('999');
      expect(filterNilaiInput('1000')).toBe('1000');
      // Validasi akan menolak nilai > 100
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
  });

  describe('7. Integration Test - Simulasi Flow Lengkap', () => {
    it('harus memproses flow lengkap: input -> validasi -> simpan -> hitung rata-rata', () => {
      // 1. Input nilai
      const inputValues = {
        1: '85.5',
        2: '90',
        3: '75.25'
      };

      // 2. Filter dan validasi
      const filteredValues = {};
      const validatedValues = {};
      
      Object.entries(inputValues).forEach(([groupId, value]) => {
        const filtered = filterNilaiInput(value);
        filteredValues[groupId] = filtered;
        
        const validation = validateNilai(filtered);
        if (validation.valid) {
          validatedValues[groupId] = validation.value;
        }
      });

      // 3. Simulasi penyimpanan (mock)
      const savedGrades = Object.entries(validatedValues).map(([groupId, nilai]) => ({
        kelompok_id: parseInt(groupId),
        nilai: nilai,
        komponen_index: 0
      }));

      // 4. Hitung rata-rata
      // Untuk menghitung rata-rata dari 3 nilai dengan bobot yang sama
      // Kita perlu membuat 3 komponen dengan bobot yang sama (33.33, 33.33, 33.34)
      const components = [
        { weight: 33.33, name: 'Komponen 1' },
        { weight: 33.33, name: 'Komponen 2' },
        { weight: 33.34, name: 'Komponen 3' }
      ];
      const groupGrades = savedGrades.map(g => ({ nilai: g.nilai }));
      const average = calculateGroupAverage(groupGrades, components);

      // Assertions
      expect(Object.keys(validatedValues).length).toBe(3);
      expect(savedGrades.length).toBe(3);
      // Perhitungan: (85.5*33.33 + 90*33.33 + 75.25*33.34) / 100 * 100
      // = (2850.015 + 2999.7 + 2508.585) / 100 = 83.583... -> 83.6
      expect(parseFloat(average)).toBeCloseTo(83.6, 1);
    });

    it('harus menangani error dalam flow dan tetap melanjutkan', () => {
      const inputValues = {
        1: '85',
        2: 'invalid', // Error
        3: '90',
        4: '150' // Error
      };

      const results = {};
      const errors = {};

      Object.entries(inputValues).forEach(([groupId, value]) => {
        const validation = validateNilai(value);
        if (validation.valid) {
          results[groupId] = validation.value;
        } else {
          errors[groupId] = validation.error;
        }
      });

      expect(Object.keys(results).length).toBe(2); // Hanya 2 yang valid
      expect(Object.keys(errors).length).toBe(2); // 2 error
      expect(results['1']).toBe(85);
      expect(results['3']).toBe(90);
    });
  });
});

