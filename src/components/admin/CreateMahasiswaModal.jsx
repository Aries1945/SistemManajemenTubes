import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateMahasiswaModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    nim: '',
    nama_lengkap: '',
    angkatan: ''
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
    
    // NIM validation
    if (!formData.nim) {
      errors.nim = 'NIM wajib diisi';
    } else if (formData.nim.length > 10) {
      errors.nim = 'NIM tidak boleh lebih dari 10 karakter';
    }
    
    // Nama lengkap validation
    if (!formData.nama_lengkap) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (formData.nama_lengkap.length > 255) {
      errors.nama_lengkap = 'Nama lengkap tidak boleh lebih dari 255 karakter';
    }
    
    // Angkatan validation (optional)
    if (formData.angkatan) {
      const angkatanNum = Number(formData.angkatan);
      if (isNaN(angkatanNum) || angkatanNum < 1900 || angkatanNum > 2100) {
        errors.angkatan = 'Tahun angkatan tidak valid';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log("Updated form data:", newData);
      return newData;
    });
    
    // Clear any error for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        // Close the modal and reset form on success
        onClose();
        resetForm();
      } else {
        // Display the error message
        setError(result.error);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || 'Failed to create mahasiswa');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      nama_lengkap: '',
      nim: '',
      password: '',
      password_confirmation: '',
      angkatan: new Date().getFullYear().toString(),
      program_studi: 'Teknik Informatika'
    });
    setFieldErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Tambah Akun Mahasiswa</h3>
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
                NIM
              </label>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                required
                maxLength={10}
                className={`w-full px-3 py-2 border ${fieldErrors.nim ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Nomor Induk Mahasiswa (max 10 karakter)"
              />
              {fieldErrors.nim && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nim}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.nim.length}/10 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="create-mahasiswa-nama-lengkap" // Changed to be unique
                name="nama_lengkap" 
                value={formData.nama_lengkap}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${fieldErrors.nama_lengkap ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Nama lengkap mahasiswa"
                required
              />
              {fieldErrors.nama_lengkap && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.nama_lengkap}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angkatan
              </label>
              <input
                type="number"
                name="angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                min="1900"
                max="2100"
                className={`w-full px-3 py-2 border ${fieldErrors.angkatan ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                placeholder="Tahun angkatan (opsional)"
              />
              {fieldErrors.angkatan && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.angkatan}</p>
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

export default CreateMahasiswaModal;