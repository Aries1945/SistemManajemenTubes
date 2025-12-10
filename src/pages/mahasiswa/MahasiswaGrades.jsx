import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, BookOpen, Award, TrendingUp, ArrowLeft, 
  CheckCircle, AlertCircle, GraduationCap, ChevronRight
} from 'lucide-react';
import { getMahasiswaCourses } from '../../utils/mahasiswaApi';

const MahasiswaGrades = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getMahasiswaCourses();
      const coursesData = response?.data?.courses || response?.courses || [];
      
      // Filter courses that have grades
      const coursesWithGrades = coursesData.filter(course => course.nilai_akhir !== null);
      
      setCourses(coursesWithGrades);
    } catch (err) {
      console.error('Error loading grades:', err);
      setError('Gagal memuat data nilai: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getGradeLetter = (score) => {
    if (!score) return '-';
    const numScore = parseFloat(score);
    if (numScore >= 85) return 'A';
    if (numScore >= 80) return 'A-';
    if (numScore >= 75) return 'B+';
    if (numScore >= 70) return 'B';
    if (numScore >= 65) return 'B-';
    if (numScore >= 60) return 'C+';
    if (numScore >= 55) return 'C';
    if (numScore >= 50) return 'C-';
    if (numScore >= 45) return 'D';
    return 'E';
  };

  const getGradeColor = (score) => {
    if (!score) return 'text-gray-500';
    const numScore = parseFloat(score);
    if (numScore >= 80) return 'text-green-600';
    if (numScore >= 70) return 'text-blue-600';
    if (numScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateGPA = () => {
    if (courses.length === 0) return '0.00';
    const totalScore = courses.reduce((sum, course) => {
      const score = parseFloat(course.nilai_akhir) || 0;
      const sks = parseInt(course.sks) || 0;
      return sum + (score * sks);
    }, 0);
    const totalSKS = courses.reduce((sum, course) => sum + (parseInt(course.sks) || 0), 0);
    if (totalSKS === 0) return '0.00';
    return (totalScore / totalSKS).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data nilai...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Star className="h-8 w-8 mr-3 text-yellow-600" />
              Nilai Saya
            </h1>
            <p className="text-gray-600 mt-2">Rekapitulasi nilai dari semua mata kuliah</p>
          </div>
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

      {/* GPA Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">IPK Sementara</p>
            <p className="text-4xl font-bold">{calculateGPA()}</p>
            <p className="text-green-100 text-sm mt-2">
              {courses.length} mata kuliah dengan nilai
            </p>
          </div>
          <Award className="h-16 w-16 text-green-200 opacity-50" />
        </div>
      </div>

      {/* Grades List */}
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
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.course_code}
                    </span>
                    <span className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {course.class_name}
                    </span>
                    <span>{course.sks} SKS</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getGradeColor(course.nilai_akhir)}`}>
                    {course.nilai_akhir || '-'}
                  </p>
                  <p className={`text-lg font-semibold ${getGradeColor(course.nilai_akhir)}`}>
                    {getGradeLetter(course.nilai_akhir)}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/mahasiswa/dashboard/courses/${course.course_id}`)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                >
                  Lihat Detail Mata Kuliah
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada nilai</h3>
          <p className="text-gray-600">
            Nilai akan muncul di sini setelah dosen memberikan penilaian
          </p>
        </div>
      )}
    </div>
  );
};

export default MahasiswaGrades;

