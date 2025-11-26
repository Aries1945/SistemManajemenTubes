-- Script untuk menghapus kolom ruangan dan jadwal dari tabel classes
-- 
-- CATATAN: Script ini akan menghapus kolom ruangan dan jadwal secara permanen
-- Pastikan untuk backup database sebelum menjalankan script ini
--
-- Cara menjalankan:
-- psql -U your_user -d your_database -f remove-ruangan-jadwal-columns.sql
-- Atau copy-paste query ini ke pgAdmin Query Tool

-- Hapus kolom ruangan dan jadwal dari tabel classes
ALTER TABLE classes DROP COLUMN IF EXISTS ruangan;
ALTER TABLE classes DROP COLUMN IF EXISTS jadwal;

-- Verifikasi kolom sudah dihapus
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;

