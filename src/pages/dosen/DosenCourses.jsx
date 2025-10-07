import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight } from 'lucide-react';

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
        {courses.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <span>Geser untuk melihat semua</span>
            <ChevronRight size={16} className="ml-1" />
          </div>
        )}
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-4">
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
    className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden flex-shrink-0 w-80"
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-sm"></div>
      <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-sm"></div>
      <div className="absolute bottom-4 left-4 w-10 h-10 border-2 border-white rounded-sm"></div>
      <div className="absolute bottom-8 left-8 w-4 h-4 border-2 border-white rounded-sm"></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10">
      {/* Semester Badge */}
      <div className="inline-block bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full mb-3">
        {course.semester}
      </div>
      
      {/* Course Title */}
      <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
        {course.name}
      </h3>
      
      {/* Course Details */}
      <div className="flex items-center justify-between text-white text-opacity-90">
        <div className="text-sm">
          <span className="font-medium">{course.code}</span>
          <span className="mx-2">•</span>
          <span>{course.sks} SKS</span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{course.students}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText size={16} />
            <span>{course.tasks}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={16} />
            <span>{course.activeGroups}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DosenCourses;