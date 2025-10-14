# Instruksi Menjalankan Sistem Tugas Besar

## 1. Persiapan Backend
```bash
cd server
npm start
```

## 2. Test Koneksi API (Opsional)
```bash
# Di root directory
node test-api-connection.js
```

## 3. Menjalankan Frontend
```bash
# Di root directory
npm run dev
```

## 4. Login sebagai Dosen
- Buka browser: http://localhost:5173
- Login menggunakan akun dosen
- Navigasi ke halaman "Courses"
- Pilih mata kuliah
- Klik tab "Tugas Besar Management"

## 5. Testing Fitur Tugas Besar

### Membuat Tugas Besar Baru:
1. Klik tombol "Create New Assignment"
2. Isi form:
   - Title: "Tugas Besar 1"
   - Description: "Deskripsi tugas besar"
   - Deadline: Pilih tanggal
   - Max Students per Group: 4
3. Klik "Create Assignment"

### Update/Delete Tugas Besar:
1. Klik icon edit (✏️) untuk update
2. Klik icon delete (🗑️) untuk hapus

## 6. Database Schema yang Digunakan

Sistem ini menggunakan existing database schema:
- `mata_kuliah` table dengan `course_id` foreign key
- `tugas_besar` table dengan `mata_kuliah_id` foreign key
- Kolom yang digunakan: `judul`, `deskripsi`, `tanggal_selesai`, `tanggal_mulai`

## 7. API Endpoints

### Dosen Routes:
- GET `/api/auth/dosen/courses` - Get courses for dosen
- GET `/api/auth/dosen/courses/:courseId/tugas-besar` - Get tugas besar for course
- POST `/api/auth/dosen/courses/:courseId/tugas-besar` - Create new tugas besar
- PUT `/api/auth/dosen/courses/:courseId/tugas-besar/:tugasId` - Update tugas besar
- DELETE `/api/auth/dosen/courses/:courseId/tugas-besar/:tugasId` - Delete tugas besar

## 8. Troubleshooting

### Error: ERR_CONNECTION_REFUSED
- Pastikan backend server berjalan di port 5001
- Check dengan: `netstat -an | findstr :5001`

### Error: Database connection
- Pastikan PostgreSQL berjalan
- Check connection string di `.env` file

### Error: 401 Unauthorized
- Pastikan sudah login sebagai dosen
- Check JWT token di localStorage

### Error: Tugas besar not found
- Pastikan `mata_kuliah` record exists untuk course
- System akan otomatis create jika belum ada

## 9. File yang Telah Dimodifikasi

### Frontend:
- `src/utils/tugasBesarApi.js` - API base URL updated ke port 5001
- `src/components/DosenTaskManagement.jsx` - Komponen UI untuk tugas besar

### Backend:
- `server/src/server.js` - Added dosen routes
- `server/src/routes/dosen.js` - Tugas besar CRUD routes dengan existing schema
- Schema alignment ke existing database tables

## 10. Next Steps

Setelah sistem berjalan, Anda bisa:
1. Test complete workflow create/read/update/delete tugas besar
2. Implement fitur grup management
3. Add student view untuk melihat tugas besar
4. Implement progress tracking

Semua perubahan telah disesuaikan dengan existing database schema dan tidak memerlukan migrasi database baru.