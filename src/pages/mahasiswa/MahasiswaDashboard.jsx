import React from 'react';
import { BookOpen, Users, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MahasiswaDashboard = () => {
  // Sample data - akan diganti dengan data dari API
  const studentInfo = {
    npm: '2021730001',
    name: 'Alice Johnson',
    semester: 7,
    activeCourses: 6
  };

  const courses = [
    { 
      id: 1, 
      name: 'Pemrograman Web', 
      code: 'IF123',
      lecturer: 'Dr. John Doe',
      groupStatus: 'joined', // 'joined', 'not_joined', 'pending'
      groupName: 'Kelompok Alpha',
      activeTasks: 2,
      upcomingDeadlines: 1
    },
    { 
      id: 2, 
      name: 'Basis Data', 
      code: 'IF234',
      lecturer: 'Dr. Jane Smith',
      groupStatus: 'not_joined',
      groupName: null,
      activeTasks: 1,
      upcomingDeadlines: 0
    },
    { 
      id: 3, 
      name: 'Rekayasa Perangkat Lunak', 
      code: 'IF345',
      lecturer: 'Dr. Bob Wilson',
      groupStatus: 'joined',
      groupName: 'Kelompok Beta',
      activeTasks: 3,
      upcomingDeadlines: 2
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Progress Report 1',
      course: 'Pemrograman Web',
      deadline: '2024-11-15',
      status: 'pending',
      daysLeft: 5
    },
    {
      id: 2,
      title: 'Database Design',
      course: 'Basis Data',
      deadline: '2024-11-20',
      status: 'submitted',
      daysLeft: 10
    },
    {
      id: 3,
      title: 'Final Presentation',
      course: 'Rekayasa Perangkat Lunak',
      deadline: '2024-12-01',
      status: 'pending',
      daysLeft: 21
    }
  ];

  const recentGrades = [
    {
      id: 1,
      course: 'Pemrograman Web',
      component: 'Proposal',
      score: 88,
      feedback: 'Good proposal, needs improvement in methodology',
      gradedAt: '2024-10-20'
    },
    {
      id: 2,
      course: 'Basis Data',
      component: 'ERD Design',
      score: 92,
      feedback: 'Excellent work on database design',
      gradedAt: '2024-10-18'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-gray-500 text-xs mt-1">{description}</p>
          )}
        </div>
        <Icon className={color} size={40} />
      </div>
    </div>
  );

  const TaskCard = ({ task }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'submitted': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getUrgencyColor = (daysLeft) => {
      if (daysLeft <= 3) return 'text-red-600';
      if (daysLeft <= 7) return 'text-yellow-600';
      return 'text-green-600';
    };

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <p className="text-sm text-gray-600">{task.course}</p>
          <p className="text-xs text-gray-500">Deadline: {task.deadline}</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status === 'submitted' ? 'Submitted' : task.status === 'pending' ? 'Pending' : 'Overdue'}
          </span>
          {task.status === 'pending' && (
            <p className={`text-sm font-medium mt-1 ${getUrgencyColor(task.daysLeft)}`}>
              {task.daysLeft} days left
            </p>
          )}
        </div>
      </div>
    );
  };

  const GradeCard = ({ grade }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{grade.component}</h4>
        <p className="text-sm text-gray-600">{grade.course}</p>
        <p className="text-xs text-gray-500 mt-1">{grade.feedback}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-green-600">{grade.score}</p>
        <p className="text-xs text-gray-500">{grade.gradedAt}</p>
      </div>
    </div>
  );

  const CourseStatusCard = ({ course }) => {
    const getGroupStatusBadge = (status) => {
      switch (status) {
        case 'joined':
          return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Bergabung</span>;
        case 'not_joined':
          return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Belum Bergabung</span>;
        case 'pending':
          return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
        default:
          return null;
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{course.name}</h4>
            <p className="text-sm text-gray-600">{course.code} • {course.lecturer}</p>
          </div>
          {getGroupStatusBadge(course.groupStatus)}
        </div>
        
        {course.groupName && (
          <p className="text-sm text-gray-600 mb-2">Kelompok: {course.groupName}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Tugas Aktif:</span>
            <span className="font-medium ml-1">{course.activeTasks}</span>
          </div>
          <div>
            <span className="text-gray-500">Deadline Mendekat:</span>
            <span className="font-medium ml-1">{course.upcomingDeadlines}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, {studentInfo.name}</h2>
        <p className="text-blue-100">NPM: {studentInfo.npm} • Semester {studentInfo.semester}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mata Kuliah Aktif"
          value={studentInfo.activeCourses}
          icon={BookOpen}
          color="text-blue-600"
          description="Semester ini"
        />
        <StatCard
          title="Kelompok Tergabung"
          value={courses.filter(c => c.groupStatus === 'joined').length}
          icon={Users}
          color="text-green-600"
          description="Dari semua mata kuliah"
        />
        <StatCard
          title="Tugas Pending"
          value={upcomingTasks.filter(t => t.status === 'pending').length}
          icon={Clock}
          color="text-yellow-600"
          description="Belum dikumpulkan"
        />
        <StatCard
          title="Rata-rata Nilai"
          value="89.2"
          icon={CheckCircle}
          color="text-purple-600"
          description="Semester ini"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tugas Mendatang</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {upcomingTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Tidak ada tugas mendatang</p>
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nilai Terbaru</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {recentGrades.map(grade => (
              <GradeCard key={grade.id} grade={grade} />
            ))}
          </div>
          {recentGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Belum ada nilai</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Status Mata Kuliah</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseStatusCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="text-blue-600 mb-2" size={24} />
            <p className="font-medium">Cari Kelompok</p>
            <p className="text-sm text-gray-600">Bergabung dengan kelompok</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="text-green-600 mb-2" size={24} />
            <p className="font-medium">Upload Tugas</p>
            <p className="text-sm text-gray-600">Kumpulkan tugas besar</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Calendar className="text-purple-600 mb-2" size={24} />
            <p className="font-medium">Lihat Jadwal</p>
            <p className="text-sm text-gray-600">Jadwal kuliah dan deadline</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaDashboard;