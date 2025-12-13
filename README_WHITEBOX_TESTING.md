# Whitebox Testing - Fitur Penilaian Dosen dan Tampilan Nilai Mahasiswa

Dokumen ini menjelaskan whitebox testing yang telah dibuat untuk menguji fitur penilaian dosen dan tampilan nilai mahasiswa.

## Overview

Whitebox testing ini mencakup pengujian internal logic, flow, dan integrasi antara komponen sistem penilaian. Testing dibagi menjadi beberapa file test yang fokus pada aspek berbeda dari sistem.

## File Test yang Dibuat

### 1. `src/components/dosen/__tests__/grading-flow.test.js`

**Fokus**: Testing flow lengkap penilaian dosen di frontend

**Coverage**:
- Validasi input nilai (0-100, desimal, boundary values)
- Validasi batch grades (multiple kelompok sekaligus)
- Perhitungan rata-rata dengan bobot
- Prepare data untuk disimpan ke API
- Integration test flow lengkap
- Edge cases dan boundary testing

**Key Functions Tested**:
- `validateGradeInput(score)` - Validasi input nilai tunggal
- `validateBatchGrades(grades)` - Validasi multiple nilai sekaligus
- `calculateAverageGrade(nilaiList, komponen)` - Perhitungan rata-rata berbobot
- `prepareGradesForSave(grades)` - Persiapan data untuk API call

### 2. `src/pages/mahasiswa/__tests__/grade-viewing.test.js`

**Fokus**: Testing fitur mahasiswa melihat nilai

**Coverage**:
- Konversi nilai ke huruf (A, A-, B+, B, B-, C+, C, C-, D, E)
- Konversi nilai ke warna (green, blue, yellow, red)
- Perhitungan rata-rata dari list nilai
- Validasi visibilitas penilaian
- Format data dari API response
- Perhitungan rata-rata course dari multiple tugas besar
- Integration test flow lengkap
- Edge cases

**Key Functions Tested**:
- `getGradeLetter(score)` - Konversi nilai ke huruf
- `getGradeColor(score)` - Konversi nilai ke warna CSS
- `calculateAverageFromNilaiList(nilaiList)` - Perhitungan rata-rata berbobot
- `shouldShowPenilaian(penilaianVisible, penilaianData)` - Validasi visibility
- `formatPenilaianData(response)` - Format data dari API
- `calculateCourseAverage(tugasBesarNilai)` - Rata-rata dari multiple tugas

### 3. `src/utils/__tests__/penilaian-integration.test.js`

**Fokus**: Testing integrasi antara dosen dan mahasiswa

**Coverage**:
- Flow lengkap: Dosen input nilai -> Mahasiswa lihat nilai
- Visibility toggle flow (on/off)
- Data consistency antara input dosen dan tampilan mahasiswa
- Error handling di level integration
- Concurrent operations (multiple dosen/mahasiswa)
- Edge cases (nilai 0, 100, desimal, catatan panjang)

**Key Scenarios Tested**:
- Dosen menyimpan nilai, mahasiswa melihat setelah visibility diaktifkan
- Mahasiswa tidak bisa melihat nilai jika visibility false
- Multiple komponen penilaian
- Update nilai yang sudah ada
- Data consistency verification

### 4. `server/src/routes/__tests__/penilaian-end-to-end.test.js`

**Fokus**: Testing end-to-end backend API

**Coverage**:
- POST `/tugas-besar/:tugasId/nilai` - Complete flow dengan mock database
- GET `/tugas-besar/:tugasId/grading` - Data retrieval
- PUT `/tugas-besar/:tugasId/penilaian-visibility` - Visibility toggle
- GET `/tugas-besar/:tugasId/penilaian` (mahasiswa) - View grades
- Data consistency antara endpoints
- Error handling
- Boundary testing

**Key Functions Tested**:
- `validateNilai(nilai)` - Validasi nilai di backend
- `checkTugasOwnership(tugasId, dosenId, pool)` - Cek ownership
- `saveNilaiForGroup(...)` - Simpan nilai untuk kelompok

## Coverage Summary

### Validasi Input
- ✅ Nilai 0-100 (valid)
- ✅ Nilai negatif (rejected)
- ✅ Nilai > 100 (rejected)
- ✅ Nilai non-numerik (rejected)
- ✅ Nilai desimal (valid)
- ✅ Nilai kosong/null (valid untuk clear)
- ✅ Boundary values (0, 100)

### Business Logic
- ✅ Perhitungan rata-rata dengan bobot
- ✅ Konversi nilai ke huruf (A, B, C, D, E)
- ✅ Konversi nilai ke warna
- ✅ Visibility control (dosen toggle, mahasiswa view)
- ✅ Multiple komponen penilaian
- ✅ Multiple kelompok

### Data Flow
- ✅ Dosen input -> Database -> Mahasiswa view
- ✅ Visibility toggle -> Immediate reflection
- ✅ Data consistency verification
- ✅ Update nilai yang sudah ada

### Error Handling
- ✅ Invalid input handling
- ✅ Authorization checks
- ✅ Database errors
- ✅ Missing data
- ✅ Concurrent operations

### Edge Cases
- ✅ Nilai 0 dan 100
- ✅ Nilai desimal panjang
- ✅ Banyak kelompok sekaligus
- ✅ Catatan kosong dan panjang
- ✅ Komponen tanpa nilai

## Cara Menjalankan Test

### Menjalankan semua test
```bash
npm test
```

### Menjalankan test dengan coverage
```bash
npm run test:coverage
```

### Menjalankan test specific file
```bash
npm test grading-flow.test.js
npm test grade-viewing.test.js
npm test penilaian-integration.test.js
npm test penilaian-end-to-end.test.js
```

### Menjalankan test dalam watch mode
```bash
npm run test:watch
```

## Test Structure

Setiap test file mengikuti struktur:
1. **Setup** - Mock functions dan data preparation
2. **Unit Tests** - Testing individual functions
3. **Integration Tests** - Testing function interactions
4. **Edge Cases** - Boundary and unusual scenarios
5. **Error Handling** - Error scenarios

## Dependencies

Test menggunakan:
- Jest sebagai test framework
- `@jest/globals` untuk test utilities
- Mock functions untuk simulate API calls dan database operations

## Catatan Penting

1. **Mock Database**: Integration tests menggunakan mock database yang disederhanakan. Untuk testing dengan database real, gunakan test database terpisah.

2. **Authentication**: Test ini tidak termasuk authentication flow lengkap. Untuk E2E testing dengan authentication, gunakan integration testing tools seperti Cypress atau Playwright.

3. **API Calls**: Frontend tests menggunakan mock functions. Untuk testing API real, jalankan server development dan gunakan integration tests.

4. **Database Operations**: Backend tests menggunakan mock pool. Untuk testing dengan database real, setup test database dengan data seed.

## Improvement Suggestions

1. **E2E Testing**: Tambahkan end-to-end testing dengan tools seperti Cypress untuk test flow lengkap dari UI.

2. **Performance Testing**: Test dengan large datasets (banyak kelompok, banyak komponen).

3. **Security Testing**: Test authorization dan access control lebih mendalam.

4. **Load Testing**: Test concurrent operations dengan banyak user.

## Maintenance

Test files ini harus diupdate ketika:
- Business logic berubah (contoh: skala penilaian berubah)
- API endpoints berubah
- Data structure berubah
- Validation rules berubah

