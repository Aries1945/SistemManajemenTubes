# Troubleshooting Import Mahasiswa

## Error yang Sudah Diperbaiki

### ❌ Error: "current transaction is aborted, commands ignored until end of transaction block"

**Penyebab:**
- Transaction PostgreSQL menjadi aborted ketika ada error di salah satu query dalam loop
- Semua query selanjutnya dalam transaction yang sama akan gagal

**Solusi yang Diterapkan:**
✅ Mengubah bulk import dari single transaction menjadi individual transaction per mahasiswa
✅ Setiap mahasiswa diproses dalam transaction terpisah
✅ Error di satu mahasiswa tidak mempengaruhi pemrosesan mahasiswa lainnya

### 🔧 Perubahan yang Dibuat:

**Sebelum (Bermasalah):**
```javascript
await client.query('BEGIN'); // Single transaction for all students
for (let i = 0; i < students.length; i++) {
  // Process student - jika error, semua selanjutnya gagal
}
await client.query('COMMIT');
```

**Sesudah (Fixed):**
```javascript
for (let i = 0; i < students.length; i++) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Transaction per student
    // Process individual student
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    // Log error untuk student ini saja
  } finally {
    client.release();
  }
}
```

## Validasi yang Ditambahkan

### ✅ Validasi Email
- Format email yang benar
- Maksimal 255 karakter
- Unique (tidak boleh duplikat)

### ✅ Validasi NIM
- Wajib diisi
- Maksimal 10 karakter
- Unique (tidak boleh duplikat)

### ✅ Validasi Nama Lengkap
- Wajib diisi
- Maksimal 255 karakter

### ✅ Error Handling yang Lebih Detail
- Error specific per baris
- Database constraint error handling
- Detailed error messages

## Testing

### Manual Test Cases:

1. **Valid Data** ✅
   ```json
   {
     "email": "test@student.com",
     "nim": "2024001",
     "nama_lengkap": "Test Student",
     "angkatan": "2024"
   }
   ```

2. **Invalid Email** ❌
   ```json
   {
     "email": "invalid-email",
     "nim": "2024002",
     "nama_lengkap": "Test Student 2"
   }
   ```
   **Expected:** Error "Invalid email format"

3. **NIM Too Long** ❌
   ```json
   {
     "email": "test3@student.com",
     "nim": "12345678901",
     "nama_lengkap": "Test Student 3"
   }
   ```
   **Expected:** Error "NIM cannot exceed 10 characters"

4. **Duplicate Email** ❌
   ```json
   [
     {"email": "same@student.com", "nim": "001", "nama_lengkap": "Student 1"},
     {"email": "same@student.com", "nim": "002", "nama_lengkap": "Student 2"}
   ]
   ```
   **Expected:** First success, second error "Email already exists"

## Response Format

### Successful Response:
```json
{
  "message": "Bulk import completed. 3 students created, 2 errors",
  "users": [
    {
      "id": 123,
      "email": "student1@test.com",
      "role": "mahasiswa",
      "nim": "2024001",
      "nama_lengkap": "Student 1",
      "angkatan": "2024",
      "is_active": true
    }
  ],
  "errors": [
    {
      "row": 3,
      "data": {"email": "invalid", "nim": "003"},
      "error": "Invalid email format"
    }
  ],
  "summary": {
    "total": 5,
    "successful": 3,
    "failed": 2
  }
}
```

## Frontend Handling

### ✅ Error Display
- Menampilkan jumlah berhasil dan gagal
- Detail error per baris
- Success message untuk import partial

### ✅ User Experience
- Loading state during import
- Clear error messages
- Option to review and retry failed items

## Monitoring & Logs

### Server Logs
```bash
# Check server logs for detailed error info
tail -f server.log

# Look for patterns like:
Error creating student 6: error: current transaction is aborted
```

### Database Monitoring
```sql
-- Check for any orphaned transactions
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';

-- Check recent insertions
SELECT * FROM users WHERE created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC;
```

## Best Practices

### 📝 For Admins:
1. Download template baru setiap kali import
2. Validasi data di Excel sebelum upload
3. Test dengan data kecil terlebih dahulu
4. Review error list dan perbaiki data yang gagal

### 🔧 For Developers:
1. Always use individual transactions for bulk operations
2. Provide detailed error messages per item
3. Log errors for debugging
4. Implement proper rollback mechanisms
5. Test with various edge cases

### 📊 Performance Considerations:
- Batch size: Recommend max 100 students per import
- Connection pooling: Each student uses separate connection briefly
- Memory usage: Process sequentially to avoid memory spikes

## Recovery Procedures

### Jika Import Gagal Total:
1. Check server logs untuk root cause
2. Verify database connection
3. Test dengan single student first
4. Check admin permissions

### Jika Import Partial:
1. Review error list dalam response
2. Perbaiki data yang gagal
3. Import ulang dengan data yang sudah diperbaiki
4. Verify hasil akhir di database

---

**Status:** ✅ Fixed and Ready for Production
**Last Updated:** December 2024
**Version:** 2.0