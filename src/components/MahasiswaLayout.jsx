import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  User,
  ChevronDown,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MahasiswaLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.nama_lengkap) return user.nama_lengkap;
    if (user?.name) return user.name;
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Mahasiswa';
  };

  // Get user NIM
  const getUserNIM = () => {
    if (user?.nim) return user.nim;
    if (user?.id) return `ID: ${user.id}`;
    return 'NIM: -';
  };

  // Navigation menu items
  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/mahasiswa/dashboard'
    },
    {
      name: 'Mata Kuliah',
      icon: BookOpen,
      path: '/mahasiswa/dashboard/mata-kuliah'
    },
    
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if path is active
  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/mahasiswa/dashboard')}>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Taskara</h1>
                  <p className="text-xs text-gray-500">Portal Mahasiswa</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserDisplayName().charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{getUserNIM()}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {getUserDisplayName().charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                            <p className="text-sm text-gray-500">{getUserNIM()}</p>
                            <p className="text-xs text-gray-400">Teknik Informatika</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => navigate('/mahasiswa/profile')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profil Saya
                        </button>
                        <button 
                          onClick={() => navigate('/mahasiswa/settings')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Pengaturan
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-200">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3 font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Semester Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Semester Aktif</h3>
              <p className="text-sm text-gray-600">Ganjil 2024/2025</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-green-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MahasiswaLayout;