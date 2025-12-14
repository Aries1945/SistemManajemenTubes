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
import api, { getCurrentUser } from '../../utils/api';
import { getMahasiswaCourses, getAllTugasBesarMahasiswa } from '../../utils/mahasiswaApi';

// Import halaman-halaman mahasiswa
import MahasiswaCourses from './MahasiswaCourses';
import MahasiswaCourseDetail from './MahasiswaCourseDetail';
import MahasiswaAllTasks from './MahasiswaAllTasks';
import MahasiswaGrades from './MahasiswaGrades';
import MahasiswaSchedule from './MahasiswaSchedule';
import MahasiswaStatistics from './MahasiswaStatistics';

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
    <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 rounded-2xl"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <div className="text-green-600">
            {icon}
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
          <TrendingUp className={`h-4 w-4 text-${trend > 0 ? 'green' : 'red'}-500 mr-1`} />
          <span className={`text-xs font-medium text-${trend > 0 ? 'green' : 'red'}-600`}>
            {trend > 0 ? '+' : ''}{trend}% dari minggu lalu
          </span>
        </div>
      )}
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 group cursor-pointer">
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
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
          course.status === 'active' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
        }`}>
          {course.status === 'active' ? '✓ Aktif' : '○ Selesai'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all">
          <FileText className="h-5 w-5 text-green-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-900">{course.totalTasks}</p>
          <p className="text-xs font-medium text-green-600 mt-1">Total Tugas</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all">
          <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-blue-900">{course.completedTasks}</p>
          <p className="text-xs font-medium text-blue-600 mt-1">Selesai</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-all">
          <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-orange-900">{course.pendingTasks}</p>
          <p className="text-xs font-medium text-orange-600 mt-1">Pending</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-5 border-t border-gray-100">
        <div className="flex items-center px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-700">Nilai: <span className="text-yellow-600">{course.averageGrade || 'NA'}</span></span>
        </div>
        <button 
          onClick={() => navigate(`/mahasiswa/dashboard/courses/${course.id}`)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Lihat Detail
          <ChevronRight className="h-4 w-4 ml-2" />
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white p-8 rounded-3xl shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-green-50 text-lg font-medium">
              Kelola tugas kuliah dan mata kuliah Anda
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-xl">
            <p className="text-green-50 text-sm font-medium mb-1">Semester Aktif</p>
            <p className="text-2xl font-bold">Ganjil 2024/2025</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Mata Kuliah"
          value={stats.totalCourses}
          icon={<BookOpen className="h-7 w-7" />}
          description="Mata kuliah semester ini"
          trend={0}
          color="green"
        />
      </div>

      {/* Main Content - Courses */}
      <div className="space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-6 w-6 text-green-600 mr-3" />
                Mata Kuliah Saya
              </h2>
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                </select>
                <button 
                  onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Lihat Semua
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
          
          <div className="space-y-4">
            {(() => {
              // Filter courses based on selectedFilter
              const filteredCourses = courses.filter(course => {
                if (selectedFilter === 'all') return true;
                if (selectedFilter === 'active') return course.status === 'active';
                if (selectedFilter === 'completed') return course.status === 'completed';
                return true;
              });
              
              if (filteredCourses.length > 0) {
                return filteredCourses.slice(0, 3).map((course, index) => (
                  <CourseCard key={`course-${course.id}-${course.classId || index}-${course.class || ''}`} course={course} />
                ));
              } else if (courses.length > 0) {
                // No courses match the filter
                return (
                  <div className="text-center py-12">
                    <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tidak Ada Mata Kuliah {selectedFilter === 'active' ? 'Aktif' : selectedFilter === 'completed' ? 'Selesai' : ''}
                    </h3>
                    <p className="text-gray-500">
                      Tidak ada mata kuliah yang sesuai dengan filter yang dipilih.
                    </p>
                  </div>
                );
              } else {
                // No courses at all
                return (
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
                );
              }
            })()}
          </div>
          </div>
        </div>

        {/* Deadline and Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-3" />
                  Deadline Mendatang
                </h3>
                <div className="p-2 bg-orange-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map(deadline => (
                    <div key={deadline.id} className="p-4 border border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300 group cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-orange-900 transition-colors">{deadline.task}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          deadline.daysLeft <= 3 
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' 
                            : deadline.daysLeft <= 7
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        }`}>
                          {deadline.daysLeft} hari
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 font-medium">{deadline.course}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-semibold ${deadline.submitted ? 'text-green-600' : 'text-orange-600'}`}>
                          {deadline.submitted ? '✓ Sudah dikumpulkan' : '○ Belum dikumpulkan'}
                        </span>
                        <span className="text-gray-500">{new Date(deadline.deadline).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Tidak ada deadline mendatang</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-blue-500 mr-3" />
                  Aktivitas Terbaru
                </h3>
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className={`p-4 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                    activity.type === 'grade' 
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
                      : activity.type === 'task'
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                      : 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50'
                  }`}>
                    <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="h-5 w-5 text-purple-500 mr-3" />
              Aksi Cepat
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
                className="group p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Mata Kuliah</span>
              </button>
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/tugas')}
                className="group p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Tugas</span>
              </button>
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/nilai')}
                className="group p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border border-yellow-200 hover:border-yellow-300 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Nilai</span>
              </button>
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/jadwal')}
                className="group p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Jadwal</span>
              </button>
              <button 
                onClick={() => navigate('/mahasiswa/dashboard/statistik')}
                className="group p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 hover:border-orange-300 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Statistik</span>
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
      // Handle different response structures
      const responseData = coursesResponse?.data || coursesResponse;
      
      if (responseData && responseData.success) {
        const enrolledCourses = responseData.courses;
        
        // Transform courses data to match component expectations
        // Determine course status based on semester and year
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentSemester = currentMonth >= 1 && currentMonth <= 6 ? 'Ganjil' : 'Genap';
        
        const transformedCourses = enrolledCourses.map(course => {
          // Determine status: active if current semester/year matches, otherwise completed
          const courseSemester = course.semester || 'Ganjil';
          const courseYear = course.tahun_ajaran || `${currentYear}/${currentYear + 1}`;
          const isCurrentSemester = courseSemester === currentSemester && 
                                   courseYear.includes(currentYear.toString());
          
          return {
            id: course.course_id,
            classId: course.class_id,
            name: course.course_name,
            code: course.course_code,
            semester: `${course.semester} ${course.tahun_ajaran}`,
            lecturer: course.dosen_name || 'Belum ditentukan',
            class: course.class_name || 'A',
            schedule: course.schedule || 'Jadwal akan diumumkan',
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            taskProgress: 0,
            averageGrade: course.nilai_akhir || null,
            status: isCurrentSemester ? 'active' : 'completed',
            sks: course.sks || 3
          };
        });
        
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
        
        {/* All Tasks Page */}
        <Route path="tugas" element={<MahasiswaAllTasks />} />
        
        {/* Grades Page */}
        <Route path="nilai" element={<MahasiswaGrades />} />
        
        {/* Schedule Page */}
        <Route path="jadwal" element={<MahasiswaSchedule />} />
        
        {/* Statistics Page */}
        <Route path="statistik" element={<MahasiswaStatistics />} />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/mahasiswa/dashboard" replace />} />
      </Routes>
    </MahasiswaLayout>
  );
};

export default MahasiswaDashboard;