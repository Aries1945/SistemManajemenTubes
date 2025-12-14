import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Search, CheckCircle, User, Filter, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EnrollStudentsModal = ({ isOpen, onClose, classId, className }) => {
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [courseEnrolledStudents, setCourseEnrolledStudents] = useState([]); // Students enrolled in other classes for same course
  const [classCapacity, setClassCapacity] = useState(null); // Kapasitas kelas
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByNPM, setFilterByNPM] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen && classId) {
      fetchData();
      setSelectedStudents([]); // Reset selections when modal opens
      setSearchQuery(''); // Reset search
      setFilterByNPM(false); // Reset filter
    }
  }, [isOpen, classId]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all active students, enrolled students, and course enrollments
      const [studentsResponse, enrolledResponse, courseEnrollmentsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get(`/admin/classes/${classId}/students`),
        api.get(`/admin/classes/${classId}/course-enrollments`)
      ]);
      
      // Fetch class info to get capacity
      let classInfo = null;
      try {
        const allClassesResponse = await api.get('/admin/classes');
        classInfo = allClassesResponse.data.find(cls => cls.id === parseInt(classId));
      } catch (err) {
        console.warn('Could not fetch class info for capacity:', err);
      }
      
      const allMahasiswa = studentsResponse.data.filter(
        user => user.role === 'mahasiswa' && user.is_active
      );
      console.log('All mahasiswa from API:', allMahasiswa);
      console.log('Enrolled students:', enrolledResponse.data);
      console.log('Course enrolled students:', courseEnrollmentsResponse.data);
      setStudents(allMahasiswa);
      setEnrolledStudents(enrolledResponse.data || []);
      setCourseEnrolledStudents(courseEnrollmentsResponse.data || []);
      
      // Set class capacity if available
      if (classInfo?.kapasitas !== undefined && classInfo?.kapasitas !== null) {
        setClassCapacity(parseInt(classInfo.kapasitas));
      } else {
        setClassCapacity(null); // Unlimited if not set
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data mahasiswa');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isStudentEnrolled = (studentId) => {
    return enrolledStudents.some(enrolled => enrolled.user_id === studentId);
  };

  // Check if student is enrolled in other classes for the same course
  const isStudentEnrolledInOtherCourse = (studentId) => {
    return courseEnrolledStudents.some(enrolled => enrolled.id === studentId);
  };

  // Get other class name where student is enrolled
  const getOtherClassName = (studentId) => {
    const enrollment = courseEnrolledStudents.find(enrolled => enrolled.id === studentId);
    return enrollment?.class_name;
  };
  
  const handleEnroll = async (studentId) => {
    try {
      await api.post(`/admin/classes/${classId}/enrollments`, {
        mahasiswa_id: studentId
      });
      
      // Refresh all data to ensure consistency
      await fetchData();
      
      // Clear any previous error
      setError('');
      
      // Show success toast
      const student = students.find(s => s.id === studentId);
      toast.success(`${student?.nama_lengkap || 'Mahasiswa'} berhasil didaftarkan ke kelas`);
    } catch (err) {
      console.error('Error enrolling student:', err);
      const errorMessage = err.response?.data?.error || 'Gagal mendaftarkan mahasiswa';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  const handleUnenroll = async (enrollmentId) => {
    try {
      await api.delete(`/admin/classes/${classId}/enrollments/${enrollmentId}`);
      
      // Refresh all data to ensure consistency
      await fetchData();
      
      // Clear any previous error
      setError('');
      
      // Show success toast
      toast.success('Mahasiswa berhasil dihapus dari kelas');
    } catch (err) {
      console.error('Error unenrolling student:', err);
      const errorMessage = err.response?.data?.error || 'Gagal menghapus mahasiswa dari kelas';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUnenrollAll = async () => {
    if (enrolledStudents.length === 0) {
      toast.error('Tidak ada mahasiswa yang terdaftar');
      return;
    }

    // Konfirmasi sebelum menghapus semua
    const confirmMessage = `Apakah Anda yakin ingin menghapus semua ${enrolledStudents.length} mahasiswa dari kelas ini?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Use bulk delete endpoint (more efficient)
      const response = await api.delete(`/admin/classes/${classId}/enrollments`);
      
      // Refresh all data
      await fetchData();
      
      // Clear any previous error
      setError('');
      
      const removedCount = response.data?.removedCount || enrolledStudents.length;
      toast.success(`Semua ${removedCount} mahasiswa berhasil dihapus dari kelas`);
    } catch (err) {
      console.error('Error unenrolling all students:', err);
      const errorMessage = err.response?.data?.error || 'Gagal menghapus semua mahasiswa dari kelas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih minimal satu mahasiswa');
      return;
    }

    // Validate capacity before enrolling
    if (classCapacity !== null) {
      const currentEnrolledCount = enrolledStudents.length;
      const totalAfterEnroll = currentEnrolledCount + selectedStudents.length;
      
      if (totalAfterEnroll > classCapacity) {
        const remaining = classCapacity - currentEnrolledCount;
        toast.error(`Kapasitas kelas hanya ${classCapacity} mahasiswa. Sisa kuota: ${remaining} mahasiswa. Silakan kurangi pemilihan.`);
        return;
      }
    }

    try {
      setIsLoading(true);
      const enrollPromises = selectedStudents.map(studentId =>
        api.post(`/admin/classes/${classId}/enrollments`, {
          mahasiswa_id: studentId
        })
      );

      await Promise.all(enrollPromises);
      
      // Refresh all data
      await fetchData();
      
      // Clear selections
      setSelectedStudents([]);
      
      // Clear any previous error
      setError('');
      
      toast.success(`${selectedStudents.length} mahasiswa berhasil didaftarkan`);
    } catch (err) {
      console.error('Error bulk enrolling students:', err);
      const errorMessage = err.response?.data?.error || 'Gagal mendaftarkan beberapa mahasiswa';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        // Check capacity limit if classCapacity is set
        if (classCapacity !== null) {
          const currentEnrolledCount = enrolledStudents.length;
          const currentSelectedCount = prev.length;
          const totalAfterSelect = currentEnrolledCount + currentSelectedCount + 1;
          
          if (totalAfterSelect > classCapacity) {
            const remaining = classCapacity - currentEnrolledCount - currentSelectedCount;
            toast.error(`Kapasitas kelas hanya ${classCapacity} mahasiswa. Sisa kuota: ${remaining} mahasiswa`);
            return prev;
          }
        }
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    const availableStudents = filteredStudents.filter(
      student => !isStudentEnrolled(student.id)
    );
    
    if (selectedStudents.length === availableStudents.length) {
      // Deselect all
      setSelectedStudents([]);
    } else {
      // If classCapacity is set, only select up to capacity limit
      if (classCapacity !== null) {
        const currentEnrolledCount = enrolledStudents.length;
        const remainingCapacity = classCapacity - currentEnrolledCount;
        
        if (remainingCapacity <= 0) {
          toast.error(`Kelas sudah penuh. Kapasitas: ${classCapacity} mahasiswa`);
          return;
        }
        
        // Select only up to remaining capacity
        const studentsToSelect = availableStudents.slice(0, remainingCapacity).map(s => s.id);
        setSelectedStudents(studentsToSelect);
        
        if (availableStudents.length > remainingCapacity) {
          toast.success(`Dipilih ${remainingCapacity} mahasiswa sesuai sisa kapasitas (${remainingCapacity}/${availableStudents.length} tersedia)`);
        } else {
          toast.success(`Dipilih semua ${studentsToSelect.length} mahasiswa yang tersedia`);
        }
      } else {
        // No capacity limit, select all available students
        setSelectedStudents(availableStudents.map(s => s.id));
      }
    }
  };
  
  // Helper function to check if student matches search query
  const matchesSearchQuery = (student) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // If filterByNPM is enabled, only search by NPM/NIM
    if (filterByNPM) {
      return ((student.npm || student.nim)?.toLowerCase().includes(searchLower));
    }
    
    // Otherwise, search by all fields
    return (
      (student.nama_lengkap?.toLowerCase().includes(searchLower)) ||
      ((student.npm || student.nim)?.toLowerCase().includes(searchLower)) ||
      (student.email?.toLowerCase().includes(searchLower))
    );
  };

  const filteredStudents = students
    .filter(student => {
      // Exclude students who are enrolled in other classes for the same course
      // They should not be shown at all
      const enrolledInOther = isStudentEnrolledInOtherCourse(student.id);
      const enrolledInThis = isStudentEnrolled(student.id);
      
      // Only exclude if enrolled in OTHER class (not this one)
      if (enrolledInOther && !enrolledInThis) {
        return false;
      }
      
      return matchesSearchQuery(student);
    })
    .sort((a, b) => {
      // Sort by enrollment status: available students first, then enrolled students
      const aEnrolledInThis = isStudentEnrolled(a.id);
      const bEnrolledInThis = isStudentEnrolled(b.id);
      
      // Priority order:
      // 1. Students not enrolled (available)
      // 2. Students enrolled in this class
      
      if (aEnrolledInThis && !bEnrolledInThis) return 1;
      if (!aEnrolledInThis && bEnrolledInThis) return -1;
      
      // If same status, sort alphabetically
      return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
    });

  // Filter enrolled students based on search query
  const filteredEnrolledStudents = enrolledStudents.filter(student => matchesSearchQuery(student));
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Pendaftaran Mahasiswa - {className}
            </h2>
            {classCapacity !== null && (
              <p className="text-sm text-gray-600 mt-1">
                Kapasitas: {enrolledStudents.length}/{classCapacity} mahasiswa
                {enrolledStudents.length < classCapacity && (
                  <span className="ml-2 text-green-600">
                    (Sisa: {classCapacity - enrolledStudents.length} mahasiswa)
                  </span>
                )}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
            <button 
              className="ml-2 font-medium"
              onClick={() => setError('')}
            >
              Tutup
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={filterByNPM ? "Cari berdasarkan NPM..." : "Cari mahasiswa berdasarkan nama atau NIM..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          <button
            onClick={() => setFilterByNPM(!filterByNPM)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
              filterByNPM 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={filterByNPM ? "Filter aktif: Hanya NPM" : "Klik untuk filter hanya NPM"}
          >
            <Filter size={16} />
            {filterByNPM ? 'NPM Only' : 'Semua'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow">
          {/* Available Students */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Daftar Mahasiswa</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudents.length > 0 &&
                      selectedStudents.length === filteredStudents.filter(s => !isStudentEnrolled(s.id)).length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pilih Semua</span>
                </label>
              </div>
              <p className="text-xs text-gray-600">
                Mahasiswa hanya dapat terdaftar di satu kelas untuk setiap mata kuliah
                {classCapacity !== null && (
                  <span className="block mt-1 font-medium">
                    Kapasitas: {enrolledStudents.length}/{classCapacity} • 
                    Sisa: {classCapacity - enrolledStudents.length} mahasiswa
                  </span>
                )}
              </p>
              {selectedStudents.length > 0 && (
                <button
                  onClick={handleBulkEnroll}
                  disabled={isLoading}
                  className="mt-2 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mendaftarkan...' : `Daftarkan ${selectedStudents.length} Mahasiswa`}
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredStudents.length > 0 ? (
                <ul className="space-y-2">
                  {filteredStudents.map(student => {
                    const enrolledInThis = isStudentEnrolled(student.id);
                    
                    return (
                      <li 
                        key={student.id}
                        className={`flex justify-between items-center p-3 rounded-md ${
                          enrolledInThis 
                            ? 'bg-green-50 text-green-700' 
                            : selectedStudents.includes(student.id)
                            ? 'bg-blue-50 border-2 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center flex-grow">
                          {!enrolledInThis && (
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                            />
                          )}
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User size={20} className="text-gray-600" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium">{student.nama_lengkap || 'Unnamed'}</p>
                            <p className="text-sm text-gray-600">{student.npm || student.nim || 'No NPM'}</p>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {enrolledInThis ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle size={16} className="mr-1" /> Terdaftar
                            </span>
                          ) : (
                            <button
                              onClick={() => handleEnroll(student.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            >
                              Daftarkan
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery 
                    ? 'Tidak ada mahasiswa yang sesuai dengan pencarian' 
                    : 'Tidak ada mahasiswa yang tersedia'}
                </div>
              )}
            </div>
          </div>
          
          {/* Enrolled Students */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Mahasiswa Terdaftar</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {searchQuery.trim() 
                      ? `${filteredEnrolledStudents.length}/${enrolledStudents.length} Mahasiswa`
                      : `${enrolledStudents.length} Mahasiswa`}
                  </span>
                  {enrolledStudents.length > 0 && (
                    <button
                      onClick={handleUnenrollAll}
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      title="Hapus semua mahasiswa dari kelas ini"
                    >
                      <Trash2 size={14} />
                      Hapus Semua
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : enrolledStudents.length > 0 ? (
                filteredEnrolledStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredEnrolledStudents.map(student => (
                    <li 
                      key={student.enrollment_id}
                      className="flex justify-between items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{student.nama_lengkap || 'Unnamed'}</p>
                          <p className="text-sm text-gray-600">{student.nim || 'No NPM'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnenroll(student.enrollment_id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery 
                      ? `Tidak ada mahasiswa terdaftar yang sesuai dengan pencarian "${searchQuery}"`
                      : 'Belum ada mahasiswa terdaftar di kelas ini'}
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Belum ada mahasiswa terdaftar di kelas ini
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudentsModal;