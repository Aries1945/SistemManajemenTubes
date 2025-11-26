-- Script untuk menghapus kolom departemen dari tabel dosen_profiles
-- 
-- CATATAN: Script ini akan menghapus kolom departemen secara permanen
-- Pastikan untuk backup database sebelum menjalankan script ini
--
-- Cara menjalankan:
-- psql -U your_user -d your_database -f remove-departemen-column.sql
-- Atau copy-paste query ini ke pgAdmin Query Tool

-- Hapus kolom departemen dari tabel dosen_profiles
ALTER TABLE dosen_profiles DROP COLUMN IF EXISTS departemen;

-- Verifikasi kolom sudah dihapus
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dosen_profiles' 
ORDER BY ordinal_position;

