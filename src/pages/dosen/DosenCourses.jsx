import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User } from 'lucide-react';

const DosenCourses = () => {
  const navigate = useNavigate();

  // Sample data - akan diganti dengan data dari API
  const courses = [
    { 
      id: 1, 
      name: 'Pemrograman Web', 
      code: 'IF123', 
      students: 45, 
      tasks: 3,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 8,
      totalClasses: 2,
      classes: ['A', 'B'],
      pendingGrading: 12
    },
    { 
      id: 2, 
      name: 'Basis Data', 
      code: 'IF234', 
      students: 38, 
      tasks: 2,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 7,
      totalClasses: 1,
      classes: ['A'],
      pendingGrading: 5
    },
    { 
      id: 3, 
      name: 'Rekayasa Perangkat Lunak', 
      code: 'IF345', 
      students: 42, 
      tasks: 4,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 9,
      totalClasses: 2,
      classes: ['A', 'C'],
      pendingGrading: 18
    },
    { 
      id: 4, 
      name: 'Algoritma dan Struktur Data', 
      code: 'IF167', 
      students: 40, 
      tasks: 3,
      semester: 'Ganjil 2024/2025',
      sks: 4,
      activeGroups: 8,
      totalClasses: 1,
      classes: ['B'],
      pendingGrading: 8
    },
    { 
      id: 5, 
      name: 'Sistem Operasi', 
      code: 'IF178', 
      students: 35, 
      tasks: 2,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 7,
      totalClasses: 1,
      classes: ['A'],
      pendingGrading: 3
    },
    { 
      id: 6, 
      name: 'Jaringan Komputer', 
      code: 'IF189', 
      students: 38, 
      tasks: 3,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 8,
      totalClasses: 1,
      classes: ['B'],
      pendingGrading: 7
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-600">Daftar mata kuliah yang Anda ampu</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{courses.length}</span> mata kuliah diampu
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{courses.reduce((sum, course) => sum + course.students, 0)}</span> total mahasiswa
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
            onSelect={() => navigate(`/dosen/dashboard/courses/${course.id}`)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
          <p className="text-gray-600">Anda belum mengampu mata kuliah apapun semester ini.</p>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden min-h-[280px]"
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
          {course.pendingGrading > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {course.pendingGrading} perlu dinilai
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
          Kelas {course.classes.join(', ')}
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
          <Users size={14} className="mr-2" />
          <span>{course.students} mahasiswa</span>
        </div>
        <div className="flex items-center text-sm">
          <User size={14} className="mr-2" />
          <span>{course.activeGroups} kelompok aktif</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white text-sm opacity-90">Progress Semester</span>
          <span className="text-white text-sm font-semibold">75%</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all" 
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-white text-opacity-90 text-sm mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FileText size={14} />
            <span>{course.tasks}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={14} />
            <span>{course.activeGroups}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{course.students}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  </div>
);

export default DosenCourses;