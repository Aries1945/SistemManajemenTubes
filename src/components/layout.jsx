import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Settings, Bell, User, LogOut, Users, 
  FileText, UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Get user and logout from AuthContext

  const handleLogout = () => {
    logout();
    // The navigate to login is handled by the logout function in AuthContext
  };

  const getMenuItems = () => {
    // Use the role from auth context
    switch (user?.role) {
      case 'mahasiswa':
        return [
          { path: '/mahasiswa/dashboard', label: 'Dashboard', icon: BookOpen },
          { path: '/mahasiswa/courses', label: 'Mata Kuliah Saya', icon: BookOpen },
          { path: '/mahasiswa/groups', label: 'Kelompok Saya', icon: Users },
          { path: '/mahasiswa/assignments', label: 'Tugas & Nilai', icon: FileText }
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: BookOpen },
          { path: '/admin/users', label: 'Kelola User', icon: UserPlus }
        ];
      case 'dosen':
        return [
          { path: '/dosen/dashboard', label: 'Dashboard', icon: BookOpen },
          { path: '/dosen/courses', label: 'Mata Kuliah', icon: BookOpen }
        ];
      default:
        return []; // No menu items if no valid role
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">UNPAR TugBes</h1>
        <p className="text-slate-400 text-sm">Manajemen Tugas Besar</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path !== `/${user?.role}/dashboard` && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <button 
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-slate-700 rounded-full h-10 w-10 flex items-center justify-center">
            <User size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  const Header = () => {
    const getPageTitle = () => {
      // Mahasiswa routes
      if (location.pathname === '/mahasiswa/dashboard') return 'Dashboard Mahasiswa';
      if (location.pathname === '/mahasiswa/courses') return 'Mata Kuliah Saya';
      if (location.pathname.startsWith('/mahasiswa/courses/')) return 'Detail Mata Kuliah';
      if (location.pathname === '/mahasiswa/groups') return 'Kelompok Saya';
      if (location.pathname === '/mahasiswa/assignments') return 'Tugas & Nilai';
      
      // Admin routes
      if (location.pathname === '/admin/dashboard') return 'Dashboard Admin';
      if (location.pathname === '/admin/users') return 'Kelola User';
      
      // Dosen routes
      if (location.pathname === '/dosen/dashboard') return 'Dashboard Dosen';
      if (location.pathname === '/dosen/courses') return 'Mata Kuliah';
      if (location.pathname.startsWith('/dosen/courses/')) return 'Detail Mata Kuliah';
      
      return 'Dashboard';
    };

    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
          <p className="text-gray-600">Semester Ganjil 2024/2025</p>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
          <Settings className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
          <div className="flex items-center gap-2 p-2 rounded-lg">
            <User size={20} className="text-gray-600" />
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
        </div>
      </div>
    );
  };

  // Only render the layout if we have a user, otherwise could show loading
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;