import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  User,
  ChevronDown,
  Calendar,
  Award,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LogoIF2 from '../assets/LogoIF2.png';

const MahasiswaLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (path === '/mahasiswa/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed w-full z-30 top-0 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:block hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              
              <div className="flex items-center cursor-pointer group" onClick={() => navigate('/mahasiswa/dashboard')}>
                <div className="flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden hover:opacity-90 transition-opacity duration-300">
                  <img 
                    src={LogoIF2} 
                    alt="Logo IF" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="h-8 w-px bg-gray-200/60 ml-3"></div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Portal Mahasiswa
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Universitas Katolik Parahyangan</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-shadow">
                    {getUserDisplayName().charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
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
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                            {getUserDisplayName().charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                            <p className="text-sm text-gray-600">{getUserNIM()}</p>
                            <p className="text-xs text-gray-500">Mahasiswa</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            navigate('/mahasiswa/profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profil Saya
                        </button>
                        <button 
                          onClick={() => {
                            navigate('/mahasiswa/settings');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Pengaturan
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-200">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors"
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

      {/* Mobile Menu Overlay - Only show on mobile, hidden on desktop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          onTouchStart={(e) => e.stopPropagation()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 z-50 shadow-xl ${
          sidebarOpen ? 'w-64' : 'w-0'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-hidden`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3 font-semibold">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Semester Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">Semester Aktif</h3>
              <p className="text-sm text-gray-600 mb-3">Ganjil 2024/2025</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-semibold text-green-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-20 transition-all duration-300 px-6 pb-8 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MahasiswaLayout;
