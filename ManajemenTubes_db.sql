    -- Database: unpar_task_management
    -- PostgreSQL Database Structure

    -- ============================================
    -- DROP TABLES IF EXISTS (urutan terbalik dari dependency)
    -- ============================================

    DROP TABLE IF EXISTS nilai CASCADE;
    DROP TABLE IF EXISTS komponen_penilaian CASCADE;
    DROP TABLE IF EXISTS anggota_kelompok CASCADE;
    DROP TABLE IF EXISTS kelompok CASCADE;
    DROP TABLE IF EXISTS tugas_besar CASCADE;
    DROP TABLE IF EXISTS mata_kuliah CASCADE;
    DROP TABLE IF EXISTS class_enrollments CASCADE;
    DROP TABLE IF EXISTS classes CASCADE;
    DROP TABLE IF EXISTS courses CASCADE;
    DROP TABLE IF EXISTS course_name CASCADE;
    DROP TABLE IF EXISTS mahasiswa_profiles CASCADE;
    DROP TABLE IF EXISTS dosen_profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- Drop type
    DROP TYPE IF EXISTS user_role CASCADE;

    -- ============================================
    -- ENUM TYPE
    -- ============================================

    CREATE TYPE user_role AS ENUM (
        'admin',
        'dosen',
        'mahasiswa'
    );

    -- ============================================
    -- TABLES
    -- ============================================

    -- Table: users
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: dosen_profiles
    CREATE TABLE dosen_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        nip VARCHAR(20) NOT NULL UNIQUE,
        nama_lengkap VARCHAR(255) NOT NULL,
        departemen VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: mahasiswa_profiles
    CREATE TABLE mahasiswa_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        nim VARCHAR(10) NOT NULL UNIQUE,
        nama_lengkap VARCHAR(255) NOT NULL,
        angkatan VARCHAR(4) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: course_name
    CREATE TABLE course_name (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(20) NOT NULL UNIQUE,
        nama VARCHAR(255) NOT NULL,
        sks INTEGER NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: courses
    CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(20) NOT NULL UNIQUE,
        nama VARCHAR(255) NOT NULL,
        sks INTEGER NOT NULL,
        dosen_id INTEGER REFERENCES users(id),
        semester VARCHAR(50),
        tahun_ajaran VARCHAR(20),
        deskripsi TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        course_name_id INTEGER REFERENCES course_name(id)
    );

    -- Table: classes
    CREATE TABLE classes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        dosen_id INTEGER REFERENCES users(id),
        nama VARCHAR(100) NOT NULL,
        kode VARCHAR(20),
        kapasitas INTEGER DEFAULT 40,
        ruangan VARCHAR(50),
        jadwal VARCHAR(100),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: class_enrollments
    CREATE TABLE class_enrollments (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        mahasiswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        nilai_akhir NUMERIC(5,2),
        enrolled_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(class_id, mahasiswa_id)
    );

    -- Table: mata_kuliah
    CREATE TABLE mata_kuliah (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(10) NOT NULL UNIQUE,
        nama VARCHAR(255) NOT NULL,
        semester VARCHAR(6) NOT NULL,
        tahun_ajaran VARCHAR(9) NOT NULL,
        dosen_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: tugas_besar
    CREATE TABLE tugas_besar (
        id SERIAL PRIMARY KEY,
        mata_kuliah_id INTEGER REFERENCES mata_kuliah(id) ON DELETE CASCADE,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        tanggal_mulai DATE NOT NULL,
        tanggal_selesai DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: kelompok
    CREATE TABLE kelompok (
        id SERIAL PRIMARY KEY,
        tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
        nama_kelompok VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: anggota_kelompok
    CREATE TABLE anggota_kelompok (
        id SERIAL PRIMARY KEY,
        kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
        mahasiswa_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: komponen_penilaian
    CREATE TABLE komponen_penilaian (
        id SERIAL PRIMARY KEY,
        tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
        nama VARCHAR(100) NOT NULL,
        bobot NUMERIC(5,2) NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: nilai
    CREATE TABLE nilai (
        id SERIAL PRIMARY KEY,
        komponen_id INTEGER REFERENCES komponen_penilaian(id) ON DELETE CASCADE,
        mahasiswa_id INTEGER REFERENCES users(id),
        nilai NUMERIC(5,2) NOT NULL,
        catatan TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================
    -- INDEXES (Optional - untuk optimasi query)
    -- ============================================

    CREATE INDEX idx_dosen_profiles_user_id ON dosen_profiles(user_id);
    CREATE INDEX idx_mahasiswa_profiles_user_id ON mahasiswa_profiles(user_id);
    CREATE INDEX idx_courses_dosen_id ON courses(dosen_id);
    CREATE INDEX idx_classes_course_id ON classes(course_id);
    CREATE INDEX idx_class_enrollments_mahasiswa_id ON class_enrollments(mahasiswa_id);
    CREATE INDEX idx_tugas_besar_mata_kuliah_id ON tugas_besar(mata_kuliah_id);
    CREATE INDEX idx_kelompok_tugas_besar_id ON kelompok(tugas_besar_id);
    CREATE INDEX idx_anggota_kelompok_kelompok_id ON anggota_kelompok(kelompok_id);
    CREATE INDEX idx_nilai_mahasiswa_id ON nilai(mahasiswa_id);

    -- ============================================
    -- RELATIONSHIPS SUMMARY
    -- ============================================

    /*
    users (parent table)
    ├── dosen_profiles (user_id)
    ├── mahasiswa_profiles (user_id)
    ├── courses (dosen_id)
    ├── classes (dosen_id)
    ├── class_enrollments (mahasiswa_id)
    ├── mata_kuliah (dosen_id)
    ├── anggota_kelompok (mahasiswa_id)
    └── nilai (mahasiswa_id)

    course_name
    └── courses (course_name_id)

    courses
    └── classes (course_id)

    classes
    └── class_enrollments (class_id)

    mata_kuliah
    └── tugas_besar (mata_kuliah_id)

    tugas_besar
    ├── kelompok (tugas_besar_id)
    └── komponen_penilaian (tugas_besar_id)

    kelompok
    └── anggota_kelompok (kelompok_id)

    komponen_penilaian
    └── nilai (komponen_id)
    */