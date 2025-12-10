-- ============================================
-- RESET DATABASE - Drop and Recreate Schema
-- ============================================
-- Script ini akan menghapus semua tabel dan membuat ulang dengan schema yang benar
-- 
-- PERINGATAN: Script ini akan menghapus SEMUA DATA yang ada!
-- Pastikan untuk backup database sebelum menjalankan script ini
--
-- Cara menjalankan:
-- 1. Buka pgAdmin atau psql
-- 2. Connect ke database Anda
-- 3. Copy-paste seluruh isi file ini dan execute
-- Atau: psql -U your_user -d your_database -f reset-database.sql
-- ============================================

-- Drop semua tabel (dengan CASCADE untuk menghapus dependencies)
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_name CASCADE;
DROP TABLE IF EXISTS mahasiswa_profiles CASCADE;
DROP TABLE IF EXISTS dosen_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop type jika ada
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. Users table (untuk authentication)
-- Note: is_active TIDAK ada di sini, ada di profile tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'dosen', 'mahasiswa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dosen Profiles
-- Note: TIDAK ada kolom departemen, is_active ada di sini
CREATE TABLE dosen_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nip VARCHAR(50) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 3. Mahasiswa Profiles
-- Note: TIDAK ada kolom angkatan, is_active ada di sini
-- Note: Kolom di database tetap bernama 'nim' (bukan npm)
CREATE TABLE mahasiswa_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nim VARCHAR(50) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 4. Course Name (Master data mata kuliah)
CREATE TABLE course_name (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    sks INTEGER NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Courses (Mata kuliah yang ditawarkan dengan dosen koordinator)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_name_id INTEGER REFERENCES course_name(id),
    dosen_id INTEGER REFERENCES users(id),
    semester VARCHAR(50) NOT NULL,
    tahun_ajaran VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Classes (Kelas untuk setiap course)
-- Note: TIDAK ada kolom ruangan dan jadwal
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    dosen_id INTEGER REFERENCES users(id),
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20),
    kapasitas INTEGER DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Class Enrollments (Pendaftaran mahasiswa ke kelas)
CREATE TABLE class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    nilai_akhir DECIMAL(5,2),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, mahasiswa_id)
);

-- ============================================
-- CREATE INDEXES (untuk performa)
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_dosen_profiles_user_id ON dosen_profiles(user_id);
CREATE INDEX idx_mahasiswa_profiles_user_id ON mahasiswa_profiles(user_id);
CREATE INDEX idx_courses_dosen_id ON courses(dosen_id);
CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_dosen_id ON classes(dosen_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_mahasiswa_id ON class_enrollments(mahasiswa_id);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (hash: $2b$10$3euPcmQFCiblsZeEu5s7p.9wvofPnMIHxHuhwJXIzPUhMjZVwjW0K)

INSERT INTO users (email, password_hash, role)
VALUES ('admin@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wvofPnMIHxHuhwJXIzPUhMjZVwjW0K', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment untuk verifikasi setelah menjalankan script

-- SELECT 'users' as table_name, COUNT(*) as row_count FROM users
-- UNION ALL
-- SELECT 'dosen_profiles', COUNT(*) FROM dosen_profiles
-- UNION ALL
-- SELECT 'mahasiswa_profiles', COUNT(*) FROM mahasiswa_profiles
-- UNION ALL
-- SELECT 'course_name', COUNT(*) FROM course_name
-- UNION ALL
-- SELECT 'courses', COUNT(*) FROM courses
-- UNION ALL
-- SELECT 'classes', COUNT(*) FROM classes
-- UNION ALL
-- SELECT 'class_enrollments', COUNT(*) FROM class_enrollments;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'dosen_profiles'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'mahasiswa_profiles'
-- ORDER BY ordinal_position;

