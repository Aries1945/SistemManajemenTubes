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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu items untuk dosen
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dosen/dashboard',
      active: location.pathname === '/dosen/dashboard' || location.pathname === '/dosen/dashboard/'
    },
    {
      title: 'Mata Kuliah',
      icon: BookOpen,
      path: '/dosen/dashboard/mata-kuliah',
      active: location.pathname.includes('/dosen/dashboard/mata-kuliah') || 
              location.pathname.includes('/dosen/dashboard/courses')
    },
    {
      title: 'Semua Tugas',
      icon: FileText,
      path: '/dosen/dashboard/semua-tugas',
      active: location.pathname.includes('/dosen/dashboard/semua-tugas')
    },
    {
      title: 'Mahasiswa',
      icon: Users,
      path: '/dosen/dashboard/mahasiswa',
      active: location.pathname.includes('/dosen/dashboard/mahasiswa')
    },
    {
      title: 'Statistik',
      icon: BarChart3,
      path: '/dosen/dashboard/statistik',
      active: location.pathname.includes('/dosen/dashboard/statistik')
    },
  ];

  const handleNavigation = (path) => {
    console.log('Layout - Navigating to:', path);
    console.log('Layout - Current location:', location.pathname);
    // Close mobile menu immediately before navigation
    setIsMobileMenuOpen(false);
    navigate(path, { replace: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.nama_lengkap) return user.nama_lengkap;
    if (user?.name) return user.name;
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:block hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
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
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Portal Dosen
                </h1>
                <p className="text-xs text-gray-500 font-medium">Universitas Katolik Parahyangan</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Dosen'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Only show on mobile, hidden on desktop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-md border-r border-gray-200/50 z-50
        transition-all duration-300 ease-in-out shadow-xl
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                transition-all duration-200 transform hover:scale-105
                ${item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                }
              `}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${item.active ? 'text-white' : 'text-gray-600'}`} />
              {isSidebarOpen && (
                <span className="font-semibold">{item.title}</span>
              )}
            </button>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Settings button clicked, navigating to /dosen/dashboard/settings');
                handleNavigation('/dosen/dashboard/settings');
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                transition-all duration-200 transform hover:scale-105
                ${location.pathname === '/dosen/dashboard/settings'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                }
              `}
            >
              <Settings className={`h-5 w-5 flex-shrink-0 ${location.pathname === '/dosen/dashboard/settings' ? 'text-white' : 'text-gray-600'}`} />
              {isSidebarOpen && (
                <span className="font-semibold">Pengaturan</span>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl mt-2
                text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="font-semibold">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-20 transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8 pb-8
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        <div className="min-h-[calc(100vh-5rem)] max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
