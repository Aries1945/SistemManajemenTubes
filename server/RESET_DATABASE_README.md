# 🔄 Reset Database - Panduan Lengkap

Script ini akan **menghapus semua tabel** dan membuat ulang dengan schema yang benar sesuai dengan perubahan yang sudah dilakukan.

## ⚠️ PERINGATAN PENTING

**Script ini akan menghapus SEMUA DATA yang ada di database!**
- Semua user (kecuali admin default)
- Semua dosen
- Semua mahasiswa
- Semua mata kuliah
- Semua kelas
- Semua data lainnya

**Pastikan untuk backup database sebelum menjalankan script ini!**

## 📋 Schema yang Akan Dibuat

### ✅ Tabel yang Akan Dibuat:

1. **users** - Tabel untuk authentication
   - `id`, `email`, `password_hash`, `role`, `created_at`, `updated_at`
   - **TIDAK ada** kolom `is_active` (ada di profile tables)

2. **dosen_profiles** - Profile dosen
   - `id`, `user_id`, `nip`, `nama_lengkap`, `is_active`, `created_at`, `updated_at`
   - **TIDAK ada** kolom `departemen`

3. **mahasiswa_profiles** - Profile mahasiswa
   - `id`, `user_id`, `nim`, `nama_lengkap`, `is_active`, `created_at`, `updated_at`
   - **TIDAK ada** kolom `angkatan`
   - **Note**: Kolom di database tetap bernama `nim` (bukan `npm`), tapi frontend menggunakan `npm`

4. **course_name** - Master data mata kuliah

5. **courses** - Mata kuliah yang ditawarkan

6. **classes** - Kelas untuk setiap course
   - **TIDAK ada** kolom `ruangan` dan `jadwal`

7. **class_enrollments** - Pendaftaran mahasiswa ke kelas

## 🚀 Cara Menjalankan

### Cara 1: Menggunakan pgAdmin (Recommended)

1. Buka **pgAdmin**
2. Connect ke database Anda
3. Klik kanan pada database → **Query Tool**
4. Buka file `reset-database.sql`
5. Copy seluruh isi file
6. Paste ke Query Tool
7. Klik **Execute** (F5)

### Cara 2: Menggunakan psql (Command Line)

```bash
psql -U your_username -d your_database_name -f reset-database.sql
```

Contoh:
```bash
psql -U postgres -d manajemen_tubes_db -f reset-database.sql
```

### Cara 3: Copy-Paste Query Langsung

1. Buka file `reset-database.sql`
2. Copy seluruh isi
3. Paste ke pgAdmin Query Tool atau psql
4. Execute

## ✅ Verifikasi Setelah Reset

Setelah menjalankan script, verifikasi dengan query berikut:

```sql
-- Cek jumlah data di setiap tabel
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'dosen_profiles', COUNT(*) FROM dosen_profiles
UNION ALL
SELECT 'mahasiswa_profiles', COUNT(*) FROM mahasiswa_profiles;

-- Cek struktur tabel dosen_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dosen_profiles'
ORDER BY ordinal_position;

-- Cek struktur tabel mahasiswa_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mahasiswa_profiles'
ORDER BY ordinal_position;
```

## 🔐 Default Admin User

Setelah reset, akan ada default admin user:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

**PENTING**: Ganti password admin setelah login pertama kali!

## 📝 Setelah Reset

1. **Restart backend server**:
   ```bash
   cd SistemManajemenTubes/server
   npm start
   ```

2. **Login dengan admin default**:
   - Email: `admin@example.com`
   - Password: `admin123`

3. **Tambah data dosen dan mahasiswa** melalui halaman admin

4. **Verifikasi data muncul** di halaman "Manajemen User"

## 🐛 Troubleshooting

### Error: "relation already exists"
- Pastikan semua tabel sudah di-drop
- Cek apakah ada foreign key constraints yang masih ada
- Jalankan DROP TABLE dengan CASCADE

### Error: "permission denied"
- Pastikan user database memiliki permission untuk DROP dan CREATE
- Gunakan user dengan role superuser atau owner database

### Data tidak muncul setelah reset
- Pastikan backend server sudah di-restart
- Cek console backend untuk error
- Verifikasi struktur tabel dengan query di atas

## 📞 Support

Jika ada masalah, cek:
1. Console backend server untuk error messages
2. Browser console untuk error frontend
3. Database logs untuk error SQL

