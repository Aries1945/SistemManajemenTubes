import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Eye, EyeOff, Shield, Key, ArrowLeft,
  AlertCircle, CheckCircle, Save, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MahasiswaLayout from '../../components/MahasiswaLayout';

const MahasiswaSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
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

      const response = await api.put('/auth/mahasiswa/password', updateData);
      
      if (response.data) {
        setSuccess('Password berhasil diubah');
        toast.success('Password berhasil diubah');
        
        // Reset form
        setFormData({
          currentPassword: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.error || 'Gagal mengubah password');
      toast.error(err.response?.data?.error || 'Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  return (
    <MahasiswaLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/mahasiswa/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Kembali ke Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-green-600" />
              Pengaturan
            </h1>
            <p className="text-gray-600 mt-2">Kelola keamanan akun Anda</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Berhasil</h3>
              <p className="text-sm text-green-600 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Password Change Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-2">
              <Key className="h-5 w-5 mr-2 text-green-600" />
              Ubah Password
            </h2>
            <p className="text-sm text-gray-600">Gunakan password yang kuat untuk melindungi akun Anda</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 pr-12"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('currentPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.currentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 pr-12"
                  placeholder="Masukkan password baru (minimal 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.password ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 pr-12"
                  placeholder="Masukkan ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.confirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">Tips Keamanan Password</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Gunakan minimal 6 karakter</li>
                <li>• Kombinasikan huruf besar, huruf kecil, dan angka</li>
                <li>• Jangan gunakan informasi pribadi sebagai password</li>
                <li>• Jangan bagikan password Anda kepada siapapun</li>
                <li>• Ganti password secara berkala</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
};

export default MahasiswaSettings;

