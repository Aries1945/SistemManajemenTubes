import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, 
  BookOpen, Users, Calendar, Save, X,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const AdminCourseManagement = () => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'detail'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');

  // Sample data - akan diganti dengan data dari API
  const courses = [
    {
      id: 1,
      name: 'Pemrograman Web',
      code: 'IF123',
      sks: 3,
      semester: 'Ganjil 2024/2025',
      description: 'Mata kuliah yang mempelajari pengembangan aplikasi web modern',
      lecturer: 'Dr. John Doe',
      lecturerId: 1,
      students: 45,
      maxStudents: 50,
      schedule: [
        { day: 'Senin', time: '08:00-10:00', room: 'Lab A' },
        { day: 'Rabu', time: '10:00-12:00', room: 'Lab A' }
      ],
      status: 'active',
      createdAt: '2024-08-15',
      updatedAt: '2024-09-20'
    },
    {
      id: 2,
      name: 'Basis Data',
      code: 'IF234',
      sks: 3,
      semester: 'Ganjil 2024/2025',
      description: 'Konsep dan implementasi sistem basis data',
      lecturer: 'Dr. Jane Smith',
      lecturerId: 2,
      students: 38,
      maxStudents: 40,
      schedule: [
        { day: 'Selasa', time: '13:00-15:00', room: 'Ruang 201' },
        { day: 'Kamis', time: '13:00-15:00', room: 'Ruang 201' }
      ],
      status: 'active',
      createdAt: '2024-08-15',
      updatedAt: '2024-09-18'
    },
    {
      id: 3,
      name: 'Algoritma dan Struktur Data',
      code: 'IF135',
      sks: 4,
      semester: 'Genap 2023/2024',
      description: 'Fundamental algoritma dan struktur data',
      lecturer: 'Dr. Bob Wilson',
      lecturerId: 3,
      students: 42,
      maxStudents: 45,
      schedule: [
        { day: 'Senin', time: '13:00-15:00', room: 'Ruang 102' },
        { day: 'Kamis', time: '08:00-10:00', room: 'Ruang 102' }
      ],
      status: 'completed',
      createdAt: '2024-01-15',
      updatedAt: '2024-06-20'
    }
  ];

  const lecturers = [
    { id: 1, name: 'Dr. John Doe', email: 'john.doe@unpar.ac.id' },
    { id: 2, name: 'Dr. Jane Smith', email: 'jane.smith@unpar.ac.id' },
    { id: 3, name: 'Dr. Bob Wilson', email: 'bob.wilson@unpar.ac.id' },
    { id: 4, name: 'Dr. Alice Brown', email: 'alice.brown@unpar.ac.id' }
  ];

  const semesters = [
    'Ganjil 2024/2025',
    'Genap 2023/2024',
    'Ganjil 2023/2024',
    'Genap 2022/2023'
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const CourseList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Mata Kuliah</h2>
          <p className="text-gray-600">Manajemen mata kuliah di Program Studi Informatika</p>
        </div>
        <button 
          onClick={() => setActiveView('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Mata Kuliah
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari mata kuliah, kode, atau dosen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Semester</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mata Kuliah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahasiswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500">{course.code} • {course.sks} SKS</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.lecturer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.semester}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.students}/{course.maxStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={course.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveView('detail');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveView('edit');
                        }}
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterSemester !== 'all' ? 'Tidak ada mata kuliah yang sesuai' : 'Belum ada mata kuliah'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSemester !== 'all' 
              ? 'Coba ubah kata kunci pencarian atau filter'
              : 'Mulai dengan menambah mata kuliah baru'
            }
          </p>
          {!searchTerm && filterSemester === 'all' && (
            <button 
              onClick={() => setActiveView('create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tambah Mata Kuliah
            </button>
          )}
        </div>
      )}
    </div>
  );

  const CourseForm = ({ isEdit = false }) => {
    const [formData, setFormData] = useState(
      isEdit && selectedCourse ? {
        ...selectedCourse,
        schedule: selectedCourse.schedule || [{ day: '', time: '', room: '' }]
      } : {
        name: '',
        code: '',
        sks: 3,
        semester: semesters[0],
        description: '',
        lecturerId: '',
        maxStudents: 40,
        schedule: [{ day: '', time: '', room: '' }],
        status: 'active'
      }
    );

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const handleSubmit = (e) => {
      e.preventDefault();
      setActiveView('list');
    };

    const addSchedule = () => {
      setFormData({
        ...formData,
        schedule: [...formData.schedule, { day: '', time: '', room: '' }]
      });
    };

    const removeSchedule = (index) => {
      const newSchedule = formData.schedule.filter((_, i) => i !== index);
      setFormData({ ...formData, schedule: newSchedule });
    };

    const updateSchedule = (index, field, value) => {
      const newSchedule = [...formData.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      setFormData({ ...formData, schedule: newSchedule });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Pemrograman Web"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Mata Kuliah *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., IF123"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Deskripsi mata kuliah"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKS *
                </label>
                <select
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={1}>1 SKS</option>
                  <option value={2}>2 SKS</option>
                  <option value={3}>3 SKS</option>
                  <option value={4}>4 SKS</option>
                  <option value={6}>6 SKS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Mahasiswa *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lecturer Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pengampu</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosen Pengampu *
              </label>
              <select
                value={formData.lecturerId}
                onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Dosen</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Jadwal Kuliah</h3>
              <button
                type="button"
                onClick={addSchedule}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                + Tambah Jadwal
              </button>
            </div>
            
            {formData.schedule.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari
                    </label>
                    <select
                      value={schedule.day}
                      onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih Hari</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu
                    </label>
                    <input
                      type="text"
                      value={schedule.time}
                      onChange={(e) => updateSchedule(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 08:00-10:00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ruangan
                    </label>
                    <input
                      type="text"
                      value={schedule.room}
                      onChange={(e) => updateSchedule(index, 'room', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Lab A, Ruang 201"
                    />
                  </div>
                  
                  <div>
                    {formData.schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Update Mata Kuliah' : 'Simpan Mata Kuliah'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const CourseDetail = () => {
    if (!selectedCourse) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.name}</h2>
          <StatusBadge status={selectedCourse.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Informasi Mata Kuliah</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nama</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedCourse.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kode</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedCourse.code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">SKS</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedCourse.sks}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Semester</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedCourse.semester}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dosen Pengampu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedCourse.lecturer}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mahasiswa</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedCourse.students}/{selectedCourse.maxStudents}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedCourse.description}</dd>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Jadwal Kuliah</h3>
              <div className="space-y-3">
                {selectedCourse.schedule.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{schedule.day}</p>
                      <p className="text-sm text-gray-600">{schedule.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{schedule.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Aksi</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveView('edit')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Mata Kuliah
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Users size={16} />
                  Lihat Mahasiswa
                </button>
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Trash2 size={16} />
                  Hapus Mata Kuliah
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Mahasiswa</span>
                  <span className="font-medium">{selectedCourse.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kapasitas</span>
                  <span className="font-medium">{selectedCourse.maxStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tingkat Okupansi</span>
                  <span className="font-medium">
                    {Math.round((selectedCourse.students / selectedCourse.maxStudents) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktif', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Selesai', icon: CheckCircle },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft', icon: Clock },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {// Handle delete logic
    }
  };

  // Render based on active view
  switch (activeView) {
    case 'create':
      return <CourseForm />;
    case 'edit':
      return <CourseForm isEdit={true} />;
    case 'detail':
      return <CourseDetail />;
    default:
      return <CourseList />;
  }
};

export default AdminCourseManagement;