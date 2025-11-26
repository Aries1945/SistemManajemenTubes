import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, BookOpen, FileText, 
  CheckCircle, Clock, Award, ArrowLeft, GraduationCap, AlertCircle
} from 'lucide-react';
import { getMahasiswaCourses, getTugasBesarByCourse } from '../../utils/mahasiswaApi';

const MahasiswaStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalSKS: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageGrade: 0,
    gpa: '0.00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all courses
      const coursesResponse = await getMahasiswaCourses();
      const courses = coursesResponse?.data?.courses || coursesResponse?.courses || [];
      
      // Get all tasks from all courses
      const allTasksPromises = courses.map(async (course) => {
        try {
          const tugasResponse = await getTugasBesarByCourse(course.course_id);
          return tugasResponse?.tugasBesar || tugasResponse?.data?.tugasBesar || [];
        } catch (err) {
          console.error(`Error loading tasks for course ${course.course_name}:`, err);
          return [];
        }
      });
      
      const tasksArrays = await Promise.all(allTasksPromises);
      const allTasks = tasksArrays.flat();
      
      // Calculate statistics
      const totalSKS = courses.reduce((sum, course) => sum + (parseInt(course.sks) || 0), 0);
      const coursesWithGrades = courses.filter(course => course.nilai_akhir !== null);
      const totalGrade = coursesWithGrades.reduce((sum, course) => {
        const score = parseFloat(course.nilai_akhir) || 0;
        const sks = parseInt(course.sks) || 0;
        return sum + (score * sks);
      }, 0);
      const totalSKSWithGrades = coursesWithGrades.reduce((sum, course) => sum + (parseInt(course.sks) || 0), 0);
      const gpa = totalSKSWithGrades > 0 ? (totalGrade / totalSKSWithGrades).toFixed(2) : '0.00';
      
      const now = new Date();
      const completedTasks = allTasks.filter(task => {
        if (!task.tanggal_selesai) return false;
        return new Date(task.tanggal_selesai) < now;
      }).length;
      
      const pendingTasks = allTasks.filter(task => {
        if (!task.tanggal_selesai) return true;
        return new Date(task.tanggal_selesai) >= now;
      }).length;
      
      setStats({
        totalCourses: courses.length,
        totalSKS,
        totalTasks: allTasks.length,
        completedTasks,
        pendingTasks,
        averageGrade: coursesWithGrades.length > 0 
          ? (coursesWithGrades.reduce((sum, c) => sum + (parseFloat(c.nilai_akhir) || 0), 0) / coursesWithGrades.length).toFixed(2)
          : 0,
        gpa
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Gagal memuat statistik: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat statistik...</p>
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
            <BarChart3 className="h-8 w-8 mr-3 text-orange-600" />
            Statistik Akademik
          </h1>
          <p className="text-gray-600 mt-2">Ringkasan performa akademik Anda</p>
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

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Mata Kuliah"
          value={stats.totalCourses}
          icon={BookOpen}
          color="text-blue-600"
          description="Mata kuliah yang diambil"
        />
        <StatCard
          title="Total SKS"
          value={stats.totalSKS}
          icon={GraduationCap}
          color="text-green-600"
          description="Satuan kredit semester"
        />
        <StatCard
          title="IPK"
          value={stats.gpa}
          icon={Award}
          color="text-yellow-600"
          description="Indeks prestasi kumulatif"
        />
        <StatCard
          title="Total Tugas"
          value={stats.totalTasks}
          icon={FileText}
          color="text-purple-600"
          description="Semua tugas besar"
        />
        <StatCard
          title="Tugas Selesai"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="text-green-600"
          description="Tugas yang sudah selesai"
        />
        <StatCard
          title="Tugas Pending"
          value={stats.pendingTasks}
          icon={Clock}
          color="text-orange-600"
          description="Tugas yang belum selesai"
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Tugas</h3>
        {stats.totalTasks > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress Penyelesaian</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all"
                style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>{stats.completedTasks} dari {stats.totalTasks} tugas selesai</span>
              <span>{stats.pendingTasks} tugas tersisa</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Belum ada tugas untuk ditampilkan</p>
        )}
      </div>
    </div>
  );
};

export default MahasiswaStatistics;

