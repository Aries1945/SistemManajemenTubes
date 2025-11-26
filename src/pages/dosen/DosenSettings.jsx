import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Save, AlertCircle, CheckCircle, 
  Lock, Eye, EyeOff, Shield, Calendar, Key,
  Info, Edit2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DosenSettings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('DosenSettings component mounted');
    console.log('DosenSettings - Current location:', window.location.pathname);
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    nip: '',
    nama_lengkap: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
    currentPassword: false
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dosen profile
      const response = await api.get('/auth/dosen/profile');
      
      if (response.data) {
        setFormData({
          email: user?.email || '',
          nip: response.data.nip || '',
          nama_lengkap: response.data.nama_lengkap || '',
          password: '',
          confirmPassword: '',
          currentPassword: ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Gagal memuat data profil');
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'profile') {
      // Validate profile fields
      if (!formData.nama_lengkap || !formData.nip) {
        setError('Nama lengkap dan NIP wajib diisi');
        return;
      }

      try {
        setSaving(true);
        
        // Update profile
        const updateData = {
          nama_lengkap: formData.nama_lengkap,
          nip: formData.nip
        };

        const response = await api.put('/auth/dosen/profile', updateData);
        
        if (response.data) {
          // Update user context
          setUser({
            ...user,
            nama_lengkap: formData.nama_lengkap
          });
          
          toast.success('Profil berhasil diperbarui');
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err.response?.data?.error || 'Gagal memperbarui profil');
        toast.error(err.response?.data?.error || 'Gagal memperbarui profil');
      } finally {
        setSaving(false);
      }
    } else if (activeTab === 'password') {
      // Validate password fields
      if (!formData.currentPassword) {
        setError('Password saat ini wajib diisi');
        return;
      }
      if (!formData.password || !formData.confirmPassword) {
        setError('Password baru dan konfirmasi password wajib diisi');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Password baru dan konfirmasi password tidak sama');
        return;
      }
      if (formData.currentPassword === formData.password) {
        setError('Password baru harus berbeda dengan password saat ini');
        return;
      }

      try {
        setSaving(true);
        
        // Update password
        const updateData = {
          currentPassword: formData.currentPassword,
          password: formData.password
        };

        const response = await api.put('/auth/dosen/profile', updateData);
        
        if (response.data) {
          toast.success('Password berhasil diubah');
          
          // Clear password fields
          setFormData({
            ...formData,
            password: '',
            confirmPassword: '',
            currentPassword: ''
          });
        }
      } catch (err) {
        console.error('Error updating password:', err);
        setError(err.response?.data?.error || 'Gagal mengubah password');
        toast.error(err.response?.data?.error || 'Gagal mengubah password');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-gray-600">Kelola informasi dan keamanan akun dosen Anda</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="text-red-600 mr-3" size={20} />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>Profil Akun</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock size={18} />
                <span>Keamanan</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informasi Profil</h2>
                <p className="text-sm text-gray-600 mt-1">Perbarui informasi akun dosen Anda</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-2" size={16} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <Info size={14} />
                <span>Email tidak dapat diubah. Hubungi administrator untuk perubahan email.</span>
              </div>
            </div>

            {/* NIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline mr-2" size={16} />
                NIP *
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan NIP"
                required
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dosen/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ubah Password</h2>
                <p className="text-sm text-gray-600 mt-1">Perbarui password untuk meningkatkan keamanan akun</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline mr-2" size={16} />
                Password Saat Ini *
              </label>
              <div className="relative">
                <input
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, currentPassword: !showPassword.currentPassword })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline mr-2" size={16} />
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan password baru (minimal 6 karakter)"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.password ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline mr-2" size={16} />
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Konfirmasi password baru"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Info size={16} />
                Tips Keamanan Password
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Gunakan minimal 6 karakter</li>
                <li>Kombinasikan huruf besar, huruf kecil, dan angka</li>
                <li>Jangan gunakan informasi pribadi sebagai password</li>
                <li>Ganti password secara berkala</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, password: '', confirmPassword: '', currentPassword: '' });
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DosenSettings;

