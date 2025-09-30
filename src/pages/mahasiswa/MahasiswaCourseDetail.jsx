import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Clock, CheckCircle, FileText, Calendar,
  AlertTriangle, Users, Star, Download, Upload
} from 'lucide-react';

const MahasiswaCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  // Sample data - akan diganti dengan API call berdasarkan courseId
  const course = {
    id: parseInt(courseId),
    name: 'Pemrograman Web',
    code: 'IF123',
    sks: 3,
    lecturer: 'Dr. John Doe',
    semester: 'Ganjil 2024/2025',
    groupStatus: 'joined', // 'joined', 'not_joined'
    groupName: 'Kelompok Alpha',
    groupMembers: ['Alice Johnson', 'Bob Smith', 'Charlie Brown'],
    schedule: [
      { day: 'Senin', time: '08:00-10:00', room: 'Lab A' },
      { day: 'Rabu', time: '10:00-12:00', room: 'Lab A' }
    ],
    assignments: [
      {
        id: 1,
        title: 'Proposal Sistem E-Commerce',
        description: 'Membuat proposal lengkap untuk sistem e-commerce',
        deadline: '2024-10-15',
        status: 'graded',
        grade: 88,
        weight: 20,
        submittedAt: '2024-10-14T10:30:00',
        feedback: 'Proposal yang baik, perlu perbaikan di metodologi'
      },
      {
        id: 2,
        title: 'Progress Report 1',
        description: 'Laporan kemajuan development tahap pertama',
        deadline: '2024-11-15',
        status: 'pending',
        grade: null,
        weight: 25,
        submittedAt: null,
        feedback: null
      }
    ],
    averageGrade: 88.5,
    activeTasks: 2,
    completedTasks: 1,
    nextDeadline: '2024-11-15'
  };

  const getGroupStatusBadge = (status) => {
    if (status === 'joined') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle size={14} />
          Bergabung
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <AlertTriangle size={14} />
          Belum Bergabung
        </span>
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock size={14} />
            Tugas Aktif
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Submitted
          </span>
        );
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Star size={14} />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  const getUrgencyColor = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 3) return 'text-red-600';
    if (diffDays <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleFileUpload = (assignmentId) => {
    if (!selectedFile) return;
    console.log('Upload file for assignment:', assignmentId, selectedFile.name);
    // Handle upload logic
    setSelectedFile(null);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/student/courses')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Mata Kuliah Saya
        </button>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
              {getGroupStatusBadge(course.groupStatus)}
            </div>
            <p className="text-gray-600 mb-2">{course.code} • {course.sks} SKS • {course.lecturer}</p>
            <p className="text-sm text-gray-500">{course.semester}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Jadwal Kuliah:</h3>
          <div className="flex flex-wrap gap-2">
            {course.schedule.map((schedule, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm">
                {schedule.day} {schedule.time} ({schedule.room})
              </span>
            ))}
          </div>
        </div>

        {/* Group Info */}
        {course.groupName && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Kelompok: {course.groupName}</h3>
            <div className="flex flex-wrap gap-2">
              {course.groupMembers.map((member, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border text-center">
          <div className="bg-yellow-50 rounded-lg p-4">
            <Clock className="text-yellow-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-yellow-600 mb-1">{course.activeTasks}</p>
            <p className="text-sm text-gray-600">Tugas Aktif</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-green-600 mb-1">{course.completedTasks}</p>
            <p className="text-sm text-gray-600">Selesai</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <Calendar className="text-blue-600 mx-auto mb-2" size={32} />
            <p className={`text-lg font-bold mb-1 ${getUrgencyColor(course.nextDeadline)}`}>
              {course.nextDeadline}
            </p>
            <p className="text-sm text-gray-600">Deadline Terdekat</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border text-center">
          <div className="bg-purple-50 rounded-lg p-4">
            <Star className="text-purple-600 mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold text-purple-600 mb-1">{course.averageGrade}</p>
            <p className="text-sm text-gray-600">Rata-rata Nilai</p>
          </div>
        </div>
      </div>

      {/* Warning for not joined group */}
      {course.groupStatus === 'not_joined' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Belum bergabung kelompok</p>
              <p className="text-yellow-700 text-sm mt-1">
                Anda perlu bergabung dengan kelompok untuk mengerjakan tugas besar.
              </p>
            </div>
            <button 
              onClick={() => navigate('/student/groups')}
              className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              Cari Kelompok
            </button>
          </div>
        </div>
      )}

      {/* Assignments Section */}
      <div className="space-y-6">
        {course.assignments.map(assignment => (
          <div key={assignment.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                  {getStatusBadge(assignment.status)}
                </div>
                <p className="text-gray-700 mb-3">{assignment.description}</p>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className={`font-medium ${getUrgencyColor(assignment.deadline)}`}>
                  {assignment.deadline}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bobot</p>
                <p className="font-medium">{assignment.weight}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{assignment.status}</p>
              </div>
              {assignment.grade && (
                <div>
                  <p className="text-sm text-gray-600">Nilai</p>
                  <p className="font-medium text-green-600">{assignment.grade}</p>
                </div>
              )}
            </div>

            {/* Upload Section */}
            {assignment.status === 'pending' && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Upload Tugas</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="flex-1 text-sm"
                    accept=".pdf,.doc,.docx,.zip,.rar"
                  />
                  <button
                    onClick={() => handleFileUpload(assignment.id)}
                    disabled={!selectedFile}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format yang didukung: PDF, DOC, DOCX, ZIP, RAR (Max: 50MB)
                </p>
              </div>
            )}

            {/* Submission Info */}
            {assignment.submittedAt && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Dikumpulkan pada: {new Date(assignment.submittedAt).toLocaleString('id-ID')}
                </p>
              </div>
            )}

            {/* Feedback Section */}
            {assignment.feedback && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Feedback Dosen</h4>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-800">{assignment.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {course.assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tugas</h3>
          <p className="text-gray-600">Tugas besar untuk mata kuliah ini belum tersedia.</p>
        </div>
      )}
    </div>
  );
};

export default MahasiswaCourseDetail;