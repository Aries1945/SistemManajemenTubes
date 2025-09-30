import React, { useState } from 'react';
import { User, LogIn, Eye, EyeOff, Mail, Lock, Users, BookOpen, Shield } from 'lucide-react';

// Dummy users untuk demo
const dummyUsers = [
  { id: 1, nama: 'Dr. John Doe', email: 'john.doe@unpar.ac.id', role: 'dosen', password: 'dosen123' },
  { id: 2, nama: 'Alice Brown', email: '2024001@student.unpar.ac.id', role: 'mahasiswa', npm: '2024001', password: 'mahasiswa123' },
  { id: 3, nama: 'Bob Wilson', email: '2024002@student.unpar.ac.id', role: 'mahasiswa', npm: '2024002', password: 'mahasiswa456' },
  { id: 4, nama: 'Admin System', email: 'admin@unpar.ac.id', role: 'admin', password: 'admin123' }
];

const UnparLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !selectedRole) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const user = dummyUsers.find(u => 
        u.email === email && u.password === password && u.role === selectedRole
      );

      setIsLoading(false);

      if (user) {
        onLogin(user);
      } else {
        alert('Email, password, atau role tidak valid!');
      }
    }, 1000);
  };

  const handleQuickLogin = (role) => {
    const user = dummyUsers.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
      setSelectedRole(role);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header dengan Logo UNPAR */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          {/* Logo UNPAR */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              {/* Logo Informatika UNPAR (pixel style) */}
              <div className="grid grid-cols-4 gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-900 rounded-sm"></div>
              </div>
              
              {/* Logo UNPAR Cross */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0">
                  {/* Cross shape */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-5 bg-blue-600 rounded-tl-2xl"></div>
                  <div className="absolute top-4 left-0 w-12 h-4 bg-blue-900"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-900"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-900 mb-1">INFORMATIKA</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">UNPAR</h2>
            <p className="text-sm text-gray-600 mb-1">Universitas Katolik Parahyangan</p>
          </div>
        </div>

        <h3 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sistem Manajemen Tugas Besar
        </h3>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masuk dengan akun UNPAR Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email UNPAR
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@unpar.ac.id atau npm@student.unpar.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Masuk sebagai
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              >
                <option value="">Pilih Role</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Login Button */}
            <div>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Masuk...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Quick Login</span>
              </div>
            </div>

            {/* Quick Login Buttons */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={() => handleQuickLogin('mahasiswa')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-green-300 transition-colors duration-200"
              >
                <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                Login sebagai Mahasiswa
              </button>
              
              <button
                onClick={() => handleQuickLogin('dosen')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors duration-200"
              >
                <User className="h-4 w-4 mr-2 text-blue-500" />
                Login sebagai Dosen
              </button>
              
              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-colors duration-200"
              >
                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                Login sebagai Admin
              </button>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Demo Credentials:</h4>
            <div className="text-xs text-blue-700 space-y-2">
              <div className="p-2 bg-white rounded border-l-4 border-green-500">
                <p className="font-semibold">Mahasiswa:</p>
                <p>Email: 2024001@student.unpar.ac.id</p>
                <p>Password: mahasiswa123</p>
              </div>
              <div className="p-2 bg-white rounded border-l-4 border-blue-500">
                <p className="font-semibold">Dosen:</p>
                <p>Email: john.doe@unpar.ac.id</p>
                <p>Password: dosen123</p>
              </div>
              <div className="p-2 bg-white rounded border-l-4 border-purple-500">
                <p className="font-semibold">Admin:</p>
                <p>Email: admin@unpar.ac.id</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Program Studi Informatika - Universitas Katolik Parahyangan
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sistem Manajemen Tugas Besar v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnparLoginPage;