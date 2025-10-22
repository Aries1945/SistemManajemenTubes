# Sistem Manajemen Tugas Besar

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistem manajemen tugas besar berbasis web untuk institusi pendidikan dengan fitur manajemen kelompok yang canggih, isolasi class-based, dan multiple metode pembentukan kelompok.

## 🚀 Fitur Utama

### 👥 Manajemen Multi-Role
- **Admin**: Kelola users, courses, dan sistem secara keseluruhan
- **Dosen**: Buat dan kelola tugas besar, kelompok, dan penilaian
- **Mahasiswa**: Akses tugas, bergabung dengan kelompok, submit deliverable

### 📚 Manajemen Course & Class
- Course catalog dengan template reusable
- Class-based enrollment system
- Isolasi tugas berdasarkan class untuk keamanan data
- Multi-dosen support per course

### 📝 Tugas Besar Management
- Dynamic component system dengan JSONB storage
- Flexible deliverable specifications
- Multiple group formation methods:
  - **Manual**: Dosen assign kelompok
  - **Automatic**: System auto-create balanced groups
  - **Student Choice**: Mahasiswa pilih kelompok sendiri
  - **Random**: Random assignment
- Configurable group size (min/max members)
- Advanced deadline management

### 👥 Group Management System
- Real-time group membership tracking
- Group leader designation
- Join/leave group functionality
- Automatic group size validation
- Cross-class isolation untuk security

### 📊 Assessment System
- Component-based grading
- Individual scoring per mahasiswa
- Flexible grading schemes
- Grade calculation and tracking

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js + PostgreSQL
- **Frontend**: React.js + Vite + TailwindCSS
- **Database**: PostgreSQL 14+ with JSONB support
- **Authentication**: JWT-based with RBAC
- **Styling**: TailwindCSS + Custom Components

## 📋 Prerequisites

Pastikan Anda memiliki software berikut terinstall:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://postgresql.org/download/))
- **npm** atau **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Aries1945/SistemManajemenTubes.git
cd SistemManajemenTugas-dev_b
```

### 2. Database Setup
```bash
# Connect ke PostgreSQL sebagai superuser
psql -U postgres

# Buat database
CREATE DATABASE unpar_task_management;

# Buat user (opsional)
CREATE USER task_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE unpar_task_management TO task_admin;

# Import schema database
\c unpar_task_management;
\i ManajemenTubes_db_backup.sql
```

### 3. Backend Configuration
```bash
# Masuk ke directory server
cd server

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
```

Edit file `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unpar_task_management
DB_USER=task_admin
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=3000
```

### 4. Frontend Setup
```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install
```

### 5. Start Application
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd ..
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📁 Project Structure

```
SistemManajemenTugas-dev_b/
├── server/                          # Backend Node.js application
│   ├── src/
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.js             # Authentication routes
│   │   │   ├── admin.js            # Admin management routes
│   │   │   ├── dosen.js            # Lecturer routes
│   │   │   ├── mahasiswa.js        # Student routes
│   │   │   └── kelompok.js         # Group management routes
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication middleware
│   │   ├── db.js                   # Database connection
│   │   └── server.js               # Express server setup
│   ├── package.json
│   └── .env                        # Environment configuration
├── src/                            # Frontend React application
│   ├── components/                 # Reusable components
│   │   ├── admin/                  # Admin-specific components
│   │   ├── dosen/                  # Lecturer-specific components
│   │   └── mahasiswa/              # Student-specific components
│   ├── pages/                      # Page components
│   ├── utils/                      # Utility functions and API calls
│   └── App.jsx                     # Main App component
├── ManajemenTubes_db_backup.sql    # Complete database schema
├── package.json                    # Frontend dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # TailwindCSS configuration
└── README.md                       # Project documentation
```

## 🔧 Configuration

### Database Configuration
Semua konfigurasi database ada dalam file `ManajemenTubes_db_backup.sql` yang berisi:
- Complete schema dengan semua tabel
- Foreign key relationships
- Indexes untuk performance optimization
- Triggers untuk data consistency
- Sample data (optional)

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unpar_task_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key

# Server Configuration
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 🔐 Authentication & Authorization

Sistem menggunakan JWT-based authentication dengan role-based access control:

### Roles:
- **admin**: Full system access
- **dosen**: Course and assignment management
- **mahasiswa**: Student course access

### Protected Routes:
- All API routes require valid JWT token
- Role-specific access control per endpoint
- Class-based data isolation for security

## 📡 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
Body: { email, password }

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Admin Routes
```bash
# Get all users
GET /api/admin/users

# Create user
POST /api/admin/users
Body: { email, password, role, profile_data }
```

### Dosen Routes
```bash
# Get courses
GET /api/dosen/courses

# Create tugas besar
POST /api/dosen/tugas-besar
Body: { course_id, class_id, title, description, ... }

# Get groups
GET /api/dosen/tugas-besar/:id/kelompok
```

### Mahasiswa Routes
```bash
# Get enrolled courses
GET /api/mahasiswa/courses

# Get assignments
GET /api/mahasiswa/courses/:id/tugas-besar

# Join group
POST /api/mahasiswa/kelompok/join
Body: { kelompok_id }
```

## 🚀 Deployment

### Production Setup
1. **Database**: Set up PostgreSQL dengan SSL
2. **Backend**: Use PM2 untuk process management
3. **Frontend**: Build dengan `npm run build`
4. **Reverse Proxy**: Configure nginx
5. **SSL**: Set up HTTPS certificates

### Build Commands
```bash
# Frontend production build
npm run build

# Preview production build
npm run preview

# Backend production start
cd server && npm run start:prod
```

## 🧪 Development

### Adding New Features
1. Create database migrations if needed
2. Add/update API routes in `server/src/routes/`
3. Create/update React components
4. Test functionality
5. Update documentation

### Code Standards
- Use ESLint configuration provided
- Follow consistent naming conventions
- Document complex functions
- Write meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   sudo service postgresql status
   
   # Verify database exists
   psql -U postgres -l
   ```

2. **JWT Token Issues**
   ```bash
   # Check JWT_SECRET in .env
   # Verify token expiration
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   
   # Kill process on port 5173
   npx kill-port 5173
   ```

4. **CORS Issues**
   ```bash
   # Check FRONTEND_URL in server .env
   # Verify CORS configuration in server.js
   ```

## 📊 Performance Optimization

### Database Optimization
- Strategic indexes telah diimplementasi
- JSONB indexes untuk dynamic queries
- Connection pooling untuk production
- Regular VACUUM dan ANALYZE

### Frontend Optimization
- Code splitting dengan React.lazy
- TailwindCSS purging untuk smaller bundle
- Vite optimization untuk development

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: [Aries1945](https://github.com/Aries1945)
- **Project Type**: Academic Task Management System
- **Institution**: UNPAR (Universitas Katolik Parahyangan)

## 📞 Support

Jika mengalami masalah atau memerlukan bantuan:

1. Check dokumentasi di atas
2. Lihat section Troubleshooting
3. Buat issue di GitHub repository
4. Contact development team

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
