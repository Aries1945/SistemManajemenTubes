import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Settings, Bell, User, LogOut, Users, 
  FileText, Star, Calendar, UserPlus
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk role switching (dalam implementasi nyata akan dari auth/context)
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Dr. John Doe',
    email: 'john.doe@unpar.ac.id',
    role: 'dosen' // 'dosen', 'mahasiswa', 'admin'
  });

  // Role switching untuk testing
  const switchRole = (newRole) => {
    const roleUsers = {
      'dosen': { id: 1, name: 'Dr. John Doe', email: 'john.doe@unpar.ac.id', role: 'dosen' },
      'mahasiswa': { id: 2, name: 'Alice Johnson', email: 'alice@student.unpar.ac.id', role: 'mahasiswa' },
      'admin': { id: 3, name: 'Admin System', email: 'admin@unpar.ac.id', role: 'admin' }
    };
    setCurrentUser(roleUsers[newRole]);
    
    // Navigate to appropriate dashboard
    if (newRole === 'mahasiswa') {
      navigate('/student/dashboard');
    } else if (newRole === 'admin') {
      navigate('/admin/courses');
    } else {
      navigate('/dashboard');
    }
  };

  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'mahasiswa':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: BookOpen },
          { path: '/student/courses', label: 'Mata Kuliah Saya', icon: BookOpen },
          { path: '/student/groups', label: 'Kelompok Saya', icon: Users },
          { path: '/student/assignments', label: 'Tugas & Nilai', icon: FileText }
        ];
      case 'admin':
        return [
          { path: '/admin/courses', label: 'Kelola Mata Kuliah', icon: BookOpen },
          { path: '/admin/users', label: 'Kelola User', icon: UserPlus }
        ];
      default: // dosen
        return [
          { path: '/dashboard', label: 'Dashboard', icon: BookOpen },
          { path: '/courses', label: 'Mata Kuliah', icon: BookOpen }
        ];
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
                           (item.path !== '/dashboard' && item.path !== '/student/dashboard' && location.pathname.startsWith(item.path));
            
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
        <div className="flex items-center gap-3 mb-3">
          <User size={20} />
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-slate-400 capitalize">{currentUser.role}</p>
          </div>
        </div>
        
        {/* Role Switcher untuk testing */}
        <div className="mb-3">
          <select 
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value)}
            className="w-full bg-slate-800 text-white text-sm px-2 py-1 rounded border border-slate-600"
          >
            <option value="dosen">Dosen</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  const Header = () => {
    const getPageTitle = () => {
      // Mahasiswa routes
      if (location.pathname === '/student/dashboard') return 'Dashboard';
      if (location.pathname === '/student/courses') return 'Mata Kuliah Saya';
      if (location.pathname.startsWith('/student/courses/')) return 'Detail Mata Kuliah';
      if (location.pathname === '/student/groups') return 'Kelompok Saya';
      if (location.pathname === '/student/assignments') return 'Tugas & Nilai';
      
      // Admin routes
      if (location.pathname === '/admin/courses') return 'Kelola Mata Kuliah';
      if (location.pathname === '/admin/users') return 'Kelola User';
      
      // Dosen routes
      if (location.pathname === '/dashboard') return 'Dashboard';
      if (location.pathname === '/courses') return 'Mata Kuliah';
      if (location.pathname.startsWith('/courses/')) return 'Detail Mata Kuliah';
      
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
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
            <User size={20} className="text-gray-600" />
            <span className="text-sm font-medium">{currentUser.name}</span>
          </div>
        </div>
      </div>
    );
  };

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