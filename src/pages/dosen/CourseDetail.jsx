import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
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

  const fetchCourseDetail = async () => {
    console.log('CourseDetail - Fetching course with ID:', courseId);
    
    try {
      setLoading(true);
      setError('');
      
      // Get all courses for this dosen, then find the specific one
      const response = await getDosenCourses();
      
      if (response.data.success) {
        const allCourses = response.data.courses;
        const foundCourse = allCourses.find(course => course.course_id === parseInt(courseId));
        
        if (foundCourse) {
          console.log('CourseDetail - Course found:', foundCourse.course_name);
          
          const courseData = {
            id: foundCourse.course_id,
            name: foundCourse.course_name,
            code: foundCourse.course_code,
            semester: `${foundCourse.semester} ${foundCourse.tahun_ajaran}`,
            sks: foundCourse.sks || 3,
            description: foundCourse.deskripsi || '',
            classes: foundCourse.class_names ? foundCourse.class_names.split(', ') : ['A'],
            dosen_name: 'Dosen', // Will be from user context later
            class_details: foundCourse.class_details || ''
          };
          
          setCourse(courseData);
          
          // Calculate stats based on available data
          const statsData = {
            totalStudents: foundCourse.total_students || 0,
            activeTasks: Math.floor(Math.random() * 5), // Random for now
            completedTasks: Math.floor(Math.random() * 3), // Random for now
            activeGroups: Math.floor(Math.random() * 10), // Random for now
            pendingGrading: Math.floor(Math.random() * 15), // Random for now
            averageGrade: Math.floor(Math.random() * 40) + 60 // Random 60-100
          };
          
          setStats(statsData);
          
        } else {
          console.error('CourseDetail - Course not found with ID:', courseId);
          console.log('Available course IDs:', allCourses.map(c => c.course_id));
          throw new Error('Course not found');
        }
      } else {
        console.error('CourseDetail - API response not successful');
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('CourseDetail - Error:', error.message);
      setError('Gagal memuat detail mata kuliah. Silakan coba lagi.');
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
        <h4 className="text-lg font-semibold mb-4">Informasi Mata Kuliah</h4>
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
            <p className="text-sm text-gray-600 mb-1">Semester</p>
            <p className="font-medium">{course?.semester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">SKS</p>
            <p className="font-medium">{course?.sks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dosen Pengampu</p>
            <p className="font-medium">{course?.dosen_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kelas</p>
            <p className="font-medium">{course?.classes?.join(', ')}</p>
          </div>
        </div>
        {course?.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
            <p className="text-gray-700">{course.description}</p>
          </div>
        )}
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
          />
        );
      case 'groups':
        return (
          <DosenGroupManagement 
            courseId={courseId}
            courseName={course?.name}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="text-red-600 mr-2" size={20} />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-1">CourseID yang dicari: {courseId}</p>
            </div>
            <button 
              onClick={fetchCourseDetail}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {!loading && !error && course && (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => navigate('/dosen/courses')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Mata Kuliah
            </button>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">{course.name}</span>
          </div>

          {/* Course Header */}
          <div className="bg-white p-6 rounded-lg shadow border mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
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