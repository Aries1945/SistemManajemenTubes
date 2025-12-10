import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Calendar, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Search, Filter, BookOpen, ArrowLeft
} from 'lucide-react';
import { getMahasiswaCourses, getTugasBesarByCourse } from '../../utils/mahasiswaApi';

const MahasiswaAllTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all courses enrolled by mahasiswa
      const coursesResponse = await getMahasiswaCourses();
      const courses = coursesResponse?.data?.courses || coursesResponse?.courses || [];
      
      if (courses.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Fetch all tugas besar from all courses
      const allTasksPromises = courses.map(async (course) => {
        try {
          const tugasResponse = await getTugasBesarByCourse(course.course_id);
          const tugasList = tugasResponse?.tugasBesar || tugasResponse?.data?.tugasBesar || [];
          
          // Add course info to each task
          return tugasList.map(task => ({
            ...task,
            courseName: course.course_name,
            courseCode: course.course_code,
            courseId: course.course_id,
            className: course.class_name
          }));
        } catch (err) {
          console.error(`Error loading tasks for course ${course.course_name}:`, err);
          return [];
        }
      });
      
      const tasksArrays = await Promise.all(allTasksPromises);
      const allTasks = tasksArrays.flat();
      
      // Sort by deadline (upcoming first)
      allTasks.sort((a, b) => {
        const dateA = a.tanggal_selesai ? new Date(a.tanggal_selesai) : new Date(0);
        const dateB = b.tanggal_selesai ? new Date(b.tanggal_selesai) : new Date(0);
        return dateA - dateB;
      });
      
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading all tasks:', err);
      setError('Gagal memuat daftar tugas besar: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (task) => {
    if (!task.tanggal_selesai) return 'unknown';
    const deadline = new Date(task.tanggal_selesai);
    const now = new Date();
    
    if (deadline < now) return 'overdue';
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return 'urgent';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ditentukan';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchTerm || 
      task.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    if (filterStatus === 'all') return matchesSearch;
    const status = getTaskStatus(task);
    if (filterStatus === 'active') return matchesSearch && status === 'active';
    if (filterStatus === 'urgent') return matchesSearch && status === 'urgent';
    if (filterStatus === 'overdue') return matchesSearch && status === 'overdue';
    
    return matchesSearch;
  });

  const handleTaskClick = (task) => {
    navigate(`/mahasiswa/dashboard/courses/${task.courseId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat daftar tugas...</p>
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
              <FileText className="h-8 w-8 mr-3 text-green-600" />
              Semua Tugas Besar
            </h1>
            <p className="text-gray-600 mt-2">Daftar semua tugas besar dari semua mata kuliah</p>
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

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas atau mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="urgent">Mendesak</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const status = getTaskStatus(task);
            const statusConfig = {
              active: { color: 'bg-green-100 text-green-800', label: 'Aktif' },
              urgent: { color: 'bg-yellow-100 text-yellow-800', label: 'Mendesak' },
              overdue: { color: 'bg-red-100 text-red-800', label: 'Terlambat' },
              unknown: { color: 'bg-gray-100 text-gray-800', label: 'Tidak diketahui' }
            };
            
            return (
              <div
                key={task.id || index}
                onClick={() => handleTaskClick(task)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.judul || task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {task.courseCode} - {task.courseName}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {task.className}
                      </span>
                    </div>
                    {task.deskripsi && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.deskripsi}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {formatDate(task.tanggal_selesai)}
                    </span>
                    {task.tanggal_mulai && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Mulai: {formatDate(task.tanggal_mulai)}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Tidak ada tugas yang sesuai' : 'Belum ada tugas besar'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Coba ubah filter atau kata kunci pencarian'
              : 'Anda belum memiliki tugas besar dari mata kuliah yang diambil'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MahasiswaAllTasks;

