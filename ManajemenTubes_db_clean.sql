DROP TABLE IF EXISTS nilai CASCADE;
DROP TABLE IF EXISTS komponen_penilaian CASCADE;
DROP TABLE IF EXISTS kelompok_members CASCADE;
DROP TABLE IF EXISTS anggota_kelompok CASCADE;
DROP TABLE IF EXISTS kelompok CASCADE;
DROP TABLE IF EXISTS tugas_besar CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_name CASCADE;
DROP TABLE IF EXISTS mahasiswa_profiles CASCADE;
DROP TABLE IF EXISTS dosen_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM (
    'admin',
    'dosen',
    'mahasiswa'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dosen_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nip VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    departemen VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE course_name (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    sks INTEGER NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE class_enrollments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    nilai_akhir NUMERIC(5,2),
    enrolled_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, mahasiswa_id)
);

CREATE TABLE tugas_besar (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    dosen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    komponen JSONB DEFAULT '[]' NOT NULL,
    deliverable JSONB DEFAULT '[]' NOT NULL,
    grouping_method VARCHAR(20) DEFAULT 'manual' NOT NULL,
    student_choice_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    max_group_size INTEGER DEFAULT 4 NOT NULL CHECK (max_group_size > 0),
    min_group_size INTEGER DEFAULT 2 NOT NULL CHECK (min_group_size > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_group_sizes CHECK (min_group_size <= max_group_size),
    CONSTRAINT valid_dates CHECK (tanggal_mulai <= tanggal_selesai),
    CONSTRAINT valid_grouping_method CHECK (grouping_method IN ('manual', 'automatic', 'student_choice', 'random'))
);

CREATE TABLE kelompok (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
    nama_kelompok VARCHAR(100) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    creation_method VARCHAR(20) DEFAULT 'manual',
    max_members INTEGER DEFAULT 4,
    is_student_choice BOOLEAN DEFAULT FALSE,
    leader_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kelompok_tugas (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
    nama_kelompok VARCHAR(100) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    creation_method VARCHAR(20) DEFAULT 'manual',
    max_members INTEGER DEFAULT 4,
    is_student_choice BOOLEAN DEFAULT FALSE,
    leader_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kelompok_members (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kelompok_id, user_id)
);

CREATE TABLE anggota_kelompok (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER REFERENCES kelompok_tugas(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE komponen_penilaian (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    bobot NUMERIC(5,2) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nilai (
    id SERIAL PRIMARY KEY,
    komponen_id INTEGER REFERENCES komponen_penilaian(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER REFERENCES users(id),
    nilai NUMERIC(5,2) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dosen_profiles_user_id ON dosen_profiles(user_id);
CREATE INDEX idx_mahasiswa_profiles_user_id ON mahasiswa_profiles(user_id);
CREATE INDEX idx_dosen_profiles_nip ON dosen_profiles(nip);
CREATE INDEX idx_mahasiswa_profiles_nim ON mahasiswa_profiles(nim);

CREATE INDEX idx_courses_dosen_id ON courses(dosen_id);
CREATE INDEX idx_courses_kode ON courses(kode);
CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_dosen_id ON classes(dosen_id);
CREATE INDEX idx_class_enrollments_mahasiswa_id ON class_enrollments(mahasiswa_id);
CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);

CREATE INDEX idx_tugas_besar_course_id ON tugas_besar(course_id);
CREATE INDEX idx_tugas_besar_dosen_id ON tugas_besar(dosen_id);
CREATE INDEX idx_tugas_besar_grouping_method ON tugas_besar(grouping_method);
CREATE INDEX idx_tugas_besar_dates ON tugas_besar(tanggal_mulai, tanggal_selesai);

CREATE INDEX idx_kelompok_tugas_besar_id ON kelompok(tugas_besar_id);
CREATE INDEX idx_kelompok_created_by ON kelompok(created_by);
CREATE INDEX idx_kelompok_members_kelompok_id ON kelompok_members(kelompok_id);
CREATE INDEX idx_kelompok_members_user_id ON kelompok_members(user_id);
CREATE INDEX idx_kelompok_members_leader ON kelompok_members(is_leader);

CREATE INDEX idx_komponen_penilaian_tugas_id ON komponen_penilaian(tugas_besar_id);
CREATE INDEX idx_nilai_mahasiswa_id ON nilai(mahasiswa_id);
CREATE INDEX idx_nilai_komponen_id ON nilai(komponen_id);

CREATE INDEX idx_anggota_kelompok_kelompok_id ON anggota_kelompok(kelompok_id);

CREATE OR REPLACE FUNCTION ensure_grouping_consistency()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grouping_method = 'student_choice' THEN
        NEW.student_choice_enabled = true;
    ELSE
        NEW.student_choice_enabled = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_grouping_consistency
    BEFORE INSERT OR UPDATE ON tugas_besar
    FOR EACH ROW
    EXECUTE FUNCTION ensure_grouping_consistency();

CREATE OR REPLACE FUNCTION validate_group_size()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.min_group_size > NEW.max_group_size THEN
        RAISE EXCEPTION 'Minimum group size (%) cannot be greater than maximum group size (%)', 
                      NEW.min_group_size, NEW.max_group_size;
    END IF;
    
    IF NEW.min_group_size <= 0 OR NEW.max_group_size <= 0 THEN
        RAISE EXCEPTION 'Group sizes must be positive integers';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_group_size
    BEFORE INSERT OR UPDATE ON tugas_besar
    FOR EACH ROW
    EXECUTE FUNCTION validate_group_size();

UPDATE tugas_besar 
SET student_choice_enabled = CASE 
    WHEN grouping_method = 'student_choice' THEN true 
    ELSE false 
END
WHERE (grouping_method = 'student_choice') != (student_choice_enabled = true);