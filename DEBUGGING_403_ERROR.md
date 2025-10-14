# Solusi Error 403 Forbidden - Tugas Besar API

## 🔍 **Diagnosa Masalah**
Error 403 Forbidden dengan message "Invalid or expired token" menunjukkan masalah authentication. Setelah investigasi, ditemukan:

1. **Token Authentication**: Backend menggunakan JWT token yang valid
2. **Role Authorization**: Route dosen memerlukan role 'dosen' dalam token
3. **Credentials**: User dosen tersedia dengan credentials yang benar

## ✅ **Solusi yang Telah Disiapkan**

### 1. **Credentials Dosen yang Valid**
- **Email**: `agus.dosen@unpar.ac.id`
- **Password**: `123`
- **Role**: `dosen`
- **User ID**: 22
- **Courses**: Mengajar course_id 11 (Anal Bisnis), 7 (Business Analisis), 6 (Object Oriented Programming)

### 2. **Debug Tools Ditambahkan**
- `src/utils/debugAuth.js` - Debug authentication status
- `src/utils/testLogin.js` - Test login function
- Debug buttons di DosenTaskManagement component

### 3. **Test Functions**
- **Debug Auth**: Check token status dan decode JWT payload
- **Test Login**: Login otomatis dengan credentials yang benar
- **Test API Connection**: Test konektivitas ke backend

## 🚀 **Cara Mengatasi Error**

### Option 1: Login Manual
1. Buka aplikasi di browser
2. Login dengan:
   - Email: `agus.dosen@unpar.ac.id`
   - Password: `123`
3. Navigate ke halaman Courses → pilih course → tab "Tugas Besar Management"

### Option 2: Debug Login (Automatic)
1. Buka halaman Tugas Besar Management
2. Klik button **"Test Login (agus.dosen)"**
3. System akan otomatis login dan reload data

### Option 3: Manual Token Check
1. Klik button **"Debug Auth"** untuk check token status
2. Jika token expired atau invalid, logout dan login ulang

## 🔧 **Technical Details**

### API Endpoints yang Sudah Siap:
- GET `/api/auth/dosen/courses` - List courses untuk dosen
- GET `/api/auth/dosen/courses/:courseId/tugas-besar` - List tugas besar
- POST `/api/auth/dosen/courses/:courseId/tugas-besar` - Create tugas besar
- PUT `/api/auth/dosen/courses/:courseId/tugas-besar/:tugasId` - Update tugas besar
- DELETE `/api/auth/dosen/courses/:courseId/tugas-besar/:tugasId` - Delete tugas besar

### Database Schema yang Sudah Aligned:
- Menggunakan existing `mata_kuliah` table
- Foreign key `mata_kuliah_id` instead of `course_id`
- Kolom yang benar: `judul`, `deskripsi`, `tanggal_selesai`
- Auto-create mata_kuliah record jika belum ada

## 🎯 **Next Steps**

1. **Start Servers**:
   ```bash
   # Backend
   cd server && npm start
   
   # Frontend  
   npm run dev
   ```

2. **Test Login**:
   - Login sebagai `agus.dosen@unpar.ac.id` dengan password `123`
   - Atau gunakan "Test Login" button untuk otomatis

3. **Test CRUD Operations**:
   - Create tugas besar baru
   - View/Edit/Delete existing tugas besar
   - Verify API responses di browser console

## 📝 **Expected Flow**
1. Login successful → JWT token stored
2. Navigate to course → courseId=11 (Anal Bisnis)
3. Click "Tugas Besar Management" tab
4. API call: GET `/api/auth/dosen/courses/11/tugas-besar`
5. Success response dengan list tugas besar

Error 403 seharusnya resolved setelah login dengan credentials yang benar!