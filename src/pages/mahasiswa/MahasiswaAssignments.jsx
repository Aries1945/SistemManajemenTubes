import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Clock, CheckCircle, AlertTriangle, Calendar, Star } from 'lucide-react';

const MahasiswaAssignments = () => {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'grades'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'submitted', 'graded'

  // Sample data - akan diganti dengan data dari API
  const assignments = [
    {
      id: 1,
      title: 'Proposal Sistem E-Commerce',
      course: 'Pemrograman Web',
      courseCode: 'IF123',
      description: 'Membuat proposal lengkap untuk sistem e-commerce yang akan dikembangkan',
      deadline: '2024-10-15',
      submittedAt: '2024-10-14T10:30:00',
      status: 'graded',
      grade: 88,
      feedback: 'Proposal yang baik, perlu perbaikan di metodologi pengembangan',
      weight: 20,
      maxScore: 100,
      groupTask: true,
      groupName: 'Kelompok Alpha',
      attachments: ['proposal_alpha.pdf'],
      gradedAt: '2024-10-20'
    },
    {
      id: 2,
      title: 'Progress Report 1',
      course: 'Pemrograman Web',
      courseCode: 'IF123',
      description: 'Laporan kemajuan development sistem e-commerce tahap pertama',
      deadline: '2024-11-15',
      submittedAt: null,
      status: 'pending',
      grade: null,
      feedback: null,
      weight: 25,
      maxScore: 100,
      groupTask: true,
      groupName: 'Kelompok Alpha',
      attachments: [],
      gradedAt: null
    },
    {
      id: 3,
      title: 'ERD Database Design',
      course: 'Basis Data',
      courseCode: 'IF234',
      description: 'Merancang Entity Relationship Diagram untuk sistem basis data',
      deadline: '2024-11-20',
      submittedAt: null,
      status: 'pending',
      grade: null,
      feedback: null,
      weight: 30,
      maxScore: 100,
      groupTask: false,
      groupName: null,
      attachments: [],
      gradedAt: null
    },
    {
      id: 4,
      title: 'System Architecture Design',
      course: 'Rekayasa Perangkat Lunak',
      courseCode: 'IF345',
      description: 'Merancang arsitektur sistem untuk project management system',
      deadline: '2024-12-01',
      submittedAt: '2024-11-28T14:20:00',
      status: 'submitted',
      grade: null,
      feedback: null,
      weight: 25,
      maxScore: 100,
      groupTask: true,
      groupName: 'Kelompok Beta',
      attachments: ['architecture_design.pdf', 'system_diagram.png'],
      gradedAt: null
    }
  ];

  const grades = [
    {
      id: 1,
      course: 'Pemrograman Web',
      courseCode: 'IF123',
      components: [
        { name: 'Proposal', weight: 20, score: 88, maxScore: 100, feedback: 'Good proposal, needs improvement in methodology' },
        { name: 'Progress 1', weight: 25, score: null, maxScore: 100, feedback: null },
        { name: 'Progress 2', weight: 25, score: null, maxScore: 100, feedback: null },
        { name: 'Final Presentation', weight: 30, score: null, maxScore: 100, feedback: null }
      ],
      currentAverage: 88,
      groupName: 'Kelompok Alpha'
    },
    {
      id: 2,
      course: 'Basis Data',
      courseCode: 'IF234',
      components: [
        { name: 'ERD Design', weight: 30, score: null, maxScore: 100, feedback: null },
        { name: 'Implementation', weight: 40, score: null, maxScore: 100, feedback: null },
        { name: 'Testing & Documentation', weight: 30, score: null, maxScore: 100, feedback: null }
      ],
      currentAverage: null,
      groupName: null
    },
    {
      id: 3,
      course: 'Rekayasa Perangkat Lunak',
      courseCode: 'IF345',
      components: [
        { name: 'System Analysis', weight: 20, score: 85, maxScore: 100, feedback: 'Good analysis of requirements' },
        { name: 'System Design', weight: 25, score: 89, maxScore: 100, feedback: 'Excellent system architecture' },
        { name: 'Implementation', weight: 30, score: null, maxScore: 100, feedback: null },
        { name: 'Testing & Deployment', weight: 25, score: null, maxScore: 100, feedback: null }
      ],
      currentAverage: 87,
      groupName: 'Kelompok Beta'
    }
  ];

  const filteredAssignments = assignments.filter(assignment => {
    if (filterStatus === 'all') return true;
    return assignment.status === filterStatus;
  });

  const AssignmentsTab = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.map(assignment => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada tugas</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' ? 'Belum ada tugas yang diberikan' : `Tidak ada tugas dengan status ${filterStatus}`}
          </p>
        </div>
      )}
    </div>
  );

  const GradesTab = () => (
    <div className="space-y-6">
      {grades.map(grade => (
        <GradeCard key={grade.id} grade={grade} />
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tugas & Nilai</h1>
          <p className="text-gray-600">Kelola pengumpulan tugas dan lihat nilai Anda</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'assignments' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tugas ({assignments.length})
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'grades' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nilai ({grades.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'assignments' ? <AssignmentsTab /> : <GradesTab />}
        </div>
      </div>
    </div>
  );
};

const AssignmentCard = ({ assignment }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock size={14} />
            Pending
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
            Graded
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
    
    if (diffDays < 0) return 'text-red-600'; // Overdue
    if (diffDays <= 3) return 'text-red-600'; // Critical
    if (diffDays <= 7) return 'text-yellow-600'; // Warning
    return 'text-green-600'; // Safe
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    setSelectedFile(null);
    console.log('File uploaded:', selectedFile.name);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
            {getStatusBadge(assignment.status)}
          </div>
          <p className="text-gray-600 mb-2">{assignment.course} ({assignment.courseCode})</p>
          <p className="text-gray-700 mb-3">{assignment.description}</p>
          
          {assignment.groupTask && assignment.groupName && (
            <p className="text-sm text-blue-600 mb-2">
              📋 Tugas Kelompok: {assignment.groupName}
            </p>
          )}
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
            <p className="font-medium text-green-600">{assignment.grade}/{assignment.maxScore}</p>
          </div>
        )}
      </div>

      {/* Submission Section */}
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
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format yang didukung: PDF, DOC, DOCX, ZIP, RAR (Max: 50MB)
          </p>
        </div>
      )}

      {/* Submitted Files */}
      {assignment.attachments.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">File yang Dikumpulkan</h4>
          <div className="space-y-2">
            {assignment.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{file}</span>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
          {assignment.submittedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Dikumpulkan pada: {new Date(assignment.submittedAt).toLocaleString('id-ID')}
            </p>
          )}
        </div>
      )}

      {/* Feedback Section */}
      {assignment.feedback && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Feedback Dosen</h4>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-800">{assignment.feedback}</p>
            {assignment.gradedAt && (
              <p className="text-xs text-blue-600 mt-2">
                Dinilai pada: {new Date(assignment.gradedAt).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GradeCard = ({ grade }) => {
  const calculateCurrentGrade = () => {
    const gradedComponents = grade.components.filter(comp => comp.score !== null);
    if (gradedComponents.length === 0) return null;
    
    const totalWeightedScore = gradedComponents.reduce((sum, comp) => sum + (comp.score * comp.weight / 100), 0);
    const totalWeight = gradedComponents.reduce((sum, comp) => sum + comp.weight, 0);
    
    return (totalWeightedScore / totalWeight * 100).toFixed(1);
  };

  const getGradeColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentGrade = calculateCurrentGrade();

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{grade.course}</h3>
          <p className="text-gray-600">{grade.courseCode}</p>
          {grade.groupName && (
            <p className="text-sm text-blue-600 mt-1">Kelompok: {grade.groupName}</p>
          )}
        </div>
        <div className="text-right">
          {currentGrade ? (
            <>
              <p className={`text-3xl font-bold ${getGradeColor(parseFloat(currentGrade))}`}>
                {currentGrade}
              </p>
              <p className="text-sm text-gray-600">Nilai Saat Ini</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400">-</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Komponen Penilaian</h4>
        {grade.components.map((component, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{component.name}</h5>
                <p className="text-sm text-gray-600">Bobot: {component.weight}%</p>
              </div>
              <div className="text-right">
                {component.score !== null ? (
                  <div>
                    <p className={`text-lg font-bold ${getGradeColor(component.score)}`}>
                      {component.score}/{component.maxScore}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({((component.score / component.maxScore) * 100).toFixed(1)}%)
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 font-medium">Belum dinilai</p>
                )}
              </div>
            </div>
            
            {component.feedback && (
              <div className="mt-3 bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-800">{component.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress Penilaian</span>
          <span>
            {grade.components.filter(comp => comp.score !== null).length}/
            {grade.components.length} komponen
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(grade.components.filter(comp => comp.score !== null).length / grade.components.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaAssignments;