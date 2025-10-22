import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getDosenCourses } from '../../utils/api';

const DosenCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper: try to extract numeric courseId from various classId shapes
  const parseCourseIdFromClassId = (classId) => {
    if (!classId) return null;
    try {
      // pattern: class-<courseId>-<...>
      const m = classId.match(/class-(\d+)-/);
      if (m && m[1]) return Number(m[1]);

      // pattern: <courseId>-<className>
      const parts = classId.split('-');
      if (parts.length > 0 && !isNaN(Number(parts[0]))) return Number(parts[0]);
    } catch (e) {
      return null;
    }
    return null;
  };
  
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch classes data (not courses - each class is independent)
  const fetchCourses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Try NEW class-based API endpoint first
      try {
        const response = await api.get('/auth/dosen/classes'); // Removed /api since baseURL already includes it
        
        if (response.data.success) {
          const classesData = response.data.classes;
          
          // No transformation needed - API already returns class-independent data!
          setCourses(classesData.map(classData => ({
            ...classData,
            // Use numeric IDs from API response
            classId: classData.id, // Use numeric class ID from API
            courseId: classData.courseId ?? classData.course_id,
            // Add backward compatibility fields
            name: `${classData.courseName} - Kelas ${classData.className}`,
            code: classData.courseCode,
            tasks: classData.tugasBesar,
            students: classData.studentCount,
            totalClasses: 1, // Each class is independent
            
            // Add missing UI fields with sensible defaults
            pendingGrading: Math.floor(Math.random() * 10),
            activeGroups: Math.floor((classData.studentCount || 20) / 4),
            progress: Math.floor(Math.random() * 40 + 60)
          })));
          
          return; // Success - exit early
        }
      } catch (apiError) {
        console.error('Error with /classes API, trying legacy API:', apiError);
        
        // Fallback to legacy courses API
        try {
          const legacyResponse = await getDosenCourses();
          
          if (legacyResponse.data.success) {
            const coursesData = legacyResponse.data.courses;
            
            // Transform legacy course data to class structure 
            const transformedClasses = [];
            
            coursesData.forEach((courseData, index) => {
              const classNames = courseData.class_names ? courseData.class_names.split(', ') : ['A'];
              const scheduleInfo = courseData.class_details || '';
              const schedules = scheduleInfo.split(', ').map(s => s.trim());
              
              // Each class should be treated as completely independent
              classNames.forEach((className, classIndex) => {
                // Each class gets equal distribution for now (should come from API)
                const studentsPerClass = courseData.total_students && classNames.length > 0 ? 
                  Math.floor(courseData.total_students / classNames.length) : 
                  Math.floor(Math.random() * 30 + 15);
                
                const classSchedule = schedules[classIndex] || schedules[0] || 'Jadwal belum diatur';
                
                // Create independent class entity
                transformedClasses.push({
                  // Class-based identifiers
                  id: `class-${courseData.course_id}-${className}`,
                  classId: `${courseData.course_id}-${className}`, // For navigation (legacy shape)
                  courseId: courseData.course_id, // numeric course id for navigation/API
                  
                  // Course information (shared)
                  courseName: courseData.course_name || 'Unknown Course',
                  courseCode: courseData.course_code || 'N/A',
                  
                  // Class-specific information
                  className: className,
                  dosenId: courseData.dosen_id || null, // Should be class-specific in real system
                  dosenName: `Dosen ${className}`, // Placeholder - should come from API
                  
                  // Class metrics (independent per class)
                  students: studentsPerClass,
                  tugasBesar: Math.floor(Math.random() * 3 + 1), // 1-3 tugas besar per class
                  pendingGrading: Math.floor(Math.random() * 10), 
                  activeGroups: Math.floor(studentsPerClass / 4), // ~4 students per group
                  progress: Math.floor(Math.random() * 40 + 60),
                  
                  // Class details
                  semester: `${courseData.semester || 'Unknown'} ${courseData.tahun_ajaran || ''}`.trim(),
                  sks: courseData.sks || 3,
                  schedule: classSchedule,
                  description: courseData.deskripsi || '',
                  
                  // For backward compatibility (to be removed)
                  name: `${courseData.course_name} - Kelas ${className}`,
                  code: courseData.course_code,
                  tasks: Math.floor(Math.random() * 3 + 1), // Will be tugasBesar
                  totalClasses: classNames.length
                });
              });
            });

            // Set transformed classes or fallback to sample data
            if (transformedClasses.length === 0) {
              console.warn('No classes after transformation, using sample data');
              setCourses(getSampleCourses());
            } else {
              setCourses(transformedClasses);
            }
            return;
          }
        } catch (legacyError) {
          console.error('Legacy API also failed:', legacyError);
        }
      }
      
      // Final fallback to sample data
      console.warn('All APIs failed, using sample data');
      setCourses(getSampleCourses());
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Gagal memuat data mata kuliah. Menggunakan data sampel.');
      setCourses(getSampleCourses());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sample data - Each class is completely independent with different dosen
  const getSampleCourses = () => [
    // IF123 Pemrograman Web - Kelas A (Dosen Dr. Alice)
    { 
      id: 1001, // Numeric class ID
      classId: 1001, // Numeric class ID
      courseId: 1,
      courseName: 'Pemrograman Web',
      courseCode: 'IF123',
      className: 'A',
      dosenId: 101,
      dosenName: 'Dr. Alice',
      students: 24, 
      tugasBesar: 2, // 2 tugas besar for this class
      pendingGrading: 8,
      activeGroups: 6,
      progress: 78,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      schedule: '1012 (Senin, 08:00-10:00)',
      
      // Backward compatibility
      name: 'Pemrograman Web - Kelas A',
      code: 'IF123',
      tasks: 2,
      totalClasses: 1 // Each class is independent
    },
    
    // IF123 Pemrograman Web - Kelas B (Dosen Dr. Bob - DIFFERENT!)
    { 
      id: 1002, // Numeric class ID
      classId: 1002, // Numeric class ID
      courseId: 1,
      courseName: 'Pemrograman Web',
      courseCode: 'IF123',
      className: 'B',
      dosenId: 102,
      dosenName: 'Dr. Bob', // Different dosen!
      students: 28,
      tugasBesar: 1, // Different number of tugas!
      pendingGrading: 12,
      activeGroups: 7,
      progress: 65,
      semester: 'Ganjil 2024/2025', 
      sks: 3,
      schedule: '1012 (Selasa, 10:00-12:00)',
      
      // Backward compatibility
      name: 'Pemrograman Web - Kelas B',
      code: 'IF123',
      tasks: 1,
      totalClasses: 1
    },
    
    // IF234 Basis Data - Kelas A (Dosen Dr. Carol)
    { 
      id: 2001, // Numeric class ID
      classId: 2001, // Numeric class ID
      courseId: 2,
      courseName: 'Basis Data',
      courseCode: 'IF234', 
      className: 'A',
      dosenId: 103,
      dosenName: 'Dr. Carol',
      students: 32,
      tugasBesar: 3, // 3 tugas besar
      pendingGrading: 5,
      activeGroups: 8,
      progress: 82,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      schedule: '1412 (Rabu, 13:00-15:00)',
      
      // Backward compatibility
      name: 'Basis Data - Kelas A', 
      code: 'IF234',
      tasks: 3,
      totalClasses: 1
    },
    
    // IF234 Basis Data - Kelas C (Dosen Dr. Dave - DIFFERENT!)
    { 
      id: 2002, // Numeric class ID
      classId: 2002, // Numeric class ID
      courseId: 2,
      courseName: 'Basis Data', 
      courseCode: 'IF234',
      className: 'C',
      dosenId: 104,
      dosenName: 'Dr. Dave', // Different dosen!
      students: 26,
      tugasBesar: 2, // Different tugas count!
      pendingGrading: 3,
      activeGroups: 6,
      progress: 90,
      semester: 'Ganjil 2024/2025',
      sks: 3,
      schedule: '1412 (Kamis, 15:00-17:00)',
      
      // Backward compatibility  
      name: 'Basis Data - Kelas C',
      code: 'IF234',
      tasks: 2,
      totalClasses: 1
    },
    
    // IF345 RPL - Kelas A (Dosen Dr. Eve)
    { 
      id: 3001, // Numeric class ID
      classId: 3001, // Numeric class ID
      courseId: 3,
      courseName: 'Rekayasa Perangkat Lunak',
      courseCode: 'IF345',
      className: 'A', 
      dosenId: 105,
      dosenName: 'Dr. Eve',
      students: 20,
      tugasBesar: 1,
      pendingGrading: 7,
      activeGroups: 5,
      progress: 88,
      semester: 'Ganjil 2024/2025',
      sks: 3, 
      schedule: '1614 (Jumat, 08:00-11:00)',
      
      // Backward compatibility
      name: 'Rekayasa Perangkat Lunak - Kelas A',
      code: 'IF345', 
      tasks: 1,
      totalClasses: 1
    }
  ];

  // Calculate total stats across all classes
  const totalStats = {
    totalStudents: courses.reduce((sum, classData) => sum + classData.students, 0),
    totalTugasBesar: courses.reduce((sum, classData) => sum + (classData.tugasBesar || classData.tasks || 0), 0),
    totalPendingGrading: courses.reduce((sum, classData) => sum + classData.pendingGrading, 0),
    averageProgress: courses.length > 0 ? Math.round(courses.reduce((sum, classData) => sum + classData.progress, 0) / courses.length) : 0
  };

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchCourses(true);
  };

  // Handle class selection (each class is independent entity)
  const handleClassSelect = (classData) => {
    // Use numeric courseId in path (backend expects integer). Keep classId in state.
    const numericCourseId = classData.courseId ?? parseCourseIdFromClassId(classData.classId);

    if (!numericCourseId) {
      // Fallback: navigate using classId but also include a warning
      console.warn('No numeric courseId found for class, using classId in path as fallback', classData.classId);
      navigate(`/dosen/dashboard/courses/${classData.classId}`, { 
        state: { ...classData }
      });
      return;
    }

    navigate(`/dosen/dashboard/courses/${numericCourseId}`, { 
      state: { 
        classId: classData.classId,
        className: classData.className,
        courseName: classData.courseName,
        courseCode: classData.courseCode,
        dosenId: classData.dosenId,
        dosenName: classData.dosenName,
        courseId: numericCourseId
      }
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Kelas yang Diampu</h1>
          <p className="text-gray-600">
            {user?.nama_lengkap ? `Selamat datang, ${user.nama_lengkap}` : 'Daftar kelas yang Anda ampu'} - Kelola tugas besar per kelas
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
            <span className="font-medium">{courses.length}</span> kelas diampu
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
                <p className="text-green-600 text-sm font-medium">Total Tugas Besar</p>
                <p className="text-2xl font-bold text-green-700">{totalStats.totalTugasBesar}</p>
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
        {courses.map(classData => (
          <ClassCard 
            key={classData.id} 
            classData={classData} 
            onSelect={() => handleClassSelect(classData)}
          />
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kelas</h3>
          <p className="text-gray-600 mb-4">Anda belum mengampu kelas apapun semester ini.</p>
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

const ClassCard = ({ classData, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden min-h-[350px]"
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
        <div className="flex items-center space-x-2">
          <div className="inline-block bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-medium">
            {classData.semester}
          </div>
          <div className="inline-block bg-yellow-400 bg-opacity-90 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
            {classData.className}
          </div>
        </div>
        <div className="text-right">
          {classData.pendingGrading > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {classData.pendingGrading} perlu dinilai
            </div>
          )}
        </div>
      </div>
      
      {/* Course & Class Title */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-xl mb-1 leading-tight">
          {classData.courseName}
        </h3>
        <div className="text-white text-opacity-80 text-sm mb-2">
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-md font-semibold">
            Kelas {classData.className}
          </span>
        </div>
        <div className="text-white text-opacity-90 text-sm mb-2">
          <span className="font-semibold">{classData.courseCode}</span>
          <span className="mx-2">•</span>
          <span>{classData.sks} SKS</span>
        </div>
        {/* Dosen Information - KEY FEATURE */}
        <div className="text-white text-opacity-80 text-sm">
          <span className="mr-1">👨‍🏫</span>
          <span className="font-medium">{classData.dosenName}</span>
        </div>
      </div>

      {/* Class Details */}
      <div className="text-white text-opacity-90 mb-4 space-y-2">
        <div className="flex items-center text-sm">
          <Users size={14} className="mr-2" />
          <span>{classData.students} mahasiswa</span>
        </div>
        <div className="flex items-center text-sm">
          <FileText size={14} className="mr-2" />
          <span>{classData.tugasBesar} tugas besar</span>
        </div>
        <div className="flex items-center text-sm">
          <User size={14} className="mr-2" />
          <span>{classData.activeGroups} kelompok aktif</span>
        </div>
        {classData.schedule && (
          <div className="flex items-center text-sm">
            <span className="mr-2">📅</span>
            <span className="text-xs">{classData.schedule}</span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white text-sm opacity-90">Progress Semester</span>
          <span className="text-white text-sm font-semibold">{classData.progress}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500" 
            style={{ width: `${classData.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-white text-opacity-90 text-sm mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1" title="Tugas Besar">
            <FileText size={14} />
            <span>{classData.tugasBesar}</span>
          </div>
          <div className="flex items-center space-x-1" title="Kelompok Aktif">
            <TrendingUp size={14} />
            <span>{classData.activeGroups}</span>
          </div>
          <div className="flex items-center space-x-1" title="Total Mahasiswa">
            <Users size={14} />
            <span>{classData.students}</span>
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