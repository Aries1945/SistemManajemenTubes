import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    email: '',
    nama_lengkap: '',
    nip: '',
    npm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email || '',
        nama_lengkap: user.nama_lengkap || '',
        nip: user.nip || '',
        npm: user.npm || user.nim || ''
      });
      setError(null);
      setFieldErrors({});
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const errors = {};
    
    // Nama lengkap validation
    if (!formData.nama_lengkap) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (formData.nama_lengkap.length > 255) {
      errors.nama_lengkap = 'Nama lengkap tidak boleh lebih dari 255 karakter';
    }
    
    // NIP validation (for dosen)
    if (user?.role === 'dosen') {
      if (!formData.nip) {
        errors.nip = 'NIP wajib diisi';
      } else if (formData.nip.length > 20) {
        errors.nip = 'NIP tidak boleh lebih dari 20 karakter';
      }
    }
    
    // NPM validation (for mahasiswa)
    if (user?.role === 'mahasiswa') {
      if (!formData.npm) {
        errors.npm = 'NPM wajib diisi';
      } else if (formData.npm.length > 20) {
        errors.npm = 'NPM tidak boleh lebih dari 20 karakter';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        nama_lengkap: formData.nama_lengkap
      };

      if (user.role === 'dosen') {
        updateData.nip = formData.nip;
        await api.put(`/admin/dosen/${user.id}`, updateData);
      } else if (user.role === 'mahasiswa') {
        updateData.npm = formData.npm;
        await api.put(`/admin/mahasiswa/${user.id}`, updateData);
      }

      toast.success('User berhasil diperbarui');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.error || 'Gagal memperbarui user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Edit {user?.role === 'dosen' ? 'Dosen' : user?.role === 'mahasiswa' ? 'Mahasiswa' : 'User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                fieldErrors.nama_lengkap
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {fieldErrors.nama_lengkap && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.nama_lengkap}</p>
            )}
          </div>

          {/* NIP (for Dosen) */}
          {user?.role === 'dosen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                maxLength={20}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.nip
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
                placeholder="Masukkan NIP"
              />
              {fieldErrors.nip && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.nip}</p>
              )}
            </div>
          )}

          {/* NPM (for Mahasiswa) */}
          {user?.role === 'mahasiswa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NPM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="npm"
                value={formData.npm}
                onChange={handleChange}
                maxLength={20}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fieldErrors.npm
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
                placeholder="Masukkan NPM"
              />
              {fieldErrors.npm && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.npm}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

