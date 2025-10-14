# Database Setup Scripts

This directory contains Node.js scripts for database modifications and setup.

## Scripts Overview

### 1. `add-columns.js`
**Purpose:** Add JSONB columns for dynamic component and deliverable storage

**What it does:**
- Adds `komponen` JSONB column to `tugas_besar` table
- Adds `deliverable` JSONB column to `tugas_besar` table
- Sets default values to empty JSON arrays

**Usage:**
```bash
node add-columns.js
```

**Database Changes:**
```sql
ALTER TABLE tugas_besar ADD COLUMN komponen JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE tugas_besar ADD COLUMN deliverable JSONB DEFAULT '[]' NOT NULL;
```

### 2. `setup-kelompok-tables.js`
**Purpose:** Create enhanced group management system

**What it does:**
- Creates `kelompok_members` table for enhanced group membership
- Enhances `kelompok` table with creation tracking
- Adds group management columns to `tugas_besar`
- Creates necessary indexes for performance

**Usage:**
```bash
node setup-kelompok-tables.js
```

**Database Changes:**
- Creates new `kelompok_members` table
- Adds `created_by`, `creation_method` to `kelompok`
- Adds `student_choice_enabled`, `max_group_size`, `min_group_size` to `tugas_besar`
- Creates performance indexes

### 3. `create-kelompok-tables.sql` (Reference)
**Purpose:** SQL reference for kelompok table structure
- Contains the raw SQL commands used by the Node.js script
- Useful for manual database setup or reference

## Execution Order

**IMPORTANT:** Run scripts in this order:

1. First: `add-columns.js`
2. Second: `setup-kelompok-tables.js`

## Prerequisites

- PostgreSQL database running
- Correct database credentials in environment variables or script
- Node.js and required dependencies installed

## Configuration

All scripts use the following database configuration:
```javascript
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unpar_task_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
});
```

## Environment Variables

Set these environment variables if using non-default values:
- `DB_USER` - Database username
- `DB_HOST` - Database host
- `DB_NAME` - Database name  
- `DB_PASSWORD` - Database password

## Verification

After running scripts, verify changes with:

```sql
-- Check tugas_besar columns
\d tugas_besar

-- Check kelompok_members table
\d kelompok_members

-- Verify indexes
\d+ kelompok_members
```

## Error Handling

Scripts include error handling for:
- Connection issues
- Column already exists
- Permission errors
- Transaction rollbacks

## Rollback Instructions

If you need to undo changes:

```sql
-- Remove added columns from tugas_besar
ALTER TABLE tugas_besar DROP COLUMN IF EXISTS komponen;
ALTER TABLE tugas_besar DROP COLUMN IF EXISTS deliverable;
ALTER TABLE tugas_besar DROP COLUMN IF EXISTS student_choice_enabled;
ALTER TABLE tugas_besar DROP COLUMN IF EXISTS max_group_size;
ALTER TABLE tugas_besar DROP COLUMN IF EXISTS min_group_size;

-- Remove kelompok enhancements
ALTER TABLE kelompok DROP COLUMN IF EXISTS created_by;
ALTER TABLE kelompok DROP COLUMN IF EXISTS creation_method;

-- Drop kelompok_members table
DROP TABLE IF EXISTS kelompok_members CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_kelompok_members_kelompok_id;
DROP INDEX IF EXISTS idx_kelompok_members_user_id;
```

## Integration with Application

These database changes enable:

1. **Dynamic Component Storage**
   - Frontend can add/remove task components
   - No schema changes needed for new component types

2. **Enhanced Group Management**
   - Three group creation methods: manual, automatic, student choice
   - Leader designation and membership tracking
   - Real-time group enrollment capabilities

3. **API Integration**
   - New `/api/kelompok/*` endpoints
   - Enhanced `/api/auth/dosen/*` endpoints for group management

## Troubleshooting

### Common Issues:

1. **"Column already exists" error**
   - Scripts handle this gracefully with `IF NOT EXISTS`
   - Safe to re-run scripts

2. **Permission denied**
   - Ensure database user has CREATE/ALTER privileges
   - Check database connection credentials

3. **Connection timeout**
   - Verify database is running
   - Check host and port configuration

### Debug Mode:

Add debug logging to scripts:
```javascript
console.log('Executing query:', queryText);
```

## Related Files

- `ManajemenTubes_db.sql` - Updated master schema
- `DATABASE_MODIFICATIONS.md` - Detailed documentation
- `src/routes/kelompok.js` - API endpoints using new schema
- `src/utils/kelompokApi.js` - Frontend API utilities