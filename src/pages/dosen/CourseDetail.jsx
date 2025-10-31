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
import { getDosenCourses } from '../../utils/api';
import DosenTaskManagement from '../../components/dosen/DosenTaskManagement';
import DosenGroupManagement from '../../components/dosen/DosenGroupManagement';
import DosenGradingManagement from '../../components/dosen/DosenGradingManagement';

const CourseDetail = () => {
  const { courseId } = useParams(); // Fixed: changed from 'id' to 'courseId'
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  
  // NEW: Class-specific information from navigation state
  const classInfo = location.state || {};
  const classId = classInfo.classId;
  const className = classInfo.className;
  
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
      if (classInfo && Object.keys(classInfo).length > 0) {// Use the class-specific data directly from DosenCourses navigation
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
        
        // Use class-specific stats
        const statsData = {
          totalStudents: classInfo.students || classInfo.studentCount || 0,
          activeTasks: classInfo.tugasBesar || classInfo.tasks || 0,
          completedTasks: Math.floor((classInfo.tugasBesar || 0) * 0.3), // 30% completed estimate
          activeGroups: classInfo.activeGroups || Math.floor((classInfo.students || 20) / 4),
          pendingGrading: classInfo.pendingGrading || Math.floor(Math.random() * 10),
          averageGrade: classInfo.progress || Math.floor(Math.random() * 40) + 60
        };
        
        setStats(statsData);
        
        return; // Use class-specific data, no need to fetch from API
      }
      
      // FALLBACK: If no class info in state, try to fetch from API (legacy)// Parse courseId if in legacy format
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
            activeTasks: Math.floor(Math.random() * 5),
            completedTasks: Math.floor(Math.random() * 3),
            activeGroups: Math.floor(Math.random() * 10),
            pendingGrading: Math.floor(Math.random() * 15),
            averageGrade: Math.floor(Math.random() * 40) + 60
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

  const CourseOverview = ({ course, stats }) => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Mahasiswa</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalStudents}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Tugas Aktif</p>
              <p className="text-2xl font-bold text-green-700">{stats.activeTasks}</p>
            </div>
            <FileText className="text-green-600" size={32} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Kelompok Aktif</p>
              <p className="text-2xl font-bold text-purple-700">{stats.activeGroups}</p>
            </div>
            <Users className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Perlu Dinilai</p>
              <p className="text-2xl font-bold text-orange-700">{stats.pendingGrading}</p>
            </div>
            <AlertTriangle className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Informasi Kelas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nama Mata Kuliah</p>
            <p className="font-medium">{course?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kode Mata Kuliah</p>
            <p className="font-medium">{course?.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kelas</p>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm">
                {course?.selectedClass}
              </span>
              {classInfo.classId && (
                <span className="text-xs text-gray-500">(ID: {classInfo.classId})</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dosen Pengampu</p>
            <p className="font-medium">{course?.dosen_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Semester</p>
            <p className="font-medium">{course?.semester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">SKS</p>
            <p className="font-medium">{course?.sks}</p>
          </div>
          {classInfo.schedule && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Jadwal</p>
              <p className="font-medium">{classInfo.schedule}</p>
            </div>
          )}
          {classInfo.ruangan && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Ruangan</p>
              <p className="font-medium">{classInfo.ruangan}</p>
            </div>
          )}
          {classInfo.kapasitas && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Kapasitas</p>
              <p className="font-medium">{classInfo.kapasitas} mahasiswa</p>
            </div>
          )}
        </div>
        
        {/* Class-specific description */}
        {course?.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Deskripsi Mata Kuliah</p>
            <p className="text-gray-700">{course.description}</p>
          </div>
        )}
        
        {/* Class-specific information highlight */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="text-blue-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-800">
                Kelas {course?.selectedClass} - {course?.name}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Anda sedang mengelola kelas {course?.selectedClass} dengan {stats.totalStudents} mahasiswa. 
                Semua data dan tugas besar di halaman ini khusus untuk kelas ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tugas Selesai</p>
              <p className="text-xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rata-rata Nilai</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageGrade}</p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Progress Semester</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round((stats.completedTasks / (stats.activeTasks + stats.completedTasks || 1)) * 100)}%
              </p>
            </div>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h4>
        <div className="space-y-3">
          {stats.activeTasks > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
              <Clock className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="font-medium">Ada {stats.activeTasks} tugas aktif</p>
                <p className="text-sm text-gray-600">Mahasiswa sedang mengerjakan tugas</p>
              </div>
            </div>
          )}
          {stats.pendingGrading > 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded">
              <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
              <div>
                <p className="font-medium">{stats.pendingGrading} tugas perlu dinilai</p>
                <p className="text-sm text-gray-600">Tugas menunggu penilaian dari dosen</p>
              </div>
            </div>
          )}
          {stats.activeGroups > 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <Users className="text-green-600 mt-0.5" size={16} />
              <div>
                <p className="font-medium">{stats.activeGroups} kelompok aktif</p>
                <p className="text-sm text-gray-600">Kelompok sedang mengerjakan proyek</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aksi Cepat</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FileText className="text-blue-600 mb-2" size={24} />
            <p className="font-medium">Kelola Tugas Besar</p>
            <p className="text-sm text-gray-600">Buat dan atur tugas besar</p>
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Users className="text-green-600 mb-2" size={24} />
            <p className="font-medium">Kelola Kelompok</p>
            <p className="text-sm text-gray-600">Atur kelompok mahasiswa</p>
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Star className="text-purple-600 mb-2" size={24} />
            <p className="font-medium">Input Penilaian</p>
            <p className="text-sm text-gray-600">Berikan nilai dan feedback</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CourseOverview course={course} stats={stats} />;
      case 'tasks':
        return (
          <DosenTaskManagement 
            courseId={courseId}
            courseName={course?.name}
            classId={classId}
            className={className}
          />
        );
      case 'groups':
        return (
          <DosenGroupManagement 
            courseId={courseId}
            classId={classId}
            courseName={course?.name}
            className={course?.selectedClass}
          />
        );
      case 'grading':
        return (
          <DosenGradingManagement 
            courseId={courseId}
            courseName={course?.name}
          />
        );
      default:
        return <CourseOverview course={course} stats={stats} />;
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

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow border mb-6">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
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