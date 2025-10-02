import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, User, ChevronDown, Plus, Edit, Trash2, Settings, LogOut, Bell, Search, Star, CheckCircle, BarChart3, Shield, Database, UserCheck, Activity, TrendingUp, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import CreateDosenModal from '../../components/admin/CreateDosenModal';
import CreateMahasiswaModal from '../../components/admin/CreateMahasiswaModal';
import CreateCourseModal from '../../components/admin/CreateCourseModal';
import CreateClassModal from '../../components/admin/CreateClassModal';
import EnrollStudentsModal from '../../components/admin/EnrollStudentsModal';
import StatsCard from '../../components/admin/StatsCard';
import ServerStatusChecker from '../../components/ServerStatusChecker';
import { Toaster, toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, logout } = useAuth();
  const [serverAvailable, setServerAvailable] = useState(false);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDosen: 0, 
    activeDosen: 0,
    totalMahasiswa: 0,
    activeMahasiswa: 0,
    totalMataKuliah: 0,
    serverUptime: 99.9 // Added default value
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isDosenModalOpen, setIsDosenModalOpen] = useState(false);
  const [isMahasiswaModalOpen, setIsMahasiswaModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [createUserSuccess, setCreateUserSuccess] = useState(null);

  // Add filter state
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [semesterFilter, setSemesterFilter] = useState('all'); // Filter for courses by semester

  // Tambahkan state untuk dialog konfirmasi delete
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemType: null, // 'user' atau 'course'
    itemName: null
  });

  // Fetch data when component mounts
  useEffect(() => {
    if (serverAvailable) {
      fetchData();
    }
  }, [serverAvailable]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch users
      let userData = [];
      try {
        const usersResponse = await api.get('/admin/users');
        userData = usersResponse.data || [];
        setUsers(userData);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        
        // Handle authentication errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Authentication error, redirecting to login...');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
      }
      
      // Fetch courses
      let courseData = [];
      try {
        const coursesResponse = await api.get('/admin/courses');
        courseData = coursesResponse.data || [];
        setCourses(courseData);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        
        // Handle authentication errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Authentication error, redirecting to login...');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
      }
      
      // Fetch classes
      try {
        const classesResponse = await api.get('/admin/classes');
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        
        // Handle authentication errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Authentication error, redirecting to login...');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
      }
      
      // Initialize stats with fetched data
      setStats({
        totalUsers: userData.length,
        activeUsers: userData.filter(u => u.is_active).length,
        totalDosen: userData.filter(u => u.role === 'dosen').length,
        activeDosen: userData.filter(u => u.role === 'dosen' && u.is_active).length,
        totalMahasiswa: userData.filter(u => u.role === 'mahasiswa').length,
        activeMahasiswa: userData.filter(u => u.role === 'mahasiswa' && u.is_active).length,
        totalMataKuliah: courseData.length,
        serverUptime: 99.9 // Default value
      });
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats when users or courses change
  useEffect(() => {
    if (users.length > 0 || courses.length > 0) {
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalDosen: users.filter(u => u.role === 'dosen').length,
        activeDosen: users.filter(u => u.role === 'dosen' && u.is_active).length,
        totalMahasiswa: users.filter(u => u.role === 'mahasiswa').length,
        activeMahasiswa: users.filter(u => u.role === 'mahasiswa' && u.is_active).length,
        totalMataKuliah: courses.length
      }));
    }
  }, [users, courses]); // This runs when either users or courses change

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch classes data
  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Handler for creating a new dosen account
  const handleCreateDosen = async (dosenData) => {
    try {
      const response = await api.post('/admin/dosen', dosenData);
      
      // Add the new dosen to users state
      if (response.data && response.data.user) {
        setUsers(prevUsers => [response.data.user, ...prevUsers]);
        toast.success(`Akun dosen untuk ${dosenData.nama_lengkap} berhasil dibuat`);
      } else {
        // Still update the user list in case the backend doesn't return the new user
        const updatedUsers = await api.get('/admin/users');
        setUsers(updatedUsers.data);
        toast.success('Akun dosen berhasil dibuat');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error creating dosen:', error);
      toast.error(error.response?.data?.error || 'Gagal membuat akun dosen');
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create dosen account'
      };
    }
  };

  // Handler for creating a new mahasiswa account
  const handleCreateMahasiswa = async (userData) => {
    try {
      // Add default password if not provided
      const dataWithPassword = {
        ...userData,
        password: userData.password || "123" // Add default password
      };
      
      // Make the API call with the modified data
      const response = await api.post('/admin/mahasiswa', dataWithPassword);
      
      // Get the newly created user from the response
      const newUser = response.data.user;
      
      // Update the users state directly to include the new user
      setUsers(prevUsers => [newUser, ...prevUsers]);
      
      // Show success message
      toast.success(`Akun mahasiswa untuk ${newUser.nama_lengkap || newUser.email} berhasil dibuat`);
      
      return { 
        success: true, 
        user: newUser
      };
    } catch (error) {
      console.error('Error creating mahasiswa:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      toast.error(error.response?.data?.error || 'Gagal membuat akun mahasiswa');
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create mahasiswa'
      };
    }
  };

  // Handler for creating a new course
  const handleCreateCourse = async (courseData) => {
    try {
      // Use the single courses endpoint for all course creation
      const response = await api.post('/admin/courses', courseData);
      
      // Add the new course to the state
      if (response.data && response.data.course) {
        setCourses(prevCourses => [response.data.course, ...prevCourses]);
        toast.success(`Mata kuliah ${courseData.nama} (${courseData.kode}) berhasil dibuat`);
      } else {
        // Fallback to fetching all courses
        fetchCourses();
        toast.success('Mata kuliah berhasil dibuat');
      }
      
      return { 
        success: true,
        course: response.data.course
      };
    } catch (error) {
      console.error('Error creating course:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      toast.error(error.response?.data?.error || 'Gagal membuat mata kuliah');
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create course'
      };
    }
  };

  // Add a function to toggle user status
  const toggleUserStatus = async (userId, currentStatus, userRole) => {
    try {
      const newStatus = !currentStatus;
      
      // Call API to update status
      await api.patch(`/admin/users/${userId}/status`, { is_active: newStatus });
      
      // Update users list
      setUsers(prevUsers => prevUsers.map( user =>
        user.id === userId ? { ...user, is_active: newStatus, status: newStatus ? 'active' : 'inactive' } : user
      ));
      
      toast.success(`User ${newStatus ? 'diaktifkan' : 'dinonaktifkan'} berhasil`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(`Gagal ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} user`);
    }
  };

  // Filter users based on selected role and search query
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Filter by role
      const roleMatches = roleFilter === 'all' || user.role === roleFilter;
      
      // Filter by status
      const statusMatches = statusFilter === 'all' || 
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);
      
      // Filter by search query if present
      const searchMatches = !searchQuery || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.nim && user.nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.nip && user.nip.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return roleMatches && statusMatches && searchMatches;
    });
  };

  // Filter courses based on selected semester
  const getFilteredCourses = () => {
    return courses.filter(course => {
      // Jika filter semua, kembalikan semua courses
      if (semesterFilter === 'all') return true;
      
      // Coba beberapa cara untuk menentukan apakah semester ganjil atau genap
      
      // Jika semester adalah angka
      if (typeof course.semester === 'number') {
        return (semesterFilter === 'ganjil' && course.semester % 2 === 1) || 
               (semesterFilter === 'genap' && course.semester % 2 === 0);
      }
      
      // Jika semester adalah string berisi angka
      if (course.semester && !isNaN(parseInt(course.semester))) {
        const semNum = parseInt(course.semester);
        return (semesterFilter === 'ganjil' && semNum % 2 === 1) || 
               (semesterFilter === 'genap' && semNum % 2 === 0);
      }
      
      // Jika semester adalah string "Ganjil" atau "Genap"
      if (typeof course.semester === 'string') {
        const semLower = course.semester.toLowerCase();
        return (semesterFilter === 'ganjil' && semLower.includes('ganjil')) || 
               (semesterFilter === 'genap' && semLower.includes('genap'));
      }
      
      // Default: tidak cocok dengan filter
      return false;
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manajemen User', icon: Users },
    { id: 'courses', label: 'Mata Kuliah', icon: BookOpen },
    { id: 'classes', label: 'Manajemen Kelas', icon: ClipboardList },
    { id: 'system', label: 'Sistem & Log', icon: Database },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  // Check server availability first
  if (!serverAvailable) {
    return <ServerStatusChecker onServerAvailable={() => setServerAvailable(true)} />;
  }

  // Display loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-600 border-b-purple-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading dashboard data...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // Display error state if data fetching failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 block w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 block w-full"
            >
              Login Ulang
            </button>
            <div className="text-xs text-gray-500 mt-4">
              <p>Kemungkinan penyebab:</p>
              <ul className="list-disc text-left mt-2 space-y-1">
                <li>Server backend tidak berjalan</li>
                <li>Sesi login telah berakhir</li>
                <li>Koneksi internet bermasalah</li>
                <li>Token authentication tidak valid</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrator</h1>
        <p className="text-purple-100">Panel kontrol sistem manajemen tugas besar</p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-8 w-8 text-blue-600" />}
          description="Total registered users"
        />
        
        <StatsCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={<UserCheck className="h-8 w-8 text-green-600" />}
          description="Currently active users"
        />
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Server Uptime</p>
              <p className="text-3xl font-bold text-gray-900">{stats.serverUptime}%</p>
            </div>
            <Activity className="h-12 w-12 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-green-600">
            Sistem berjalan normal
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi User</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dosen</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalDosen / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalDosen}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mahasiswa</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalUsers > 0 ? (stats.totalMahasiswa / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalMahasiswa}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terkini</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'course' ? 'bg-green-500' :
                  activity.type === 'system' ? 'bg-purple-500' :
                  'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                {activity.count > 1 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {activity.count}
                  </span>
                )}
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Server</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Running</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">File Storage</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Log Activity Terbaru</h3>
          <button 
            onClick={() => setActiveTab('system')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Lihat Semua Log
          </button>
        </div>
        <div className="space-y-2">
          {systemLogs.length > 0 ? (
            systemLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.level === 'success' ? 'bg-green-500' :
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.action} - {log.user}</p>
                    <p className="text-xs text-gray-600">{log.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Belum ada log aktivitas</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = getFilteredUsers();
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Manajemen User</h2>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Filter and search controls */}
            <div className="flex space-x-4">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Semua User</option>
                  <option value="dosen">Dosen</option>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              
              {/* Dropdown untuk filter status */}
              <div className="relative ml-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              
              {/* Search input tetap ada */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Cari user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>
            
            {/* Add user button */}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsDosenModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Plus size={18} className="inline mr-1" />
                Dosen
              </button>
              <button
                onClick={() => setIsMahasiswaModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Plus size={18} className="inline mr-1" />
                Mahasiswa
              </button>
            </div>
          </div>
        </div>
        
        {/* Display user counts */}
        <div className="flex space-x-4 mb-6">
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{filteredUsers.length}</span> dari {users.length} users
          </div>
          <div className="text-sm text-gray-500">
            Dosen: <span className="font-semibold">{users.filter(u => u.role === 'dosen').length}</span>
          </div>
          <div className="text-sm text-gray-500">
            Mahasiswa: <span className="font-semibold">{users.filter(u => u.role === 'mahasiswa').length}</span>
          </div>
        </div>
        
        {/* Users table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terdaftar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    {/* User cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nama_lengkap || 'Nama tidak tersedia'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.role === 'dosen' && user.nip && <div className="text-xs text-gray-500">NIP: {user.nip}</div>}
                          {user.role === 'mahasiswa' && user.nim && <div className="text-xs text-gray-500">NIM: {user.nim}</div>}
                        </div>
                      </div>
                    </td>
                    
                    {/* Role cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'dosen' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'mahasiswa' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    
                    {/* Status cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    
                    {/* Registered date cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    
                    {/* Actions cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button 
                          className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          onClick={() => toggleUserStatus(user.id, user.is_active, user.role)}
                        >
                          {user.is_active ? 
                            <XCircle className="h-4 w-4" /> : 
                            <CheckCircle className="h-4 w-4" />
                          }
                        </button>
                      )}
                      
                      {/* Tombol untuk menghapus user */}
                      <button
                        onClick={() => openDeleteConfirmation(user.id, 'user', user.nama_lengkap)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {users.length > 0 ? 'Tidak ada user yang sesuai dengan filter.' : 'Belum ada user yang terdaftar.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCourses = () => {
    const filteredCourses = getFilteredCourses();
    
    return (
      <div className="space-y-6">
        {/* Button to add new course */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Semua Semester</option>
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <button 
              onClick={() => setIsCourseModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>
        </div>

        {/* Course cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.nama}</h3>
                    <p className="text-gray-600">{course.kode} • {course.sks} SKS</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>Dosen: {course.dosen_nama || 'Belum ditentukan'}</p>
                  <p>Semester: {course.semester} {course.tahun_ajaran}</p>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    Detail
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Tambahkan tombol delete */}
                  <button 
                    className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    onClick={() => openDeleteConfirmation(course.id, 'course', course.nama)}
                    title="Hapus Mata Kuliah"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white p-8 rounded-xl shadow-lg text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mata kuliah</h3>
              <p className="text-gray-500 mb-4">Belum ada mata kuliah yang terdaftar dalam sistem</p>
              <button 
                onClick={() => setIsCourseModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Mata Kuliah Pertama</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSystemLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sistem & Log Activity</h1>
        <div className="flex space-x-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
            <option>Semua Level</option>
            <option>Info</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Error</option>
          </select>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
            Export Log
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-lg font-bold text-green-600">Connected</p>
            </div>
            <Database className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Server</p>
              <p className="text-lg font-bold text-green-600">Running</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage</p>
              <p className="text-lg font-bold text-yellow-600">75% Used</p>
            </div>
            <Database className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-purple-600">{stats.serverUptime}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {systemLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systemLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{log.detail}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.level === 'success' ? 'bg-green-100 text-green-800' :
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada log aktivitas</h3>
              <p className="text-gray-500">Log aktivitas sistem akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
        <div className="text-sm text-gray-600">
          Total: {classes.length} kelas
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map(classItem => (
            <div key={classItem.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.nama}</h3>
                  <p className="text-gray-600">{classItem.course_nama} • {classItem.course_kode}</p>
                  {classItem.kode && <p className="text-sm text-gray-500">Kode: {classItem.kode}</p>}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Dosen: {classItem.dosen_nama || 'Belum ditentukan'}</p>
                <p>Kapasitas: {classItem.jumlah_mahasiswa || 0}/{classItem.kapasitas || 'Unlimited'}</p>
                {classItem.ruangan && <p>Ruangan: {classItem.ruangan}</p>}
                {classItem.jadwal && <p>Jadwal: {classItem.jadwal}</p>}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => openEnrollModal(classItem)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Kelola Mahasiswa
                </button>
                <button 
                  onClick={() => openDeleteConfirmation(classItem.id, 'class', classItem.nama)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                  title="Hapus Kelas"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada kelas</h3>
            <p className="text-gray-500">Kelas akan muncul setelah dibuat dari mata kuliah</p>
          </div>
        )}
      </div>

      {/* Courses with Classes Management */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Buat Kelas untuk Mata Kuliah</h2>
          <p className="text-sm text-gray-600">Pilih mata kuliah untuk membuat kelas baru</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.nama}</h3>
                    <p className="text-sm text-gray-600">{course.kode} • {course.sks} SKS</p>
                    <p className="text-sm text-gray-500">{course.semester} {course.tahun_ajaran}</p>
                  </div>
                  <button
                    onClick={() => openClassModal(course)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Buat Kelas
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mata kuliah</h3>
              <p className="text-gray-500">Buat mata kuliah terlebih dahulu sebelum membuat kelas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'courses': return renderCourses();
      case 'classes': return renderClasses();
      case 'system': return renderSystemLogs();
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Konfigurasi Database</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Host</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="localhost" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Port</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="5432" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center mt-1">
                      <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Pengaturan Aplikasi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Aplikasi</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" 
                      defaultValue="UNPAR Task Management" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Versi</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                      defaultValue="1.0.0" 
                      disabled 
                    />
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return renderDashboard();
    }
  };

  // Fungsi handler untuk menghapus user
  const deleteUser = async (userId) => {
    try {
      // Panggil API untuk menghapus user
      await api.delete(`/admin/users/${userId}`);
      
      // Update daftar users dengan menghapus user yang sudah dihapus
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast.success('User berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Gagal menghapus user');
    }
  };

  // Fungsi handler untuk menghapus course
  const deleteCourse = async (courseId) => {
    try {
      // Panggil API untuk menghapus course
      await api.delete(`/admin/courses/${courseId}`);
      
      // Update daftar courses dengan menghapus course yang sudah dihapus
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      toast.success('Mata kuliah berhasil dihapus');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.error || 'Gagal menghapus mata kuliah');
    }
  };

  // Fungsi untuk membuka dialog konfirmasi
  const openDeleteConfirmation = (id, type, name) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemName: name
    });
  };

  // Class management functions
  const handleCreateClass = async (classData, courseId) => {
    try {
      const response = await api.post(`/admin/courses/${courseId}/classes`, classData);
      
      if (response.data && response.data.class) {
        // Update classes state with new class
        fetchClasses(); // Refresh classes list
        toast.success(`Kelas ${classData.nama} berhasil dibuat`);
        return { success: true };
      }
      
      return { success: false, error: 'Gagal membuat kelas' };
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.error || 'Gagal membuat kelas');
      return { success: false, error: error.response?.data?.error || 'Failed to create class' };
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await api.delete(`/admin/classes/${classId}`);
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
      toast.success('Kelas berhasil dihapus');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(error.response?.data?.error || 'Gagal menghapus kelas');
    }
  };

  const openClassModal = (course) => {
    setSelectedCourse(course);
    setIsClassModalOpen(true);
  };

  const openEnrollModal = (classItem) => {
    setSelectedClass(classItem);
    setIsEnrollModalOpen(true);
  };

  // Fungsi untuk menutup dialog konfirmasi
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemType: null,
      itemName: null
    });
  };

  // Fungsi untuk mengkonfirmasi penghapusan
  const confirmDelete = async () => {
    try {
      if (deleteConfirmation.itemType === 'user') {
        await deleteUser(deleteConfirmation.itemId);
      } else if (deleteConfirmation.itemType === 'course') {
        await deleteCourse(deleteConfirmation.itemId);
      } else if (deleteConfirmation.itemType === 'class') {
        await handleDeleteClass(deleteConfirmation.itemId);
      }
    } catch (error) {
      console.error('Error during delete confirmation:', error);
    } finally {
      closeDeleteConfirmation();
    }
  };

  // Komponen Dialog Konfirmasi Delete
  const DeleteConfirmationDialog = ({ isOpen, onCancel, onConfirm, itemType, itemName }) => {
    if (!isOpen) return null;

    const getTitle = () => {
      switch (itemType) {
        case 'user': return 'Hapus User';
        case 'course': return 'Hapus Mata Kuliah';
        case 'class': return 'Hapus Kelas';
        default: return 'Hapus Item';
      }
    };

    const getConfirmationText = () => {
      switch (itemType) {
        case 'user': return 'user';
        case 'course': return 'mata kuliah';
        case 'class': return 'kelas';
        default: return 'item';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {getTitle()}
          </h3>
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus {getConfirmationText()} <span className="font-semibold">{itemName}</span>? 
            {itemType === 'class' && (
              <span className="block mt-2 text-sm text-orange-600">
                Semua mahasiswa yang terdaftar di kelas ini akan dihapus dari kelas.
              </span>
            )}
            <span className="block mt-2 text-sm">Tindakan ini tidak dapat dibatalkan.</span>
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Portal Administrator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {systemLogs.filter(log => log.level === 'error').length || 0}
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nama_lengkap || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@unpar.ac.id'}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {createUserSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
                {createUserSuccess}
              </div>
            )}
            {renderContent()
            }
          </main>
        </div>
      </div>
      
      {/* Modals */}
      <CreateDosenModal 
        isOpen={isDosenModalOpen}
        onClose={() => setIsDosenModalOpen(false)}
        onSubmit={async (dosenData) => {
          try {
            const result = await handleCreateDosen(dosenData);
            if (result.success) {
              toast.success(`Akun dosen untuk ${dosenData.nama_lengkap} berhasil dibuat dengan password default "123"`);
            }
          } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to create dosen account');
          }
        }}
      />

      <CreateMahasiswaModal
        isOpen={isMahasiswaModalOpen} 
        onClose={() => setIsMahasiswaModalOpen(false)}
        onSubmit={handleCreateMahasiswa}
      />

      <CreateCourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSubmit={async (courseData) => {
          try {
            const result = await handleCreateCourse(courseData);
            if (result.success) {
              toast.success(`Mata kuliah ${courseData.nama} (${courseData.kode}) berhasil dibuat`);
            }
            return result;
          } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to create course');
          }
        }}
      />

      <CreateClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleCreateClass}
        courseId={selectedCourse?.id}
        courseName={selectedCourse?.nama}
      />

      <EnrollStudentsModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        classId={selectedClass?.id}
        className={selectedClass?.nama}
      />

      <>
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onCancel={closeDeleteConfirmation}
          onConfirm={confirmDelete}
          itemType={deleteConfirmation.itemType}
          itemName={deleteConfirmation.itemName}
        />
        <Toaster position="top-right" />
      </>
    </div>
  );
};

export default AdminDashboard;