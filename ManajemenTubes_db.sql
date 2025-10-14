    -- Database: unpar_task_management
    -- PostgreSQL Database Structure
    -- Last Updated: October 14, 2025
    -- 
    -- IMPORTANT: This schema includes modifications made via Node.js scripts:
    -- 1. Added komponen and deliverable columns to tugas_besar (via add-columns.js)
    -- 2. Added kelompok management tables (via setup-kelompok-tables.js)

    -- ============================================
    -- DROP TABLES IF EXISTS (urutan terbalik dari dependency)
    -- ============================================

    DROP TABLE IF EXISTS nilai CASCADE;
    DROP TABLE IF EXISTS komponen_penilaian CASCADE;
    DROP TABLE IF EXISTS kelompok_members CASCADE;  -- Updated table name
    DROP TABLE IF EXISTS anggota_kelompok CASCADE;  -- Deprecated, replaced by kelompok_members
    DROP TABLE IF EXISTS kelompok CASCADE;
    DROP TABLE IF EXISTS tugas_besar CASCADE;
    -- DROP TABLE IF EXISTS mata_kuliah CASCADE; -- Deprecated - using courses table
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

    -- Table: mata_kuliah (DEPRECATED - using courses table instead)
    /*
    CREATE TABLE mata_kuliah (
        id SERIAL PRIMARY KEY,
        kode VARCHAR(10) NOT NULL UNIQUE,
        nama VARCHAR(255) NOT NULL,
        semester VARCHAR(6) NOT NULL,
        tahun_ajaran VARCHAR(9) NOT NULL,
        dosen_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    */

    -- Table: tugas_besar
    -- Modified via Node.js script (add-columns.js) to include:
    -- - komponen JSONB column for storing component data
    -- - deliverable JSONB column for storing deliverable data  
    -- - student_choice_enabled, max_group_size, min_group_size for group management
    CREATE TABLE tugas_besar (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        tanggal_mulai DATE NOT NULL,
        tanggal_selesai DATE NOT NULL,
        komponen JSONB DEFAULT '[]' NOT NULL,              -- Added via Node.js script
        deliverable JSONB DEFAULT '[]' NOT NULL,           -- Added via Node.js script
        student_choice_enabled BOOLEAN DEFAULT FALSE,      -- Added via Node.js script
        max_group_size INTEGER DEFAULT 4,                  -- Added via Node.js script
        min_group_size INTEGER DEFAULT 2,                  -- Added via Node.js script
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: kelompok
    -- Enhanced via Node.js script (setup-kelompok-tables.js) to include:
    -- - created_by for tracking who created the group
    -- - creation_method to distinguish between manual, automatic, and student_choice
    CREATE TABLE kelompok (
        id SERIAL PRIMARY KEY,
        tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
        nama_kelompok VARCHAR(100) NOT NULL,
        created_by INTEGER REFERENCES users(id),           -- Added via Node.js script
        creation_method VARCHAR(20) DEFAULT 'manual',      -- Added via Node.js script (manual, automatic, student_choice)
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Table: kelompok_members (Replaces anggota_kelompok)
    -- Created via Node.js script (setup-kelompok-tables.js)
    -- Enhanced group membership tracking with leader designation
    CREATE TABLE kelompok_members (
        id SERIAL PRIMARY KEY,
        kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_leader BOOLEAN DEFAULT FALSE,                    -- Track group leader
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(kelompok_id, user_id)                       -- Prevent duplicate memberships
    );

    -- Table: anggota_kelompok (DEPRECATED)
    -- Replaced by kelompok_members table for enhanced functionality
    -- Kept for reference - should be migrated to kelompok_members
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
    -- Enhanced with new indexes for kelompok_members table
    -- ============================================

    CREATE INDEX idx_dosen_profiles_user_id ON dosen_profiles(user_id);
    CREATE INDEX idx_mahasiswa_profiles_user_id ON mahasiswa_profiles(user_id);
    CREATE INDEX idx_courses_dosen_id ON courses(dosen_id);
    CREATE INDEX idx_classes_course_id ON classes(course_id);
    CREATE INDEX idx_class_enrollments_mahasiswa_id ON class_enrollments(mahasiswa_id);
    CREATE INDEX idx_tugas_besar_course_id ON tugas_besar(course_id);
    CREATE INDEX idx_kelompok_tugas_besar_id ON kelompok(tugas_besar_id);
    CREATE INDEX idx_anggota_kelompok_kelompok_id ON anggota_kelompok(kelompok_id);    -- Deprecated table
    CREATE INDEX idx_kelompok_members_kelompok_id ON kelompok_members(kelompok_id);   -- Added via Node.js script
    CREATE INDEX idx_kelompok_members_user_id ON kelompok_members(user_id);          -- Added via Node.js script
    CREATE INDEX idx_nilai_mahasiswa_id ON nilai(mahasiswa_id);

    -- ============================================
    -- RELATIONSHIPS SUMMARY
    -- Updated to reflect new kelompok_members table and enhanced tugas_besar
    -- ============================================

    /*
    users (parent table)
    ├── dosen_profiles (user_id)
    ├── mahasiswa_profiles (user_id)
    ├── courses (dosen_id)
    ├── classes (dosen_id)
    ├── class_enrollments (mahasiswa_id)
    ├── anggota_kelompok (mahasiswa_id) [DEPRECATED]
    ├── kelompok_members (user_id) [NEW - Enhanced group membership]
    ├── kelompok (created_by) [ENHANCED]
    └── nilai (mahasiswa_id)

    course_name
    └── courses (course_name_id)

    courses
    ├── classes (course_id)
    └── tugas_besar (course_id)

    classes
    └── class_enrollments (class_id)

    tugas_besar [ENHANCED with JSONB columns and group settings]
    ├── kelompok (tugas_besar_id)
    └── komponen_penilaian (tugas_besar_id)

    kelompok [ENHANCED with creation tracking]
    ├── anggota_kelompok (kelompok_id) [DEPRECATED]
    └── kelompok_members (kelompok_id) [NEW]

    komponen_penilaian
    └── nilai (komponen_id)
    */

    -- ============================================
    -- DATABASE MODIFICATION HISTORY
    -- ============================================

    /*
    MODIFICATIONS MADE VIA NODE.JS SCRIPTS:

    1. add-columns.js (executed):
       - Added komponen JSONB column to tugas_besar
       - Added deliverable JSONB column to tugas_besar
       
    2. setup-kelompok-tables.js (executed):
       - Added created_by column to kelompok table
       - Added creation_method column to kelompok table
       - Created kelompok_members table (replaces anggota_kelompok)
       - Added student_choice_enabled column to tugas_besar
       - Added max_group_size column to tugas_besar  
       - Added min_group_size column to tugas_besar
       - Created indexes for new kelompok_members table

    NEW API ENDPOINTS CREATED:
    - /api/kelompok/* routes for group management
    - Support for 3 group creation methods: manual, automatic, student_choice
    
    NEW FEATURES ENABLED:
    - JSONB storage for dynamic component and deliverable data
    - Enhanced group management with leader designation
    - Multiple group creation methods
    - Student self-enrollment capabilities
    - Real-time group membership tracking
    */