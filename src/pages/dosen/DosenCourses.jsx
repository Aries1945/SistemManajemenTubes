import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';

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
      activeGroups: 8
    },
    { 
      id: 2, 
      name: 'Basis Data', 
      code: 'IF234', 
      students: 38, 
      tasks: 2,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 7
    },
    { 
      id: 3, 
      name: 'Rekayasa Perangkat Lunak', 
      code: 'IF345', 
      students: 42, 
      tasks: 4,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      activeGroups: 9
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-600">Daftar mata kuliah yang Anda ampu</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onSelect={() => navigate(`/courses/${course.id}`)}
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
  <div className="bg-white rounded-lg shadow border overflow-hidden">
    {/* Header */}
    <div className="p-6 border-b border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.name}</h3>
          <p className="text-gray-600">{course.code} • {course.sks} SKS • {course.semester}</p>
        </div>
        <button 
          onClick={onSelect}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Kelola Mata Kuliah
        </button>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Mahasiswa */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Users className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{course.students}</p>
            <p className="text-sm text-gray-600">Mahasiswa</p>
          </div>
        </div>

        {/* Tugas Besar */}
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <FileText className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{course.tasks}</p>
            <p className="text-sm text-gray-600">Tugas Besar</p>
          </div>
        </div>

        {/* Kelompok Aktif */}
        <div className="text-center">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-1">{course.activeGroups}</p>
            <p className="text-sm text-gray-600">Kelompok Aktif</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);




export default DosenCourses;