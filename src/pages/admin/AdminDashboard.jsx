import React, { useState } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, User, ChevronDown, Plus, Edit, Trash2, Settings, LogOut, Bell, Search, Star, CheckCircle, BarChart3, Shield, Database, UserCheck, Activity, TrendingUp, AlertCircle } from 'lucide-react';

// Dummy Data untuk Admin
const adminData = {
  currentUser: {
    id: 1,
    nama: 'Admin System',
    email: 'admin@unpar.ac.id',
    role: 'admin'
  },
  systemStats: {
    totalUsers: 156,
    totalDosen: 12,
    totalMahasiswa: 144,
    totalMataKuliah: 8,
    totalKelompok: 24,
    totalTugasBesar: 16,
    activeUsers: 128,
    serverUptime: 99.8
  },
  users: [
    { id: 1, nama: 'Dr. John Doe', email: 'john.doe@unpar.ac.id', role: 'dosen', status: 'active', lastLogin: '2024-10-28 10:30', mataKuliah: 3 },
    { id: 2, nama: 'Dr. Jane Smith', email: 'jane.smith@unpar.ac.id', role: 'dosen', status: 'active', lastLogin: '2024-10-27 14:20', mataKuliah: 2 },
    { id: 3, nama: 'Alice Brown', email: 'alice@student.unpar.ac.id', role: 'mahasiswa', status: 'active', lastLogin: '2024-10-28 09:15', npm: '2024001' },
    { id: 4, nama: 'Bob Wilson', email: 'bob@student.unpar.ac.id', role: 'mahasiswa', status: 'active', lastLogin: '2024-10-27 16:45', npm: '2024002' },
    { id: 5, nama: 'Charlie Davis', email: 'charlie@student.unpar.ac.id', role: 'mahasiswa', status: 'inactive', lastLogin: '2024-10-25 11:20', npm: '2024003' }
  ],
  mataKuliah: [
    { 
      id: 1, 
      kode: 'IF1234', 
      nama: 'Pemrograman Web', 
      semester: 'Ganjil 2024/2025', 
      sks: 3, 
      dosen: 'Dr. John Doe',
      mahasiswa: 24,
      kelompok: 6,
      status: 'active'
    },
    { 
      id: 2, 
      kode: 'IF5678', 
      nama: 'Basis Data', 
      semester: 'Ganjil 2024/2025', 
      sks: 3, 
      dosen: 'Dr. John Doe',
      mahasiswa: 28,
      kelompok: 7,
      status: 'active'
    },
    { 
      id: 3, 
      kode: 'IF9012', 
      nama: 'Rekayasa Perangkat Lunak', 
      semester: 'Ganjil 2024/2025', 
      sks: 4, 
      dosen: 'Dr. Jane Smith',
      mahasiswa: 32,
      kelompok: 8,
      status: 'active'
    },
    { 
      id: 4, 
      kode: 'IF3456', 
      nama: 'Algoritma dan Pemrograman', 
      semester: 'Ganjil 2024/2025', 
      sks: 4, 
      dosen: 'Dr. Jane Smith',
      mahasiswa: 30,
      kelompok: 3,
      status: 'inactive'
    }
  ],
  systemLogs: [
    { id: 1, timestamp: '2024-10-28 10:30:45', user: 'Alice Brown', action: 'Login', detail: 'Berhasil login ke sistem', level: 'info' },
    { id: 2, timestamp: '2024-10-28 10:25:12', user: 'Dr. John Doe', action: 'Create Group', detail: 'Membuat kelompok baru untuk Pemrograman Web', level: 'info' },
    { id: 3, timestamp: '2024-10-28 09:45:33', user: 'Bob Wilson', action: 'Submit Task', detail: 'Upload progress report', level: 'info' },
    { id: 4, timestamp: '2024-10-28 09:30:21', user: 'System', action: 'Backup', detail: 'Database backup completed', level: 'success' },
    { id: 5, timestamp: '2024-10-28 08:15:44', user: 'System', action: 'Error', detail: 'Failed to send email notification', level: 'error' },
    { id: 6, timestamp: '2024-10-27 16:45:33', user: 'Dr. Jane Smith', action: 'Grade Assignment', detail: 'Memberikan nilai untuk tugas RPL', level: 'info' }
  ],
  recentActivity: [
    { type: 'user', message: '3 mahasiswa baru terdaftar', time: '2 jam lalu', count: 3 },
    { type: 'course', message: 'Mata kuliah baru ditambahkan', time: '5 jam lalu', count: 1 },
    { type: 'system', message: 'Database backup berhasil', time: '1 hari lalu', count: 1 },
    { type: 'error', message: 'Error pada sistem email', time: '2 hari lalu', count: 2 }
  ]
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manajemen User', icon: Users },
    { id: 'courses', label: 'Mata Kuliah', icon: BookOpen },
    { id: 'system', label: 'Sistem & Log', icon: Database },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrator</h1>
        <p className="text-purple-100">Panel kontrol sistem manajemen tugas besar</p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.systemStats.totalUsers}</p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="text-green-600">+5</span> minggu ini
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.systemStats.activeUsers}</p>
            </div>
            <UserCheck className="h-12 w-12 text-green-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {Math.round((adminData.systemStats.activeUsers / adminData.systemStats.totalUsers) * 100)}% dari total
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mata Kuliah</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.systemStats.totalMataKuliah}</p>
            </div>
            <BookOpen className="h-12 w-12 text-yellow-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {adminData.mataKuliah.filter(mk => mk.status === 'active').length} aktif
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Server Uptime</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.systemStats.serverUptime}%</p>
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
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(adminData.systemStats.totalDosen / adminData.systemStats.totalUsers) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium">{adminData.systemStats.totalDosen}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mahasiswa</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(adminData.systemStats.totalMahasiswa / adminData.systemStats.totalUsers) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium">{adminData.systemStats.totalMahasiswa}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terkini</h3>
          <div className="space-y-3">
            {adminData.recentActivity.slice(0, 4).map((activity, index) => (
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
              <span className="text-gray-600">Email Service</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Error</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">File Storage</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Backup System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Running</span>
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
          {adminData.systemLogs.slice(0, 5).map(log => (
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
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option>Semua Role</option>
            <option>Dosen</option>
            <option>Mahasiswa</option>
          </select>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dosen</p>
              <p className="text-2xl font-bold text-blue-600">{adminData.systemStats.totalDosen}</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mahasiswa</p>
              <p className="text-2xl font-bold text-green-600">{adminData.systemStats.totalMahasiswa}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Users Aktif</p>
              <p className="text-2xl font-bold text-purple-600">{adminData.systemStats.activeUsers}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminData.users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.nama.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'dosen' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.lastLogin).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === 'dosen' ? `${user.mataKuliah} mata kuliah` : `NPM: ${user.npm}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminData.mataKuliah.map(mk => (
          <div key={mk.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mk.nama}</h3>
                <p className="text-gray-600">{mk.kode} • {mk.sks} SKS</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mk.status === 'active' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {mk.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>Dosen: {mk.dosen}</p>
              <p>Semester: {mk.semester}</p>
              <p>Mahasiswa: {mk.mahasiswa} orang</p>
              <p>Kelompok: {mk.kelompok} kelompok</p>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                Kelola
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
              <p className="text-lg font-bold text-green-600">Online</p>
            </div>
            <Database className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email Service</p>
              <p className="text-lg font-bold text-red-600">Error</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage</p>
              <p className="text-lg font-bold text-green-600">85% Used</p>
            </div>
            <Database className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-purple-600">{adminData.systemStats.serverUptime}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
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
              {adminData.systemLogs.map(log => (
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
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'courses': return renderCourses();
      case 'system': return renderSystemLogs();
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Konfigurasi Email</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="smtp.unpar.ac.id" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Port</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="587" />
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                    Simpan
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Pengaturan Backup</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval Backup</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Harian</option>
                      <option>Mingguan</option>
                      <option>Bulanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lokasi Backup</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="/backup/database" />
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                    Backup Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return renderDashboard();
    }
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
                  5
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AS</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{adminData.currentUser.nama}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 mr-8">
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
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;