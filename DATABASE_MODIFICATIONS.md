# Database Modifications Documentation

## Overview
Dokumen ini mencatat semua modifikasi database yang dilakukan melalui Node.js scripts untuk sistem manajemen tugas besar UNPAR.

**Last Updated:** October 14, 2025  
**Database:** unpar_task_management  
**Schema Version:** 2.0 (Enhanced Group Management)

---

## Modification History

### 1. Component and Deliverable Enhancement
**Script:** `add-columns.js`  
**Executed:** October 14, 2025  
**Purpose:** Enable dynamic storage of task components and deliverables

#### Changes Made:
```sql
ALTER TABLE tugas_besar ADD COLUMN komponen JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE tugas_besar ADD COLUMN deliverable JSONB DEFAULT '[]' NOT NULL;
```

#### Impact:
- Tugas besar can now store flexible component data as JSON
- Deliverables are stored as JSON arrays
- Frontend can dynamically add/remove components without schema changes
- Supports complex component structures with weights, deadlines, etc.

#### JSON Structure Examples:
```json
// komponen field
[
  {
    "name": "Proposal",
    "weight": 20,
    "deadline": "2024-11-15"
  },
  {
    "name": "Progress Report 1", 
    "weight": 30,
    "deadline": "2024-12-01"
  }
]

// deliverable field
[
  "Source Code",
  "Documentation", 
  "Presentation Slides"
]
```

---

### 2. Group Management System
**Script:** `setup-kelompok-tables.js`  
**Executed:** October 14, 2025  
**Purpose:** Implement comprehensive group management with multiple creation methods

#### New Tables Created:

##### kelompok_members
```sql
CREATE TABLE kelompok_members (
    id SERIAL PRIMARY KEY,
    kelompok_id INTEGER REFERENCES kelompok(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kelompok_id, user_id)
);
```

#### Enhanced Existing Tables:

##### kelompok table enhancements:
```sql
ALTER TABLE kelompok ADD COLUMN created_by INTEGER REFERENCES users(id);
ALTER TABLE kelompok ADD COLUMN creation_method VARCHAR(20) DEFAULT 'manual';
```

##### tugas_besar table enhancements:
```sql
ALTER TABLE tugas_besar ADD COLUMN student_choice_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE tugas_besar ADD COLUMN max_group_size INTEGER DEFAULT 4;
ALTER TABLE tugas_besar ADD COLUMN min_group_size INTEGER DEFAULT 2;
```

#### New Indexes:
```sql
CREATE INDEX idx_kelompok_members_kelompok_id ON kelompok_members(kelompok_id);
CREATE INDEX idx_kelompok_members_user_id ON kelompok_members(user_id);
```

---

## Group Creation Methods

### 1. Manual Creation (`manual`)
- **Method:** Dosen manually selects students and assigns them to groups
- **API Endpoint:** `POST /api/kelompok/tugas/:tugasId/kelompok/manual`
- **Data Flow:**
  1. Dosen selects available students
  2. Creates group with specific name
  3. Assigns leader and members
  4. System records `creation_method = 'manual'`

### 2. Automatic Creation (`automatic`)
- **Method:** System randomly distributes students into groups
- **API Endpoint:** `POST /api/kelompok/tugas/:tugasId/kelompok/otomatis`
- **Data Flow:**
  1. Dosen specifies desired group size
  2. System randomly shuffles unassigned students
  3. Creates groups with automatic naming (Kelompok A, B, C...)
  4. First member in each group becomes leader
  5. System records `creation_method = 'automatic'`

### 3. Student Choice (`student_choice`)
- **Method:** Students self-enroll into groups
- **API Endpoint:** `POST /api/kelompok/tugas/:tugasId/kelompok/enable-student-choice`
- **Data Flow:**
  1. Dosen enables student choice mode with min/max group sizes
  2. System sets `student_choice_enabled = true` on tugas_besar
  3. Students can see real-time group status
  4. Students create or join existing groups within size limits
  5. System records `creation_method = 'student_choice'`

---

## API Endpoints Created

### Group Management Routes (`/api/kelompok/`)

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| GET | `/tugas/:tugasId/kelompok` | Get all groups for a task | Dosen + Mahasiswa |
| GET | `/tugas/:tugasId/mahasiswa` | Get students available for grouping | Dosen only |
| POST | `/tugas/:tugasId/kelompok/manual` | Create group manually | Dosen only |
| POST | `/tugas/:tugasId/kelompok/otomatis` | Create groups automatically | Dosen only |
| POST | `/tugas/:tugasId/kelompok/enable-student-choice` | Enable student choice mode | Dosen only |
| DELETE | `/kelompok/:kelompokId` | Delete a group | Dosen only |
| POST | `/tugas/:tugasId/kelompok/student-join` | Student join/create group | Mahasiswa only |
| POST | `/kelompok/:kelompokId/leave` | Student leave group | Mahasiswa only |

---

## Data Migration Considerations

### Deprecated Tables
- `anggota_kelompok` → Replaced by `kelompok_members`
- Enhanced functionality with leader designation and timestamps

### Migration Path
If existing data needs to be migrated:
```sql
-- Migrate existing group members
INSERT INTO kelompok_members (kelompok_id, user_id, is_leader, joined_at)
SELECT 
    kelompok_id, 
    mahasiswa_id as user_id,
    false as is_leader,  -- Default all as non-leaders
    created_at as joined_at
FROM anggota_kelompok;

-- Manually assign leaders (first member in each group)
UPDATE kelompok_members 
SET is_leader = true 
WHERE id IN (
    SELECT DISTINCT ON (kelompok_id) id 
    FROM kelompok_members 
    ORDER BY kelompok_id, joined_at
);
```

---

## Frontend Integration

### New Components
- `DosenGroupManagement.jsx` - Enhanced with real API integration
- Group creation forms for all 3 methods
- Real-time group membership display

### API Utilities
- `kelompokApi.js` - Complete API wrapper for group operations
- Error handling and authentication integration

### State Management
- Real-time group data loading
- Student availability tracking
- Loading states for async operations

---

## Security Considerations

### Authorization
- Dosen can only manage groups for their own courses
- Mahasiswa can only join groups for courses they're enrolled in
- API endpoints include proper role-based access control

### Data Validation
- Group size limits enforced at API level
- Duplicate membership prevention via unique constraints
- Input sanitization for group names and user selections

---

## Performance Optimizations

### Database Indexes
- Optimized queries for group membership lookups
- Efficient student availability queries
- Fast group creation operations

### Caching Strategy
- Real-time updates without full page refresh
- Optimistic UI updates with fallback error handling

---

## Future Enhancements

### Planned Features
1. **Real-time Updates:** WebSocket integration for live group changes
2. **Group Chat:** Integration with messaging system
3. **File Sharing:** Group-specific file upload areas
4. **Peer Evaluation:** Member rating system
5. **Group Analytics:** Performance tracking and statistics

### Schema Considerations
- `kelompok_members` table ready for additional metadata
- JSONB fields in `tugas_besar` support arbitrary feature extensions
- Flexible creation_method field supports new group formation strategies

---

## Troubleshooting

### Common Issues
1. **Migration Errors:** Ensure proper sequence when running Node.js scripts
2. **Permission Errors:** Verify database user has CREATE/ALTER permissions
3. **Constraint Violations:** Check for existing data conflicts before migrations

### Verification Queries
```sql
-- Check if modifications were applied
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tugas_besar' 
AND column_name IN ('komponen', 'deliverable', 'student_choice_enabled');

-- Verify kelompok_members table exists
SELECT count(*) FROM kelompok_members;

-- Check group creation methods
SELECT creation_method, count(*) 
FROM kelompok 
GROUP BY creation_method;
```

---

**Note:** All modifications maintain backward compatibility where possible. The system gracefully handles missing data and provides appropriate defaults for enhanced features.