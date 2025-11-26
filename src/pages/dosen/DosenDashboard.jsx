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
    const colorClasses = {
      blue: {
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        light: 'bg-blue-50',
        dark: 'bg-blue-600'
      },
      green: {
        gradient: 'from-green-500 to-emerald-600',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        light: 'bg-green-50',
        dark: 'bg-green-600'
      },
      orange: {
        gradient: 'from-orange-500 to-amber-600',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        iconBg: 'bg-orange-100',
        light: 'bg-orange-50',
        dark: 'bg-orange-600'
      },
      purple: {
        gradient: 'from-purple-500 to-pink-600',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        light: 'bg-purple-50',
        dark: 'bg-purple-600'
      }
    };
    
    const colors = colorClasses[color] || colorClasses.blue;
    
    return (
      <div 
        className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${colors.border} ${onClick ? 'cursor-pointer' : ''} relative overflow-hidden`}
        onClick={onClick}
      >
        {/* Decorative corner gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-5 rounded-bl-full`}></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</p>
                {badge && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {badge}
                  </span>
                )}
                {trend && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    trend > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  {value}
                </p>
                {percentage !== undefined && (
                  <span className="text-lg font-semibold text-gray-400">({percentage}%)</span>
                )}
              </div>
              
              {subtitle && (
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  {subtitle}
                </p>
              )}
              
              {description && (
                <p className="text-xs text-gray-500 leading-relaxed mt-2">{description}</p>
              )}
            </div>
            
            <div className={`p-4 bg-gradient-to-br ${colors.gradient} rounded-xl shadow-lg flex-shrink-0 ml-4`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          </div>
          
          {action && (
            <div className="pt-4 mt-4 border-t-2 border-gray-100">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl ${colors.bg} ${colors.text} hover:opacity-90 transition-all duration-200 text-sm font-bold flex items-center justify-between group border ${colors.border}`}
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100">
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-blue-100 text-lg">
              Kelola mata kuliah dan mahasiswa Anda dengan efektif
            </p>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/dosen/dashboard/mata-kuliah')}
                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mr-3">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Lihat Semua Mata Kuliah</span>
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/semua-tugas')}
                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors mr-3">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Lihat Semua Tugas</span>
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/mahasiswa')}
                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 flex items-center group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors mr-3">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Kelola Mahasiswa</span>
              </button>
              <button 
                onClick={() => navigate('/dosen/dashboard/statistik')}
                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 flex items-center group"
              >
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors mr-3">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Lihat Statistik</span>
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