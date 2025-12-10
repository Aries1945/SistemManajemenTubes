import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateDosenModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    nip: '',
    nama_lengkap: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (formData.email.length > 255) {
      errors.email = 'Email tidak boleh lebih dari 255 karakter';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    // NIP validation
    if (!formData.nip) {
      errors.nip = 'NIP wajib diisi';
    } else if (formData.nip.length > 20) { // Adjust based on your DB constraints
      errors.nip = 'NIP tidak boleh lebih dari 20 karakter';
    }
    
    // Nama lengkap validation
    if (!formData.nama_lengkap) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (formData.nama_lengkap.length > 255) {
      errors.nama_lengkap = 'Nama lengkap tidak boleh lebih dari 255 karakter';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for NIP to limit length if needed
    if (name === 'nip' && value.length > 20) { // Adjust based on your DB constraints
      setFieldErrors({
        ...fieldErrors,
        nip: 'NIP tidak boleh lebih dari 20 karakter'
      });
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        email: '',
        nip: '',
        nama_lengkap: ''
      });
      setFieldErrors({});
    } catch (err) {
      setError(err.message || 'Failed to create dosen account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Tambah Akun Dosen</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={255}
                className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="email@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                required
                maxLength={20} // Adjust based on your DB constraints
                className={`w-full px-3 py-2 border ${fieldErrors.nip ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Nomor Induk Pegawai"
              />
              {fieldErrors.nip && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nip}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.nip.length}/20 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                required
                maxLength={255}
                className={`w-full px-3 py-2 border ${fieldErrors.nama_lengkap ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Nama lengkap dosen"
              />
              {fieldErrors.nama_lengkap && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nama_lengkap}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-4">
              Password default adalah "123". User harus segera mengubah password setelah login pertama kali.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                disabled={isLoading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
              >
                {isLoading ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDosenModal;