# 🗑️ Menghapus Kolom Departemen dari Dosen

Field "Departemen" telah dihapus dari form tambah dosen dan backend API. Untuk menyelesaikan perubahan ini, Anda perlu menjalankan script SQL untuk menghapus kolom dari database.

## ✅ Perubahan yang Sudah Dilakukan

1. ✅ Form frontend (`CreateDosenModal.jsx`) - Field departemen dihapus
2. ✅ Backend API (`admin.js`) - Tidak lagi menerima parameter departemen
3. ✅ Query database - Semua query yang menggunakan departemen sudah diupdate
4. ✅ Schema database (`schema.js`) - Schema untuk table baru sudah diupdate

## 📋 Langkah Terakhir: Update Database

Jalankan script SQL untuk menghapus kolom `departemen` dari tabel `dosen_profiles`:

### Cara 1: Menggunakan psql (Command Line)

```bash
psql -U your_user -d your_database -f remove-departemen-column.sql
```

### Cara 2: Menggunakan pgAdmin

1. Buka pgAdmin
2. Connect ke database Anda
3. Klik kanan pada database → Query Tool
4. Buka file `remove-departemen-column.sql`
5. Execute (F5)

### Cara 3: Copy-Paste Query Langsung

```sql
ALTER TABLE dosen_profiles DROP COLUMN IF EXISTS departemen;
```

## ⚠️ Catatan Penting

- Script ini akan menghapus kolom `departemen` secara permanen
- Pastikan untuk backup database sebelum menjalankan script
- Data departemen yang sudah ada akan hilang (tapi sudah tidak digunakan lagi)

## 🔍 Verifikasi

Setelah menjalankan script, verifikasi dengan query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dosen_profiles' 
ORDER BY ordinal_position;
```

Kolom `departemen` seharusnya tidak muncul lagi dalam hasil.

