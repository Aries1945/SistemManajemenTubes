import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, FileText, Star, Calendar, Clock, 
  CheckCircle, Download, Upload, MessageSquare, Users,
  BookOpen, Target, Award, AlertCircle, Play, Eye
} from 'lucide-react';
import MahasiswaTaskManagement from '../../components/mahasiswa/MahasiswaTaskManagement';
import MahasiswaGroupView from '../../components/mahasiswa/MahasiswaGroupView';
import MahasiswaGradeView from '../../components/mahasiswa/MahasiswaGradeView';

const MahasiswaCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample course data - akan diganti dengan API call berdasarkan courseId
  const course = {
    id: parseInt(courseId),
    name: 'Pemrograman Web',
    code: 'IF123',
    lecturer: 'Dr. Ahmad Fauzi',
    class: 'A',
    schedule: 'Senin, 08:00-10:00 | Kamis, 13:00-15:00',
    semester: 'Ganjil 2024/2025',
    sks: 3,
    room: 'Lab Komputer 1',
    totalStudents: 45,
    averageGrade: 85.5,
    myGrade: 87.2,
    attendance: 95,
    totalTasks: 5,
    completedTasks: 3,
    pendingTasks: 2,
    taskProgress: 60,
    myGroup: 'Kelompok 5',
    groupMembers: ['John Doe', 'Jane Smith', 'Bob Wilson']
  };

  const CourseOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Nilai Saya</p>
              <p className="text-2xl font-bold text-green-700">{course.myGrade}</p>
            </div>
            <Star className="text-green-600" size={32} />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Kehadiran</p>
              <p className="text-2xl font-bold text-blue-700">{course.attendance}%</p>
            </div>
            <CheckCircle className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Tugas Selesai</p>
              <p className="text-2xl font-bold text-purple-700">{course.completedTasks}/{course.totalTasks}</p>
            </div>
            <FileText className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Rata-rata Kelas</p>
              <p className="text-2xl font-bold text-orange-700">{course.averageGrade}</p>
            </div>
            <Target className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Course Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Informasi Mata Kuliah</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Dosen Pengampu</p>
            <p className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              {course.lecturer}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kelas</p>
            <p className="font-medium">{course.class}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Jadwal</p>
            <p className="font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {course.schedule}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ruangan</p>
            <p className="font-medium">{course.room}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kelompok Saya</p>
            <p className="font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              {course.myGroup}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">SKS</p>
            <p className="font-medium">{course.sks}</p>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Progress Pembelajaran</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Penyelesaian Tugas</span>
              <span className="text-sm text-gray-600">{course.taskProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all" 
                style={{ width: `${course.taskProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Kehadiran</span>
              <span className="text-sm text-gray-600">{course.attendance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all" 
                style={{ width: `${course.attendance}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Tugas "React Components" berhasil dikumpulkan</p>
              <p className="text-sm text-gray-600">2 hari yang lalu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Nilai UTS telah diumumkan: 88</p>
              <p className="text-sm text-gray-600">5 hari yang lalu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Bergabung dengan Kelompok 5</p>
              <p className="text-sm text-gray-600">1 minggu yang lalu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aksi Cepat</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FileText className="text-green-600 mb-2" size={24} />
            <p className="font-medium">Lihat Tugas</p>
            <p className="text-sm text-gray-600">Kelola tugas dan pengumpulan</p>
          </button>
          <button 
            onClick={() => setActiveTab('group')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Users className="text-blue-600 mb-2" size={24} />
            <p className="font-medium">Kelompok Saya</p>
            <p className="text-sm text-gray-600">Lihat anggota dan aktivitas</p>
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Star className="text-purple-600 mb-2" size={24} />
            <p className="font-medium">Lihat Nilai</p>
            <p className="text-sm text-gray-600">Cek nilai dan feedback</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CourseOverview />;
      case 'tasks':
        return (
          <MahasiswaTaskManagement 
            courseId={course.id}
            courseName={course.name}
          />
        );
      case 'group':
        return (
          <MahasiswaGroupView 
            courseId={course.id}
            courseName={course.name}
            myGroup={course.myGroup}
            groupMembers={course.groupMembers}
          />
        );
      case 'grades':
        return (
          <MahasiswaGradeView 
            courseId={course.id}
            courseName={course.name}
            myGrade={course.myGrade}
            averageGrade={course.averageGrade}
          />
        );
      default:
        return <CourseOverview />;
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Mata Kuliah Saya
        </button>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">{course.code} • {course.sks} SKS • Kelas {course.class}</p>
            <p className="text-sm text-gray-500">{course.semester}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>{course.lecturer}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Nilai Saya</p>
            <span className="text-2xl font-bold text-green-600">{course.myGrade}</span>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-600">Grade: A-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tasks' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tugas
          </button>
          <button 
            onClick={() => setActiveTab('group')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'group' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kelompok
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'grades' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nilai
          </button>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MahasiswaCourseDetail;