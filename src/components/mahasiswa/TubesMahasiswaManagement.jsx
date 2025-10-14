import React, { useState } from 'react';
import { 
  FileText, Calendar, Clock, CheckCircle, Upload, Download, 
  Eye, AlertCircle, Star, User, Users, Play, Paperclip, X, ArrowLeft,
  BookOpen, Target, Award, MessageSquare, Settings, ChevronRight,
  Mail, Phone, Activity, UserPlus, List
} from 'lucide-react';

const TubesMahasiswaManagement = ({ courseId, courseName }) => {
  const [selectedTubes, setSelectedTubes] = useState(null);
  const [activeTab, setActiveTab] = useState('tugas'); // 'tugas', 'kelompok', or 'main'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskPreview, setShowTaskPreview] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [selectedGroupChoice, setSelectedGroupChoice] = useState(null);

  // Available students for group formation
  const availableStudents = [
    { id: 2, name: 'John Doe', nim: '20210002', email: 'john.doe@university.ac.id' },
    { id: 3, name: 'Jane Smith', nim: '20210003', email: 'jane.smith@university.ac.id' },
    { id: 4, name: 'Bob Wilson', nim: '20210004', email: 'bob.wilson@university.ac.id' },
    { id: 5, name: 'Alice Brown', nim: '20210005', email: 'alice.brown@university.ac.id' },
    { id: 6, name: 'Charlie Davis', nim: '20210006', email: 'charlie.davis@university.ac.id' },
    { id: 7, name: 'Diana Evans', nim: '20210007', email: 'diana.evans@university.ac.id' },
    { id: 8, name: 'Edward Foster', nim: '20210008', email: 'edward.foster@university.ac.id' },
    { id: 9, name: 'Fiona Green', nim: '20210009', email: 'fiona.green@university.ac.id' },
    { id: 10, name: 'George Harris', nim: '20210010', email: 'george.harris@university.ac.id' }
  ];

  // Group choice configuration (for tubes that require group selection)
  const groupChoiceConfig = {
    taskTitle: 'Mobile App Development Project',
    deadline: '2024-11-01 23:59',
    allowMove: true,
    groups: [
      { id: 'A', name: 'Mobile Masters', currentMembers: 2, maxCapacity: 3, members: ['Diana Prince', 'Eve Wilson'] },
      { id: 'B', name: 'App Creators', currentMembers: 3, maxCapacity: 3, members: ['Frank Ocean', 'Grace Kelly', 'Henry Ford'] },
      { id: 'C', name: 'Code Warriors', currentMembers: 2, maxCapacity: 3, members: ['Ivy League', 'Jack Sparrow'] },
      { id: 'D', name: 'Tech Innovators', currentMembers: 1, maxCapacity: 3, members: ['Kelly Clarkson'] },
      { id: 'E', name: 'Digital Pioneers', currentMembers: 2, maxCapacity: 3, members: ['Luna Lovegood', 'Mike Tyson'] }
    ]
  };

  // Sample Tubes data
  const tubesData = [
    {
      id: 1,
      title: 'E-Commerce Website Development',
      description: 'Proyek pengembangan website e-commerce lengkap dengan fitur customer dan admin panel',
      deadline: '2024-12-15',
      status: 'in_progress',
      progress: 65,
      groupId: 'GROUP_001',
      groupName: 'Web Warriors',
      hasGroup: true, // Sudah punya kelompok
      members: [
        { id: 1, name: 'Anda', role: 'Frontend Developer', avatar: '👨‍💻', isCurrentUser: true },
        { id: 2, name: 'Alice Johnson', role: 'Backend Developer', avatar: '👩‍💻', isCurrentUser: false },
        { id: 3, name: 'Bob Smith', role: 'UI/UX Designer', avatar: '🎨', isCurrentUser: false },
        { id: 4, name: 'Charlie Brown', role: 'Database Admin', avatar: '🗄️', isCurrentUser: false }
      ],
      tasks: [
        {
          id: 1,
          title: 'Proposal Project',
          description: 'Membuat proposal lengkap untuk project e-commerce termasuk requirement analysis dan technology stack',
          dueDate: '2024-10-20',
          submittedDate: '2024-10-18',
          status: 'submitted',
          grade: 88,
          feedback: 'Proposal bagus! Tech stack sudah sesuai. Perlu detail lebih pada user stories.',
          type: 'group',
          maxGrade: 100,
          attachments: ['proposal-ecommerce.pdf', 'tech-stack-analysis.docx'],
          submissionCount: 1,
          lateSubmission: false,
          assignedTo: ['Alice Johnson', 'Bob Smith'],
          taskFiles: ['proposal-template.docx', 'requirements-checklist.pdf']
        },
        {
          id: 2,
          title: 'Database Design & ERD',
          description: 'Merancang struktur database dan membuat Entity Relationship Diagram untuk sistem e-commerce',
          dueDate: '2024-10-30',
          submittedDate: '2024-10-29',
          status: 'submitted',
          grade: 92,
          feedback: 'ERD sangat comprehensive! Normalisasi database sudah tepat.',
          type: 'group',
          maxGrade: 100,
          attachments: ['database-erd.png', 'sql-schema.sql'],
          submissionCount: 1,
          lateSubmission: false,
          assignedTo: ['Charlie Brown'],
          taskFiles: ['erd-guidelines.pdf', 'sample-ecommerce-schema.sql']
        },
        {
          id: 3,
          title: 'Frontend Development Sprint 1',
          description: 'Implementasi UI untuk halaman utama, product listing, dan product detail page',
          dueDate: '2024-11-10',
          submittedDate: '2024-11-09',
          status: 'submitted',
          grade: 85,
          feedback: 'UI design bagus dan responsive. Perlu optimization pada loading speed.',
          type: 'individual',
          maxGrade: 100,
          attachments: ['frontend-sprint1.zip'],
          submissionCount: 2,
          lateSubmission: false,
          assignedTo: ['Anda', 'Bob Smith'],
          taskFiles: ['ui-mockup.figma', 'component-library.zip']
        },
        {
          id: 4,
          title: 'Backend API Development',
          description: 'Membuat REST API untuk product management, user authentication, dan shopping cart',
          dueDate: '2024-11-15',
          submittedDate: '2024-11-14',
          status: 'submitted',
          grade: 90,
          feedback: 'API structure excellent! Documentation sangat lengkap dan testing coverage baik.',
          type: 'individual',
          maxGrade: 100,
          attachments: ['backend-api.zip', 'api-documentation.pdf'],
          submissionCount: 1,
          lateSubmission: false,
          assignedTo: ['Alice Johnson'],
          taskFiles: ['api-requirements.pdf', 'postman-collection.json']
        },
        {
          id: 5,
          title: 'Frontend Development Sprint 2',
          description: 'Implementasi shopping cart, checkout process, dan user dashboard',
          dueDate: '2024-11-25',
          submittedDate: null,
          status: 'in_progress',
          grade: null,
          feedback: null,
          type: 'individual',
          maxGrade: 100,
          attachments: [],
          submissionCount: 0,
          lateSubmission: false,
          assignedTo: ['Anda', 'Bob Smith'],
          taskFiles: ['checkout-flow.pdf', 'dashboard-wireframe.pdf']
        },
        {
          id: 6,
          title: 'Integration & Testing',
          description: 'Integrasi frontend dan backend, testing end-to-end functionality',
          dueDate: '2024-12-05',
          submittedDate: null,
          status: 'not_started',
          grade: null,
          feedback: null,
          type: 'group',
          maxGrade: 100,
          attachments: [],
          submissionCount: 0,
          lateSubmission: false,
          assignedTo: ['All Members'],
          taskFiles: ['testing-checklist.pdf', 'integration-guide.pdf']
        },
        {
          id: 7,
          title: 'Final Presentation',
          description: 'Presentasi final project dengan demo aplikasi dan dokumentasi lengkap',
          dueDate: '2024-12-15',
          submittedDate: null,
          status: 'not_started',
          grade: null,
          feedback: null,
          type: 'group',
          maxGrade: 100,
          attachments: [],
          submissionCount: 0,
          lateSubmission: false,
          assignedTo: ['All Members'],
          taskFiles: ['presentation-template.pptx', 'demo-script.pdf']
        }
      ],
      overallGrade: 88.75,
      maxGrade: 100
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Pengembangan aplikasi mobile untuk sistem manajemen perpustakaan',
      deadline: '2024-12-20',
      status: 'pending_group_selection',
      progress: 0,
      groupId: null,
      groupName: null,
      hasGroup: false, // Belum punya kelompok - perlu pilih dulu
      requiresGroupSelection: true,
      members: [],
      tasks: [
        {
          id: 8,
          title: 'Project Planning & Proposal',
          description: 'Membuat rencana project dan proposal untuk aplikasi mobile perpustakaan',
          dueDate: '2024-11-01',
          submittedDate: null,
          status: 'not_started',
          grade: null,
          feedback: null,
          type: 'group',
          maxGrade: 100,
          attachments: [],
          submissionCount: 0,
          lateSubmission: false,
          assignedTo: ['All Members'],
          taskFiles: ['mobile-project-template.docx']
        }
      ],
      overallGrade: null,
      maxGrade: 100
    }
  ];

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
      case 'pending_group_selection':
        return 'bg-orange-100 text-orange-800';
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
      case 'pending_group_selection':
        return 'Pilih Kelompok';
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

  const handleTubesClick = (tubes) => {
    // Jika tubes belum punya kelompok, tampilkan modal pemilihan kelompok
    if (!tubes.hasGroup && tubes.requiresGroupSelection) {
      setSelectedGroupChoice(tubes);
      setShowChoiceModal(true);
    } else {
      setSelectedTubes(tubes);
      setActiveTab('tugas');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskPreview(true);
  };

  const handleBackToTubes = () => {
    setSelectedTubes(null);
    setActiveTab('tugas');
  };

  const handleCloseTaskPreview = () => {
    setShowTaskPreview(false);
    setSelectedTask(null);
    setSubmissionFiles([]);
    setSubmissionNote('');
  };

  // Group Choice Modal Component
  const GroupChoiceModal = () => {
    const [selectedGroup, setSelectedGroupId] = useState(null);
    const [showMembers, setShowMembers] = useState(null);

    const handleSelectGroup = () => {
      if (!selectedGroup) {
        alert('Pilih kelompok terlebih dahulu!');
        return;
      }
      
      const group = groupChoiceConfig.groups.find(g => g.id === selectedGroup);
      if (group.currentMembers >= group.maxCapacity) {
        alert('Kelompok ini sudah penuh!');
        return;
      }

      console.log('Selected group:', selectedGroup);
      alert(`Anda berhasil bergabung dengan ${group.name}!`);
      
      // Update the tubes data to include the selected group
      const updatedTubes = {
        ...selectedGroupChoice,
        hasGroup: true,
        groupName: group.name,
        groupId: `GROUP_${selectedGroup}`,
        status: 'not_started',
        members: [
          { id: 1, name: 'Anda', role: 'Project Manager', avatar: '👨‍💼', isCurrentUser: true },
          ...group.members.map((member, index) => ({
            id: index + 2,
            name: member,
            role: 'Member',
            avatar: '👤',
            isCurrentUser: false
          }))
        ]
      };
      
      setShowChoiceModal(false);
      setSelectedGroupChoice(null);
      setSelectedTubes(updatedTubes);
      setActiveTab('tugas');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Pilih Kelompok Anda</h2>
                <p className="text-sm opacity-90">{selectedGroupChoice?.title}</p>
                <div className="flex items-center gap-4 text-sm opacity-90 mt-2">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Deadline: {new Date(groupChoiceConfig.deadline).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowChoiceModal(false);
                  setSelectedGroupChoice(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Petunjuk</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pilih salah satu kelompok yang tersedia</li>
                    <li>• Klik "Show Members" untuk melihat siapa saja yang sudah bergabung</li>
                    <li>• Kelompok yang FULL tidak dapat dipilih</li>
                    {groupChoiceConfig.allowMove && <li>• Anda dapat pindah kelompok sebelum deadline</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {groupChoiceConfig.groups.map(group => {
                const isFull = group.currentMembers >= group.maxCapacity;
                const isSelected = selectedGroup === group.id;

                return (
                  <div key={group.id}>
                    <label 
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isFull ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed' :
                        isSelected ? 'border-orange-500 bg-orange-50' :
                        'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="radio"
                          name="group"
                          value={group.id}
                          checked={isSelected}
                          onChange={() => !isFull && setSelectedGroupId(group.id)}
                          disabled={isFull}
                          className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{group.name}</h4>
                          <p className="text-sm text-gray-600">
                            {group.currentMembers}/{group.maxCapacity} Members
                            {isFull && <span className="ml-2 text-red-600 font-medium">FULL</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowMembers(showMembers === group.id ? null : group.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        {showMembers === group.id ? 'Hide' : 'Show'} Members
                      </button>
                    </label>
                    
                    {showMembers === group.id && (
                      <div className="mt-2 ml-9 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Anggota Kelompok:</p>
                        <div className="flex flex-wrap gap-2">
                          {group.members.map((member, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedGroup ? `Dipilih: ${groupChoiceConfig.groups.find(g => g.id === selectedGroup)?.name}` : 'Belum memilih kelompok'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  setSelectedGroupChoice(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSelectGroup}
                disabled={!selectedGroup}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Confirm Pilihan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
    handleCloseTaskPreview();
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
                  <span className="text-sm opacity-90">{selectedTask.type === 'group' ? 'Kelompok' : 'Individual'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTask.status)} bg-white bg-opacity-20 text-white`}>
                    {getStatusText(selectedTask.status)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(selectedTask.dueDate).toLocaleDateString('id-ID')}
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
                onClick={handleCloseTaskPreview}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Deskripsi Tugas</h3>
              <p className="text-blue-800">{selectedTask.description}</p>
            </div>

            {/* Assigned Members */}
            {selectedTask.assignedTo && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3">Assigned To</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignedTo.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      <User className="h-3 w-3 mr-1" />
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Submission */}
            {selectedTask.status === 'submitted' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Status Submission</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Dikumpulkan: {new Date(selectedTask.submittedDate).toLocaleDateString('id-ID')}
                  </div>
                  {selectedTask.feedback && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                      <p className="text-sm text-green-700">{selectedTask.feedback}</p>
                    </div>
                  )}
                </div>
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

  // Tubes Detail View
  const TubesDetailView = () => {
    if (!selectedTubes) return null;

    const completedTasks = selectedTubes.tasks.filter(t => t.status === 'submitted').length;
    const totalTasks = selectedTubes.tasks.length;
    const avgGrade = selectedTubes.tasks.filter(t => t.grade).reduce((sum, t) => sum + t.grade, 0) / selectedTubes.tasks.filter(t => t.grade).length || 0;

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToTubes}
            className="flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Tubes
          </button>
        </div>

        {/* Tubes Info Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedTubes.title}</h2>
              <p className="text-green-100 mb-4">{selectedTubes.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Deadline: {new Date(selectedTubes.deadline).toLocaleDateString('id-ID')}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {selectedTubes.members.length} anggota
                </span>
                <span className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Progress: {selectedTubes.progress}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-xs text-green-100 mb-1">Overall Grade</p>
                <p className="text-2xl font-bold">{selectedTubes.overallGrade || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress Keseluruhan</span>
            <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} tugas selesai</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${selectedTubes.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('tugas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tugas'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Daftar Tugas ({totalTasks})
              </button>
              <button
                onClick={() => setActiveTab('kelompok')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'kelompok'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Kelompok ({selectedTubes.members.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'tugas' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Selesai</p>
                        <p className="text-2xl font-bold text-green-700">{completedTasks}</p>
                      </div>
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">Dalam Progress</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {selectedTubes.tasks.filter(t => t.status === 'in_progress').length}
                        </p>
                      </div>
                      <Clock className="text-yellow-600" size={24} />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Rata-rata Nilai</p>
                        <p className="text-2xl font-bold text-purple-700">{Math.round(avgGrade) || 0}</p>
                      </div>
                      <Star className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>

                {/* Task List */}
                {selectedTubes.tasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="border rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(task.type)}
                            <span className="text-xs text-gray-500">{task.type === 'group' ? 'Kelompok' : 'Individual'}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString('id-ID')}
                          </span>
                          
                          {task.assignedTo && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {task.assignedTo.join(', ')}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'kelompok' && (
              <div className="space-y-6">
                {/* Group Overview Stats */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{selectedTubes.groupName}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {selectedTubes.members.length} Anggota
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                      <p className="text-sm text-gray-600">Tugas Selesai</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedTubes.tasks.filter(t => t.status === 'in_progress').length}
                      </p>
                      <p className="text-sm text-gray-600">Dalam Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedTubes.tasks.filter(t => t.status === 'not_started').length}
                      </p>
                      <p className="text-sm text-gray-600">Akan Datang</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{Math.round(avgGrade) || 0}</p>
                      <p className="text-sm text-gray-600">Nilai Rata-rata</p>
                    </div>
                  </div>
                </div>

                {/* Group Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Informasi Kelompok</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Nama Kelompok:</span>
                      <p className="text-blue-800">{selectedTubes.groupName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Group ID:</span>
                      <p className="text-blue-800">{selectedTubes.groupId}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Dibentuk:</span>
                      <p className="text-blue-800">{new Date('2024-09-15').toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Status:</span>
                      <p className="text-blue-800">Aktif</p>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Anggota Kelompok ({selectedTubes.members.length})</h3>
                  <div className="space-y-4">
                    {selectedTubes.members.map(member => {
                      // Mock additional data for enhanced display
                      const memberData = {
                        ...member,
                        nim: member.isCurrentUser ? '20210001' : `2021000${member.id}`,
                        email: member.isCurrentUser ? 'you@university.ac.id' : `${member.name.toLowerCase().replace(' ', '.')}@university.ac.id`,
                        phone: `08123456789${member.id}`,
                        lastActive: '2024-10-07',
                        contributionScore: member.isCurrentUser ? 95 : 80 + Math.floor(Math.random() * 15),
                        isLeader: member.isCurrentUser
                      };

                      return (
                        <div key={member.id} className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                          member.isCurrentUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                member.isCurrentUser ? 'bg-green-600' : 'bg-gray-600'
                              }`}>
                                {member.name.charAt(0)}
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                                  {member.isCurrentUser && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Saya
                                    </span>
                                  )}
                                  {memberData.isLeader && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                      Leader
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">NIM: {memberData.nim}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {memberData.email}
                                  </span>
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {memberData.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center justify-end mb-1">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="font-semibold">{memberData.contributionScore}</span>
                              </div>
                              <p className="text-xs text-gray-500">Kontribusi Score</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Aktif: {new Date(memberData.lastActive).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>

                          {!member.isCurrentUser && (
                            <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                              <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </button>
                              <button className="flex items-center text-sm text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded hover:bg-green-50 transition-colors">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Group Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Aksi Kelompok</h4>
                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Group Chat
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FileText className="h-4 w-4 mr-2" />
                      Shared Documents
                    </button>
                    <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </button>
                    <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <Settings className="h-4 w-4 mr-2" />
                      Pengaturan
                    </button>
                  </div>
                </div>

                {/* Group Activity Timeline */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-gray-600" />
                    Aktivitas Terbaru
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Alice Johnson</span> menyelesaikan Backend API Development
                        </p>
                        <p className="text-xs text-gray-500">2 hari yang lalu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Anda</span> mengupload Frontend Sprint 1
                        </p>
                        <p className="text-xs text-gray-500">3 hari yang lalu</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Bob Smith</span> menambahkan komentar di group chat
                        </p>
                        <p className="text-xs text-gray-500">5 hari yang lalu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main View - Tubes List
  if (selectedTubes) {
    return (
      <>
        <TubesDetailView />
        {showTaskPreview && <TaskPreview />}
      </>
    );
  }

  // Main Menu View
  return (
    <div className="space-y-6">
      {/* Modal untuk pemilihan kelompok */}
      {showChoiceModal && <GroupChoiceModal />}
      
      {/* Header dengan Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'tugas' ? 'Tugas Besar (Tubes)' : 'Kelompok Saya'}
          </h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'tugas' 
              ? `Kelola project besar dan kerja kelompok untuk ${courseName}`
              : `Informasi dan aktivitas kelompok untuk ${courseName}`
            }
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('tugas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tugas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Tugas Besar ({tubesData.length})
            </button>
            <button
              onClick={() => setActiveTab('kelompok')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kelompok'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Kelompok Saya
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tugas' && (
            <div className="space-y-6">
              {/* Tubes Cards */}
              <div className="grid gap-6">
                {tubesData.map(tubes => {
                  const completedTasks = tubes.hasGroup ? tubes.tasks.filter(t => t.status === 'submitted').length : 0;
                  const totalTasks = tubes.tasks.length;
                  const daysUntilDue = getDaysUntilDue(tubes.deadline);
                  
                  return (
                    <div 
                      key={tubes.id}
                      onClick={() => handleTubesClick(tubes)}
                      className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer group ${
                        !tubes.hasGroup && tubes.requiresGroupSelection 
                          ? 'border-orange-300 bg-orange-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <h3 className="text-xl font-bold text-gray-900">{tubes.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tubes.status)}`}>
                              {getStatusText(tubes.status)}
                            </span>
                            {!tubes.hasGroup && tubes.requiresGroupSelection && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                Pilih Kelompok
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{tubes.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Deadline: {new Date(tubes.deadline).toLocaleDateString('id-ID')}
                            </span>
                            {tubes.hasGroup ? (
                              <>
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {tubes.groupName} ({tubes.members.length} anggota)
                                </span>
                                <span className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {completedTasks}/{totalTasks} tugas selesai
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center text-orange-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Belum memiliki kelompok
                              </span>
                            )}
                            {daysUntilDue > 0 && (
                              <span className="flex items-center text-orange-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {daysUntilDue} hari lagi
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          {tubes.overallGrade && (
                            <div className="bg-green-50 p-3 rounded-lg mb-3">
                              <div className="flex items-center">
                                <Award className="h-5 w-5 text-green-600 mr-1" />
                                <span className="text-lg font-bold text-green-700">{tubes.overallGrade}</span>
                                <span className="text-sm text-green-600 ml-1">/{tubes.maxGrade}</span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">Overall Grade</p>
                            </div>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                      </div>

                      {/* Progress Bar - hanya tampil jika sudah punya kelompok */}
                      {tubes.hasGroup && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-600">{tubes.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${tubes.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Quick Stats atau Group Selection Notice */}
                      {tubes.hasGroup ? (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-700">{completedTasks}</p>
                            <p className="text-xs text-green-600">Selesai</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-lg font-bold text-yellow-700">
                              {tubes.tasks.filter(t => t.status === 'in_progress').length}
                            </p>
                            <p className="text-xs text-yellow-600">Progress</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-700">
                              {tubes.tasks.filter(t => t.status === 'not_started').length}
                            </p>
                            <p className="text-xs text-gray-600">Belum Mulai</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-orange-600" />
                            <div>
                              <h4 className="font-medium text-orange-900">Pilih Kelompok Terlebih Dahulu</h4>
                              <p className="text-sm text-orange-700">
                                {groupChoiceConfig.groups.length} kelompok tersedia • 
                                Deadline: {new Date(groupChoiceConfig.deadline).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Click Indicator */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center text-green-600 font-medium group-hover:text-green-700">
                          {tubes.hasGroup ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              <span className="text-sm">Klik untuk melihat detail tugas dan kelompok</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              <span className="text-sm">Klik untuk memilih kelompok</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {tubesData.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Tugas Besar</h3>
                  <p className="text-gray-500">Tugas besar akan muncul di sini ketika dosen memberikan project.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'kelompok' && (
            <div className="space-y-6">
              {/* All Groups Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tubesData.filter(tubes => tubes.hasGroup).map(tubes => {
                  const completedTasks = tubes.tasks.filter(t => t.status === 'submitted').length;
                  const totalTasks = tubes.tasks.length;
                  const avgGrade = tubes.tasks.filter(t => t.grade).reduce((sum, t) => sum + t.grade, 0) / tubes.tasks.filter(t => t.grade).length || 0;
                  
                  return (
                    <div key={tubes.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all">
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{tubes.groupName}</h4>
                            <p className="text-sm text-gray-600">{tubes.title}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {tubes.members.length} Anggota
                        </span>
                      </div>

                      {/* Group Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-700">{completedTasks}/{totalTasks}</p>
                          <p className="text-xs text-blue-600">Tugas Selesai</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-lg font-bold text-purple-700">{Math.round(avgGrade) || 0}</p>
                          <p className="text-xs text-purple-600">Nilai Rata-rata</p>
                        </div>
                      </div>

                      {/* Members Preview */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Anggota:</p>
                        <div className="flex flex-wrap gap-2">
                          {tubes.members.slice(0, 3).map(member => (
                            <div key={member.id} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {member.name.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-700">
                                {member.isCurrentUser ? 'You' : member.name.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                          {tubes.members.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{tubes.members.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Group Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleTubesClick(tubes)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat Detail
                        </button>
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tubes tanpa kelompok - perlu pemilihan */}
              {tubesData.some(tubes => !tubes.hasGroup && tubes.requiresGroupSelection) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Project Memerlukan Pemilihan Kelompok
                  </h4>
                  <div className="space-y-3">
                    {tubesData.filter(tubes => !tubes.hasGroup && tubes.requiresGroupSelection).map(tubes => (
                      <div key={tubes.id} className="bg-white border border-orange-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">{tubes.title}</h5>
                            <p className="text-sm text-gray-600">{tubes.description}</p>
                            <p className="text-xs text-orange-700 mt-1">
                              Deadline pemilihan: {new Date(groupChoiceConfig.deadline).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleTubesClick(tubes)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                          >
                            Pilih Kelompok
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Aksi Cepat</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center p-4 bg-white border rounded-lg hover:shadow-md transition-all">
                    <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Group Chat</p>
                      <p className="text-sm text-gray-600">Chat dengan semua kelompok</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 bg-white border rounded-lg hover:shadow-md transition-all">
                    <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Schedule Meeting</p>
                      <p className="text-sm text-gray-600">Atur jadwal rapat</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 bg-white border rounded-lg hover:shadow-md transition-all">
                    <FileText className="h-8 w-8 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Shared Docs</p>
                      <p className="text-sm text-gray-600">Akses dokumen bersama</p>
                    </div>
                  </button>
                </div>
              </div>

              {tubesData.filter(tubes => tubes.hasGroup).length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada Kelompok</h3>
                  <p className="text-gray-500">Kelompok akan muncul di sini setelah Anda memilih kelompok untuk project.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TubesMahasiswaManagement;