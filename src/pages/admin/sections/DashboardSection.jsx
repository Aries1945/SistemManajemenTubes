import React from 'react';
import { Users, UserCheck, Activity, Database, TrendingUp } from 'lucide-react';
import StatsCard from '../../../components/admin/StatsCard';

const DashboardSection = ({ stats, systemLogs, recentActivity, setActiveTab }) => {
  return (
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
};

export default DashboardSection;