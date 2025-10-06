import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  Trophy,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MahasiswaSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/mahasiswa/dashboard',
      exact: true
    },
    {
      title: 'Mata Kuliah',
      icon: BookOpen,
      path: '/mahasiswa/dashboard/courses'
    },
    {
      title: 'Kelompok',
      icon: Users,
      path: '/mahasiswa/dashboard/groups'
    },
    {
      title: 'Tugas',
      icon: FileText,
      path: '/mahasiswa/dashboard/assignments'
    },
    {
      title: 'Nilai',
      icon: Trophy,
      path: '/mahasiswa/dashboard/grades'
    },
    {
      title: 'Jadwal',
      icon: Calendar,
      path: '/mahasiswa/dashboard/schedule'
    },
    {
      title: 'Diskusi',
      icon: MessageSquare,
      path: '/mahasiswa/dashboard/discussions'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">Portal Mahasiswa</h2>
              <p className="text-sm text-gray-600">Sistem Manajemen Tugas</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-green-50 text-green-700 border-r-4 border-green-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }`}
                  title={isCollapsed ? item.title : ''}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/mahasiswa/dashboard/profile"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive('/mahasiswa/dashboard/profile')
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
              }`}
              title={isCollapsed ? 'Profil' : ''}
            >
              <User className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span className="font-medium">Profil</span>}
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50`}
              title={isCollapsed ? 'Keluar' : ''}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span className="font-medium">Keluar</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MahasiswaSidebar;