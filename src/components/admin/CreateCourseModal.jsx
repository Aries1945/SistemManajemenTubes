import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../utils/api';

const CreateCourseModal = ({ isOpen, onClose, onSubmit }) => {
  // State for the two-step form
  const [step, setStep] = useState(1); // 1 = select course, 2 = new course form
  const [courseNames, setCourseNames] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);

  // Form state for selecting an existing course and assigning a dosen
  const [formData, setFormData] = useState({
    course_name_id: '', // Changed from course_template_id
    dosen_id: '',
    semester: 'Ganjil',
    tahun_ajaran: '2024/2025'
  });

  // Form state for creating a new course template
  const [newCourseData, setNewCourseData] = useState({
    kode: '',
    nama: '',
    sks: 3,
    deskripsi: ''
  });

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [newCourseErrors, setNewCourseErrors] = useState({});

  // Load course templates and dosen list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourseNames(); // Changed from fetchCourseTemplates
      fetchDosenList();
    }
  }, [isOpen]);

  const fetchCourseNames = async () => {
    try {
      const response = await api.get('/admin/course-names'); // Changed from course-templates
      setCourseNames(response.data); // Changed from setCourseTemplates
    } catch (error) {
      console.error('Error fetching course names:', error);
      setError('Failed to load course list');
    }
  };

  const fetchDosenList = async () => {
    try {
      const response = await api.get('/admin/users');
      const dosenOnly = response.data.filter(user => user.role === 'dosen' && user.is_active);
      setDosenList(dosenOnly);
    } catch (error) {
      console.error('Error fetching dosen list:', error);
      setError('Failed to load dosen list');
    }
  };

  // Handle submission for creating a new course template
  const handleCreateName = async (e) => { // Changed from handleCreateTemplate
    e.preventDefault();
    
    if (!validateNewCourseForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the new course name
      const response = await api.post('/admin/course-names', newCourseData); // Changed endpoint
      
      // Update the names list
      await fetchCourseNames();
      
      // Select the newly created name
      setFormData({
        ...formData,
        course_name_id: response.data.courseName.id // Changed from courseTemplate
      });
      
      // Hide the new course form
      setShowNewCourseForm(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for course offering (assignment)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure we're submitting the right fields for a course offering
      const submissionData = {
        course_name_id: formData.course_name_id, // Changed from course_template_id
        semester: formData.semester,
        tahun_ajaran: formData.tahun_ajaran
      };
      
      // Only include dosen_id if it's not empty
      if (formData.dosen_id) {
        submissionData.dosen_id = formData.dosen_id;
      }
      
      const result = await onSubmit(submissionData);
      
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.course_name_id) { // Changed from course_template_id
      errors.course_name_id = 'Pilih mata kuliah terlebih dahulu';
    }
    
    if (!formData.semester) {
      errors.semester = 'Semester wajib diisi';
    }
    
    if (!formData.tahun_ajaran) {
      errors.tahun_ajaran = 'Tahun ajaran wajib diisi';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateNewCourseForm = () => {
    const errors = {};
    
    if (!newCourseData.kode) {
      errors.kode = 'Kode mata kuliah wajib diisi';
    } else if (newCourseData.kode.length > 20) {
      errors.kode = 'Kode tidak boleh lebih dari 20 karakter';
    }
    
    if (!newCourseData.nama) {
      errors.nama = 'Nama mata kuliah wajib diisi';
    } else if (newCourseData.nama.length > 255) {
      errors.nama = 'Nama tidak boleh lebih dari 255 karakter';
    }
    
    if (!newCourseData.sks) {
      errors.sks = 'SKS wajib diisi';
    } else if (isNaN(Number(newCourseData.sks)) || Number(newCourseData.sks) <= 0) {
      errors.sks = 'SKS harus berupa angka positif';
    }
    
    setNewCourseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      });
    }
  };

  const handleNewCourseChange = (e) => {
    const { name, value } = e.target;
    
    setNewCourseData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    if (newCourseErrors[name]) {
      setNewCourseErrors({
        ...newCourseErrors,
        [name]: null
      });
    }
  };

  const resetForm = () => {
    setFormData({
      course_name_id: '', // Changed from course_template_id
      dosen_id: '',
      semester: 'Ganjil',
      tahun_ajaran: '2024/2025'
    });
    setNewCourseData({
      kode: '',
      nama: '',
      sks: 3,
      deskripsi: ''
    });
    setFieldErrors({});
    setNewCourseErrors({});
    setShowNewCourseForm(false);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Tambah Mata Kuliah</h3>
          <button 
            onClick={() => {
              onClose();
              resetForm();
            }}
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
          {/* Course Selection Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Kuliah*
              </label>
              <div className="flex space-x-2">
                <select
                  name="course_name_id" // Changed from course_template_id
                  value={formData.course_name_id} // Changed from course_template_id
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border ${fieldErrors.course_name_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {courseNames.map(name => ( // Changed from courseTemplates
                    <option key={name.id} value={name.id}>
                      {name.kode} - {name.nama} ({name.sks} SKS)
                    </option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowNewCourseForm(!showNewCourseForm)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {fieldErrors.course_name_id && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.course_name_id}</p>
              )}
            </div>

            {/* New Course Form (conditionally shown) */}
            {showNewCourseForm && (
              <div className="border border-blue-200 bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-3">Tambah Mata Kuliah Baru</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Mata Kuliah*
                      </label>
                      <input
                        type="text"
                        name="kode"
                        value={newCourseData.kode}
                        onChange={handleNewCourseChange}
                        required
                        maxLength={20}
                        className={`w-full px-3 py-2 border ${newCourseErrors.kode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                        placeholder="AIF001"
                      />
                      {newCourseErrors.kode && (
                        <p className="mt-1 text-xs text-red-500">{newCourseErrors.kode}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKS*
                      </label>
                      <input
                        type="number"
                        name="sks"
                        value={newCourseData.sks}
                        onChange={handleNewCourseChange}
                        required
                        min="1"
                        max="12"
                        className={`w-full px-3 py-2 border ${newCourseErrors.sks ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                      />
                      {newCourseErrors.sks && (
                        <p className="mt-1 text-xs text-red-500">{newCourseErrors.sks}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Mata Kuliah*
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={newCourseData.nama}
                      onChange={handleNewCourseChange}
                      required
                      maxLength={255}
                      className={`w-full px-3 py-2 border ${newCourseErrors.nama ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                      placeholder="Nama lengkap mata kuliah"
                    />
                    {newCourseErrors.nama && (
                      <p className="mt-1 text-xs text-red-500">{newCourseErrors.nama}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={newCourseData.deskripsi}
                      onChange={handleNewCourseChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Deskripsi singkat mata kuliah (opsional)"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreateName}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosen Pengampu
              </label>
              <select
                name="dosen_id"
                value={formData.dosen_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- Pilih Dosen --</option>
                {dosenList.map(dosen => (
                  <option key={dosen.id} value={dosen.id}>
                    {dosen.nama_lengkap} {dosen.nip ? `(${dosen.nip})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Dosen pengampu dapat diatur nanti jika diperlukan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester*
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.semester ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                  <option value="Pendek">Semester Pendek</option>
                </select>
                {fieldErrors.semester && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.semester}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Ajaran*
                </label>
                <input
                  type="text"
                  name="tahun_ajaran"
                  value={formData.tahun_ajaran}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.tahun_ajaran ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                  placeholder="2024/2025"
                />
                {fieldErrors.tahun_ajaran && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.tahun_ajaran}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;