import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import LogoIF2 from '../assets/LogoIF2.png';

const LoginPage = () => {
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      redirectToDashboard(user.role);
    }
  }, [user, authLoading]);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'dosen':
        navigate('/dosen/dashboard');
        break;
      case 'mahasiswa':
        navigate('/mahasiswa/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const formik = useFormik({
    initialValues: { 
      email: '', 
      password: '' 
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        setError(null);
        const result = await login(values.email, values.password);
        
        // Handle login failure
        if (!result.success) {
          setError(result.error);
        }
        // Navigation handled by useEffect when user state changes
      } catch (error) {
        setError(error.message || 'Invalid email or password');
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden">
                <img 
                  src={LogoIF2} 
                  alt="Logo IF" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal Akademik</h1>
                <p className="text-xs text-gray-500">Universitas Katolik Parahyangan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Sistem Manajemen Tugas Besar
            </h2>
            <p className="text-base text-gray-600">
              Masuk untuk mengakses sistem manajemen tugas besar
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <div className="bg-blue-600 rounded-full p-3 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
              Masuk ke Akun Anda
            </h3>

            {/* Error Message */}
            {error && (
              <div 
                className={`mb-6 p-4 rounded-xl border-l-4 ${
                  error.includes('tidak aktif') 
                    ? 'bg-amber-50 border-amber-400 text-amber-800' 
                    : 'bg-red-50 border-red-400 text-red-800'
                }`} 
                role="alert"
              >
                <p className="font-semibold text-sm">{error}</p>
                {error.includes('tidak aktif') && (
                  <p className="mt-2 text-xs text-amber-700">
                    Hubungi administrator sistem untuk mengaktifkan kembali akun Anda.
                  </p>
                )}
              </div>
            )}

            <form className="space-y-5" onSubmit={formik.handleSubmit}>
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
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
                    {...formik.getFieldProps('email')}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="nama@example.com"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...formik.getFieldProps('password')}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    placeholder="Password Anda"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <img 
                src={LogoIF2} 
                alt="Logo IF" 
                className="h-8 w-auto object-contain"
              />
              <p className="text-sm text-gray-600">
                Sistem Manajemen Tugas Besar
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Universitas Katolik Parahyangan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
