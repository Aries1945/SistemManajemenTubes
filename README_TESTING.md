# Whitebox Testing - Fitur Dosen Menilai Tugas Besar Mahasiswa

## Deskripsi

Dokumen ini menjelaskan whitebox testing untuk fitur dosen menilai tugas besar mahasiswa menggunakan Jest.

## Struktur Test Files

```
src/
├── components/dosen/__tests__/
│   └── DosenGradingManagement.test.js    # Test untuk frontend component
├── utils/__tests__/
│   └── penilaianApi.test.js               # Test untuk API utilities
server/
└── src/routes/__tests__/
    └── dosen.grading.test.js              # Test untuk backend API routes
```

## Test Coverage

### 1. Frontend Component Tests (`DosenGradingManagement.test.js`)

#### 1.1 Validasi Input Nilai
- ✅ Menerima nilai valid (0-100)
- ✅ Menolak nilai negatif
- ✅ Menolak nilai > 100
- ✅ Menolak nilai non-numerik
- ✅ Menerima nilai kosong/null/undefined
- ✅ Menerima nilai desimal valid

#### 1.2 Filter Input Nilai
- ✅ Memfilter karakter non-numerik
- ✅ Membatasi hanya satu titik desimal
- ✅ Membatasi nilai maksimum ke 100
- ✅ Membatasi nilai minimum ke 0
- ✅ Menerima nilai valid tanpa perubahan
- ✅ Menangani nilai kosong

#### 1.3 Perhitungan Rata-rata Kelompok
- ✅ Menghitung dengan bobot yang benar
- ✅ Menangani komponen tanpa nilai
- ✅ Return null jika tidak ada komponen
- ✅ Menangani semua komponen tanpa nilai
- ✅ Menghitung dengan bobot tidak sama dengan 100

#### 1.4 Get Group Grade
- ✅ Return nilai rata-rata untuk kelompok dan komponen
- ✅ Return null jika kelompok tidak ditemukan
- ✅ Return null jika komponen tidak ditemukan
- ✅ Return null jika tidak ada nilai
- ✅ Return null jika gradingData tidak valid

#### 1.5 Validasi Batch Nilai
- ✅ Valid jika semua nilai valid
- ✅ Detect error jika ada nilai invalid
- ✅ Mengabaikan nilai kosong

#### 1.6 Edge Cases dan Boundary Testing
- ✅ Menangani nilai batas (0 dan 100)
- ✅ Menangani nilai sangat kecil
- ✅ Menangani nilai sangat besar (dibatasi)
- ✅ Menangani string kosong dengan spasi
- ✅ Menangani nilai dengan banyak desimal

#### 1.7 Integration Test
- ✅ Memproses flow lengkap: input -> validasi -> simpan -> hitung rata-rata
- ✅ Menangani error dalam flow dan tetap melanjutkan

### 2. Backend API Tests (`dosen.grading.test.js`)

#### 2.1 Validasi Input Nilai
- ✅ Menerima nilai valid (0-100)
- ✅ Menolak nilai negatif
- ✅ Menolak nilai > 100
- ✅ Menolak nilai non-numerik
- ✅ Menerima null/undefined

#### 2.2 Authorization Check
- ✅ Mengizinkan dosen yang memiliki tugas besar
- ✅ Menolak dosen yang tidak memiliki tugas besar

#### 2.3 Komponen Validation
- ✅ Menerima index komponen yang valid
- ✅ Menolak index negatif
- ✅ Menolak index melebihi panjang array

#### 2.4 Group Members Check
- ✅ Menerima kelompok dengan anggota
- ✅ Menolak kelompok tanpa anggota

#### 2.5 Save Nilai Logic
- ✅ Membuat nilai baru jika belum ada
- ✅ Update nilai yang sudah ada

#### 2.6 Data Structure
- ✅ Struktur data dengan benar
- ✅ Handle komponen dengan field alternatif

#### 2.7 Update Visibility
- ✅ Update visibility jika dosen memiliki akses
- ✅ Menolak update jika dosen tidak memiliki akses

#### 2.8 Error Handling
- ✅ Handle database error
- ✅ Handle JSON parse error

#### 2.9 Integration Test
- ✅ Memproses flow lengkap: validasi -> check ownership -> save nilai

### 3. API Utilities Tests (`penilaianApi.test.js`)

#### 3.1 Authentication
- ✅ Menambahkan token ke header Authorization
- ✅ Throw error jika tidak ada token
- ✅ Mengambil token dari user object
- ✅ Handle 401 error dan clear storage

#### 3.2 getGradingData
- ✅ Memanggil endpoint yang benar
- ✅ Handle error dengan benar

#### 3.3 saveNilai
- ✅ Mengirim data dengan format yang benar
- ✅ Handle nilai null/undefined untuk catatan

#### 3.4 updatePenilaianVisibility
- ✅ Update visibility ke true
- ✅ Update visibility ke false

#### 3.5 Error Handling
- ✅ Handle network error
- ✅ Handle JSON parse error
- ✅ Handle 500 server error

#### 3.6 Request Format Validation
- ✅ Mengirim Content-Type application/json
- ✅ Stringify body untuk POST/PUT requests

## Menjalankan Tests

### Install Dependencies
```bash
npm install
```

### Menjalankan Semua Tests
```bash
npm test
```

### Menjalankan Tests dengan Watch Mode
```bash
npm run test:watch
```

### Menjalankan Tests dengan Coverage Report
```bash
npm run test:coverage
```

### Menjalankan Test File Spesifik
```bash
npm test DosenGradingManagement.test.js
npm test dosen.grading.test.js
npm test penilaianApi.test.js
```

## Test Results

Setelah menjalankan tests, Anda akan melihat:
- ✅ Jumlah test yang passed
- ❌ Jumlah test yang failed
- ⏱️ Waktu eksekusi
- 📊 Coverage report (jika menggunakan --coverage)

## Coverage Goals

Target coverage untuk fitur ini:
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Catatan Penting

1. **Mocking**: Tests menggunakan mock untuk:
   - Database queries (pool.query)
   - API calls (fetch)
   - LocalStorage

2. **Isolation**: Setiap test diisolasi dan tidak bergantung pada test lain

3. **Cleanup**: beforeEach digunakan untuk membersihkan mocks sebelum setiap test

4. **Edge Cases**: Tests mencakup berbagai edge cases dan boundary conditions

## Troubleshooting

### Error: "Cannot find module '@jest/globals'"
```bash
npm install --save-dev @jest/globals jest jest-environment-jsdom
```

### Error: "Test timeout"
Tingkatkan timeout di `jest.config.js`:
```js
testTimeout: 20000 // 20 detik
```

### Error: "localStorage is not defined"
Pastikan menggunakan `jest-environment-jsdom` untuk tests yang membutuhkan browser APIs.

## Kontribusi

Jika menambahkan fitur baru atau mengubah logika penilaian, pastikan untuk:
1. Menambahkan test cases baru
2. Memastikan semua tests tetap passing
3. Mempertahankan coverage > 90%

