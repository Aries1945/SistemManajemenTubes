import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Calendar, Users, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Search, Filter, BookOpen
} from 'lucide-react';
import api from '../../utils/api';
import { getTugasBesar } from '../../utils/tugasBesarApi';

const DosenAllTasks = () => {
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
      
      // Get all classes taught by dosen using the correct endpoint
      const response = await api.get('/auth/dosen/classes');
      
      if (!response.data || !response.data.success) {
        console.error('Invalid response from /auth/dosen/classes:', response.data);
        setError('Format response tidak valid dari server');
        setLoading(false);
        return;
      }
      
      const classes = response.data.classes || [];
      
      if (classes.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${classes.length} classes, loading tasks...`);
      
      // Fetch tasks from all classes
      const allTasksPromises = classes.map(async (classItem) => {
        try {
          // Use id (numeric) for classId, and courseId from classItem
          const classId = classItem.id || classItem.classId;
          const courseId = classItem.courseId;
          
          if (!classId || !courseId) {
            console.warn('Missing classId or courseId for class:', classItem);
            return [];
          }
          
          const tugasResponse = await getTugasBesar(courseId, classId);
          const tugasList = tugasResponse.tugasBesar || [];
          
          // Add class and course info to each task
          return tugasList.map(task => ({
            ...task,
            classId: classId,
            className: classItem.className || classItem.class_name,
            courseName: classItem.courseName || classItem.course_name,
            courseCode: classItem.courseCode || classItem.course_code,
            courseId: courseId
          }));
        } catch (err) {
          console.error(`Error loading tasks for class ${classItem.className || classItem.class_name}:`, err);
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
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 7) return 'urgent';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ditentukan';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.className?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getTaskStatus(task);
    if (filterStatus === 'active') return matchesSearch && (status === 'active' || status === 'urgent');
    if (filterStatus === 'overdue') return matchesSearch && status === 'overdue';
    
    return matchesSearch;
  });

  const handleTaskClick = (task) => {
    navigate(`/dosen/dashboard/courses/${task.courseId}`, {
      state: {
        classId: task.classId,
        className: task.className
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
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Tugas Besar</h1>
          <p className="text-gray-600">Daftar semua tugas besar dari semua kelas yang Anda ajar</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas besar, mata kuliah, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-gray-200/50 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada tugas besar</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Tidak ada tugas besar yang sesuai dengan filter'
              : 'Belum ada tugas besar yang dibuat untuk kelas Anda'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const status = getTaskStatus(task);
            const statusConfig = {
              active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aktif' },
              urgent: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Mendesak' },
              overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Terlambat' },
              unknown: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Tidak diketahui' }
            };
            const config = statusConfig[status] || statusConfig.unknown;
            const StatusIcon = config.icon;

            return (
              <div
                key={`${task.id}-${task.classId}`}
                onClick={() => handleTaskClick(task)}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {task.judul}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{task.courseName} - {task.className}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {formatDate(task.tanggal_selesai)}</span>
                      </div>
                    </div>

                    {task.deskripsi && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{task.deskripsi}</p>
                    )}
                  </div>
                  
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DosenAllTasks;

