-- Script untuk menghapus kolom angkatan dari tabel mahasiswa_profiles
-- 
-- CATATAN: Script ini akan menghapus kolom angkatan secara permanen
-- Pastikan untuk backup database sebelum menjalankan script ini
--
-- Cara menjalankan:
-- psql -U your_user -d your_database -f remove-angkatan-column.sql
-- Atau copy-paste query ini ke pgAdmin Query Tool

-- Hapus kolom angkatan dari tabel mahasiswa_profiles
ALTER TABLE mahasiswa_profiles DROP COLUMN IF EXISTS angkatan;

-- Verifikasi kolom sudah dihapus
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mahasiswa_profiles' 
ORDER BY ordinal_position;

