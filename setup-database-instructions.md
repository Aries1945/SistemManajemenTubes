# Database Setup Instructions untuk Device Baru

## Prerequisites
- PostgreSQL 14+ installed
- pgAdmin atau psql client

## Step 1: Buat Database
```sql
CREATE DATABASE unpar_task_management;
CREATE USER task_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE unpar_task_management TO task_admin;
```

## Step 2: Import Schema
**Gunakan file: `ManajemenTubes_db_clean.sql`**

### Via psql (Command Line):
```bash
psql -U task_admin -d unpar_task_management -f ManajemenTubes_db_clean.sql
```

### Via pgAdmin:
1. Buka pgAdmin
2. Connect ke database `unpar_task_management`
3. Tools → Query Tool
4. Open file → pilih `ManajemenTubes_db_clean.sql`
5. Execute (F5)

## Step 3: Verify Installation
```sql
-- Check semua tabel sudah dibuat
\dt

-- Expected tables:
-- users, dosen_profiles, mahasiswa_profiles, courses, classes, 
-- class_enrollments, tugas_besar, kelompok, kelompok_members, dll

-- Check indexes
\di

-- Check functions & triggers
\df
```

## Step 4: Configure Environment
Buat file `.env` di folder `server/`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unpar_task_management
DB_USER=task_admin
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=3000
```

## File SQL yang Tersedia:
- ✅ **`ManajemenTubes_db_clean.sql`** → **GUNAKAN INI untuk setup baru**
- ❌ `ManajemenTubes_db_backup.sql` → File backup dengan dokumentasi (jangan gunakan untuk import)

## Troubleshooting:
- Jika ada error "role does not exist" → Pastikan user `task_admin` sudah dibuat
- Jika ada error "permission denied" → Pastikan GRANT privileges sudah dijalankan
- Jika ada error parsing → Pastikan menggunakan file `_clean.sql`