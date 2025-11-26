# Menambahkan Kolom class_id ke Tabel tugas_besar

## Masalah
Tabel `tugas_besar` di database Anda (`ManajemenTubes_db_clean.sql`) tidak memiliki kolom `class_id`, sedangkan aplikasi memerlukan kolom ini untuk mengasosiasikan tugas besar dengan kelas tertentu.

## Solusi
Jalankan script SQL `add-class-id-to-tugas-besar.sql` untuk menambahkan kolom `class_id` ke tabel `tugas_besar`.

## Cara Menjalankan

### Menggunakan pgAdmin:
1. Buka pgAdmin
2. Connect ke database Anda
3. Klik kanan pada database → Query Tool
4. Copy-paste isi file `add-class-id-to-tugas-besar.sql`
5. Klik Execute (F5)

### Menggunakan psql:
```bash
psql -U your_username -d your_database_name -f add-class-id-to-tugas-besar.sql
```

## Verifikasi
Setelah menjalankan script, verifikasi dengan query berikut:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'tugas_besar' 
AND column_name = 'class_id';
```

Jika berhasil, Anda akan melihat kolom `class_id` dengan tipe `integer`.

## Catatan
- Script ini aman dijalankan beberapa kali (menggunakan `IF NOT EXISTS`)
- Script ini tidak akan menghapus data yang sudah ada
- Setelah menambahkan kolom, tugas besar yang sudah ada akan memiliki `class_id = NULL`
- Anda perlu mengupdate tugas besar yang sudah ada untuk mengasosiasikannya dengan kelas tertentu

