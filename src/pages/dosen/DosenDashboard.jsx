import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Plus, Activity,
  BarChart3, User, MessageSquare, Filter, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import api, { getCurrentUser, getDosenCourses, getDosenClasses } from '../../utils/api';
import { getTugasBesar } from '../../utils/tugasBesarApi';

// Import halaman-halaman dosen
import DosenCourses from './DosenCourses';
import CourseDetail from './CourseDetail';
import DosenSettings from './DosenSettings';
import DosenAllTasks from './DosenAllTasks';
import DosenStudents from './DosenStudents';
import DosenStatistics from './DosenStatistics';

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

  const StatsCard = ({ title, value, icon, description, trend, color = 'blue', subtitle, action, onClick, badge, percentage }) => {
    // Unified blue color scheme with variations for visual hierarchy
    const colorVariations = {
      primary: { // Blue-600 base
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      secondary: { // Blue-500 lighter
        gradient: 'from-blue-400 to-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      accent: { // Blue-700 darker
        gradient: 'from-blue-600 to-blue-700',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-300',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        button: 'bg-blue-700 hover:bg-blue-800'
      },
      light: { // Blue-400 lightest
        gradient: 'from-blue-300 to-blue-400',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      }
    };
    
    // Map color prop to variation (all use blue, just different shades)
    const variationMap = {
      blue: 'primary',
      green: 'secondary',
      orange: 'accent',
      purple: 'light'
    };
    
    const colors = colorVariations[variationMap[color] || 'primary'];
    
    return (
      <div 
        className={`bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border ${colors.border} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} relative overflow-hidden group`}
        onClick={onClick}
      >
        {/* Subtle accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-60`}></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</p>
                {badge && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors.bg} ${colors.text} border ${colors.border} shadow-sm`}>
                    {badge}
                  </span>
                )}
                {trend && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    trend > 0 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-5xl font-extrabold text-gray-900">
                  {value}
                </p>
                {percentage !== undefined && (
                  <span className="text-lg font-semibold text-blue-600">({percentage}%)</span>
                )}
              </div>
              
              {subtitle && (
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {subtitle}
                </p>
              )}
              
              {description && (
                <p className="text-xs text-gray-600 leading-relaxed mt-2">{description}</p>
              )}
            </div>
            
            <div className={`p-4 ${colors.iconBg} rounded-xl flex-shrink-0 ml-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <div className={colors.iconColor}>
                {icon}
              </div>
            </div>
          </div>
          
          {action && (
            <div className="pt-4 mt-4 border-t border-blue-100">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg ${colors.button} text-white transition-all duration-200 text-sm font-semibold flex items-center justify-between group shadow-md hover:shadow-lg hover:scale-[1.02]`}
              >
                <span className="flex items-center gap-2">
                  <span>{action}</span>
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CourseCard = ({ course }) => (
    <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-blue-100 hover:border-blue-200 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{course.name}</h3>
          <p className="text-gray-700 text-sm mb-3">{course.code} • {course.sks} SKS • {course.semester}</p>
          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-700">
            <span className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
              <Users className="h-4 w-4 mr-1.5 text-blue-600" />
              <span className="font-medium">{course.students}</span>
              <span className="ml-1 text-gray-600">mahasiswa</span>
            </span>
            {course.totalClasses > 0 && (
              <span className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                <BookOpen className="h-4 w-4 mr-1.5 text-blue-600" />
                <span className="font-medium">{course.totalClasses}</span>
                <span className="ml-1 text-gray-600">kelas</span>
              </span>
            )}
          </div>
          {course.classes.length > 0 && (
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
              Kelas: {course.classes.join(', ')}
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
          course.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {course.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-900">Progress Semester</span>
          <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">{course.activeTasks}</p>
          <p className="text-xs text-gray-700 font-medium">Tugas Aktif</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">{course.pendingSubmissions}</p>
          <p className="text-xs text-gray-700 font-medium">Perlu Dinilai</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-blue-100">
        <span className="text-xs text-gray-600">Update terakhir: {course.lastActivity}</span>
        <button 
          onClick={() => navigate(`/dosen/dashboard/courses/${course.id}`)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center shadow-md hover:shadow-lg hover:scale-105"
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
          <p className="text-gray-700">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-blue-100 text-lg">
              Kelola mata kuliah dan mahasiswa Anda dengan efektif
            </p>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Semester Aktif</p>
            <p className="text-2xl font-bold">Ganjil 2024/2025</p>
          </div>
        </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Mata Kuliah"
          value={stats.totalCourses}
          subtitle={`${stats.totalCourses === 0 ? 'Belum ada' : stats.totalCourses === 1 ? '1 mata kuliah' : `${stats.totalCourses} mata kuliah`} aktif`}
          icon={<BookOpen className="h-7 w-7 text-white" />}
          description="Mata kuliah yang sedang Anda ajar pada semester Ganjil 2024/2025"
          color="blue"
          badge="Aktif"
          action="Lihat Semua Mata Kuliah"
          onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
        />
        <StatsCard
          title="Total Mahasiswa"
          value={stats.totalStudents}
          subtitle={`${stats.totalStudents === 0 ? 'Belum ada' : stats.totalStudents === 1 ? '1 mahasiswa' : `${stats.totalStudents} mahasiswa`} terdaftar`}
          icon={<Users className="h-7 w-7 text-white" />}
          description="Jumlah total mahasiswa yang terdaftar di semua kelas yang Anda ajar"
          color="green"
          badge="Terdaftar"
          action="Kelola Mahasiswa"
          onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
        />
        <StatsCard
          title="Tugas Aktif"
          value={stats.activeTasks}
          subtitle={`${stats.activeTasks === 0 ? 'Tidak ada' : stats.activeTasks === 1 ? '1 tugas' : `${stats.activeTasks} tugas`} sedang berjalan`}
          icon={<FileText className="h-7 w-7 text-white" />}
          description="Tugas besar yang sedang aktif dan dalam proses pengerjaan oleh mahasiswa"
          color="purple"
          badge="Berjalan"
          action="Lihat Tugas Aktif"
          onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
        />
        <StatsCard
          title="Perlu Dinilai"
          value={stats.pendingGrading}
          subtitle={`${stats.pendingGrading === 0 ? 'Tidak ada' : stats.pendingGrading === 1 ? '1 tugas' : `${stats.pendingGrading} tugas`} menunggu penilaian`}
          icon={<Clock className="h-7 w-7 text-white" />}
          description="Tugas yang sudah dikumpulkan oleh mahasiswa dan sedang menunggu untuk dinilai"
          color="orange"
          badge={stats.pendingGrading > 0 ? "Urgent" : "Selesai"}
          action="Mulai Penilaian"
          onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mata Kuliah Saya</h2>
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-blue-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                </select>
                <button 
                  onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center shadow-md hover:shadow-lg hover:scale-105"
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
                  <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Mata Kuliah</h3>
                  <p className="text-gray-700 mb-4">
                    Anda belum di-assign ke mata kuliah manapun.<br />
                    Silakan hubungi administrator untuk mendapatkan assignment.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-2">Cara mendapatkan assignment:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
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
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${
                  activity.urgent 
                    ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-50/50' 
                    : 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50/50'
                }`}>
                  <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600 mt-1.5">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Deadline Mendatang</h3>
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="p-4 border border-blue-200 rounded-xl hover:bg-blue-50/50 transition-all hover:shadow-md bg-white/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{deadline.task}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        deadline.daysLeft <= 3 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {deadline.daysLeft} hari
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mb-2 font-medium">{deadline.course}</p>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="font-medium">{deadline.submissions}/{deadline.totalStudents} terkumpul</span>
                      <span>{new Date(deadline.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">Tidak ada deadline mendatang</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                className="w-full text-left p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center group hover:shadow-md bg-white/50"
              >
                <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors mr-3 shadow-sm">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Lihat Semua Mata Kuliah</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/semua-tugas')}
                className="w-full text-left p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center group hover:shadow-md bg-white/50"
              >
                <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors mr-3 shadow-sm">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Lihat Semua Tugas</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/mahasiswa')}
                className="w-full text-left p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center group hover:shadow-md bg-white/50"
              >
                <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors mr-3 shadow-sm">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Kelola Mahasiswa</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/statistik')}
                className="w-full text-left p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center group hover:shadow-md bg-white/50"
              >
                <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors mr-3 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Lihat Statistik</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
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
  const location = useLocation();
  
  // Debug: Log route changes
  useEffect(() => {
    console.log('DosenDashboard - Current path:', location.pathname);
  }, [location.pathname]);
  
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
      
      // Fetch classes with statistics from database
      const classesResponse = await getDosenClasses();
      console.log('DosenDashboard - Fetched classes:', classesResponse.data);
      
      if (classesResponse.data.success) {
        const classes = classesResponse.data.classes || [];
        
        // Group classes by course_id to aggregate statistics per course
        const coursesMap = new Map();
        let totalActiveTasks = 0;
        let totalPendingGrading = 0;
        let totalStudents = 0;
        const now = new Date();
        
        // Process each class and aggregate by course
        for (const classItem of classes) {
          const courseId = classItem.courseId;
          
          if (!coursesMap.has(courseId)) {
            coursesMap.set(courseId, {
              id: courseId,
              name: classItem.courseName,
              code: classItem.courseCode,
              semester: `${classItem.semester} ${classItem.tahunAjaran}`,
              students: 0,
              classes: [],
              activeTasks: 0,
              pendingSubmissions: 0,
              progress: 0,
              status: 'active',
              sks: classItem.sks,
              totalClasses: 0,
              progressSum: 0,
              progressCount: 0
            });
          }
          
          const course = coursesMap.get(courseId);
          course.students += classItem.studentCount || 0;
          course.classes.push(classItem.className);
          course.totalClasses += 1;
          course.pendingSubmissions += classItem.pendingGrading || 0;
          
          // Calculate progress from class
          if (classItem.progress !== undefined && classItem.progress !== null) {
            course.progressSum += classItem.progress;
            course.progressCount += 1;
          }
          
          // Use activeTasks from classItem (calculated in backend)
          const activeTasksCount = classItem.activeTasks || 0;
          course.activeTasks += activeTasksCount;
          totalActiveTasks += activeTasksCount;
          
          totalPendingGrading += classItem.pendingGrading || 0;
          totalStudents += classItem.studentCount || 0;
        }
        
        // Transform courses map to array and calculate average progress
        const transformedCourses = Array.from(coursesMap.values()).map(course => {
          // Calculate average progress
          const avgProgress = course.progressCount > 0 
            ? Math.round(course.progressSum / course.progressCount)
            : 0;
          
          return {
            ...course,
            progress: avgProgress,
            lastActivity: 'Baru saja'
          };
        });
        
        // Calculate overall stats
        const totalCourses = transformedCourses.length;
        
        setStats({
          totalCourses,
          totalStudents,
          activeTasks: totalActiveTasks,
          pendingGrading: totalPendingGrading
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
        {/* Settings Page - Edit Profile (must be before index route) */}
        <Route path="settings" element={<DosenSettings />} />
        
        {/* Mata Kuliah List Page - sesuai dengan sidebar */}
        <Route path="mata-kuliah" element={<DosenCourses />} />
        
        {/* All Tasks Page */}
        <Route path="semua-tugas" element={<DosenAllTasks />} />
        
        {/* Students Management Page */}
        <Route path="mahasiswa" element={<DosenStudents />} />
        
        {/* Statistics Page */}
        <Route path="statistik" element={<DosenStatistics />} />
        
        {/* Course Detail Page - dengan courseId */}
        <Route path="courses/:courseId" element={<CourseDetail />} />
        
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
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dosen/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default DosenDashboard;