import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User, Calendar, Star } from 'lucide-react';

const MahasiswaCourses = () => {
  const navigate = useNavigate();

  // Sample data - akan diganti dengan data dari API
  const courses = [
    { 
      id: 1, 
      name: 'Pemrograman Web', 
      code: 'IF123', 
      lecturer: 'Dr. Ahmad Fauzi',
      class: 'A',
      schedule: 'Senin, 08:00-10:00 | Kamis, 13:00-15:00',
      semester: 'Ganjil 2024/2025',
      sks: 3,
      totalTasks: 5,
      completedTasks: 3,
      pendingTasks: 2,
      averageGrade: 85.5,
      taskProgress: 60,
      status: 'active',
      students: 45
    },
    { 
      id: 2, 
      name: 'Basis Data', 
      code: 'IF234', 
      lecturer: 'Prof. Siti Rahayu',
      class: 'B',
      schedule: 'Selasa, 10:00-12:00 | Jumat, 08:00-10:00',
      semester: 'Ganjil 2024/2025',
      sks: 3,
      totalTasks: 4,
      completedTasks: 4,
      pendingTasks: 0,
      averageGrade: 92.0,
      taskProgress: 100,
      status: 'active',
      students: 38
    },
    { 
      id: 3, 
      name: 'Rekayasa Perangkat Lunak', 
      code: 'IF345', 
      lecturer: 'Dr. Budi Santoso',
      class: 'A',
      schedule: 'Rabu, 13:00-15:00 | Sabtu, 08:00-10:00',
      semester: 'Ganjil 2024/2025',
      sks: 3,
      totalTasks: 6,
      completedTasks: 2,
      pendingTasks: 4,
      averageGrade: 78.0,
      taskProgress: 33,
      status: 'active',
      students: 42
    },
    { 
      id: 4, 
      name: 'Matematika Diskrit', 
      code: 'IF156', 
      lecturer: 'Dr. Indira Kartika',
      class: 'C',
      schedule: 'Senin, 13:00-15:00 | Kamis, 08:00-10:00',
      semester: 'Ganjil 2024/2025',
      sks: 3,
      totalTasks: 3,
      completedTasks: 1,
      pendingTasks: 2,
      averageGrade: 80.0,
      taskProgress: 33,
      status: 'active',
      students: 35
    },
    { 
      id: 5, 
      name: 'Algoritma dan Struktur Data', 
      code: 'IF167', 
      lecturer: 'Prof. Eko Susanto',
      class: 'A',
      schedule: 'Selasa, 08:00-10:00 | Jumat, 13:00-15:00',
      semester: 'Ganjil 2024/2025',
      sks: 4,
      totalTasks: 5,
      completedTasks: 3,
      pendingTasks: 2,
      averageGrade: 88.0,
      taskProgress: 60,
      status: 'active',
      students: 40
    },
    { 
      id: 6, 
      name: 'Sistem Operasi', 
      code: 'IF178', 
      lecturer: 'Dr. Maya Sari',
      class: 'B',
      schedule: 'Rabu, 08:00-10:00 | Sabtu, 10:00-12:00',
      semester: 'Ganjil 2024/2025',
      sks: 3,
      totalTasks: 4,
      completedTasks: 2,
      pendingTasks: 2,
      averageGrade: 82.5,
      taskProgress: 50,
      status: 'active',
      students: 38
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-600">Daftar mata kuliah yang Anda ambil semester ini</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{courses.length}</span> mata kuliah terdaftar
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{courses.reduce((sum, course) => sum + course.sks, 0)}</span> total SKS
          </div>
          {courses.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <span>Geser untuk melihat semua</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onSelect={() => navigate(`/mahasiswa/dashboard/courses/${course.id}`)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
          <p className="text-gray-600">Anda belum terdaftar di mata kuliah manapun semester ini.</p>
          <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Registrasi Mata Kuliah
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 cursor-pointer hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden min-h-[280px]"
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-sm"></div>
      <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-sm"></div>
      <div className="absolute bottom-4 left-4 w-10 h-10 border-2 border-white rounded-sm"></div>
      <div className="absolute bottom-8 left-8 w-4 h-4 border-2 border-white rounded-sm"></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="inline-block bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-medium">
          {course.semester}
        </div>
        <div className="text-right">
          {course.averageGrade && (
            <div className="flex items-center justify-end text-white text-xs">
              <Star size={12} className="mr-1" />
              <span>{course.averageGrade}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Course Title & Code */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-xl mb-1 leading-tight">
          {course.name}
        </h3>
        <div className="text-white text-opacity-80 text-sm mb-2">
          Kelas {course.class}
        </div>
        <div className="text-white text-opacity-90 text-sm">
          <span className="font-semibold">{course.code}</span>
          <span className="mx-2">•</span>
          <span>{course.sks} SKS</span>
        </div>
      </div>

      {/* Course Details */}
      <div className="text-white text-opacity-90 mb-4 space-y-2">
        <div className="flex items-center text-sm">
          <User size={14} className="mr-2" />
          <span className="truncate">{course.lecturer}</span>
        </div>
        <div className="flex items-center text-xs">
          <Calendar size={12} className="mr-2" />
          <span className="truncate">{course.schedule}</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white text-sm opacity-90">Progress Tugas</span>
          <span className="text-white text-sm font-semibold">{course.taskProgress}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all" 
            style={{ width: `${course.taskProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-white text-opacity-90 text-sm mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{course.students}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText size={14} />
            <span>{course.totalTasks}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={14} />
            <span>{course.completedTasks}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  </div>
);

export default MahasiswaCourses;