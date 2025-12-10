import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X } from 'lucide-react';

const CreateClassModal = ({ isOpen, onClose, onSubmit, courseId, initialData }) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    dosen_id: '',
    kapasitas: 40
  });
  
  const [dosenList, setDosenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      fetchDosen();
      
      if (isEditing && initialData) {
        setFormData({
          nama: initialData.nama || '',
          kode: initialData.kode || '',
          dosen_id: initialData.dosen_id || '',
          kapasitas: initialData.kapasitas || 40
        });
      } else {
        // Reset form for new class
        setFormData({
          nama: '',
          kode: '',
          dosen_id: '',
          kapasitas: 40
        });
      }
    }
  }, [isOpen, initialData, isEditing]);
  
  const fetchDosen = async () => {
    try {
      const response = await api.get('/admin/users');
      const dosenOnly = response.data.filter(user => user.role === 'dosen' && user.is_active);
      setDosenList(dosenOnly);
    } catch (err) {
      console.error('Error fetching dosen list:', err);
      setError('Gagal mengambil daftar dosen');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await onSubmit(formData, courseId, initialData?.id);
      if (!result.success) {
        setError(result.error || 'Gagal menyimpan kelas');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan kelas');
      console.error('Error in class creation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kelas*
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Kelas A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Kelas
            </label>
            <input
              type="text"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              placeholder="K01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosen Pengajar
            </label>
            <select
              name="dosen_id"
              value={formData.dosen_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Pilih Dosen --</option>
              {dosenList.map(dosen => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.nama_lengkap || dosen.email} {dosen.nip ? `(${dosen.nip})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kapasitas
            </label>
            <input
              type="number"
              name="kapasitas"
              value={formData.kapasitas}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Kelas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;