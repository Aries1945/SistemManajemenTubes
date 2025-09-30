import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MahasiswaCourses = () => {
  const navigate = useNavigate();

  // Sample data - akan diganti dengan data dari API
  const courses = [
    { 
      id: 1, 
      name: 'Pemrograman Web', 
      code: 'IF123',
      lecturer: 'Dr. John Doe',
      sks: 3,
      schedule: [
        { day: 'Senin', time: '08:00-10:00', room: 'Lab A' },
        { day: 'Rabu', time: '10:00-12:00', room: 'Lab A' }
      ],
      groupStatus: 'joined',
      groupName: 'Kelompok Alpha',
      groupMembers: ['Alice Johnson', 'Bob Smith', 'Charlie Brown'],
      activeTasks: 2,
      completedTasks: 1,
      nextDeadline: '2024-11-15',
      averageGrade: 88.5
    },
    { 
      id: 2, 
      name: 'Basis Data', 
      code: 'IF234',
      lecturer: 'Dr. Jane Smith',
      sks: 3,
      schedule: [
        { day: 'Selasa', time: '13:00-15:00', room: 'Ruang 201' },
        { day: 'Kamis', time: '13:00-15:00', room: 'Ruang 201' }
      ],
      groupStatus: 'not_joined',
      groupName: null,
      groupMembers: [],
      activeTasks: 1,
      completedTasks: 0,
      nextDeadline: '2024-11-20',
      averageGrade: null
    },
    { 
      id: 3, 
      name: 'Rekayasa Perangkat Lunak', 
      code: 'IF345',
      lecturer: 'Dr. Bob Wilson',
      sks: 3,
      schedule: [
        { day: 'Senin', time: '13:00-15:00', room: 'Ruang 102' },
        { day: 'Kamis', time: '08:00-10:00', room: 'Ruang 102' }
      ],
      groupStatus: 'joined',
      groupName: 'Kelompok Beta',
      groupMembers: ['Alice Johnson', 'Diana Prince', 'Edward Norton', 'Fiona Green'],
      activeTasks: 3,
      completedTasks: 2,
      nextDeadline: '2024-12-01',
      averageGrade: 89.2
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah Saya</h1>
          <p className="text-gray-600">Semester Ganjil 2024/2025</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onSelect={() => navigate(`/student/courses/${course.id}`)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
          <p className="text-gray-600">Anda belum terdaftar di mata kuliah manapun semester ini.</p>
        </div>
      )}
    </div>
  );
};

const CourseCard = ({ course, onSelect }) => {
  const getGroupStatusBadge = (status) => {
    switch (status) {
      case 'joined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Bergabung
          </span>
        );
      case 'not_joined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <AlertTriangle size={14} />
            Belum Bergabung
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock size={14} />
            Pending
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
    
    if (diffDays <= 3) return 'text-red-600';
    if (diffDays <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
              {getGroupStatusBadge(course.groupStatus)}
            </div>
            <p className="text-gray-600 mb-2">{course.code} • {course.sks} SKS • {course.lecturer}</p>
            
            {/* Schedule */}
            <div className="flex flex-wrap gap-2 mb-3">
              {course.schedule.map((schedule, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                  {schedule.day} {schedule.time} ({schedule.room})
                </span>
              ))}
            </div>

            {/* Group Info */}
            {course.groupName && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Kelompok: {course.groupName}
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.groupMembers.map((member, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <button 
              onClick={onSelect}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Active Tasks */}
          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-yellow-600 mb-1">{course.activeTasks}</p>
              <p className="text-sm text-gray-600">Tugas Aktif</p>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-green-600 mb-1">{course.completedTasks}</p>
              <p className="text-sm text-gray-600">Selesai</p>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <FileText className="text-blue-600" size={24} />
              </div>
              <p className={`text-sm font-bold mb-1 ${getUrgencyColor(course.nextDeadline)}`}>
                {course.nextDeadline}
              </p>
              <p className="text-sm text-gray-600">Deadline Terdekat</p>
            </div>
          </div>

          {/* Average Grade */}
          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-purple-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {course.averageGrade ? course.averageGrade : '-'}
              </p>
              <p className="text-sm text-gray-600">Rata-rata Nilai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {course.groupStatus === 'not_joined' && (
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium">Belum bergabung kelompok</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Anda perlu bergabung dengan kelompok untuk mengerjakan tugas besar.
                </p>
              </div>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
                Cari Kelompok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default MahasiswaCourses;