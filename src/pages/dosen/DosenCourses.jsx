import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getDosenCourses } from '../../utils/api';

const DosenCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch courses data
  const fetchCourses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Call API to get dosen courses using the correct endpoint
      const response = await getDosenCourses();
      
      // Handle the response structure from getDosenCourses
      if (response.data.success) {
        const coursesData = response.data.courses;
        
        // Transform data to match UI expectations
        const transformedCourses = coursesData.map(course => ({
          id: course.course_id,
          name: course.course_name,
          code: course.course_code,
          students: course.total_students || 0,
          tasks: Math.floor(Math.random() * 5), // Random for now, will be from API later
          semester: `${course.semester} ${course.tahun_ajaran}`,
          sks: course.sks || 3,
          activeGroups: Math.floor(Math.random() * 10), // Random for now
          totalClasses: course.total_classes || 1,
          classes: course.class_names ? course.class_names.split(', ') : ['A'],
          pendingGrading: Math.floor(Math.random() * 15), // Random for now
          progress: Math.floor(Math.random() * 100), // Random for now
          description: course.deskripsi || '',
          class_details: course.class_details || ''
        }));

        setCourses(transformedCourses);
      } else {
        // If API response is not successful, use sample data
        console.warn('API response was not successful, using sample data');
        setCourses(getSampleCourses());
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Gagal memuat data mata kuliah. Silakan coba lagi.');
      
      // Fallback to sample data for development
      setCourses(getSampleCourses());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sample data fallback
  const getSampleCourses = () => [
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
      pendingGrading: 12,
      progress: 75
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
      pendingGrading: 5,
      progress: 60
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
      pendingGrading: 18,
      progress: 80
    }
  ];

  // Calculate total stats
  const totalStats = {
    totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
    totalTasks: courses.reduce((sum, course) => sum + course.tasks, 0),
    totalPendingGrading: courses.reduce((sum, course) => sum + course.pendingGrading, 0),
    averageProgress: courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length) : 0
  };

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchCourses(true);
  };

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    navigate(`/dosen/dashboard/courses/${courseId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat mata kuliah...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-600">
            {user?.nama_lengkap ? `Selamat datang, ${user.nama_lengkap}` : 'Daftar mata kuliah yang Anda ampu'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memperbarui...' : 'Perbarui'}
          </button>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{courses.length}</span> mata kuliah diampu
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{totalStats.totalStudents}</span> total mahasiswa
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{totalStats.totalPendingGrading}</span> perlu dinilai
          </div>
          {courses.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <span>Geser untuk melihat semua</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Mahasiswa</p>
                <p className="text-2xl font-bold text-blue-700">{totalStats.totalStudents}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Tugas</p>
                <p className="text-2xl font-bold text-green-700">{totalStats.totalTasks}</p>
              </div>
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Perlu Dinilai</p>
                <p className="text-2xl font-bold text-orange-700">{totalStats.totalPendingGrading}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Rata-rata Progress</p>
                <p className="text-2xl font-bold text-purple-700">{totalStats.averageProgress}%</p>
              </div>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onSelect={() => handleCourseSelect(course.id)}
          />
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
          <p className="text-gray-600 mb-4">Anda belum mengampu mata kuliah apapun semester ini.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden min-h-[320px]"
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
          <span className="text-white text-sm font-semibold">{course.progress}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-white text-opacity-90 text-sm mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1" title="Jumlah Tugas">
            <FileText size={14} />
            <span>{course.tasks}</span>
          </div>
          <div className="flex items-center space-x-1" title="Kelompok Aktif">
            <TrendingUp size={14} />
            <span>{course.activeGroups}</span>
          </div>
          <div className="flex items-center space-x-1" title="Total Mahasiswa">
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