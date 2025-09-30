import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, FileText, Star, TrendingUp } from 'lucide-react';
import DosenTaskManagement from '../../components/dosen/DosenTaskManagement';
import DosenGroupManagement from '../../components/dosen/DosenGroupManagement';
import DosenGradingManagement from '../../components/dosen/DosenGradingManagement';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample course data - akan diganti dengan API call berdasarkan courseId
  const course = {
    id: parseInt(courseId),
    name: 'Pemrograman Web',
    code: 'IF123',
    students: 45,
    tasks: 3,
    semester: 'Ganjil 2024/2025',
    sks: 3,
    activeGroups: 8
  };

  const CourseOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Mahasiswa</p>
              <p className="text-2xl font-bold text-blue-700">{course.students}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Tugas Besar</p>
              <p className="text-2xl font-bold text-green-700">{course.tasks}</p>
            </div>
            <FileText className="text-green-600" size={32} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Kelompok Aktif</p>
              <p className="text-2xl font-bold text-purple-700">{course.activeGroups}</p>
            </div>
            <Users className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Nilai Rata-rata</p>
              <p className="text-2xl font-bold text-orange-700">84.5</p>
            </div>
            <Star className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Informasi Mata Kuliah</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nama Mata Kuliah</p>
            <p className="font-medium">{course.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kode Mata Kuliah</p>
            <p className="font-medium">{course.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Semester</p>
            <p className="font-medium">{course.semester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">SKS</p>
            <p className="font-medium">{course.sks}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Tugas besar "Sistem E-Commerce" dibuat</p>
              <p className="text-sm text-gray-600">2 hari yang lalu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">8 kelompok mahasiswa telah terbentuk</p>
              <p className="text-sm text-gray-600">3 hari yang lalu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Penilaian proposal telah selesai</p>
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
            <FileText className="text-blue-600 mb-2" size={24} />
            <p className="font-medium">Kelola Tugas Besar</p>
            <p className="text-sm text-gray-600">Buat dan atur tugas besar</p>
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Users className="text-green-600 mb-2" size={24} />
            <p className="font-medium">Kelola Kelompok</p>
            <p className="text-sm text-gray-600">Atur kelompok mahasiswa</p>
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Star className="text-purple-600 mb-2" size={24} />
            <p className="font-medium">Input Penilaian</p>
            <p className="text-sm text-gray-600">Berikan nilai dan feedback</p>
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
          <DosenTaskManagement 
            courseId={course.id}
            courseName={course.name}
          />
        );
      case 'groups':
        return (
          <DosenGroupManagement 
            courseId={course.id}
            courseName={course.name}
          />
        );
      case 'grading':
        return (
          <DosenGradingManagement 
            courseId={course.id}
            courseName={course.name}
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
          onClick={() => navigate('/courses')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Mata Kuliah
        </button>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Course Header */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">{course.code} • {course.sks} SKS</p>
            <p className="text-sm text-gray-500">{course.semester}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Status</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Aktif
            </span>
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
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tasks' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tugas Besar
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'groups' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kelompok
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'grading' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Penilaian
          </button>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;