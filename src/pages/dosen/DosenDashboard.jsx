import React from 'react';
import { BookOpen, FileText, Users, TrendingUp } from 'lucide-react';

const DosenDashboard = () => {
  // Sample data - akan diganti dengan data dari API
  const stats = {
    totalCourses: 3,
    activeTasks: 5,
    totalGroups: 15,
    avgScore: 85.2
  };

  const recentTasks = [
    { 
      id: 1, 
      title: 'Sistem E-Commerce', 
      course: 'Pemrograman Web', 
      deadline: '2024-12-15',
      status: 'active'
    },
    { 
      id: 2, 
      title: 'Database Design Project', 
      course: 'Basis Data', 
      deadline: '2024-11-30',
      status: 'active'
    },
    { 
      id: 3, 
      title: 'Mobile App Development', 
      course: 'Pemrograman Mobile', 
      deadline: '2024-12-20',
      status: 'draft'
    }
  ];

  const recentGroups = [
    { id: 1, name: 'Kelompok Alpha', course: 'Pemrograman Web', members: 4, score: 88 },
    { id: 2, name: 'Kelompok Beta', course: 'Basis Data', members: 3, score: 92 },
    { id: 3, name: 'Kelompok Gamma', course: 'Pemrograman Web', members: 4, score: 78 }
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

  const TaskCard = ({ task }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="text-sm text-gray-600">{task.course}</p>
        <p className="text-xs text-gray-500">Deadline: {task.deadline}</p>
      </div>
      <div className="text-right">
        <span className={`px-2 py-1 rounded-full text-xs ${
          task.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {task.status === 'active' ? 'Aktif' : 'Draft'}
        </span>
      </div>
    </div>
  );

  const GroupCard = ({ group }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-medium">{group.name}</p>
        <p className="text-sm text-gray-600">{group.course}</p>
        <p className="text-xs text-gray-500">{group.members} anggota</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">{group.score}</p>
        <p className="text-xs text-gray-500">Nilai</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, Dr. John Doe</h2>
        <p className="text-blue-100">Semester Ganjil 2024/2025</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Mata Kuliah"
          value={stats.totalCourses}
          icon={BookOpen}
          color="text-blue-600"
          description="Yang diampu"
        />
        <StatCard
          title="Tugas Aktif"
          value={stats.activeTasks}
          icon={FileText}
          color="text-green-600"
          description="Sedang berjalan"
        />
        <StatCard
          title="Total Kelompok"
          value={stats.totalGroups}
          icon={Users}
          color="text-purple-600"
          description="Semua mata kuliah"
        />
        <StatCard
          title="Nilai Rata-rata"
          value={stats.avgScore}
          icon={TrendingUp}
          color="text-orange-600"
          description="Semester ini"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tugas Besar Terbaru</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {recentTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Belum ada tugas besar</p>
            </div>
          )}
        </div>

        {/* Recent Groups */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Kelompok Terbaru</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {recentGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
          {recentGroups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Belum ada kelompok</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="text-blue-600 mb-2" size={24} />
            <p className="font-medium">Buat Tugas Besar</p>
            <p className="text-sm text-gray-600">Tambah tugas besar baru</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="text-green-600 mb-2" size={24} />
            <p className="font-medium">Kelola Kelompok</p>
            <p className="text-sm text-gray-600">Atur kelompok mahasiswa</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <TrendingUp className="text-purple-600 mb-2" size={24} />
            <p className="font-medium">Input Nilai</p>
            <p className="text-sm text-gray-600">Berikan penilaian</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DosenDashboard;