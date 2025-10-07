import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, Award, Bell, ChevronRight, Star, Activity,
  BarChart3, User, MessageSquare, Filter, Search, Target, Trophy
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MahasiswaLayout from "../../components/MahasiswaLayout";
import api, { getCurrentUser, getMahasiswaClasses } from "../../utils/api";

const MahasiswaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      
      // Transform enrolled classes to match the expected format
      const transformedCourses = enrolledClasses.map(classItem => ({
        id: classItem.id,
        name: classItem.course_name,
        code: classItem.course_code,
        lecturer: classItem.dosen_nama || 'Belum ditentukan',
        semester: `${classItem.semester} ${classItem.tahun_ajaran}`,
        sks: classItem.sks,
        className: classItem.class_name,
        classCode: classItem.class_code,
        ruangan: classItem.ruangan,
        jadwal: classItem.jadwal,
        kapasitas: classItem.kapasitas,
        enrolledAt: classItem.enrolled_at,
        // Mock data for UI components that need backend implementation later
        groupStatus: 'not_joined', // TODO: Implement group system
        groupName: null,
        groupMembers: [],
        activeTasks: Math.floor(Math.random() * 3) + 1, // Random for now
        completedTasks: Math.floor(Math.random() * 5) + 1,
        upcomingDeadlines: Math.floor(Math.random() * 2),
        lastGrade: Math.floor(Math.random() * 20) + 80, // Random grade 80-100
        progress: Math.floor(Math.random() * 50) + 40, // Random progress 40-90%
        attendance: Math.floor(Math.random() * 15) + 85 // Random attendance 85-100%
      }));
      
      // Calculate stats based on actual enrolled classes
      const stats = {
        totalCourses: enrolledClasses.length,
        activeGroups: transformedCourses.filter(course => course.groupStatus === 'joined').length,
        completedTasks: transformedCourses.reduce((sum, course) => sum + course.completedTasks, 0),
        averageGrade: transformedCourses.length > 0 
          ? Math.round(transformedCourses.reduce((sum, course) => sum + course.lastGrade, 0) / transformedCourses.length * 10) / 10
          : 0
      };
      
      // Mock data for other components (TODO: Implement these APIs later)
      const mockUpcomingTasks = transformedCourses.slice(0, 3).map((course, index) => ({
        id: index + 1,
        title: `Tugas ${index + 1}`,
        course: course.name,
        courseCode: course.code,
        deadline: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ['pending', 'in_progress', 'not_started'][index % 3],
        daysLeft: (index + 1) * 7,
        priority: ['high', 'medium', 'low'][index % 3],
        description: `Tugas untuk mata kuliah ${course.name}`
      }));
      
      const mockRecentGrades = transformedCourses.slice(0, 2).map((course, index) => ({
        id: index + 1,
        course: course.name,
        courseCode: course.code,
        component: ['Proposal', 'Progress Report', 'Final Project'][index % 3],
        score: course.lastGrade,
        maxScore: 100,
        feedback: 'Good work, keep it up!',
        gradedAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gradedBy: course.lecturer
      }));
      
      const mockNotifications = [
        {
          id: 1,
          type: 'info',
          message: `Anda terdaftar dalam ${enrolledClasses.length} kelas`,
          course: 'System',
          time: 'Baru saja',
          urgent: false
        }
      ];
      
      // Set all the state
      setStats(stats);
      setCourses(transformedCourses);
      setUpcomingTasks(mockUpcomingTasks);
      setRecentGrades(mockRecentGrades);
      setNotifications(mockNotifications);
      
      console.log(`[${new Date().toISOString()}] Dashboard data loaded:`, {
        enrolledClasses: enrolledClasses.length,
        transformedCourses: transformedCourses.length,
        stats
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatsCard = ({ title, value, icon, description, color = 'blue', suffix = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${color}-500 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}{suffix}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
          <p className="text-gray-600 text-sm">{course.code} • {course.sks} SKS</p>
          <p className="text-gray-500 text-xs">{course.lecturer}</p>
          {course.className && (
            <p className="text-blue-600 text-xs font-medium mt-1">
              Kelas: {course.className} {course.classCode && `(${course.classCode})`}
            </p>
          )}
          {course.ruangan && (
            <p className="text-gray-500 text-xs">📍 {course.ruangan}</p>
          )}
          {course.jadwal && (
            <p className="text-gray-500 text-xs">🕒 {course.jadwal}</p>
          )}
        </div>
        <div className="text-right">
          {course.lastGrade && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              course.lastGrade >= 85 ? 'bg-green-100 text-green-800' :
              course.lastGrade >= 70 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {course.lastGrade}
            </div>
          )}
        </div>
      </div>

      {/* Class Info */}
      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                {course.semester}
              </p>
              <p className="text-xs text-blue-600">
                Terdaftar: {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('id-ID') : 'N/A'}
              </p>
            </div>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Group Status */}
      <div className="mb-4">
        {course.groupStatus === 'joined' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">{course.groupName}</p>
                <p className="text-xs text-green-600">{course.groupMembers.length} anggota</p>
              </div>
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-yellow-800">Belum bergabung dengan kelompok</p>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <FileText className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-medium text-blue-900">{course.activeTasks}</p>
          <p className="text-xs text-blue-600">Aktif</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
          <p className="text-xs font-medium text-green-900">{course.completedTasks}</p>
          <p className="text-xs text-green-600">Selesai</p>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <Clock className="h-4 w-4 text-orange-600 mx-auto mb-1" />
          <p className="text-xs font-medium text-orange-900">{course.upcomingDeadlines}</p>
          <p className="text-xs text-orange-600">Deadline</p>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => navigate(`/mahasiswa/courses/${course.id}`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
      >
        Lihat Detail
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );

  // Function to extract name from email
  const getUserDisplayName = () => {
    console.log(`[${new Date().toISOString()}] getUserDisplayName called`);
    console.log('getUserDisplayName - currentUser:', currentUser);
    console.log('getUserDisplayName - currentUser?.nama_lengkap:', currentUser?.nama_lengkap);
    console.log('getUserDisplayName - currentUser?.email:', currentUser?.email);
    
    if (currentUser?.nama_lengkap) {
      console.log('Returning nama_lengkap:', currentUser.nama_lengkap);
      return currentUser.nama_lengkap;
    }
    if (currentUser?.name) {
      console.log('Returning name:', currentUser.name);
      return currentUser.name;
    }
    if (currentUser?.email) {
      // Extract name from email (e.g., "Agus@student.unpar.ac.id" -> "Agus")
      const name = currentUser.email.split('@')[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      console.log('Extracted from email:', displayName);
      return displayName;
    }
    console.log('Returning fallback: Mahasiswa');
    return 'Mahasiswa';
  };

  // Function to get user NIM or ID
  const getUserIdentifier = () => {
    console.log(`[${new Date().toISOString()}] getUserIdentifier called`);
    console.log('getUserIdentifier - currentUser:', currentUser);
    console.log('getUserIdentifier - currentUser?.nim:', currentUser?.nim);
    console.log('getUserIdentifier - currentUser?.id:', currentUser?.id);
    
    if (currentUser?.nim) {
      console.log('Returning NIM:', currentUser.nim);
      return currentUser.nim;
    }
    if (currentUser?.id) {
      console.log('Returning ID:', currentUser.id);
      return `ID: ${currentUser.id}`;
    }
    console.log('Returning fallback NIM');
    return 'NIM: 2021730001';
  };

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    console.log('Current hour:', hour);
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const TaskCard = ({ task }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      task.priority === 'high' ? 'border-red-500 bg-red-50' :
      task.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-green-500 bg-green-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.daysLeft <= 3 ? 'bg-red-100 text-red-800' :
          task.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.daysLeft} hari
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{task.course} • {task.courseCode}</p>
      <p className="text-xs text-gray-500 mb-3">{task.description}</p>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.status === 'pending' ? 'bg-red-100 text-red-800' :
          task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.status === 'pending' ? 'Belum Mulai' :
           task.status === 'in_progress' ? 'Sedang Dikerjakan' :
           'Selesai'}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(task.deadline).toLocaleDateString('id-ID')}
        </span>
      </div>
    </div>
  );

  if (isLoading || !currentUser) {
    return (
      <MahasiswaLayout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {getUserDisplayName()}!
              </h1>
              <p className="text-purple-100">
                Kelola tugas dan akademik Anda dengan mudah
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">NIM</p>
              <p className="text-xl font-semibold">{getUserIdentifier()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Mata Kuliah"
            value={stats.totalCourses}
            icon={<BookOpen className="h-6 w-6 text-blue-600" />}
            description="Semester ini"
            color="blue"
          />
          <StatsCard
            title="Kelompok Aktif"
            value={stats.activeGroups}
            icon={<Users className="h-6 w-6 text-green-600" />}
            description="Kelompok bergabung"
            color="green"
          />
          <StatsCard
            title="Tugas Selesai"
            value={stats.completedTasks}
            icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            description="Tugas dikumpulkan"
            color="purple"
          />
          <StatsCard
            title="Rata-rata Nilai"
            value={stats.averageGrade}
            icon={<Trophy className="h-6 w-6 text-orange-600" />}
            description="Semester ini"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Mata Kuliah Saya</h2>
                <select 
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="current">Semester Aktif</option>
                  <option value="previous">Semester Sebelumnya</option>
                  <option value="all">Semua Semester</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Terdaftar di Kelas Manapun</h3>
                    <p className="text-gray-500 mb-4">
                      Anda belum terdaftar dalam kelas mata kuliah apapun.
                      <br />
                      Silakan hubungi admin untuk mendaftarkan Anda ke kelas yang sesuai.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tips:</strong> Pastikan Anda sudah memiliki jadwal kuliah dari fakultas
                        dan hubungi admin untuk pendaftaran kelas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nilai Terbaru</h3>
              <div className="space-y-3">
                {recentGrades.map(grade => (
                  <div key={grade.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{grade.component}</h4>
                        <p className="text-sm text-gray-600">{grade.course} • {grade.courseCode}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          grade.score >= 85 ? 'bg-green-100 text-green-800' :
                          grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.score}/{grade.maxScore}
                        </div>
                      </div>
                    </div>
                    {grade.feedback && (
                      <p className="text-sm text-gray-600 mb-2">"{grade.feedback}"</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Dinilai oleh: {grade.gradedBy}</span>
                      <span>{new Date(grade.gradedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tugas Mendatang</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {upcomingTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
              {upcomingTasks.length > 3 && (
                <button 
                  onClick={() => navigate('/mahasiswa/assignments')}
                  className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat Semua Tugas
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                    notification.urgent 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-blue-500 bg-blue-50'
                  }`}>
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-600">{notification.course}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/mahasiswa/courses')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <BookOpen className="h-4 w-4 text-blue-600 mr-3" />
                  <span className="text-sm font-medium">Lihat Semua Mata Kuliah</span>
                </button>
                <button 
                  onClick={() => navigate('/mahasiswa/assignments')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Kelola Tugas</span>
                </button>
                <button 
                  onClick={() => navigate('/mahasiswa/groups')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Users className="h-4 w-4 text-purple-600 mr-3" />
                  <span className="text-sm font-medium">Kelola Kelompok</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <BarChart3 className="h-4 w-4 text-orange-600 mr-3" />
                  <span className="text-sm font-medium">Lihat Nilai & Statistik</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
};

export default MahasiswaDashboard;
