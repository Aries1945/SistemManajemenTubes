import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Plus, Activity,
  BarChart3, User, MessageSquare, Filter, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import api, { getCurrentUser, getDosenCourses } from '../../utils/api';

// Import halaman-halaman dosen
import DosenCourses from './DosenCourses';
import CourseDetail from './CourseDetail';

// Component untuk Dashboard Overview (halaman utama)
const DashboardOverview = ({ 
  user, 
  currentUser, 
  stats, 
  courses, 
  recentActivities, 
  upcomingDeadlines, 
  selectedFilter, 
  setSelectedFilter,
  isLoading 
}) => {
  const navigate = useNavigate();

  // Function to extract name from email
  const getUserDisplayName = () => {
    if (currentUser?.nama_lengkap) return currentUser.nama_lengkap;
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) {
      const name = currentUser.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Dosen';
  };

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const StatsCard = ({ title, value, icon, description, trend, color = 'blue' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${color}-500 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          <TrendingUp className={`h-4 w-4 text-${trend > 0 ? 'green' : 'red'}-500 mr-1`} />
          <span className={`text-sm font-medium text-${trend > 0 ? 'green' : 'red'}-600`}>
            {trend > 0 ? '+' : ''}{trend}% dari minggu lalu
          </span>
        </div>
      )}
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
          <p className="text-gray-600 text-sm">{course.code} • {course.sks} SKS • {course.semester}</p>
          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.students} mahasiswa
            </span>
            {course.totalClasses > 0 && (
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.totalClasses} kelas
              </span>
            )}
          </div>
          {course.classes.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Kelas: {course.classes.join(', ')}
            </div>
          )}
          {course.classDetails && (
            <div className="mt-1 text-xs text-gray-400">
              {course.classDetails}
            </div>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {course.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Semester</span>
          <span className="text-sm text-gray-600">{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-blue-900">{course.activeTasks}</p>
          <p className="text-xs text-blue-600">Tugas Aktif</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-orange-900">{course.pendingSubmissions}</p>
          <p className="text-xs text-orange-600">Perlu Dinilai</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">Update terakhir: {course.lastActivity}</span>
        <button 
          onClick={() => navigate(`/dosen/dashboard/courses/${course.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          Kelola
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-blue-100">
              Kelola mata kuliah dan mahasiswa Anda dengan efektif
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Semester Aktif</p>
            <p className="text-xl font-semibold">Ganjil 2024/2025</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Mata Kuliah"
          value={stats.totalCourses}
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
          description="Mata kuliah aktif"
          trend={5}
          color="blue"
        />
        <StatsCard
          title="Total Mahasiswa"
          value={stats.totalStudents}
          icon={<Users className="h-6 w-6 text-green-600" />}
          description="Mahasiswa terdaftar"
          trend={8}
          color="green"
        />
        <StatsCard
          title="Tugas Aktif"
          value={stats.activeTasks}
          icon={<FileText className="h-6 w-6 text-purple-600" />}
          description="Tugas yang sedang berjalan"
          trend={-2}
          color="purple"
        />
        <StatsCard
          title="Perlu Dinilai"
          value={stats.pendingGrading}
          icon={<Clock className="h-6 w-6 text-orange-600" />}
          description="Tugas menunggu penilaian"
          trend={12}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mata Kuliah Saya</h2>
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                </select>
                <button 
                  onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  Lihat Semua
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.slice(0, 3).map(course => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Mata Kuliah</h3>
                  <p className="text-gray-500 mb-4">
                    Anda belum di-assign ke mata kuliah manapun.<br />
                    Silakan hubungi administrator untuk mendapatkan assignment.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">Cara mendapatkan assignment:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Hubungi administrator sistem</li>
                      <li>• Administrator akan membuat kelas dan meng-assign Anda</li>
                      <li>• Mata kuliah akan muncul di dashboard setelah di-assign</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`p-3 rounded-lg border-l-4 ${
                  activity.urgent 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-blue-500 bg-blue-50'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline Mendatang</h3>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{deadline.task}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deadline.daysLeft <= 3 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {deadline.daysLeft} hari
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{deadline.course}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{deadline.submissions}/{deadline.totalStudents} terkumpul</span>
                      <span>{new Date(deadline.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tidak ada deadline mendatang</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <BookOpen className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Lihat Semua Mata Kuliah</span>
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm font-medium">Lihat Semua Tugas</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Users className="h-4 w-4 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Kelola Mahasiswa</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <BarChart3 className="h-4 w-4 text-orange-600 mr-3" />
                <span className="text-sm font-medium">Lihat Statistik</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DosenDashboard Component with Routes
const DosenDashboard = () => {
  const { user } = useAuth();
  
  // State for current user profile with complete data
  const [currentUser, setCurrentUser] = useState(user);
  
  // States for dynamic data
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeTasks: 0,
    pendingGrading: 0
  });
  
  const [courses, setCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const initializeDashboard = async () => {
      await fetchUserProfile();
      await fetchDashboardData();
    };
    
    initializeDashboard();
  }, [user]);

  // Fetch current user profile with complete data including nama_lengkap
  const fetchUserProfile = async () => {
    try {
      const response = await getCurrentUser();
      console.log('DosenDashboard - Fetched user profile:', response.data);
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('DosenDashboard - Error fetching user profile:', error);
      setCurrentUser(user);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real courses assigned to this dosen
      const coursesResponse = await getDosenCourses();
      console.log('DosenDashboard - Fetched courses:', coursesResponse.data);
      
      if (coursesResponse.data.success) {
        const assignedCourses = coursesResponse.data.courses;
        
        // Transform courses data to match component expectations
        const transformedCourses = assignedCourses.map(course => ({
          id: course.course_id,
          name: course.course_name,
          code: course.course_code,
          semester: `${course.semester} ${course.tahun_ajaran}`,
          students: parseInt(course.total_students) || 0,
          classes: course.class_names ? course.class_names.split(', ') : [],
          classDetails: course.class_details || '',
          activeTasks: 0,
          pendingSubmissions: 0,
          lastActivity: 'Baru saja',
          progress: 75,
          status: 'active',
          sks: course.sks,
          totalClasses: parseInt(course.total_classes) || 0
        }));
        
        // Calculate stats from real data
        const totalStudents = assignedCourses.reduce((sum, course) => sum + (parseInt(course.total_students) || 0), 0);
        const totalCourses = assignedCourses.length;
        
        setStats({
          totalCourses,
          totalStudents,
          activeTasks: 0,
          pendingGrading: 0
        });
        
        setCourses(transformedCourses);
      } else {
        setCourses([]);
        setStats({
          totalCourses: 0,
          totalStudents: 0,
          activeTasks: 0,
          pendingGrading: 0
        });
      }
      
      // Mock data for activities and deadlines
      setRecentActivities([
        {
          id: 1,
          type: 'info',
          message: 'Selamat datang di dashboard dosen',
          time: 'Baru saja',
          urgent: false
        }
      ]);
      
      setUpcomingDeadlines([]);
      
    } catch (error) {
      console.error('DosenDashboard - Error fetching dashboard data:', error);
      
      setCourses([]);
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        activeTasks: 0,
        pendingGrading: 0
      });
      setRecentActivities([
        {
          id: 1,
          type: 'error',
          message: 'Gagal memuat data mata kuliah',
          time: 'Baru saja',
          urgent: true
        }
      ]);
      setUpcomingDeadlines([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Routes>
        {/* Dashboard Overview - Default route */}
        <Route 
          index 
          element={
            <DashboardOverview
              user={user}
              currentUser={currentUser}
              stats={stats}
              courses={courses}
              recentActivities={recentActivities}
              upcomingDeadlines={upcomingDeadlines}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              isLoading={isLoading}
            />
          } 
        />
        
        {/* Mata Kuliah List Page - sesuai dengan sidebar */}
        <Route path="mata-kuliah" element={<DosenCourses />} />
        
        {/* Course Detail Page - dengan courseId */}
        <Route path="courses/:courseId" element={<CourseDetail />} />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dosen/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default DosenDashboard;