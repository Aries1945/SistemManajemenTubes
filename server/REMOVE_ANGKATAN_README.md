# 🗑️ Menghapus Kolom Angkatan dari Mahasiswa Profiles

Field "Angkatan" telah dihapus dari form tambah mahasiswa dan backend API. Untuk menyelesaikan perubahan ini, Anda perlu menjalankan script SQL untuk menghapus kolom dari database.

## ✅ Perubahan yang Sudah Dilakukan

1. ✅ Form frontend (`CreateMahasiswaModal.jsx`) - Field angkatan dihapus, NIM diganti NPM
2. ✅ Backend API POST (`admin.js`) - Tidak lagi menerima parameter angkatan, menggunakan NPM
3. ✅ Backend API BULK (`admin.js`) - Tidak lagi menerima parameter angkatan, menggunakan NPM
4. ✅ Schema database (`schema.js`) - Schema untuk table baru sudah diupdate

## 📋 Langkah Terakhir: Update Database

Jalankan script SQL untuk menghapus kolom `angkatan` dari tabel `mahasiswa_profiles`:

### Cara 1: Menggunakan psql (Command Line)

```bash
psql -U your_user -d your_database -f remove-angkatan-column.sql
```

### Cara 2: Menggunakan pgAdmin

1. Buka pgAdmin
2. Connect ke database Anda
3. Klik kanan pada database → Query Tool
4. Buka file `remove-angkatan-column.sql`
5. Execute (F5)

### Cara 3: Copy-Paste Query Langsung

```sql
ALTER TABLE mahasiswa_profiles DROP COLUMN IF EXISTS angkatan;
```

## ⚠️ Catatan Penting

- Script ini akan menghapus kolom `angkatan` secara permanen
- Pastikan untuk backup database sebelum menjalankan script
- Data angkatan yang sudah ada akan hilang (tapi sudah tidak digunakan lagi)

## 🔍 Verifikasi

Setelah menjalankan script, verifikasi dengan query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mahasiswa_profiles' 
ORDER BY ordinal_position;
```

Kolom `angkatan` seharusnya tidak muncul lagi dalam hasil.

## 🚨 Error yang Terjadi

Jika Anda mendapat error 500 saat membuat mahasiswa, kemungkinan besar kolom `angkatan` masih ada di database dan memiliki constraint `NOT NULL`. Jalankan script SQL di atas untuk memperbaikinya.

