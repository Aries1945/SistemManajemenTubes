# 🗑️ Menghapus Kolom Ruangan dan Jadwal dari Classes

Field "Ruangan" dan "Jadwal" telah dihapus dari form tambah kelas dan backend API. Untuk menyelesaikan perubahan ini, Anda perlu menjalankan script SQL untuk menghapus kolom dari database.

## ✅ Perubahan yang Sudah Dilakukan

1. ✅ Form frontend (`CreateClassModal.jsx`) - Field ruangan dan jadwal dihapus
2. ✅ Backend API POST (`admin.js`) - Tidak lagi menerima parameter ruangan dan jadwal
3. ✅ Backend API PATCH (`admin.js`) - Tidak lagi menerima parameter ruangan dan jadwal untuk update
4. ✅ Schema database (`schema.js`) - Schema untuk table baru sudah diupdate

## 📋 Langkah Terakhir: Update Database

Jalankan script SQL untuk menghapus kolom `ruangan` dan `jadwal` dari tabel `classes`:

### Cara 1: Menggunakan psql (Command Line)

```bash
psql -U your_user -d your_database -f remove-ruangan-jadwal-columns.sql
```

### Cara 2: Menggunakan pgAdmin

1. Buka pgAdmin
2. Connect ke database Anda
3. Klik kanan pada database → Query Tool
4. Buka file `remove-ruangan-jadwal-columns.sql`
5. Execute (F5)

### Cara 3: Copy-Paste Query Langsung

```sql
ALTER TABLE classes DROP COLUMN IF EXISTS ruangan;
ALTER TABLE classes DROP COLUMN IF EXISTS jadwal;
```

## ⚠️ Catatan Penting

- Script ini akan menghapus kolom `ruangan` dan `jadwal` secara permanen
- Pastikan untuk backup database sebelum menjalankan script
- Data ruangan dan jadwal yang sudah ada akan hilang (tapi sudah tidak digunakan lagi)

## 🔍 Verifikasi

Setelah menjalankan script, verifikasi dengan query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;
```

Kolom `ruangan` dan `jadwal` seharusnya tidak muncul lagi dalam hasil.

