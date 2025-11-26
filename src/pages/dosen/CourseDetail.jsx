import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Users, 
  FileText, 
  Star,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getDosenCourses, getDosenClasses } from '../../utils/api';
import DosenTaskManagement from '../../components/dosen/DosenTaskManagement';
import DosenGroupManagement from '../../components/dosen/DosenGroupManagement';
import DosenGradingManagement from '../../components/dosen/DosenGradingManagement';

const CourseDetail = () => {
  const { courseId } = useParams(); // Fixed: changed from 'id' to 'courseId'
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('tasks'); // Default to tasks, overview removed
  const [course, setCourse] = useState(null);
  
  // NEW: Class-specific information from navigation state
  const classInfo = location.state || {};
  const [resolvedClassId, setResolvedClassId] = useState(classInfo.classId || null);
  const [resolvedClassName, setResolvedClassName] = useState(classInfo.className || null);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    completedTasks: 0,
    activeGroups: 0,
    pendingGrading: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourseDetail = async () => {try {
      setLoading(true);
      setError('');
      
      // Prioritize class info from navigation state (from DosenCourses)
      if (classInfo && Object.keys(classInfo).length > 0 && classInfo.classId) {
        // Set resolved classId and className from state
        setResolvedClassId(classInfo.classId);
        setResolvedClassName(classInfo.className);
        
        // Use the class-specific data directly from DosenCourses navigation
        const courseData = {
          id: classInfo.courseId || parseInt(courseId),
          name: classInfo.courseName || 'Unknown Course',
          code: classInfo.courseCode || 'N/A',
          semester: classInfo.semester || 'Unknown Semester',
          sks: classInfo.sks || 3,
          description: classInfo.description || '',
          
          // Class-specific information (KEY CHANGE)
          selectedClass: classInfo.className || 'Unknown',
          classes: [classInfo.className || 'Unknown'], // Only show this specific class
          dosen_name: classInfo.dosenName || 'Dosen',
          class_details: classInfo.schedule || 'Jadwal tidak tersedia',
          
          // Additional class-specific metadata
          classId: classInfo.classId,
          dosenId: classInfo.dosenId,
          ruangan: classInfo.ruangan || '',
          kapasitas: classInfo.kapasitas || 0
        };
        
        setCourse(courseData);
        
        // Use class-specific stats - all from database, no random data
        const statsData = {
          totalStudents: classInfo.students || classInfo.studentCount || 0,
          activeTasks: classInfo.tugasBesar || classInfo.tasks || 0,
          completedTasks: 0, // Will be calculated from database if needed
          activeGroups: classInfo.activeGroups || 0,
          pendingGrading: classInfo.pendingGrading || 0,
          averageGrade: classInfo.progress || 0
        };
        
        setStats(statsData);
        
        return; // Use class-specific data, no need to fetch from API
      }
      
      // FALLBACK: If no class info in state, fetch classes from API
      if (!resolvedClassId) {
        // Fetch classes to get classId for this course
        const classesResponse = await getDosenClasses();
        
        if (classesResponse.data.success) {
          const classes = classesResponse.data.classes || [];
          // Find first class that matches this courseId
          const matchingClass = classes.find(cls => cls.courseId === parseInt(courseId));
          
          if (matchingClass) {
            const resolvedId = matchingClass.id;
            const resolvedName = matchingClass.className;
            
            setResolvedClassId(resolvedId);
            setResolvedClassName(resolvedName);
            
            // Use class data to populate course
            const courseData = {
              id: matchingClass.courseId,
              name: matchingClass.courseName,
              code: matchingClass.courseCode,
              semester: `${matchingClass.semester} ${matchingClass.tahunAjaran}`,
              sks: matchingClass.sks || 3,
              description: '',
              classes: [resolvedName],
              dosen_name: matchingClass.dosenName || 'Dosen',
              class_details: '',
              selectedClass: resolvedName,
              classId: resolvedId
            };
            
            setCourse(courseData);
            
            const statsData = {
              totalStudents: matchingClass.studentCount || 0,
              activeTasks: matchingClass.tugasBesar || 0,
              completedTasks: 0,
              activeGroups: matchingClass.activeGroups || 0,
              pendingGrading: matchingClass.pendingGrading || 0,
              averageGrade: matchingClass.progress || 0
            };
            
            setStats(statsData);
            return;
          }
        }
      }
      
      // FALLBACK: If still no classId, try legacy method
      let actualCourseId = courseId;
      let fallbackClassName = null;
      
      if (courseId.toString().startsWith('class-')) {
        const parts = courseId.split('-');
        if (parts.length >= 3) {
          actualCourseId = parts[1];
          fallbackClassName = parts.slice(2).join(' ');
        }
      }
      
      // Get all courses for this dosen
      const response = await getDosenCourses();
      
      if (response.data.success) {
        const allCourses = response.data.courses;
        const foundCourse = allCourses.find(course => course.course_id === parseInt(actualCourseId));
        
        if (foundCourse) {
          const courseData = {
            id: foundCourse.course_id,
            name: foundCourse.course_name,
            code: foundCourse.course_code,
            semester: `${foundCourse.semester} ${foundCourse.tahun_ajaran}`,
            sks: foundCourse.sks || 3,
            description: foundCourse.deskripsi || '',
            classes: foundCourse.class_names ? foundCourse.class_names.split(', ') : ['A'],
            dosen_name: 'Dosen',
            class_details: foundCourse.class_details || '',
            selectedClass: fallbackClassName || (foundCourse.class_names ? foundCourse.class_names.split(', ')[0] : 'A')
          };
          
          setCourse(courseData);
          
          const statsData = {
            totalStudents: foundCourse.total_students || 0,
            activeTasks: 0,
            completedTasks: 0,
            activeGroups: 0,
            pendingGrading: 0,
            averageGrade: 0
          };
          
          setStats(statsData);
          
        } else {
          const availableCourses = allCourses.map(course => ({
            id: course.course_id,
            name: course.course_name,
            code: course.course_code
          }));
          
          const errorMessage = availableCourses.length > 0 
            ? `Mata kuliah dengan ID ${actualCourseId} tidak ditemukan. Tersedia: ${availableCourses.map(c => `${c.code} (ID: ${c.id})`).join(', ')}`
            : 'Course not found';
            
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('Failed to fetch courses from API');
      }
    } catch (error) {
      console.error('CourseDetail - Error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    } else {
      setLoading(false);
      setError('ID mata kuliah tidak ditemukan');
    }
  }, [courseId]);

  // CourseOverview component removed

  // Handler untuk navigasi dari TaskManagement ke tab lain
  const handleNavigateToGroups = (taskId, taskTitle) => {
    setActiveTab('groups');
    // Pass taskId to GroupManagement via state or props
    // GroupManagement will handle the taskId internally
  };

  const handleNavigateToGrading = (taskId, taskTitle) => {
    setActiveTab('grading');
    // Pass taskId to GradingManagement via state or props
    // GradingManagement will handle the taskId internally
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <DosenTaskManagement 
            courseId={courseId}
            courseName={course?.name}
            classId={resolvedClassId || course?.classId}
            className={resolvedClassName || course?.selectedClass}
            onNavigateToGroups={handleNavigateToGroups}
            onNavigateToGrading={handleNavigateToGrading}
            onNavigateToExport={(taskId, taskTitle) => {
              // Export functionality will be handled in TaskManagement
            }}
          />
        );
      case 'groups':
        return (
          <DosenGroupManagement 
            courseId={courseId}
            classId={resolvedClassId || course?.classId}
            courseName={course?.name}
            className={resolvedClassName || course?.selectedClass}
          />
        );
      case 'grading':
        return (
          <DosenGradingManagement 
            courseId={courseId}
            courseName={course?.name}
            taskId={null}
            classId={resolvedClassId || course?.classId}
          />
        );
      default:
        return (
          <DosenTaskManagement 
            courseId={courseId}
            courseName={course?.name}
            classId={resolvedClassId || course?.classId}
            className={resolvedClassName || course?.selectedClass}
            onNavigateToGroups={handleNavigateToGroups}
            onNavigateToGrading={handleNavigateToGrading}
            onNavigateToExport={(taskId, taskTitle) => {
              // Export functionality will be handled in TaskManagement
            }}
          />
        );
    }
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Memuat data mata kuliah...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <AlertTriangle className="text-red-600 mr-3" size={24} />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-2">Akses Ditolak</h3>
              <p className="text-red-700 mb-3">{error}</p>
              <p className="text-red-600 text-sm mb-4">CourseID yang dicoba diakses: <span className="font-mono bg-red-100 px-2 py-1 rounded">{courseId}</span></p>
              
              {/* Show available courses if error mentions them */}
              {error.includes('Mata kuliah yang tersedia:') && (
                <div className="bg-white border border-red-200 rounded p-4 mt-4">
                  <h4 className="text-gray-800 font-medium mb-3">🔗 Link Mata Kuliah yang Tersedia:</h4>
                  <div className="space-y-2">
                    {/* Parse course info from error message and create links */}
                    {error.match(/([A-Z0-9]+) \(ID: (\d+)\)/g)?.map((match, index) => {
                      const [, code, id] = match.match(/([A-Z0-9]+) \(ID: (\d+)\)/);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 min-w-20">{code}:</span>
                          <a 
                            href={`/dosen/courses/${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/dosen/courses/${id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Buka Mata Kuliah {code} (ID: {id})
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={fetchCourseDetail}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
                <button 
                  onClick={() => navigate('/dosen/courses')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Kembali ke Daftar Mata Kuliah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && course && (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Mata Kuliah
            </button>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">{course.name}</span>
            {course.selectedClass && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-700 bg-blue-100 px-2 py-1 rounded-md text-sm font-medium">
                  Kelas {course.selectedClass}
                </span>
              </>
            )}
          </div>

          {/* Course Header */}
          <div className="bg-white p-6 rounded-lg shadow border mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.name}
                  {course.selectedClass && (
                    <span className="ml-3 text-lg font-normal text-gray-600">
                      - Kelas {course.selectedClass}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600">{course.code} • {course.sks} SKS</p>
                <p className="text-sm text-gray-500">Semester {course.semester}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Overview removed */}
          <div className="bg-white rounded-lg shadow border mb-6">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'tasks' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tugas Besar
              </button>
              <button 
                onClick={() => setActiveTab('groups')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'groups' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kelompok
              </button>
              <button 
                onClick={() => setActiveTab('grading')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'grading' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Penilaian
              </button>
            </div>

            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetail;