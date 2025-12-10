import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getDosenCourses } from '../../utils/api';

const DosenCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Normalize payload from different backend shapes into a consistent class object
  const normalizeClassData = (rawClass = {}) => {
    const computedClassId = rawClass.classId ?? rawClass.id ?? rawClass.class_id ?? rawClass.classIdLegacy;
    const normalizedCourseId = rawClass.courseId ?? rawClass.course_id ?? parseCourseIdFromClassId(computedClassId);
    const classLecturerId = rawClass.dosenId ?? rawClass.dosen_id ?? rawClass.classLecturerId ?? rawClass.class_dosen_id;
    const coordinatorId = rawClass.courseCoordinatorId ?? rawClass.course_coordinator_id ?? rawClass.course_dosen_id ?? classLecturerId;

    const isClassLecturer = rawClass.isClassLecturer ?? rawClass.is_class_lecturer ?? (user?.id ? classLecturerId === user.id : true);
    const isCourseCoordinator = rawClass.isCourseCoordinator ?? rawClass.is_course_coordinator ?? (user?.id ? coordinatorId === user.id : false);
    const isPengampuOnly = isCourseCoordinator && !isClassLecturer;

    const courseName = rawClass.courseName ?? rawClass.course_name ?? 'Mata Kuliah';
    const className = rawClass.className ?? rawClass.class_name ?? 'Kelas';
    const courseCode = rawClass.courseCode ?? rawClass.course_code ?? 'N/A';
    const dosenName = rawClass.dosenName ?? rawClass.dosen_name ?? rawClass.class_dosen_name ?? 'Dosen belum ditentukan';
    const courseCoordinatorName = rawClass.courseCoordinatorName ?? rawClass.course_coordinator_name ?? rawClass.course_dosen_name ?? dosenName ?? 'Belum ditentukan';

    return {
      ...rawClass,
      id: rawClass.id ?? rawClass.class_id ?? computedClassId,
      classId: computedClassId ?? `class-${normalizedCourseId}-${className}`,
      courseId: normalizedCourseId ?? parseCourseIdFromClassId(computedClassId),
      courseName,
      courseCode,
      className,
      dosenId: classLecturerId,
      dosenName,
      courseCoordinatorId: coordinatorId,
      courseCoordinatorName,
      name: rawClass.name ?? `${courseName} - Kelas ${className}`,
      code: rawClass.code ?? courseCode,
      tasks: rawClass.tugasBesar ?? rawClass.tasks ?? 0,
      students: rawClass.studentCount ?? rawClass.students ?? 0,
      totalClasses: rawClass.totalClasses ?? 1,
      studentCount: rawClass.studentCount ?? rawClass.students ?? 0,
      tugasBesar: rawClass.tugasBesar ?? rawClass.tasks ?? 0,
      pendingGrading: rawClass.pendingGrading ?? 0,
      activeGroups: rawClass.activeGroups ?? 0,
      progress: rawClass.progress ?? 0,
      isClassLecturer,
      isCourseCoordinator,
      accessRole: rawClass.accessRole ?? (isPengampuOnly ? 'course-coordinator' : 'class-lecturer'),
      roleBadgeLabel: isPengampuOnly ? 'Pengampu' : 'Pengajar'
    };
  };

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
          
          // Use data directly from API - all statistics come from database
          setCourses(classesData.map(normalizeClassData));
          
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
                // Each class gets equal distribution (from database)
                const studentsPerClass = courseData.total_students && classNames.length > 0 ? 
                  Math.floor(courseData.total_students / classNames.length) : 0;
                
                const classSchedule = schedules[classIndex] || schedules[0] || 'Jadwal belum diatur';
                
                // Create independent class entity - all data from database, no random
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
                  dosenId: courseData.dosen_id || null,
                  dosenName: courseData.dosen_name || 'Dosen',
                  
                  // Class metrics - all from database (no random)
                  students: studentsPerClass,
                  studentCount: studentsPerClass,
                  tugasBesar: 0, // Will be fetched from database separately if needed
                  pendingGrading: 0, // Will be fetched from database separately if needed
                  activeGroups: 0, // Will be fetched from database separately if needed
                  progress: 0, // Will be calculated from database if needed
                  
                  // Class details
                  semester: `${courseData.semester || 'Unknown'} ${courseData.tahun_ajaran || ''}`.trim(),
                  sks: courseData.sks || 3,
                  schedule: classSchedule,
                  description: courseData.deskripsi || '',
                  
                  // For backward compatibility
                  name: `${courseData.course_name} - Kelas ${className}`,
                  code: courseData.course_code,
                  tasks: 0,
                  totalClasses: classNames.length
                });
              });
            });

            // Set transformed classes - no fallback to sample data
            setCourses(transformedClasses.map(normalizeClassData));
            return;
          }
        } catch (legacyError) {
          console.error('Legacy API also failed:', legacyError);
        }
      }
      
      // No fallback to sample data - show empty state instead
      setCourses([]);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Gagal memuat data mata kuliah. Silakan coba lagi.');
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // Calculate total stats across all classes - all from database
  const totalStats = {
    totalStudents: courses.reduce((sum, classData) => sum + (classData.studentCount || classData.students || 0), 0),
    totalTugasBesar: courses.reduce((sum, classData) => sum + (classData.tugasBesar || classData.tasks || 0), 0),
    totalPendingGrading: courses.reduce((sum, classData) => sum + (classData.pendingGrading || 0), 0),
    averageProgress: courses.length > 0 ? Math.round(courses.reduce((sum, classData) => sum + (classData.progress || 0), 0) / courses.length) : 0
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
      navigate(`/dosen/dashboard/courses/${classData.classId}`, { 
        state: { ...classData }
      });
      return;
    }

    navigate(`/dosen/dashboard/courses/${numericCourseId}`, { 
      state: { 
        classId: classData.classId,
        classPkId: classData.id,
        className: classData.className,
        courseName: classData.courseName,
        courseCode: classData.courseCode,
        dosenId: classData.dosenId,
        dosenName: classData.dosenName,
        courseCoordinatorId: classData.courseCoordinatorId,
        courseCoordinatorName: classData.courseCoordinatorName,
        isClassLecturer: classData.isClassLecturer,
        isCourseCoordinator: classData.isCourseCoordinator,
        accessRole: classData.accessRole,
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelas yang Diampu</h1>
            <p className="text-gray-700">
              {user?.nama_lengkap ? `Selamat datang, ${user.nama_lengkap}` : 'Daftar kelas yang Anda ampu'} - Kelola tugas besar per kelas
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-5 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Memperbarui...' : 'Perbarui'}
            </button>
            <div className="flex flex-wrap gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 px-5 py-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-1">Kelas Diampu</div>
                <div className="text-xl font-bold text-gray-900">{courses.length}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 px-5 py-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-1">Total Mahasiswa</div>
                <div className="text-xl font-bold text-gray-900">{totalStats.totalStudents}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 px-5 py-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-xs text-blue-600 font-semibold mb-1">Perlu Dinilai</div>
                <div className="text-xl font-bold text-gray-900">{totalStats.totalPendingGrading}</div>
              </div>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Total Mahasiswa</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <Users className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Total Tugas Besar</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.totalTugasBesar}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <FileText className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Perlu Dinilai</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.totalPendingGrading}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <AlertTriangle className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">Rata-rata Progress</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.averageProgress}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <TrendingUp className="text-blue-600" size={28} />
              </div>
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

const ClassCard = ({ classData, onSelect }) => {
  const isPengampuOnly = classData.isCourseCoordinator && !classData.isClassLecturer;
  const roleBadgeLabel = classData.roleBadgeLabel;
  const roleBadgeStyles = classData.isClassLecturer
    ? 'bg-emerald-300 text-emerald-900'
    : 'bg-amber-300 text-amber-900';

  return (
    <div 
      onClick={onSelect}
      className="bg-gradient-to-br from-white via-blue-50/20 to-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 shadow-md border border-blue-100 hover:border-blue-200 relative overflow-hidden min-h-[400px] group hover:-translate-y-1"
    >
      {/* Subtle accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"></div>
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium border border-blue-200">
              {classData.semester}
            </div>
            <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold border border-blue-200">
              {classData.className}
            </div>
            {roleBadgeLabel && (
              <div className={`inline-block text-xs px-2 py-1 rounded-full font-bold ${roleBadgeStyles}`}>
                {roleBadgeLabel}
              </div>
            )}
          </div>
          <div className="text-right">
            {classData.pendingGrading > 0 && (
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">
                {classData.pendingGrading} perlu dinilai
              </div>
            )}
          </div>
        </div>
        
        {/* Course & Class Title */}
        <div className="mb-4">
          <h3 className="text-gray-900 font-bold text-xl mb-1 leading-tight">
            {classData.courseName}
          </h3>
          <div className="text-gray-700 text-sm mb-2">
            <span className="bg-blue-50 px-2 py-1 rounded-md font-semibold border border-blue-100">
              Kelas {classData.className}
            </span>
          </div>
          <div className="text-gray-700 text-sm mb-2">
            <span className="font-semibold">{classData.courseCode}</span>
            <span className="mx-2">•</span>
            <span>{classData.sks} SKS</span>
          </div>
          {/* Dosen Information */}
          <div className="text-gray-700 text-sm">
            <span className="mr-1">👨‍🏫</span>
            <span className="font-medium">{classData.dosenName}</span>
          </div>
          <div className="text-gray-600 text-xs mt-2">
            <p className="uppercase tracking-wide text-[10px] mb-1">Dosen Pengampu</p>
            <p className="font-semibold">{classData.courseCoordinatorName || 'Belum ditentukan'}</p>
          </div>
          {isPengampuOnly && (
            <div className="mt-3 text-xs text-gray-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              Anda tercatat sebagai dosen koordinator. Kelas ini diajar oleh {classData.dosenName || 'dosen lain'}.
            </div>
          )}
        </div>

        {/* Class Details */}
        <div className="text-gray-700 mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <Users size={14} className="mr-2 text-blue-600" />
            <span>{classData.studentCount || classData.students || 0} mahasiswa</span>
          </div>
          <div className="flex items-center text-sm">
            <FileText size={14} className="mr-2 text-blue-600" />
            <span>{classData.tugasBesar || 0} tugas besar</span>
          </div>
          <div className="flex items-center text-sm">
            <User size={14} className="mr-2 text-blue-600" />
            <span>{classData.activeGroups || 0} kelompok aktif</span>
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
            <span className="text-gray-900 text-sm font-medium">Progress Semester</span>
            <span className="text-gray-700 text-sm font-semibold">{classData.progress || 0}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${classData.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-gray-700 text-sm mt-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1" title="Tugas Besar">
              <FileText size={14} className="text-blue-600" />
              <span>{classData.tugasBesar || 0}</span>
            </div>
            <div className="flex items-center space-x-1" title="Perlu Dinilai">
              <AlertTriangle size={14} className="text-blue-600" />
              <span>{classData.pendingGrading || 0}</span>
            </div>
            <div className="flex items-center space-x-1" title="Kelompok Aktif">
              <TrendingUp size={14} className="text-blue-600" />
              <span>{classData.activeGroups || 0}</span>
            </div>
            <div className="flex items-center space-x-1" title="Total Mahasiswa">
              <Users size={14} className="text-blue-600" />
              <span>{classData.studentCount || classData.students || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <ChevronRight size={16} className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DosenCourses;