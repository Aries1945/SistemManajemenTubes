# Panduan Import Mahasiswa

## Fitur Baru: Import Mahasiswa dari Excel

Kini admin dapat menambahkan mahasiswa dengan dua cara:

### 1. Tambah Mahasiswa Satu per Satu
- Klik tombol "Tambah Mahasiswa"
- Pilih "Tambah Mahasiswa Baru"
- Isi form dengan data mahasiswa
- Klik "Simpan"

### 2. Import Banyak Mahasiswa dari Excel
- Klik tombol "Tambah Mahasiswa"
- Pilih "Import dari Excel"
- Download template Excel terlebih dahulu
- Isi template dengan data mahasiswa
- Upload file Excel yang sudah diisi
- Review data yang akan diimport
- Klik "Import" untuk memproses

## Format Template Excel

Template Excel harus memiliki kolom berikut:

| Email | NIM | Nama Lengkap | Angkatan |
|-------|-----|--------------|----------|
| contoh@email.com | 2020730001 | Nama Mahasiswa | 2020 |

### Aturan Format:

1. **Email**: 
   - Wajib diisi
   - Format email yang valid (contoh@domain.com)
   - Maksimal 255 karakter
   - Harus unik (tidak boleh duplikat)

2. **NIM**: 
   - Wajib diisi
   - Maksimal 10 karakter
   - Harus unik (tidak boleh duplikat)

3. **Nama Lengkap**: 
   - Wajib diisi
   - Maksimal 255 karakter

4. **Angkatan**: 
   - Opsional
   - Format tahun (contoh: 2020, 2021)
   - Rentang tahun: 1900-2100

## Fitur Import

### Validasi Data
- Sistem akan memvalidasi setiap baris data sebelum import
- Data yang error akan ditampilkan dalam daftar error
- Hanya data yang valid yang akan diimport

### Hasil Import
- Menampilkan jumlah data yang berhasil diimport
- Menampilkan daftar error jika ada
- Data yang berhasil akan langsung muncul di daftar mahasiswa

### Password Default
- Semua akun mahasiswa yang dibuat akan memiliki password default: **123**
- Mahasiswa harus mengganti password setelah login pertama kali

## Troubleshooting

### Error "Email already exists"
- Email sudah digunakan oleh akun lain
- Gunakan email yang berbeda

### Error "NIM already exists"
- NIM sudah digunakan oleh mahasiswa lain
- Gunakan NIM yang berbeda

### Error "Format email tidak valid"
- Pastikan format email benar (contoh@domain.com)

### Error "NIM tidak boleh lebih dari 10 karakter"
- NIM maksimal 10 karakter
- Periksa dan perbaiki NIM yang terlalu panjang

### Error "File Excel tidak terbaca"
- Pastikan file dalam format .xlsx atau .xls
- Pastikan tidak ada karakter khusus di nama file
- Coba download template baru dan isi ulang

## Tips Penggunaan

1. **Download Template**: Selalu download template terbaru sebelum mengisi data
2. **Backup Data**: Simpan file Excel sebagai backup sebelum import
3. **Test Import**: Coba import dengan sedikit data terlebih dahulu
4. **Review Error**: Periksa daftar error dan perbaiki sebelum import ulang
5. **Batch Import**: Untuk data banyak, bagi menjadi beberapa batch kecil

## Contoh File Excel

```
Email                  | NIM        | Nama Lengkap      | Angkatan
john.doe@student.com   | 2020730001 | John Doe          | 2020
jane.smith@student.com | 2020730002 | Jane Smith        | 2020
bob.wilson@student.com | 2021730003 | Bob Wilson        | 2021
```

Dengan fitur ini, admin dapat mengelola data mahasiswa dengan lebih efisien, terutama saat awal semester atau saat ada mahasiswa baru dalam jumlah banyak.