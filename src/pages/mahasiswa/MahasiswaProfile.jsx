import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Save, AlertCircle, CheckCircle, 
  Edit2, ArrowLeft, GraduationCap, Calendar, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api, { getCurrentUser } from '../../utils/api';
import toast from 'react-hot-toast';
import MahasiswaLayout from '../../components/MahasiswaLayout';

const MahasiswaProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    nim: '',
    nama_lengkap: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      let userData = {};
      let profileData = {};
      
      // Fetch mahasiswa profile from /auth/me
      try {
        const userResponse = await getCurrentUser();
        // Handle different response structures
        if (userResponse.data) {
          userData = userResponse.data.user || userResponse.data || {};
        } else {
          userData = userResponse.user || userResponse || {};
        }
        console.log('User data from /auth/me:', userData);
        console.log('Full response:', userResponse);
      } catch (err) {
        console.error('Error fetching user from /auth/me:', err);
        // Use user from context as fallback
        userData = user || {};
      }
      
      // Fetch detailed profile from /auth/mahasiswa/profile (optional, /auth/me should have the data)
      try {
        const profileResponse = await api.get('/auth/mahasiswa/profile');
        profileData = profileResponse.data || {};
        console.log('Profile data from /auth/mahasiswa/profile:', profileData);
      } catch (err) {
        console.warn('Could not fetch from /auth/mahasiswa/profile, using /auth/me data:', err.response?.status);
        // This is okay, /auth/me should have the data we need
        profileData = {};
      }
      
      // Combine data, prioritizing profile data from /auth/mahasiswa/profile
      const finalData = {
        email: userData.email || user?.email || '',
        nim: profileData.nim || userData.nim || user?.nim || '',
        nama_lengkap: profileData.nama_lengkap || userData.nama_lengkap || user?.nama_lengkap || ''
      };
      
      console.log('Final form data:', finalData);
      setFormData(finalData);
      
      // Only show error if we have absolutely no data at all
      if (!finalData.email && !finalData.nim && !finalData.nama_lengkap) {
        setError('Data profil tidak ditemukan. Silakan hubungi administrator.');
      } else if (!finalData.nim || !finalData.nama_lengkap) {
        // Show warning if NIM or nama_lengkap is missing
        console.warn('Some profile data is missing:', { nim: finalData.nim, nama_lengkap: finalData.nama_lengkap });
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setError('Gagal memuat data profil: ' + (err.message || 'Unknown error'));
      
      // Fallback to user data from context
      if (user) {
        setFormData({
          email: user.email || '',
          nim: user.nim || '',
          nama_lengkap: user.nama_lengkap || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!formData.nama_lengkap || formData.nama_lengkap.trim() === '') {
      setError('Nama lengkap wajib diisi');
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    
    if (formData.nama_lengkap.trim().length < 2) {
      setError('Nama lengkap minimal 2 karakter');
      toast.error('Nama lengkap minimal 2 karakter');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Update profile
      const updateData = {
        nama_lengkap: formData.nama_lengkap.trim()
      };

      console.log('Sending update request:', updateData);

      const response = await api.put('/auth/mahasiswa/profile', updateData);
      
      console.log('Update response:', response);
      
      if (response.data && response.data.success) {
        // Update user context
        const updatedUser = {
          ...user,
          nama_lengkap: formData.nama_lengkap.trim()
        };
        setUser(updatedUser);
        
        setSuccess('Profil berhasil diperbarui');
        toast.success('Profil berhasil diperbarui');
        setIsEditing(false);
      } else {
        setError('Gagal memperbarui profil. Silakan coba lagi.');
        toast.error('Gagal memperbarui profil');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Gagal memperbarui profil';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data profil...</p>
          </div>
        </div>
      </MahasiswaLayout>
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="h-8 w-8 mr-3 text-green-600" />
                Profil Saya
              </h1>
              <p className="text-gray-600 mt-2">Kelola informasi profil Anda</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profil
              </button>
            )}
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

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Email (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* NIM (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 inline mr-2 text-gray-500" />
                NIM
              </label>
              <input
                type="text"
                value={formData.nim}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">NIM tidak dapat diubah</p>
            </div>

            {/* Nama Lengkap (Editable) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2 text-gray-500" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                disabled={!isEditing}
                required
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  isEditing
                    ? 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    : 'bg-gray-50 border-gray-300 cursor-not-allowed'
                }`}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
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
            )}
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">Informasi</h3>
              <p className="text-sm text-blue-700">
                Anda hanya dapat mengubah nama lengkap. Email dan NIM tidak dapat diubah karena terkait dengan sistem akademik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
};

export default MahasiswaProfile;

