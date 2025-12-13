import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, BookOpen, User, Mail, Hash,
  ChevronRight, Filter, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

const DosenStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all classes taught by dosen using the correct endpoint
      const classesResponse = await api.get('/auth/dosen/classes');
      
      if (!classesResponse.data || !classesResponse.data.success) {
        console.error('Invalid response from /auth/dosen/classes:', classesResponse.data);
        setError('Format response tidak valid dari server');
        setLoading(false);
        return;
      }
      
      const classesList = classesResponse.data.classes || [];
      setClasses(classesList);
      
      // Fetch all students from all classes using dosen endpoint
      const response = await api.get('/auth/dosen/students');
      
      if (!response.data || !response.data.success) {
        console.error('Invalid response from /auth/dosen/students:', response.data);
        setError('Format response tidak valid dari server');
        setLoading(false);
        return;
      }
      
      const allStudentsData = response.data.students || [];
      
      console.log(`Found ${allStudentsData.length} student records`);
      
      if (allStudentsData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Group students by user_id and collect their classes
      const uniqueStudents = {};
      allStudentsData.forEach(student => {
        const key = student.user_id;
        if (!uniqueStudents[key]) {
          uniqueStudents[key] = {
            user_id: student.user_id,
            id: student.user_id,
            nama_lengkap: student.nama_lengkap,
            nim: student.nim,
            email: student.email,
            enrollment_status: student.enrollment_status,
            enrolled_at: student.enrolled_at,
            nilai_akhir: student.nilai_akhir,
            classes: [{
              classId: student.class_id,
              className: student.class_name,
              classCode: student.class_code,
              courseId: student.course_id,
              courseName: student.course_name,
              courseCode: student.course_code
            }]
          };
        } else {
          // Add class to existing student if not already present
          const classExists = uniqueStudents[key].classes.some(
            c => c.classId === student.class_id
          );
          if (!classExists) {
            uniqueStudents[key].classes.push({
              classId: student.class_id,
              className: student.class_name,
              classCode: student.class_code,
              courseId: student.course_id,
              courseName: student.course_name,
              courseCode: student.course_code
            });
          }
        }
      });
      
      setStudents(Object.values(uniqueStudents));
    } catch (err) {
      console.error('Error loading students:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Gagal memuat daftar mahasiswa: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedClass === 'all') return matchesSearch;
    
    return matchesSearch && student.classes.some(c => c.classId === selectedClass);
  });

  const handleClassClick = (classId) => {
    const classItem = classes.find(c => c.classId === classId);
    if (classItem) {
      navigate(`/dosen/dashboard/courses/${classItem.courseId}`, {
        state: {
          classId: classItem.classId,
          className: classItem.className
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Mahasiswa</h1>
          <p className="text-gray-700">Daftar semua mahasiswa dari kelas yang Anda ajar</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mahasiswa (nama, NIM, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(classItem => (
                <option key={classItem.classId} value={classItem.classId}>
                  {classItem.courseName} - {classItem.className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-1">Total Mahasiswa</p>
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-1">Total Kelas</p>
              <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-1">Ditampilkan</p>
              <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <Filter className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-12 border border-blue-100 text-center">
          <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada mahasiswa</h3>
          <p className="text-gray-700">
            {searchTerm || selectedClass !== 'all'
              ? 'Tidak ada mahasiswa yang sesuai dengan filter'
              : 'Belum ada mahasiswa yang terdaftar di kelas Anda'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.user_id || student.id}
              className="bg-gradient-to-br from-white to-blue-50/20 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-blue-100 rounded-xl shadow-sm">
                      <User className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{student.nama_lengkap}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Hash className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">NIM: {student.nim || 'Tidak ada'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-900 mb-3">Terdaftar di Kelas:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.classes.map((classItem, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleClassClick(classItem.classId)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 group border border-blue-200 shadow-sm hover:shadow-md hover:scale-105"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>{classItem.courseName} - {classItem.className}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DosenStudents;

