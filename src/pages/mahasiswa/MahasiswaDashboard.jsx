import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Star, Activity,
  BarChart3, User, MessageSquare, Filter, Search, Target, Trophy
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MahasiswaSidebar from "../../components/mahasiswa/MahasiswaSidebar";
import MahasiswaCourses from "./MahasiswaCourses";
import MahasiswaCourseDetail from "./MahasiswaCourseDetail";
import MahasiswaAssignments from "./MahasiswaAssignments";
import MahasiswaGroups from "./MahasiswaGroups";
import api, { getCurrentUser, getMahasiswaClasses } from "../../utils/api";

const MahasiswaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Debug: Log user data
  console.log('MahasiswaDashboard - User data:', user);

  // State for current user profile with complete data
  const [currentUser, setCurrentUser] = useState(null);

  // Sync currentUser with user from context initially
  useEffect(() => {
    if (user && !currentUser) {
      console.log('Setting initial currentUser from context:', user);
      setCurrentUser(user);
    }
  }, [user, currentUser]);

  // States for dynamic data
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeGroups: 0,
    completedTasks: 0,
    averageGrade: 0
  });

  const [courses, setCourses] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('current');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      console.log(`[${new Date().toISOString()}] initializeDashboard started with user:`, user);
      await fetchUserProfile(); // Fetch complete user profile first
      console.log(`[${new Date().toISOString()}] fetchUserProfile completed`);
      await fetchDashboardData(); // Then fetch dashboard data
      console.log(`[${new Date().toISOString()}] fetchDashboardData completed`);
    };
    
    if (user) {
      initializeDashboard();
    }
  }, [user]); // Re-fetch when user changes

  // Re-render when user data changes
  useEffect(() => {
    console.log('User data changed:', user);
  }, [user]);

  // Fetch current user profile with complete data including NIM
  const fetchUserProfile = async () => {
    try {
      console.log(`[${new Date().toISOString()}] fetchUserProfile started`);
      const response = await getCurrentUser();
      console.log(`[${new Date().toISOString()}] fetchUserProfile response:`, response.data);
      
      if (response.data && response.data.user) {
        console.log('Setting currentUser with fetched data:', response.data.user);
        setCurrentUser(response.data.user);
      } else {
        console.warn('No user data in response, using fallback');
        setCurrentUser(user);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching user profile:`, error);
      // Fallback to context user if API fails
      console.log('Fallback to context user:', user);
      setCurrentUser(user);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log(`[${new Date().toISOString()}] fetchDashboardData started`);
      
      // Fetch enrolled classes from API
      let enrolledClasses = [];
      try {
        const classesResponse = await getMahasiswaClasses();
        console.log('Enrolled classes response:', classesResponse.data);
        enrolledClasses = classesResponse.data.classes || [];
      } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        // Use fallback empty array if API fails
        enrolledClasses = [];
      }

      // Transform enrolled classes to match course format
      const transformedCourses = enrolledClasses.map(classItem => ({
        id: classItem.class_id,
        name: classItem.course_name,
        code: classItem.course_code,
        semester: `${classItem.semester} ${classItem.tahun_ajaran}`,
        progress: 75, // Sample progress
        instructor: classItem.dosen_name,
        nextDeadline: "2 hari",
        status: "active"
      }));

      setCourses(transformedCourses);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalCourses: transformedCourses.length,
        activeGroups: 0, // Will be updated when groups API is available
        completedTasks: 0, // Will be updated when tasks API is available
        averageGrade: 0 // Will be updated when grades API is available
      }));

      // Generate sample notifications
      const sampleNotifications = [
        {
          id: 1,
          title: "Tugas Baru Tersedia",
          message: "Ada tugas baru untuk mata kuliah Pemrograman Web",
          time: "2 jam yang lalu",
          type: "assignment"
        },
        {
          id: 2,
          title: "Hasil Penilaian",
          message: "Nilai tugas Basis Data telah tersedia",
          time: "1 hari yang lalu",
          type: "grade"
        }
      ];
      
      setNotifications(sampleNotifications);

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in fetchDashboardData:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract name from email or use existing name
  const getUserDisplayName = () => {
    if (currentUser?.nama_lengkap) return currentUser.nama_lengkap;
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) {
      // Extract name from email (e.g., "john.doe@student.unpar.ac.id" -> "John Doe")
      const name = currentUser.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Mahasiswa';
  };

  // Function to get user NIM
  const getUserNIM = () => {
    if (currentUser?.nim) return currentUser.nim;
    if (currentUser?.student_id) return currentUser.student_id;
    return '-';
  };

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MahasiswaSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <div className={`flex-1 transition-all duration-300`}>
        <div className="p-6">
          <Routes>
            {/* Dashboard route - default content */}
            <Route path="/" element={
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {getGreeting()}, {getUserDisplayName()}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        NIM: {getUserNIM()} • Selamat datang di dashboard mahasiswa
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Bell className="h-6 w-6 text-gray-600 hover:text-green-600 cursor-pointer" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {notifications.length}
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Mata Kuliah</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Kelompok Aktif</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <FileText className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tugas Selesai</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Trophy className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageGrade || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mata Kuliah */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">Mata Kuliah Anda</h2>
                          <button 
                            onClick={() => navigate('/mahasiswa/dashboard/courses')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                          >
                            Lihat Semua
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        {isLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : courses.length > 0 ? (
                          <div className="space-y-4">
                            {courses.slice(0, 3).map((course) => (
                              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                                    <p className="text-sm text-gray-600">{course.code} • {course.instructor}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Progress: {course.progress}%</p>
                                    <p className="text-xs text-gray-500">Deadline: {course.nextDeadline}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">Belum ada mata kuliah yang diambil</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-4">Tidak ada notifikasi baru</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            
            {/* Existing routes */}
            <Route path="/courses" element={<MahasiswaCourses />} />
            <Route path="/courses/:courseId" element={<MahasiswaCourseDetail />} />
            <Route path="/assignments" element={<MahasiswaAssignments />} />
            <Route path="/groups" element={<MahasiswaGroups />} />
            
            {/* Placeholder routes untuk menu sidebar lainnya */}
            <Route path="/grades" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Nilai</h1>
                <p className="text-gray-600">Halaman nilai sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/schedule" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Jadwal</h1>
                <p className="text-gray-600">Halaman jadwal sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/discussions" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Diskusi</h1>
                <p className="text-gray-600">Halaman diskusi sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/profile" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Profil</h1>
                <p className="text-gray-600">Halaman profil sedang dalam pengembangan.</p>
              </div>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/mahasiswa/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaDashboard;