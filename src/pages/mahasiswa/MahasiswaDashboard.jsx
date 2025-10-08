import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Plus, Activity,
  BarChart3, User, MessageSquare, Filter, Search, GraduationCap,
  Target, Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MahasiswaLayout from '../../components/MahasiswaLayout';
import api, { getCurrentUser, getMahasiswaCourses } from '../../utils/api';

// Import halaman-halaman mahasiswa
import MahasiswaCourses from './MahasiswaCourses';
import MahasiswaCourseDetail from './MahasiswaCourseDetail';

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
    return 'Mahasiswa';
  };

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const StatsCard = ({ title, value, icon, description, trend, color = 'green' }) => (
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
              <User className="h-4 w-4 mr-1" />
              {course.lecturer}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Kelas {course.class}
            </span>
          </div>
          {course.schedule && (
            <div className="mt-1 text-xs text-gray-500">
              {course.schedule}
            </div>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {course.status === 'active' ? 'Aktif' : 'Selesai'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress Tugas</span>
          <span className="text-sm text-gray-600">{course.taskProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all" 
            style={{ width: `${course.taskProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <FileText className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-900">{course.totalTasks}</p>
          <p className="text-xs text-green-600">Total Tugas</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-blue-900">{course.completedTasks}</p>
          <p className="text-xs text-blue-600">Selesai</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-orange-900">{course.pendingTasks}</p>
          <p className="text-xs text-orange-600">Pending</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          <span>Nilai: {course.averageGrade || 'Belum ada'}</span>
        </div>
        <button 
          onClick={() => navigate(`/mahasiswa/dashboard/courses/${course.id}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          Lihat Detail
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-600 border-b-green-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-green-100">
              Pantau progress akademik dan kelola tugas kuliah Anda
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Semester Aktif</p>
            <p className="text-xl font-semibold">Ganjil 2024/2025</p>
            <div className="flex items-center mt-1">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span className="text-sm">IPK: {stats.gpa || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Mata Kuliah"
          value={stats.totalCourses}
          icon={<BookOpen className="h-6 w-6 text-green-600" />}
          description="Mata kuliah semester ini"
          trend={0}
          color="green"
        />
        <StatsCard
          title="Total SKS"
          value={stats.totalSKS}
          icon={<Target className="h-6 w-6 text-blue-600" />}
          description="SKS semester ini"
          trend={0}
          color="blue"
        />
        <StatsCard
          title="Tugas Selesai"
          value={stats.completedTasks}
          icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
          description="Tugas yang sudah dikumpulkan"
          trend={15}
          color="purple"
        />
        <StatsCard
          title="Tugas Pending"
          value={stats.pendingTasks}
          icon={<Clock className="h-6 w-6 text-orange-600" />}
          description="Tugas belum selesai"
          trend={-5}
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
                  onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
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
                    Anda belum terdaftar di mata kuliah manapun semester ini.<br />
                    Silakan lakukan registrasi mata kuliah terlebih dahulu.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg text-left max-w-md mx-auto">
                    <h4 className="font-medium text-green-900 mb-2">Cara mendaftar mata kuliah:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Akses sistem registrasi online</li>
                      <li>• Pilih mata kuliah sesuai kurikulum</li>
                      <li>• Pastikan tidak ada bentrok jadwal</li>
                      <li>• Konfirmasi registrasi sebelum deadline</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Deadline Mendatang</h3>
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{deadline.task}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deadline.daysLeft <= 3 
                          ? 'bg-red-100 text-red-800' 
                          : deadline.daysLeft <= 7
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {deadline.daysLeft} hari
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{deadline.course}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className={`${deadline.submitted ? 'text-green-600' : 'text-orange-600'}`}>
                        {deadline.submitted ? 'Sudah dikumpulkan' : 'Belum dikumpulkan'}
                      </span>
                      <span>{new Date(deadline.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tidak ada deadline mendatang</p>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`p-3 rounded-lg border-l-4 ${
                  activity.type === 'grade' 
                    ? 'border-green-500 bg-green-50' 
                    : activity.type === 'task'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-500 bg-gray-50'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Akademik</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Target IPK Semester</span>
                  <span className="text-sm text-gray-600">3.50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Penyelesaian Tugas</span>
                  <span className="text-sm text-gray-600">{stats.taskCompletionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${stats.taskCompletionRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.currentGPA}</p>
                    <p className="text-xs text-gray-600">IPK Saat Ini</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalCredits}</p>
                    <p className="text-xs text-gray-600">Total SKS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <BookOpen className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm font-medium">Lihat Semua Mata Kuliah</span>
              </button>
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/tugas')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Lihat Semua Tugas</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Star className="h-4 w-4 text-yellow-600 mr-3" />
                <span className="text-sm font-medium">Lihat Nilai</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Calendar className="h-4 w-4 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Jadwal Kuliah</span>
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

// Main MahasiswaDashboard Component with Routes
const MahasiswaDashboard = () => {
  const { user } = useAuth();
  
  // State for current user profile with complete data
  const [currentUser, setCurrentUser] = useState(user);
  
  // States for dynamic data
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalSKS: 0,
    completedTasks: 0,
    pendingTasks: 0,
    gpa: '0.00',
    currentGPA: '0.00',
    totalCredits: 0,
    taskCompletionRate: 0
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
      console.log('MahasiswaDashboard - Fetched user profile:', response.data);
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('MahasiswaDashboard - Error fetching user profile:', error);
      setCurrentUser(user);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real courses for this mahasiswa
      const coursesResponse = await getMahasiswaCourses();
      console.log('MahasiswaDashboard - Fetched courses:', coursesResponse.data);
      
      if (coursesResponse.data.success) {
        const enrolledCourses = coursesResponse.data.courses;
        
        // Transform courses data to match component expectations
        const transformedCourses = enrolledCourses.map(course => ({
          id: course.course_id,
          name: course.course_name,
          code: course.course_code,
          semester: `${course.semester} ${course.tahun_ajaran}`,
          lecturer: course.lecturer_name || 'Belum ditentukan',
          class: course.class_name || 'A',
          schedule: course.schedule || 'Jadwal akan diumumkan',
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          taskProgress: 0,
          averageGrade: null,
          status: 'active',
          sks: course.sks || 3
        }));
        
        // Calculate stats from real data
        const totalSKS = enrolledCourses.reduce((sum, course) => sum + (parseInt(course.sks) || 0), 0);
        const totalCourses = enrolledCourses.length;
        
        setStats({
          totalCourses,
          totalSKS,
          completedTasks: 0,
          pendingTasks: 0,
          gpa: '0.00',
          currentGPA: '0.00',
          totalCredits: totalSKS,
          taskCompletionRate: 0
        });
        
        setCourses(transformedCourses);
      } else {
        setCourses([]);
        setStats({
          totalCourses: 0,
          totalSKS: 0,
          completedTasks: 0,
          pendingTasks: 0,
          gpa: '0.00',
          currentGPA: '0.00',
          totalCredits: 0,
          taskCompletionRate: 0
        });
      }
      
      // Mock data for activities and deadlines
      setRecentActivities([
        {
          id: 1,
          type: 'info',
          message: 'Selamat datang di dashboard mahasiswa',
          time: 'Baru saja'
        }
      ]);
      
      setUpcomingDeadlines([]);
      
    } catch (error) {
      console.error('MahasiswaDashboard - Error fetching dashboard data:', error);
      
      setCourses([]);
      setStats({
        totalCourses: 0,
        totalSKS: 0,
        completedTasks: 0,
        pendingTasks: 0,
        gpa: '0.00',
        currentGPA: '0.00',
        totalCredits: 0,
        taskCompletionRate: 0
      });
      setRecentActivities([
        {
          id: 1,
          type: 'error',
          message: 'Gagal memuat data mata kuliah',
          time: 'Baru saja'
        }
      ]);
      setUpcomingDeadlines([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MahasiswaLayout>
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
        <Route path="mata-kuliah" element={<MahasiswaCourses />} />
        
        {/* Course Detail Page - dengan courseId */}
        <Route path="courses/:courseId" element={<MahasiswaCourseDetail />} />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/mahasiswa/dashboard" replace />} />
      </Routes>
    </MahasiswaLayout>
  );
};

export default MahasiswaDashboard;