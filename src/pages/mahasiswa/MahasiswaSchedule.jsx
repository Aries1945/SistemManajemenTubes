import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, BookOpen, ArrowLeft, 
  AlertCircle, MapPin, ChevronRight
} from 'lucide-react';
import { getMahasiswaCourses } from '../../utils/mahasiswaApi';

const MahasiswaSchedule = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getMahasiswaCourses();
      const coursesData = response?.data?.courses || response?.courses || [];
      
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Gagal memuat jadwal kuliah: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat jadwal kuliah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mahasiswa/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Kembali ke Dashboard</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-purple-600" />
            Jadwal Kuliah
          </h1>
          <p className="text-gray-600 mt-2">Jadwal mata kuliah yang Anda ambil</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Schedule List */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.course_id || index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.course_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.course_code}
                    </span>
                    <span>{course.class_name}</span>
                    <span>{course.sks} SKS</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {course.semester} {course.tahun_ajaran}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    <span>Jadwal: {course.jadwal || 'Belum ditentukan'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                    <span>Ruangan: {course.ruangan || 'Belum ditentukan'}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/mahasiswa/dashboard/courses/${course.course_id}`)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                  >
                    Lihat Detail Mata Kuliah
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jadwal</h3>
          <p className="text-gray-600">
            Jadwal akan muncul di sini setelah Anda terdaftar di mata kuliah
          </p>
        </div>
      )}
    </div>
  );
};

export default MahasiswaSchedule;

