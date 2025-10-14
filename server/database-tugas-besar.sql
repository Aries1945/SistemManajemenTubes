-- Database Schema for Tugas Besar Feature
-- Execute these queries in PostgreSQL

-- Tabel untuk menyimpan tugas besar
CREATE TABLE tugas_besar (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    dosen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,
    max_students_per_group INTEGER DEFAULT 4,
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan tugas progres dalam tugas besar
CREATE TABLE tugas_progres (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER NOT NULL REFERENCES tugas_besar(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,
    weight INTEGER DEFAULT 0, -- bobot nilai dalam persen
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk kelompok tugas besar
CREATE TABLE kelompok_tugas (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER NOT NULL REFERENCES tugas_besar(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk anggota kelompok
CREATE TABLE anggota_kelompok (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER NOT NULL REFERENCES kelompok_tugas(id) ON DELETE CASCADE,
    mahasiswa_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- leader, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kelompok_id, mahasiswa_id)
);

-- Tabel untuk pengumpulan tugas progres
CREATE TABLE pengumpulan_progres (
    id SERIAL PRIMARY KEY,
    tugas_progres_id INTEGER NOT NULL REFERENCES tugas_progres(id) ON DELETE CASCADE,
    kelompok_id INTEGER NOT NULL REFERENCES kelompok_tugas(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, graded, returned
    score INTEGER, -- nilai 0-100
    feedback TEXT
);

-- Index untuk optimasi query
CREATE INDEX idx_tugas_besar_course ON tugas_besar(course_id);
CREATE INDEX idx_tugas_besar_dosen ON tugas_besar(dosen_id);
CREATE INDEX idx_tugas_progres_tugas ON tugas_progres(tugas_besar_id);
CREATE INDEX idx_kelompok_tugas_besar ON kelompok_tugas(tugas_besar_id);
CREATE INDEX idx_anggota_kelompok ON anggota_kelompok(kelompok_id);
CREATE INDEX idx_pengumpulan_progres ON pengumpulan_progres(tugas_progres_id);

-- Sample data untuk testing
INSERT INTO tugas_besar (course_id, dosen_id, title, description, deadline, max_students_per_group, status) VALUES
(1, 2, 'Sistem E-Commerce', 'Membuat aplikasi e-commerce dengan fitur lengkap menggunakan teknologi web modern', '2024-12-15 23:59:59', 4, 'active'),
(1, 2, 'Aplikasi Mobile Learning', 'Membuat aplikasi mobile untuk pembelajaran online dengan React Native', '2024-12-20 23:59:59', 3, 'draft');

INSERT INTO tugas_progres (tugas_besar_id, title, description, deadline, weight) VALUES
(1, 'Proposal dan Analisis Kebutuhan', 'Membuat proposal proyek dan analisis kebutuhan sistem', '2024-10-20 23:59:59', 15),
(1, 'Desain UI/UX dan Database', 'Membuat wireframe, mockup, dan desain database', '2024-11-10 23:59:59', 20),
(1, 'Implementasi Backend', 'Mengembangkan API dan sistem backend', '2024-11-25 23:59:59', 30),
(1, 'Implementasi Frontend', 'Mengembangkan antarmuka pengguna', '2024-12-05 23:59:59', 25),
(1, 'Testing dan Deployment', 'Testing sistem dan deployment aplikasi', '2024-12-15 23:59:59', 10);