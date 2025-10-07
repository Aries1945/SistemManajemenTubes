import React, { useState } from 'react';
import { 
  FileText, Calendar, Clock, CheckCircle, Upload, Download, 
  Eye, AlertCircle, Star, User, Users, Play, Paperclip
} from 'lucide-react';

const MahasiswaTaskManagement = ({ courseId, courseName }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Sample tasks data
  const tasks = [
    {
      id: 1,
      title: 'Tugas 1: HTML & CSS Fundamentals',
      description: 'Membuat website portfolio menggunakan HTML dan CSS. Pastikan responsive design dan validasi W3C.',
      dueDate: '2024-10-15',
      submittedDate: '2024-10-14',
      status: 'submitted',
      grade: 88,
      feedback: 'Bagus! Tapi perlu perbaikan pada responsive design untuk mobile.',
      type: 'individual',
      maxGrade: 100,
      attachments: ['portfolio-website.zip'],
      submissionCount: 1,
      lateSubmission: false
    },
    {
      id: 2,
      title: 'Tugas 2: JavaScript Interactive Features',
      description: 'Menambahkan fitur interaktif menggunakan JavaScript vanilla. Implementasikan minimal 3 fitur interaktif.',
      dueDate: '2024-10-25',
      submittedDate: '2024-10-24',
      status: 'submitted',
      grade: 92,
      feedback: 'Excellent work! Implementasi yang sangat baik dan kode yang clean.',
      type: 'individual',
      maxGrade: 100,
      attachments: ['interactive-features.zip', 'documentation.pdf'],
      submissionCount: 2,
      lateSubmission: false
    },
    {
      id: 3,
      title: 'Tugas 3: React.js Application',
      description: 'Membuat aplikasi web menggunakan React.js dengan state management dan routing.',
      dueDate: '2024-11-05',
      submittedDate: '2024-11-03',
      status: 'submitted',
      grade: 85,
      feedback: 'Good job! Component structure bisa diperbaiki. Perhatikan best practices React.',
      type: 'individual',
      maxGrade: 100,
      attachments: ['react-app.zip'],
      submissionCount: 1,
      lateSubmission: false
    },
    {
      id: 4,
      title: 'Project: E-Commerce Website',
      description: 'Membuat website e-commerce lengkap dengan fitur keranjang, pembayaran, dan admin panel. Tugas kelompok 4-5 orang.',
      dueDate: '2024-11-20',
      submittedDate: null,
      status: 'in_progress',
      grade: null,
      feedback: null,
      type: 'group',
      maxGrade: 100,
      attachments: [],
      submissionCount: 0,
      lateSubmission: false,
      groupMembers: ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown']
    },
    {
      id: 5,
      title: 'Final Project: Full-Stack Web Application',
      description: 'Membuat aplikasi web full-stack dengan database, authentication, dan deployment.',
      dueDate: '2024-12-15',
      submittedDate: null,
      status: 'not_started',
      grade: null,
      feedback: null,
      type: 'individual',
      maxGrade: 100,
      attachments: [],
      submissionCount: 0,
      lateSubmission: false
    },
    {
      id: 6,
      title: 'Quiz: JavaScript Fundamentals',
      description: 'Quiz online tentang dasar-dasar JavaScript. Durasi 60 menit.',
      dueDate: '2024-10-10',
      submittedDate: '2024-10-10',
      status: 'submitted',
      grade: 78,
      feedback: 'Perlu lebih memahami konsep closure dan async/await.',
      type: 'quiz',
      maxGrade: 100,
      attachments: [],
      submissionCount: 1,
      lateSubmission: false
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daftar Tugas</h3>
          <p className="text-sm text-gray-600">Kelola tugas dan pengumpulan untuk {courseName}</p>
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
          <div key={task.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
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
                  
                  {task.submittedDate && (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Dikumpulkan: {new Date(task.submittedDate).toLocaleDateString('id-ID')}
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

            {/* Group Members (for group tasks) */}
            {task.type === 'group' && task.groupMembers && (
              <div className="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-800 mb-1">Anggota Kelompok:</p>
                <div className="flex flex-wrap gap-2">
                  {task.groupMembers.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      <User className="h-3 w-3 mr-1" />
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {task.feedback && (
              <div className="mb-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-800 mb-1">Feedback Dosen:</p>
                <p className="text-sm text-green-700">{task.feedback}</p>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">File Submission:</p>
                <div className="flex flex-wrap gap-2">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded text-sm">
                      <Paperclip className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-700">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex space-x-3">
                <button className="flex items-center text-sm text-green-600 hover:text-green-800 transition-colors">
                  <Download className="h-4 w-4 mr-1" />
                  Download Soal
                </button>
                
                {task.status === 'submitted' && (
                  <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat Submission
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {task.status !== 'submitted' && (
                  <button className="flex items-center text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Upload className="h-4 w-4 mr-1" />
                    {task.status === 'in_progress' ? 'Update Submission' : 'Mulai Mengerjakan'}
                  </button>
                )}
                
                {task.type === 'group' && (
                  <button className="flex items-center text-sm text-purple-600 hover:text-purple-800 border border-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors">
                    <Users className="h-4 w-4 mr-1" />
                    Kelompok
                  </button>
                )}
              </div>
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