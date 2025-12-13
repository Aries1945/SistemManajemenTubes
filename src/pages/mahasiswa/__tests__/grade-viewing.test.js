/**
 * Whitebox Testing untuk Fitur Mahasiswa Melihat Nilai
 * 
 * Test Coverage:
 * 1. Loading penilaian dari API
 * 2. Validasi visibilitas penilaian
 * 3. Perhitungan nilai rata-rata
 * 4. Konversi nilai ke huruf (grade letter)
 * 5. Tampilan nilai per komponen
 * 6. Error handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Helper functions yang akan di-test (extracted dari MahasiswaCourseDetail dan MahasiswaGrades)
const getGradeLetter = (score) => {
  if (!score && score !== 0) return '-';
  const numScore = parseFloat(score);
  if (numScore >= 85) return 'A';
  if (numScore >= 80) return 'A-';
  if (numScore >= 75) return 'B+';
  if (numScore >= 70) return 'B';
  if (numScore >= 65) return 'B-';
  if (numScore >= 60) return 'C+';
  if (numScore >= 55) return 'C';
  if (numScore >= 50) return 'C-';
  if (numScore >= 45) return 'D';
  return 'E';
};

const getGradeColor = (score) => {
  if (!score && score !== 0) return 'text-gray-500';
  const numScore = parseFloat(score);
  if (numScore >= 80) return 'text-green-600';
  if (numScore >= 70) return 'text-blue-600';
  if (numScore >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const calculateAverageFromNilaiList = (nilaiList) => {
  if (!nilaiList || nilaiList.length === 0) return null;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  nilaiList.forEach((nilai) => {
    // Hanya hitung jika nilai ada (tidak null/undefined)
    if (nilai.nilai !== null && nilai.nilai !== undefined) {
      const nilaiValue = parseFloat(nilai.nilai);
      const bobot = parseFloat(nilai.bobot) || 0;
      if (!isNaN(nilaiValue) && bobot > 0) {
        totalWeightedScore += nilaiValue * (bobot / 100);
        totalWeight += bobot;
      }
    }
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
};

const shouldShowPenilaian = (penilaianVisible, penilaianData) => {
  if (!penilaianVisible) return false;
  if (!penilaianData || !penilaianData.data) return false;
  return penilaianData.data.average !== null && penilaianData.data.average !== undefined;
};

const formatPenilaianData = (response) => {
  if (!response || !response.success) return null;
  if (!response.visible) return { visible: false, message: response.message || 'Penilaian belum ditampilkan' };
  if (!response.data) return { visible: false, message: 'Data penilaian tidak tersedia' };

  return {
    visible: true,
    data: {
      tugas: response.data.tugas,
      komponen: response.data.komponen || [],
      nilai: response.data.nilai || [],
      average: response.data.average
    }
  };
};

const calculateCourseAverage = (tugasBesarNilai) => {
  if (!tugasBesarNilai || tugasBesarNilai.length === 0) return null;
  
  const totalNilai = tugasBesarNilai.reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0);
  return (totalNilai / tugasBesarNilai.length).toFixed(1);
};

describe('Mahasiswa Grade Viewing - Whitebox Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Konversi Nilai ke Huruf (getGradeLetter)', () => {
    it('harus mengembalikan A untuk nilai >= 85', () => {
      expect(getGradeLetter(100)).toBe('A');
      expect(getGradeLetter(95)).toBe('A');
      expect(getGradeLetter(85)).toBe('A');
      expect(getGradeLetter(85.5)).toBe('A');
    });

    it('harus mengembalikan A- untuk nilai 80-84', () => {
      expect(getGradeLetter(84.99)).toBe('A-');
      expect(getGradeLetter(80)).toBe('A-');
      expect(getGradeLetter(82.5)).toBe('A-');
    });

    it('harus mengembalikan B+ untuk nilai 75-79', () => {
      expect(getGradeLetter(79.99)).toBe('B+');
      expect(getGradeLetter(75)).toBe('B+');
      expect(getGradeLetter(77)).toBe('B+');
    });

    it('harus mengembalikan B untuk nilai 70-74', () => {
      expect(getGradeLetter(74.99)).toBe('B');
      expect(getGradeLetter(70)).toBe('B');
      expect(getGradeLetter(72)).toBe('B');
    });

    it('harus mengembalikan B- untuk nilai 65-69', () => {
      expect(getGradeLetter(69.99)).toBe('B-');
      expect(getGradeLetter(65)).toBe('B-');
    });

    it('harus mengembalikan C+ untuk nilai 60-64', () => {
      expect(getGradeLetter(64.99)).toBe('C+');
      expect(getGradeLetter(60)).toBe('C+');
    });

    it('harus mengembalikan C untuk nilai 55-59', () => {
      expect(getGradeLetter(59.99)).toBe('C');
      expect(getGradeLetter(55)).toBe('C');
    });

    it('harus mengembalikan C- untuk nilai 50-54', () => {
      expect(getGradeLetter(54.99)).toBe('C-');
      expect(getGradeLetter(50)).toBe('C-');
    });

    it('harus mengembalikan D untuk nilai 45-49', () => {
      expect(getGradeLetter(49.99)).toBe('D');
      expect(getGradeLetter(45)).toBe('D');
    });

    it('harus mengembalikan E untuk nilai < 45', () => {
      expect(getGradeLetter(44.99)).toBe('E');
      expect(getGradeLetter(30)).toBe('E');
      expect(getGradeLetter(0)).toBe('E');
    });

    it('harus mengembalikan "-" untuk nilai null/undefined/empty', () => {
      expect(getGradeLetter(null)).toBe('-');
      expect(getGradeLetter(undefined)).toBe('-');
      expect(getGradeLetter('')).toBe('-');
    });

    it('harus handle nilai sebagai string', () => {
      expect(getGradeLetter('85')).toBe('A');
      expect(getGradeLetter('75.5')).toBe('B+');
      expect(getGradeLetter('50')).toBe('C-');
    });
  });

  describe('2. Get Grade Color (getGradeColor)', () => {
    it('harus mengembalikan green untuk nilai >= 80', () => {
      expect(getGradeColor(100)).toBe('text-green-600');
      expect(getGradeColor(85)).toBe('text-green-600');
      expect(getGradeColor(80)).toBe('text-green-600');
    });

    it('harus mengembalikan blue untuk nilai 70-79', () => {
      expect(getGradeColor(79.99)).toBe('text-blue-600');
      expect(getGradeColor(70)).toBe('text-blue-600');
      expect(getGradeColor(75)).toBe('text-blue-600');
    });

    it('harus mengembalikan yellow untuk nilai 60-69', () => {
      expect(getGradeColor(69.99)).toBe('text-yellow-600');
      expect(getGradeColor(60)).toBe('text-yellow-600');
      expect(getGradeColor(65)).toBe('text-yellow-600');
    });

    it('harus mengembalikan red untuk nilai < 60', () => {
      expect(getGradeColor(59.99)).toBe('text-red-600');
      expect(getGradeColor(50)).toBe('text-red-600');
      expect(getGradeColor(0)).toBe('text-red-600');
    });

    it('harus mengembalikan gray untuk nilai null/undefined', () => {
      expect(getGradeColor(null)).toBe('text-gray-500');
      expect(getGradeColor(undefined)).toBe('text-gray-500');
      expect(getGradeColor('')).toBe('text-gray-500');
    });
  });

  describe('3. Perhitungan Rata-rata dari Nilai List (calculateAverageFromNilaiList)', () => {
    it('harus menghitung rata-rata dengan bobot yang benar', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
      ];

      const average = calculateAverageFromNilaiList(nilaiList);
      // (80*0.5 + 90*0.5) / 1.0 * 100 = 85
      expect(average).toBe('85.0');
    });

    it('harus menghitung dengan bobot tidak sama dengan 100', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 30 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 40 }
      ];

      const average = calculateAverageFromNilaiList(nilaiList);
      // (80*0.3 + 90*0.4) / 0.7 * 100 = 85.71...
      expect(parseFloat(average)).toBeCloseTo(85.71, 1);
    });

    it('harus return null jika tidak ada nilai', () => {
      expect(calculateAverageFromNilaiList([])).toBeNull();
      expect(calculateAverageFromNilaiList(null)).toBeNull();
      expect(calculateAverageFromNilaiList(undefined)).toBeNull();
    });

    it('harus handle nilai dengan string', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: '80', bobot: '50' },
        { komponen_nama: 'Tugas', nilai: '90', bobot: '50' }
      ];

      const average = calculateAverageFromNilaiList(nilaiList);
      expect(average).toBe('85.0');
    });

    it('harus handle nilai null/undefined dalam list', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
        { komponen_nama: 'Tugas', nilai: null, bobot: 50 }
      ];

      const average = calculateAverageFromNilaiList(nilaiList);
      // Hanya menghitung dari nilai yang ada
      // (80*0.5) / 0.5 * 100 = 80
      expect(average).toBe('80.0');
    });

    it('harus handle bobot 0', () => {
      const nilaiList = [
        { komponen_nama: 'Ujian', nilai: 80, bobot: 0 },
        { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
      ];

      const average = calculateAverageFromNilaiList(nilaiList);
      // (90*0.5) / 0.5 * 100 = 90
      expect(average).toBe('90.0');
    });
  });

  describe('4. Validasi Visibilitas Penilaian (shouldShowPenilaian)', () => {
    it('harus return true jika penilaian visible dan ada data average', () => {
      const penilaianData = {
        visible: true,
        data: {
          average: 85,
          nilai: [],
          komponen: []
        }
      };

      expect(shouldShowPenilaian(true, penilaianData)).toBe(true);
    });

    it('harus return false jika penilaian tidak visible', () => {
      const penilaianData = {
        visible: false,
        data: {
          average: 85,
          nilai: [],
          komponen: []
        }
      };

      expect(shouldShowPenilaian(false, penilaianData)).toBe(false);
    });

    it('harus return false jika tidak ada data', () => {
      expect(shouldShowPenilaian(true, null)).toBe(false);
      expect(shouldShowPenilaian(true, {})).toBe(false);
      expect(shouldShowPenilaian(true, { visible: true })).toBe(false);
    });

    it('harus return false jika average null', () => {
      const penilaianData = {
        visible: true,
        data: {
          average: null,
          nilai: [],
          komponen: []
        }
      };

      expect(shouldShowPenilaian(true, penilaianData)).toBe(false);
    });

    it('harus return true untuk average 0 (valid)', () => {
      const penilaianData = {
        visible: true,
        data: {
          average: 0,
          nilai: [],
          komponen: []
        }
      };

      expect(shouldShowPenilaian(true, penilaianData)).toBe(true);
    });
  });

  describe('5. Format Penilaian Data (formatPenilaianData)', () => {
    it('harus format data dengan benar jika visible dan ada data', () => {
      const response = {
        success: true,
        visible: true,
        data: {
          tugas: { id: 1, judul: 'Tugas Besar 1' },
          komponen: [{ name: 'Ujian', weight: 50 }],
          nilai: [{ komponen_nama: 'Ujian', nilai: 85, bobot: 50 }],
          average: 85
        }
      };

      const formatted = formatPenilaianData(response);
      expect(formatted.visible).toBe(true);
      expect(formatted.data.average).toBe(85);
      expect(formatted.data.komponen.length).toBe(1);
      expect(formatted.data.nilai.length).toBe(1);
    });

    it('harus return message jika tidak visible', () => {
      const response = {
        success: true,
        visible: false,
        message: 'Penilaian belum ditampilkan oleh dosen'
      };

      const formatted = formatPenilaianData(response);
      expect(formatted.visible).toBe(false);
      expect(formatted.message).toBe('Penilaian belum ditampilkan oleh dosen');
    });

    it('harus return null jika response tidak success', () => {
      const response = {
        success: false,
        error: 'Error message'
      };

      expect(formatPenilaianData(response)).toBeNull();
    });

    it('harus handle missing data fields', () => {
      const response = {
        success: true,
        visible: true,
        data: {
          tugas: { id: 1 },
          average: 85
        }
      };

      const formatted = formatPenilaianData(response);
      expect(formatted.visible).toBe(true);
      expect(formatted.data.komponen).toEqual([]);
      expect(formatted.data.nilai).toEqual([]);
    });
  });

  describe('6. Perhitungan Rata-rata Course (calculateCourseAverage)', () => {
    it('harus menghitung rata-rata dari multiple tugas besar', () => {
      const tugasBesarNilai = [
        { tugasId: 1, tugasTitle: 'TB1', nilai: 85 },
        { tugasId: 2, tugasTitle: 'TB2', nilai: 90 },
        { tugasId: 3, tugasTitle: 'TB3', nilai: 75 }
      ];

      const average = calculateCourseAverage(tugasBesarNilai);
      // (85 + 90 + 75) / 3 = 83.33...
      expect(parseFloat(average)).toBeCloseTo(83.33, 1);
    });

    it('harus return null jika tidak ada nilai', () => {
      expect(calculateCourseAverage([])).toBeNull();
      expect(calculateCourseAverage(null)).toBeNull();
      expect(calculateCourseAverage(undefined)).toBeNull();
    });

    it('harus handle nilai dengan string', () => {
      const tugasBesarNilai = [
        { tugasId: 1, tugasTitle: 'TB1', nilai: '85' },
        { tugasId: 2, tugasTitle: 'TB2', nilai: '90' }
      ];

      const average = calculateCourseAverage(tugasBesarNilai);
      expect(average).toBe('87.5');
    });

    it('harus handle nilai null/undefined dalam list', () => {
      const tugasBesarNilai = [
        { tugasId: 1, tugasTitle: 'TB1', nilai: 85 },
        { tugasId: 2, tugasTitle: 'TB2', nilai: null },
        { tugasId: 3, tugasTitle: 'TB3', nilai: 90 }
      ];

      const average = calculateCourseAverage(tugasBesarNilai);
      // (85 + 0 + 90) / 3 = 58.33...
      expect(parseFloat(average)).toBeCloseTo(58.33, 1);
    });

    it('harus handle single tugas besar', () => {
      const tugasBesarNilai = [
        { tugasId: 1, tugasTitle: 'TB1', nilai: 85 }
      ];

      const average = calculateCourseAverage(tugasBesarNilai);
      expect(average).toBe('85.0');
    });
  });

  describe('7. Integration Test - Complete Flow', () => {
    it('harus memproses flow lengkap: load -> format -> calculate -> display', () => {
      // Simulate API response
      const apiResponse = {
        success: true,
        visible: true,
        data: {
          tugas: { id: 1, judul: 'Tugas Besar 1' },
          komponen: [
            { name: 'Ujian', weight: 50 },
            { name: 'Tugas', weight: 50 }
          ],
          nilai: [
            { komponen_nama: 'Ujian', nilai: 80, bobot: 50 },
            { komponen_nama: 'Tugas', nilai: 90, bobot: 50 }
          ],
          average: 85
        }
      };

      // Step 1: Format data
      const formatted = formatPenilaianData(apiResponse);
      expect(formatted.visible).toBe(true);

      // Step 2: Check visibility
      const shouldShow = shouldShowPenilaian(apiResponse.visible, formatted);
      expect(shouldShow).toBe(true);

      // Step 3: Calculate average (should match API)
      const calculatedAverage = calculateAverageFromNilaiList(formatted.data.nilai);
      expect(calculatedAverage).toBe('85.0');

      // Step 4: Get grade letter
      const gradeLetter = getGradeLetter(formatted.data.average);
      expect(gradeLetter).toBe('A');

      // Step 5: Get grade color
      const gradeColor = getGradeColor(formatted.data.average);
      expect(gradeColor).toBe('text-green-600');
    });

    it('harus handle flow ketika penilaian belum visible', () => {
      const apiResponse = {
        success: true,
        visible: false,
        message: 'Penilaian belum ditampilkan oleh dosen'
      };

      const formatted = formatPenilaianData(apiResponse);
      expect(formatted.visible).toBe(false);
      expect(formatted.message).toBeDefined();

      const shouldShow = shouldShowPenilaian(false, formatted);
      expect(shouldShow).toBe(false);
    });
  });

  describe('8. Edge Cases', () => {
    it('harus handle boundary values untuk grade letter', () => {
      expect(getGradeLetter(84.99)).toBe('A-');
      expect(getGradeLetter(85)).toBe('A');
      expect(getGradeLetter(79.99)).toBe('B+');
      expect(getGradeLetter(80)).toBe('A-');
    });

    it('harus handle nilai desimal panjang', () => {
      expect(getGradeLetter(85.123456)).toBe('A');
      expect(getGradeLetter(75.999)).toBe('B+');
    });

    it('harus handle banyak komponen penilaian', () => {
      const nilaiList = [];
      for (let i = 0; i < 10; i++) {
        nilaiList.push({
          komponen_nama: `Komponen ${i + 1}`,
          nilai: 80 + i,
          bobot: 10
        });
      }

      const average = calculateAverageFromNilaiList(nilaiList);
      expect(average).toBe('84.5');
    });
  });
});

