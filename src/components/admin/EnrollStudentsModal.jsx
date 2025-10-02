import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Search, CheckCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EnrollStudentsModal = ({ isOpen, onClose, classId, className }) => {
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [courseEnrolledStudents, setCourseEnrolledStudents] = useState([]); // Students enrolled in other classes for same course
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen && classId) {
      fetchData();
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
      
      const allMahasiswa = studentsResponse.data.filter(
        user => user.role === 'mahasiswa' && user.is_active
      );
      setStudents(allMahasiswa);
      setEnrolledStudents(enrolledResponse.data);
      setCourseEnrolledStudents(courseEnrollmentsResponse.data);
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
  
  const filteredStudents = students
    .filter(student => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (student.nama_lengkap?.toLowerCase().includes(searchLower)) ||
        (student.nim?.toLowerCase().includes(searchLower)) ||
        (student.email?.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      // Sort by enrollment status: available students first, then enrolled in other classes
      const aEnrolledInThis = isStudentEnrolled(a.id);
      const bEnrolledInThis = isStudentEnrolled(b.id);
      const aEnrolledInOther = isStudentEnrolledInOtherCourse(a.id);
      const bEnrolledInOther = isStudentEnrolledInOtherCourse(b.id);
      
      // Priority order:
      // 1. Students not enrolled anywhere (available)
      // 2. Students enrolled in this class
      // 3. Students enrolled in other classes for the same course (disabled)
      
      if (aEnrolledInThis && !bEnrolledInThis) return 1;
      if (!aEnrolledInThis && bEnrolledInThis) return -1;
      if (!aEnrolledInOther && bEnrolledInOther) return -1;
      if (aEnrolledInOther && !bEnrolledInOther) return 1;
      
      // If same status, sort alphabetically
      return (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '');
    });
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Pendaftaran Mahasiswa - {className}
          </h2>
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
        
        <div className="flex items-center mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow">
          {/* Available Students */}
          <div className="border rounded-lg">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-semibold">Daftar Mahasiswa</h3>
              <p className="text-xs text-gray-600 mt-1">
                Mahasiswa yang sudah terdaftar di mata kuliah yang sama ditampilkan dengan status "Tidak tersedia"
              </p>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredStudents.length > 0 ? (
                <ul className="space-y-2">
                  {filteredStudents.map(student => {
                    const enrolledInThis = isStudentEnrolled(student.id);
                    const enrolledInOther = isStudentEnrolledInOtherCourse(student.id);
                    const otherClassName = getOtherClassName(student.id);
                    
                    return (
                      <li 
                        key={student.id}
                        className={`flex justify-between items-center p-3 rounded-md ${
                          enrolledInThis 
                            ? 'bg-green-50 text-green-700' 
                            : enrolledInOther
                              ? 'bg-yellow-50 text-yellow-700 opacity-75'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center flex-grow">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User size={20} className="text-gray-600" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium">{student.nama_lengkap || 'Unnamed'}</p>
                            <p className="text-sm text-gray-600">{student.nim || 'No NIM'}</p>
                            {enrolledInOther && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Sudah terdaftar di: {otherClassName}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {enrolledInThis ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle size={16} className="mr-1" /> Terdaftar
                            </span>
                          ) : enrolledInOther ? (
                            <span className="flex items-center text-yellow-600 text-sm">
                              Tidak tersedia
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
            <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">Mahasiswa Terdaftar</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {enrolledStudents.length} Mahasiswa
              </span>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : enrolledStudents.length > 0 ? (
                <ul className="space-y-2">
                  {enrolledStudents.map(student => (
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
                          <p className="text-sm text-gray-600">{student.nim || 'No NIM'}</p>
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