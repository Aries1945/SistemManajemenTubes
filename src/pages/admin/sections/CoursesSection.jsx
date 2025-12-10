import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, ChevronDown, X, Eye } from 'lucide-react';
import api from '../../../utils/api';

const CoursesSection = ({ 
  courses, 
  semesterFilter, 
  setSemesterFilter,
  getFilteredCourses,
  setIsCourseModalOpen,
  openDeleteConfirmation
}) => {
  const filteredCourses = getFilteredCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit'
  const [dosenList, setDosenList] = useState([]);

  // Fetch dosen list when editing
  useEffect(() => {
    if (viewMode === 'edit') {
      api.get('/admin/users')
        .then(response => {
          const dosenOnly = response.data.filter(user => user.role === 'dosen' && user.is_active);
          setDosenList(dosenOnly);
        })
        .catch(error => {
          console.error('Error fetching dosen list:', error);
        });
    }
  }, [viewMode]);

  const handleViewDetail = (course) => {
    setSelectedCourse(course);
    setViewMode('detail');
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setViewMode('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const formData = new FormData(e.target);
    const updateData = {
      nama: formData.get('nama') || selectedCourse.nama,
      kode: formData.get('kode') || selectedCourse.kode,
      sks: parseInt(formData.get('sks')) || selectedCourse.sks,
      dosen_id: formData.get('dosen_id') || selectedCourse.dosen_id,
      semester: formData.get('semester') || selectedCourse.semester,
      tahun_ajaran: formData.get('tahun_ajaran') || selectedCourse.tahun_ajaran,
      deskripsi: formData.get('deskripsi') || selectedCourse.deskripsi,
      status: formData.get('status') || selectedCourse.status
    };

    try {
      await api.patch(`/admin/courses/${selectedCourse.id}`, updateData);
      setViewMode('list');
      setSelectedCourse(null);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Gagal mengupdate mata kuliah: ' + (error.response?.data?.error || error.message));
    }
  };

  const renderDetailView = () => {
    if (!selectedCourse) return null;

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.nama}</h2>
            <p className="text-gray-600 mt-1">{selectedCourse.kode} • {selectedCourse.sks} SKS</p>
          </div>
          <button
            onClick={() => setViewMode('list')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Dosen Pengajar</h3>
            <p className="text-gray-900">{selectedCourse.dosen_nama || 'Belum ditentukan'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Semester</h3>
            <p className="text-gray-900">{selectedCourse.semester} {selectedCourse.tahun_ajaran}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedCourse.status}
            </span>
          </div>
          {selectedCourse.deskripsi && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Deskripsi</h3>
              <p className="text-gray-900">{selectedCourse.deskripsi}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => handleEdit(selectedCourse)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  };

  const renderEditView = () => {
    if (!selectedCourse) return null;

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Mata Kuliah</h2>
            <p className="text-sm text-gray-600 mt-1">Perbarui informasi mata kuliah</p>
          </div>
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCourse(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Kuliah</label>
            <input
              type="text"
              name="nama"
              defaultValue={selectedCourse.nama}
              required
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
            <input
              type="text"
              name="kode"
              defaultValue={selectedCourse.kode}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKS</label>
            <input
              type="number"
              name="sks"
              defaultValue={selectedCourse.sks}
              min="1"
              max="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosen Pengajar</label>
            <select
              name="dosen_id"
              defaultValue={selectedCourse.dosen_id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Pilih Dosen --</option>
              {dosenList.map(dosen => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.nama_lengkap || dosen.email} {dosen.nip ? `(${dosen.nip})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              name="semester"
              defaultValue={selectedCourse.semester}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <input
              type="text"
              name="tahun_ajaran"
              defaultValue={selectedCourse.tahun_ajaran}
              placeholder="2024/2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="deskripsi"
              defaultValue={selectedCourse.deskripsi}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              defaultValue={selectedCourse.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setSelectedCourse(null);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (viewMode === 'detail') {
    return renderDetailView();
  }

  if (viewMode === 'edit') {
    return renderEditView();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
            >
              <option value="all">Semua Semester</option>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          
          <button 
            onClick={() => setIsCourseModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.nama}</h3>
                  <p className="text-gray-600">{course.kode} • {course.sks} SKS</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Dosen: {course.dosen_nama || 'Belum ditentukan'}</p>
                <p>Semester: {course.semester} {course.tahun_ajaran}</p>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewDetail(course)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Detail</span>
                </button>
                <button 
                  onClick={() => handleEdit(course)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Edit Mata Kuliah"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                
                <button 
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  onClick={() => openDeleteConfirmation(course.id, 'course', course.nama)}
                  title="Hapus Mata Kuliah"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white p-8 rounded-xl shadow-lg text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mata kuliah</h3>
            <p className="text-gray-500 mb-4">Belum ada mata kuliah yang terdaftar dalam sistem</p>
            <button 
              onClick={() => setIsCourseModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Mata Kuliah Pertama</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default CoursesSection;