import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { getMahasiswaCourses } from '../../utils/mahasiswaApi';

const MahasiswaCourses = () => {
  const navigate = useNavigate();
  
  // State untuk API data
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load courses data dari API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getMahasiswaCourses();
      
      if (response && response.success) {
        // Transform API data to match component expectations
        const transformedCourses = response.courses.map(course => ({
          id: course.course_id,
          name: course.course_name,
          code: course.course_code,
          lecturer: course.dosen_name || 'Belum ditentukan',
          class: course.class_name || 'A',
          classId: course.class_id,
          schedule: 'Jadwal akan diumumkan', // Could be enhanced with real schedule data
          semester: `${course.semester} ${course.tahun_ajaran}`,
          sks: course.sks,
          totalTasks: 0, // Will be updated when we have task count data
          completedTasks: 0,
          pendingTasks: 0,
          averageGrade: course.nilai_akhir || null,
          taskProgress: 0, // Will be calculated based on tasks
          status: course.enrollment_status || 'active',
          students: 45, // Default value, could be enhanced with real student count
          enrolledAt: course.enrolled_at,
          courseDescription: course.course_description
        }));
        
        setCourses(transformedCourses);
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError('Gagal memuat data mata kuliah: ' + err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (course) => {
    navigate(`/mahasiswa/dashboard/courses/${course.id}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadCourses();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-600">Daftar mata kuliah yang Anda ambil semester ini</p>
        </div>
        <div className="flex items-center space-x-3">
          {!loading && (
            <>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{courses.length}</span> mata kuliah terdaftar
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{courses.reduce((sum, course) => sum + course.sks, 0)}</span> total SKS
              </div>
            </>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Memuat...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data mata kuliah...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Gagal memuat data</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={`${course.id}-${course.classId || course.class}`} 
              course={course} 
              onSelect={() => handleCourseSelect(course)} 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
          <p className="text-gray-600">Anda belum terdaftar di mata kuliah manapun semester ini.</p>
          <p className="text-gray-500 text-sm mt-2">
            Silakan hubungi admin atau bagian akademik untuk registrasi mata kuliah.
          </p>
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

      {/* Status indicator */}
      <div className="absolute top-2 left-2">
        <div className={`w-2 h-2 rounded-full ${
          course.status === 'active' ? 'bg-green-300' : 'bg-yellow-300'
        }`}></div>
      </div>
    </div>
  </div>
);

export default MahasiswaCourses;