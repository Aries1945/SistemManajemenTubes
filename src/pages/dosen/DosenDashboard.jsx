import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Plus, Activity,
  BarChart3, User, MessageSquare, Filter, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DosenSidebar from '../../components/dosen/DosenSidebar';
import DosenCourses from './DosenCourses';
import CourseDetail from './CourseDetail';
import api, { getCurrentUser, getDosenCourses } from '../../utils/api';

const DosenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Debug: Log user data
  console.log('DosenDashboard - User data:', user);
  
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
  const [quickActions, setQuickActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      await fetchUserProfile(); // Fetch complete user profile first
      await fetchDashboardData(); // Then fetch dashboard data
    };
    
    initializeDashboard();
  }, [user]); // Re-fetch when user changes

  // Fetch current user profile with complete data including nama_lengkap
  const fetchUserProfile = async () => {
    try {
      const response = await getCurrentUser();
      console.log('DosenDashboard - Fetched user profile:', response.data);
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('DosenDashboard - Error fetching user profile:', error);
      // Fallback to context user if API fails
      setCurrentUser(user);
    }
  };

  // Function to extract name from email
  const getUserDisplayName = () => {
    console.log('DosenDashboard - getUserDisplayName - currentUser:', currentUser);
    
    if (currentUser?.nama_lengkap) return currentUser.nama_lengkap;
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) {
      // Extract name from email (e.g., "john.doe@lecturer.unpar.ac.id" -> "John Doe")
      const name = currentUser.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Dosen';
  };

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    console.log('DosenDashboard - Current hour:', hour);
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
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
          tasks: 0, // Will be updated when tasks API is available
          activeGroups: parseInt(course.total_groups) || 0
        }));

        setCourses(transformedCourses);
        
        // Calculate stats from real data
        const totalStudents = transformedCourses.reduce((sum, course) => sum + course.students, 0);
        
        setStats(prevStats => ({
          ...prevStats,
          totalCourses: transformedCourses.length,
          totalStudents: totalStudents,
          activeTasks: 0, // Will be updated when tasks API is available
          pendingGrading: 0 // Will be updated when grading API is available
        }));

        // Generate sample recent activities based on real courses
        const activities = transformedCourses.slice(0, 3).map((course, index) => ({
          id: index + 1,
          title: `Mahasiswa bergabung ke ${course.name}`,
          description: `${course.students} mahasiswa terdaftar`,
          timestamp: `${index + 1} jam yang lalu`,
          icon: <Users className="h-4 w-4" />,
          iconBg: 'bg-green-100'
        }));
        
        setRecentActivities(activities);
      } else {
        console.warn('DosenDashboard - Failed to fetch courses:', coursesResponse.data.message);
        // Use fallback data if API fails
        setCourses([]);
        setStats(prevStats => ({
          ...prevStats,
          totalCourses: 0,
          totalStudents: 0
        }));
      }
      
    } catch (error) {
      console.error('DosenDashboard - Error fetching dashboard data:', error);
      // Set fallback data
      setCourses([]);
      setStats(prevStats => ({
        ...prevStats,
        totalCourses: 0,
        totalStudents: 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DosenSidebar 
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
                        Selamat datang di dashboard dosen
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Bell className="h-6 w-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          3
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
                        <p className="text-sm font-medium text-gray-600">Total Mata Kuliah</p>
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
                        <p className="text-sm font-medium text-gray-600">Total Mahasiswa</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <FileText className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tugas Aktif</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Clock className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Menunggu Penilaian</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
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
                            onClick={() => navigate('/dosen/dashboard/courses')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
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
                                    <p className="text-sm text-gray-600">{course.code} • {course.semester}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{course.students} mahasiswa</p>
                                    <p className="text-xs text-gray-500">{course.tasks} tugas</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">Belum ada mata kuliah yang ditugaskan</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                            <Plus className="h-4 w-4 text-blue-600 mr-3" />
                            <span className="text-sm font-medium">Buat Tugas Baru</span>
                          </button>
                          <button 
                            onClick={() => navigate('/dosen/dashboard/assignments')}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <FileText className="h-4 w-4 text-green-600 mr-3" />
                            <span className="text-sm font-medium">Lihat Semua Tugas</span>
                          </button>
                          <button 
                            onClick={() => navigate('/dosen/dashboard/students')}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <Users className="h-4 w-4 text-purple-600 mr-3" />
                            <span className="text-sm font-medium">Kelola Mahasiswa</span>
                          </button>
                          <button 
                            onClick={() => navigate('/dosen/dashboard/grading')}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <BarChart3 className="h-4 w-4 text-orange-600 mr-3" />
                            <span className="text-sm font-medium">Lihat Statistik</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            
            {/* Existing routes */}
            <Route path="/courses" element={<DosenCourses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            
            {/* Placeholder routes untuk menu sidebar lainnya */}
            <Route path="/students" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Daftar Mahasiswa</h1>
                <p className="text-gray-600">Halaman daftar mahasiswa sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/assignments" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Tugas & Proyek</h1>
                <p className="text-gray-600">Halaman tugas dan proyek sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/grading" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Penilaian</h1>
                <p className="text-gray-600">Halaman penilaian sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/schedule" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Jadwal</h1>
                <p className="text-gray-600">Halaman jadwal sedang dalam pengembangan.</p>
              </div>
            } />
            
            <Route path="/settings" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Pengaturan</h1>
                <p className="text-gray-600">Halaman pengaturan sedang dalam pengembangan.</p>
              </div>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dosen/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DosenDashboard;