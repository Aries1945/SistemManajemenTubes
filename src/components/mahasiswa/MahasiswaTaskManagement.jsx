import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Clock, CheckCircle, Upload, Download, 
  Eye, AlertCircle, Star, User, Users, Play, Paperclip, X, ArrowLeft
} from 'lucide-react';
import { getAllTugasBesarMahasiswa, getMahasiswaCourses } from '../../utils/mahasiswaApi';

const MahasiswaTaskManagement = ({ courseId, courseName }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionNote, setSubmissionNote] = useState('');
  
  // Real data state
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadTugasBesar();
    loadCourses();
  }, []);

  const loadTugasBesar = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading tugas besar for mahasiswa...');
      
      const response = await getAllTugasBesarMahasiswa();
      
      console.log('Tugas besar API response:', response);
      
      if (response && response.success) {
        // Transform API data to match component expected format
        const transformedTasks = response.tugasBesar.map(tb => ({
          id: tb.id,
          title: tb.title,
          description: tb.description,
          detailedDescription: tb.description, // You can enhance this later
          dueDate: tb.end_date,
          startDate: tb.start_date,
          submittedDate: null, // Will be updated when submission API is ready
          status: getTaskStatus(tb), // Determine status based on dates and submission
          grade: null, // Will be updated when grade API is ready
          feedback: null,
          type: 'group', // Default to group, can be enhanced later
          maxGrade: 100,
          attachments: [],
          submissionCount: 0,
          lateSubmission: false,
          taskFiles: [],
          // Course information
          courseId: tb.course_id,
          courseName: tb.course_name,
          courseCode: tb.course_code,
          semester: tb.semester,
          tahunAjaran: tb.tahun_ajaran,
          dosenName: tb.dosen_name,
          className: tb.class_name,
          // Group settings
          maxStudentsPerGroup: tb.max_students_per_group,
          studentChoiceEnabled: tb.student_choice_enabled,
          maxGroupSize: tb.max_group_size,
          minGroupSize: tb.min_group_size,
          // Additional data
          komponen: tb.komponen,
          deliverable: tb.deliverable,
          createdAt: tb.created_at
        }));
        
        console.log('Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
      } else {
        console.log('No tugas besar found or API error');
        setTasks([]);
      }
    } catch (err) {
      console.error('Error loading tugas besar:', err);
      setError('Gagal memuat daftar tugas: ' + err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await getMahasiswaCourses();
      console.log('Courses API response:', response);
      
      if (response && response.success) {
        setCourses(response.courses);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const getTaskStatus = (task) => {
    const now = new Date();
    const endDate = new Date(task.end_date);
    const startDate = new Date(task.start_date);
    
    // For now, determine status based on dates
    // Later you can enhance this with submission status
    if (now < startDate) {
      return 'not_started';
    } else if (now <= endDate) {
      return 'in_progress';
    } else {
      return 'overdue';
    }
  };

  // Tasks are now loaded from API - no sample data needed

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'grade':
        return (b.grade || 0) - (a.grade || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Sudah Dikumpulkan';
      case 'in_progress':
        return 'Sedang Dikerjakan';
      case 'not_started':
        return 'Belum Dimulai';
      case 'overdue':
        return 'Terlambat';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'quiz':
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'group':
        return 'Kelompok';
      case 'quiz':
        return 'Quiz';
      case 'individual':
        return 'Individual';
      default:
        return 'Tugas';
    }
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'submitted';
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePreview = (task) => {
    setSelectedTask(task);
    setShowPreview(true);
    setSubmissionFiles([]);
    setSubmissionNote('');
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTask(null);
    setSubmissionFiles([]);
    setSubmissionNote('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFiles(files);
  };

  const handleSubmitTask = () => {
    console.log('Submitting task:', {
      taskId: selectedTask.id,
      files: submissionFiles,
      note: submissionNote
    });
    alert('Tugas berhasil dikumpulkan!');
    handleClosePreview();
  };

  const TaskPreview = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(selectedTask.type)}
                  <span className="text-sm opacity-90">{getTypeText(selectedTask.type)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTask.status)} bg-white bg-opacity-20 text-white`}>
                    {getStatusText(selectedTask.status)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(selectedTask.dueDate).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  {selectedTask.grade !== null && (
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Nilai: {selectedTask.grade}/{selectedTask.maxGrade}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleClosePreview}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Deskripsi Singkat</h3>
              <p className="text-blue-800">{selectedTask.description}</p>
            </div>

            {/* Detailed Description */}
            {selectedTask.detailedDescription && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detail Tugas</h3>
                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">
                    {selectedTask.detailedDescription}
                  </pre>
                </div>
              </div>
            )}

            {/* Group Members */}
            {selectedTask.type === 'group' && selectedTask.groupMembers && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3">Anggota Kelompok</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.groupMembers.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      <User className="h-3 w-3 mr-1" />
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Task Files */}
            {selectedTask.taskFiles && selectedTask.taskFiles.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">File Tugas</h3>
                <div className="space-y-2">
                  {selectedTask.taskFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Submission */}
            {selectedTask.status === 'submitted' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Submission Anda</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Dikumpulkan: {new Date(selectedTask.submittedDate).toLocaleDateString('id-ID')}
                  </div>
                  {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-green-800 mb-2">File yang dikumpulkan:</p>
                      {selectedTask.attachments.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-green-100 rounded text-sm">
                          <Paperclip className="h-3 w-3 mr-2 text-green-600" />
                          <span className="text-green-700">{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedTask.feedback && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-1">Feedback Dosen:</p>
                    <p className="text-sm text-green-700">{selectedTask.feedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form */}
            {selectedTask.status !== 'submitted' && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-green-600" />
                  Kumpulkan Tugas
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ZIP, PDF, DOC, atau file lainnya (Max 50MB)
                        </p>
                      </label>
                    </div>
                    
                    {submissionFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">File terpilih:</p>
                        {submissionFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button 
                              onClick={() => setSubmissionFiles(submissionFiles.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      placeholder="Tambahkan catatan atau komentar untuk submission Anda..."
                    />
                  </div>

                  {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Peringatan: Terlambat</p>
                        <p className="text-xs text-red-600 mt-1">
                          Deadline sudah terlewat. Submission ini akan ditandai sebagai terlambat.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitTask}
                    disabled={submissionFiles.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Kumpulkan Tugas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return <TaskPreview />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Memuat daftar tugas...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-2">Gagal Memuat Data</h3>
              <p className="text-red-700 mb-3">{error}</p>
              <button 
                onClick={() => {
                  setError('');
                  loadTugasBesar();
                  loadCourses();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daftar Tugas Besar</h3>
          <p className="text-sm text-gray-600">
            {courseName ? `Tugas untuk ${courseName}` : 
             `${tasks.length} tugas dari ${courses.length} mata kuliah yang Anda ikuti`}
          </p>
          {courses.length > 0 && !courseName && (
            <div className="flex flex-wrap gap-2 mt-2">
              {courses.map(course => (
                <span key={course.course_id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {course.course_code} - {course.course_name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="not_started">Belum Dimulai</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="submitted">Sudah Dikumpulkan</option>
          </select>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="dueDate">Urutkan: Deadline</option>
            <option value="grade">Urutkan: Nilai</option>
            <option value="title">Urutkan: Nama</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Selesai</p>
              <p className="text-2xl font-bold text-green-700">
                {tasks.filter(t => t.status === 'submitted').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Dalam Progress</p>
              <p className="text-2xl font-bold text-yellow-700">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Belum Dimulai</p>
              <p className="text-2xl font-bold text-blue-700">
                {tasks.filter(t => t.status === 'not_started').length}
              </p>
            </div>
            <FileText className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Rata-rata Nilai</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round(tasks.filter(t => t.grade).reduce((sum, t) => sum + t.grade, 0) / tasks.filter(t => t.grade).length) || 0}
              </p>
            </div>
            <Star className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => handlePreview(task)}
            className="bg-white border rounded-lg p-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(task.type)}
                    <span className="text-xs text-gray-500">{getTypeText(task.type)}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Deadline: {new Date(task.dueDate).toLocaleDateString('id-ID')}
                  </span>
                  
                  {task.type === 'group' && task.groupMembers && (
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {task.groupMembers.length} anggota
                    </span>
                  )}
                  
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="flex items-center text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Terlambat
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
                
                {task.grade !== null && (
                  <div className="mt-2 flex items-center justify-end">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{task.grade}/{task.maxGrade}</span>
                  </div>
                )}
                
                {task.status !== 'submitted' && !isOverdue(task.dueDate, task.status) && (
                  <div className="mt-1 text-xs text-gray-500">
                    {getDaysUntilDue(task.dueDate)} hari lagi
                  </div>
                )}
              </div>
            </div>

            {/* Click to view indicator */}
            <div className="flex items-center justify-center pt-3 border-t border-gray-100">
              <span className="flex items-center text-sm text-green-600 font-medium">
                <Eye className="h-4 w-4 mr-1" />
                Klik untuk melihat detail dan mengumpulkan tugas
              </span>
            </div>
          </div>
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada tugas ditemukan</h3>
          <p className="text-gray-500">Coba ubah filter untuk melihat tugas lainnya.</p>
        </div>
      )}
    </div>
  );
};

export default MahasiswaTaskManagement;