# 🗄️ Database Schema Documentation

## 📋 Overview
This document describes the cleaned and consolidated database schema for the UNPAR Task Management System.

## 🧹 Database Cleanup Summary

### ✅ **Consolidated Files**
- **`clean-database-schema.sql`** - Complete, clean database schema
- **`backup-sql-files/`** - Backup of removed files

### ❌ **Removed Deprecated Files**
1. `database-tugas-besar.sql` - Outdated schema, merged into clean schema
2. `create-kelompok-tables.sql` - Kelompok tables now in main schema

### 🗑️ **Deprecated Tables Removed**
1. **`mata_kuliah`** - Replaced by `courses` with proper `course_name` relationship
2. **`tugas_progres`** - Replaced by JSONB `komponen` in `tugas_besar`
3. **`anggota_kelompok`** - Replaced by `kelompok_members` with enhanced features
4. **`kelompok_tugas`** - Renamed to `kelompok` for clarity
5. **`pengumpulan_progres`** - Not implemented, can be added if needed

### ✅ **Tables Retained and Enhanced**
1. **`course_name`** - Master data mata kuliah (daftar mata kuliah yang tersedia)
2. **`courses`** - Relasi mata kuliah dengan dosen koordinator (siapa yang mengajar)

## 🏗️ Current Database Structure

### 👤 **User Management**
```
users (authentication)
├── dosen_profiles (faculty details)
└── mahasiswa_profiles (student details)
```

### 📚 **Course Management**
```
course_name (master data mata kuliah)
└── courses (relasi dengan dosen koordinator)
    ├── classes (class sections)
    └── class_enrollments (student enrollments)
```

### 📝 **Project Management**
```
tugas_besar (projects with JSONB components)
├── kelompok (groups)
└── kelompok_members (group membership with leader support)
```

### 📊 **Assessment (Optional)**
```
komponen_penilaian (deprecated - use JSONB instead)
└── nilai (grades)
```

## ✨ **Enhanced Features**

### 1. **JSONB Storage**
- **`tugas_besar.komponen`** - Flexible component storage
- **`tugas_besar.deliverable`** - Deliverable specifications
- **Format**: `[{"name": "Proposal", "weight": 20, "deadline": "2025-10-25"}]`

### 2. **Enhanced Group Management**
- **`kelompok.creation_method`** - Track how group was created (manual/automatic/student_choice)
- **`kelompok.created_by`** - Who created the group
- **`kelompok_members.is_leader`** - Leader designation

### 3. **Student Choice Support**
- **`tugas_besar.student_choice_enabled`** - Enable student self-enrollment
- **`tugas_besar.max_group_size`** - Maximum group size
- **`tugas_besar.min_group_size`** - Minimum group size

## 🚀 **Usage Instructions**

### **1. Apply Clean Schema**
```bash
# Backup current database first
pg_dump unpar_task_management > backup_$(date +%Y%m%d).sql

# Apply clean schema
psql -d unpar_task_management -f clean-database-schema.sql
```

### **2. Data Migration (if needed)**
If you have existing data in deprecated tables:

```sql
-- Migrate course_name to courses (if data exists)
-- Migrate anggota_kelompok to kelompok_members (if data exists)
-- Convert existing components to JSONB format
```

### **3. Verify Schema**
```sql
-- Check table structure
\dt

-- Verify JSONB data
SELECT id, title, komponen::text FROM tugas_besar WHERE komponen IS NOT NULL;

-- Check group membership
SELECT k.nama_kelompok, km.user_id, km.is_leader 
FROM kelompok k 
JOIN kelompok_members km ON k.id = km.kelompok_id;
```

## 📈 **Performance Optimizations**

### **Indexes Added**
- User profile lookups (NIP, NIM)
- Course and class relationships
- Tugas besar date ranges and status
- Group membership queries
- Assessment lookups

### **JSONB Benefits**
- Flexible component structure
- No need for separate tables
- Better performance for component queries
- Schema evolution without migrations

## 🔧 **Maintenance Queries**

### **Check Database Health**
```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"')) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') DESC;

-- Foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public';
```

### **JSONB Component Queries**
```sql
-- Find tugas with specific component
SELECT title, komponen 
FROM tugas_besar 
WHERE komponen @> '[{"name": "Proposal"}]';

-- Extract component weights
SELECT 
    title,
    jsonb_array_elements(komponen)->>'name' as component_name,
    (jsonb_array_elements(komponen)->>'weight')::int as weight
FROM tugas_besar 
WHERE komponen != '[]';
```

## 📊 **Schema Statistics**

- **Total Tables**: 11 (down from ~15)
- **Deprecated Tables Removed**: 6
- **Enhanced Tables**: 3 (tugas_besar, kelompok, kelompok_members)
- **JSONB Columns**: 2 (komponen, deliverable)
- **New Indexes**: 15+

## 🎯 **Benefits of Cleanup**

1. **Simplified Structure** - Fewer tables to maintain
2. **Better Performance** - Optimized indexes and JSONB storage
3. **Flexibility** - JSONB allows schema evolution
4. **Clarity** - Clear table purposes and relationships
5. **Maintainability** - Single source of truth for schema

## 🚨 **Important Notes**

1. **Backup First** - Always backup before applying schema changes
2. **Test Migration** - Test with sample data before production
3. **API Updates** - Update API routes to use new schema
4. **Documentation** - Keep this documentation updated with changes

---
*Last Updated: October 14, 2025*
*Database Schema Version: 2.0 (Cleaned)*