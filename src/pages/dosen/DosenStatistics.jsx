import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, BookOpen, Users, FileText, Clock, 
  TrendingUp, Award, AlertCircle, CheckCircle
} from 'lucide-react';
import api from '../../utils/api';
import { getTugasBesar } from '../../utils/tugasBesarApi';

const DosenStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalGroups: 0,
    pendingGrading: 0,
    averageProgress: 0
  });
  const [classStats, setClassStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
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
      
      const classes = classesResponse.data.classes || [];
      
      console.log(`Found ${classes.length} classes, loading statistics...`);
      
      if (classes.length === 0) {
        setStats({
          totalClasses: 0,
          totalStudents: 0,
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          totalGroups: 0,
          pendingGrading: 0,
          averageProgress: 0
        });
        setClassStats([]);
        setLoading(false);
        return;
      }
      
      // Calculate statistics
      let totalStudents = 0;
      let totalTasks = 0;
      let activeTasks = 0;
      let completedTasks = 0;
      let totalGroups = 0;
      let totalPendingGrading = 0;
      let totalProgress = 0;
      let progressCount = 0;
      
      const classStatsList = await Promise.all(classes.map(async (classItem) => {
        try {
          // Use id (numeric) for classId, and courseId from classItem
          const classId = classItem.id || classItem.classId;
          const courseId = classItem.courseId;
          
          if (!classId || !courseId) {
            console.warn('Missing classId or courseId for class:', classItem);
            return {
              ...classItem,
              tasksCount: 0,
              activeTasks: 0,
              completedTasks: 0,
              groupsCount: classItem.activeGroups || 0,
              pendingGrading: classItem.pendingGrading || 0,
              progress: classItem.progress || 0
            };
          }
          
          // Get tasks for this class
          const tasksResponse = await getTugasBesar(courseId, classId);
          const tasks = tasksResponse.tugasBesar || [];
          
          // Count tasks by status
          const now = new Date();
          const classActiveTasks = tasks.filter(task => {
            if (!task.tanggal_selesai) return false;
            return new Date(task.tanggal_selesai) >= now;
          }).length;
          
          const classCompletedTasks = tasks.filter(task => {
            if (!task.tanggal_selesai) return false;
            return new Date(task.tanggal_selesai) < now;
          }).length;
          
          // Get groups count from class data
          const groupsCount = classItem.activeGroups || 0;
          
          // Calculate progress
          let classProgress = classItem.progress || 0;
          if (tasks.length > 0 && !classProgress) {
            const progressSum = tasks.reduce((sum, task) => {
              if (task.tanggal_mulai && task.tanggal_selesai) {
                const start = new Date(task.tanggal_mulai);
                const end = new Date(task.tanggal_selesai);
                const now = new Date();
                if (end > start) {
                  const total = end - start;
                  const elapsed = now - start;
                  return sum + Math.max(0, Math.min(100, (elapsed / total) * 100));
                }
              }
              return sum;
            }, 0);
            classProgress = progressSum / tasks.length;
          }
          
          // Get pending grading (from class data)
          const pendingGrading = classItem.pendingGrading || 0;
          
          totalStudents += classItem.studentCount || 0;
          totalTasks += tasks.length;
          activeTasks += classActiveTasks;
          completedTasks += classCompletedTasks;
          totalGroups += groupsCount;
          totalPendingGrading += pendingGrading;
          totalProgress += classProgress;
          if (tasks.length > 0 || classProgress > 0) progressCount++;
          
          return {
            ...classItem,
            tasksCount: tasks.length,
            activeTasks: classActiveTasks,
            completedTasks: classCompletedTasks,
            groupsCount,
            pendingGrading,
            progress: classProgress
          };
        } catch (err) {
          console.error(`Error loading stats for class ${classItem.className || classItem.class_name}:`, err);
          return {
            ...classItem,
            tasksCount: 0,
            activeTasks: 0,
            completedTasks: 0,
            groupsCount: classItem.activeGroups || 0,
            pendingGrading: classItem.pendingGrading || 0,
            progress: classItem.progress || 0
          };
        }
      }));
      
      setClassStats(classStatsList);
      
      setStats({
        totalClasses: classes.length,
        totalStudents,
        totalTasks,
        activeTasks,
        completedTasks,
        totalGroups,
        pendingGrading: totalPendingGrading,
        averageProgress: progressCount > 0 ? totalProgress / progressCount : 0
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Gagal memuat statistik: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classItem) => {
    navigate(`/dosen/dashboard/courses/${classItem.courseId}`, {
      state: {
        classId: classItem.classId,
        className: classItem.className
      }
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistik</h1>
        <p className="text-gray-700">Ringkasan statistik dari semua kelas yang Anda ajar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Total Kelas</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalClasses}</p>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Total Mahasiswa</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Total Tugas</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalTasks}</p>
          <p className="text-gray-600 text-xs mt-2 font-medium">
            {stats.activeTasks} aktif, {stats.completedTasks} selesai
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Perlu Dinilai</p>
          <p className="text-4xl font-bold text-gray-900">{stats.pendingGrading}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Total Kelompok</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalGroups}</p>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Rata-rata Progress</p>
          <p className="text-3xl font-bold text-gray-900">{stats.averageProgress.toFixed(1)}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 text-sm font-semibold mb-1">Tugas Aktif</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
        </div>
      </div>

      {/* Class-wise Statistics */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistik per Kelas</h2>
        
        {classStats.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-700">Belum ada kelas yang diajar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {classStats.map((classItem) => (
              <div
                key={classItem.classId}
                onClick={() => handleClassClick(classItem)}
                className="bg-gradient-to-br from-white to-blue-50/20 rounded-xl p-6 border border-blue-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {classItem.courseName}
                    </h3>
                    <p className="text-gray-700">{classItem.className}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{classItem.progress.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">Progress</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Mahasiswa</p>
                    <p className="text-lg font-semibold text-gray-900">{classItem.studentCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Tugas</p>
                    <p className="text-lg font-semibold text-gray-900">{classItem.tasksCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Kelompok</p>
                    <p className="text-lg font-semibold text-gray-900">{classItem.groupsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Perlu Dinilai</p>
                    <p className="text-lg font-semibold text-blue-600">{classItem.pendingGrading}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DosenStatistics;

