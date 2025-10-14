-- Script untuk membuat tabel kelompok dan kelompok_members

-- Table: kelompok
CREATE TABLE IF NOT EXISTS kelompok (
    id SERIAL PRIMARY KEY,
    tugas_besar_id INTEGER REFERENCES tugas_besar(id) ON DELETE CASCADE,
    nama_kelompok VARCHAR(100) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    creation_method VARCHAR(20) DEFAULT 'manual', -- 'manual', 'automatic', 'student_choice'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: kelompok_members
CREATE TABLE IF NOT EXISTS kelompok_members (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kelompok_id, user_id)
);

-- Add columns to tugas_besar for student choice mode
ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS student_choice_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS max_group_size INTEGER DEFAULT 4;
ALTER TABLE tugas_besar ADD COLUMN IF NOT EXISTS min_group_size INTEGER DEFAULT 2;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kelompok_tugas_besar_id ON kelompok(tugas_besar_id);
CREATE INDEX IF NOT EXISTS idx_kelompok_members_kelompok_id ON kelompok_members(kelompok_id);
CREATE INDEX IF NOT EXISTS idx_kelompok_members_user_id ON kelompok_members(user_id);

-- Comments
COMMENT ON TABLE kelompok IS 'Table untuk menyimpan data kelompok mahasiswa';
COMMENT ON TABLE kelompok_members IS 'Table untuk menyimpan anggota kelompok';
COMMENT ON COLUMN kelompok.creation_method IS 'Metode pembuatan kelompok: manual, automatic, student_choice';
COMMENT ON COLUMN kelompok_members.is_leader IS 'Menandakan apakah user adalah ketua kelompok';