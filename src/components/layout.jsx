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
  Bell,
  User
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
      active: location.pathname === '/dosen/dashboard'
    },
    {
      title: 'Mata Kuliah',
      icon: BookOpen,
      path: '/dosen/dashboard/mata-kuliah',
      active: location.pathname.includes('/dosen/dashboard/mata-kuliah') || 
              location.pathname.includes('/dosen/dashboard/courses')
    },
 

  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:block hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal Dosen</h1>
                <p className="text-xs text-gray-500">Universitas XYZ</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Dosen'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${item.active 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${item.active ? 'text-white' : 'text-gray-600'}`} />
              {isSidebarOpen && (
                <span className="font-medium">{item.title}</span>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={() => handleNavigation('/dosen/dashboard/pengaturan')}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                text-gray-700 hover:bg-gray-100 transition-all duration-200
              `}
            >
              <Settings className="h-5 w-5 flex-shrink-0 text-gray-600" />
              {isSidebarOpen && (
                <span className="font-medium">Pengaturan</span>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                text-red-600 hover:bg-red-50 transition-all duration-200
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;