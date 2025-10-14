import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Eye, UserPlus, UserMinus,
  Shuffle, Save, X, Search, Filter, Download,
  CheckCircle, AlertCircle, Clock, RefreshCw, List
} from 'lucide-react';

const DosenGroupManagement = ({ courseId, courseName = 'Pemrograman Web', taskId = null }) => {
  const [activeView, setActiveView] = useState('list');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTask, setFilterTask] = useState(taskId || 'all');

  // Sample data - akan diganti dengan data dari API
  const tasks = [
    { id: 1, title: 'Sistem E-Commerce', status: 'active' },
    { id: 2, title: 'Database Design Project', status: 'completed' },
    { id: 3, title: 'Mobile App Development', status: 'draft' }
  ];

  const students = [
    { id: 1, npm: '2023001', name: 'Alice Johnson', email: 'alice@student.unpar.ac.id' },
    { id: 2, npm: '2023002', name: 'Bob Smith', email: 'bob@student.unpar.ac.id' },
    { id: 3, npm: '2023003', name: 'Charlie Brown', email: 'charlie@student.unpar.ac.id' },
    { id: 4, npm: '2023004', name: 'Diana Prince', email: 'diana@student.unpar.ac.id' },
    { id: 5, npm: '2023005', name: 'Edward Norton', email: 'edward@student.unpar.ac.id' },
    { id: 6, npm: '2023006', name: 'Fiona Green', email: 'fiona@student.unpar.ac.id' },
    { id: 7, npm: '2023007', name: 'George Wilson', email: 'george@student.unpar.ac.id' },
    { id: 8, npm: '2023008', name: 'Hannah Davis', email: 'hannah@student.unpar.ac.id' },
    { id: 9, npm: '2023009', name: 'Ian Murphy', email: 'ian@student.unpar.ac.id' },
    { id: 10, npm: '2023010', name: 'Julia Roberts', email: 'julia@student.unpar.ac.id' }
  ];

  const groups = [
    {
      id: 1,
      name: 'Kelompok A',
      taskId: 1,
      taskTitle: 'Sistem E-Commerce',
      members: [
        { ...students[0], role: 'leader' },
        { ...students[1], role: 'member' },
        { ...students[2], role: 'member' }
      ],
      status: 'active',
      createdBy: 'dosen',
      createdAt: '2024-10-01',
      scores: {
        proposal: 88,
        progress1: 85,
        progress2: null,
        final: null,
        average: 86.5
      }
    },
    {
      id: 2,
      name: 'Kelompok B',
      taskId: 1,
      taskTitle: 'Sistem E-Commerce',
      members: [
        { ...students[3], role: 'leader' },
        { ...students[4], role: 'member' },
        { ...students[5], role: 'member' },
        { ...students[6], role: 'member' }
      ],
      status: 'active',
      createdBy: 'auto',
      createdAt: '2024-10-01',
      scores: {
        proposal: 92,
        progress1: 89,
        progress2: null,
        final: null,
        average: 90.5
      }
    },
    {
      id: 3,
      name: 'Kelompok A',
      taskId: 2,
      taskTitle: 'Database Design Project',
      members: [
        { ...students[7], role: 'leader' },
        { ...students[8], role: 'member' },
        { ...students[9], role: 'member' }
      ],
      status: 'completed',
      createdBy: 'dosen',
      createdAt: '2024-09-15',
      scores: {
        proposal: 85,
        progress1: 88,
        progress2: 92,
        final: 90,
        average: 88.75
      }
    }
  ];

  // Function to get next group letter for a specific task
  const getNextGroupLetter = (taskId) => {
    const existingGroups = groups.filter(group => group.taskId.toString() === taskId);
    const usedLetters = existingGroups.map(group => {
      const match = group.name.match(/Kelompok ([A-Z])/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // Find the next available letter
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, etc.
      if (!usedLetters.includes(letter)) {
        return letter;
      }
    }
    return 'Z'; // Fallback
  };

  // Function to randomly select a leader from members
  const randomSelectLeader = (members) => {
    if (members.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * members.length);
    return members[randomIndex].id;
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.members.some(member => 
                           member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.npm.includes(searchTerm)
                         );
    const matchesTask = filterTask === 'all' || group.taskId.toString() === filterTask;
    return matchesSearch && matchesTask;
  });

  const GroupList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Kelompok</h2>
          <p className="text-gray-600">{courseName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveView('create-manual')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Buat Manual
          </button>
          <button 
            onClick={() => setActiveView('create-auto')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Shuffle size={20} />
            Buat Otomatis
          </button>
          <button 
            onClick={() => setActiveView('create-student-form')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Users size={20} />
            Form Mahasiswa
          </button>
          <button 
            onClick={() => setActiveView('create-choice')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <List size={20} />
            Buat dari Pilihan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari kelompok atau mahasiswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterTask}
              onChange={(e) => setFilterTask(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tugas</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id.toString()}>{task.title}</option>
              ))}
            </select>
          </div>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6">
        {filteredGroups.map(group => (
          <GroupCard 
            key={group.id} 
            group={group}
            onView={() => {
              setSelectedGroup(group);
              setActiveView('detail');
            }}
            onEdit={() => {
              setSelectedGroup(group);
              setActiveView('edit');
            }}
            onDelete={(id) => {
              console.log('Delete group:', id);
            }}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterTask !== 'all' ? 'Tidak ada kelompok yang sesuai' : 'Belum ada kelompok'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterTask !== 'all' 
              ? 'Coba ubah kata kunci pencarian atau filter'
              : 'Mulai dengan membuat kelompok untuk tugas besar'
            }
          </p>
          {!searchTerm && filterTask === 'all' && (
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={() => setActiveView('create-manual')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Manual
              </button>
              <button 
                onClick={() => setActiveView('create-auto')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Buat Otomatis
              </button>
              <button 
                onClick={() => setActiveView('create-student-form')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Form Mahasiswa
              </button>
              <button 
                onClick={() => setActiveView('create-choice')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Buat dari Pilihan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const GroupCard = ({ group, onView, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <StatusBadge status={group.status} />
            <CreationBadge createdBy={group.createdBy} />
          </div>
          <p className="text-gray-600 mb-4">Tugas: {group.taskTitle}</p>
          
          {/* Members */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Anggota ({group.members.length} orang):</p>
            <div className="flex flex-wrap gap-2">
              {group.members.map(member => (
                <span 
                  key={member.id} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    member.role === 'leader' 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.name} {member.role === 'leader' && '(Ketua)'}
                </span>
              ))}
            </div>
          </div>

          {/* Scores */}
          {group.scores.average && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Nilai:</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{group.scores.average}</p>
                  <p className="text-xs text-gray-500">Rata-rata</p>
                </div>
                <div className="flex gap-2 text-sm">
                  {group.scores.proposal && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      Proposal: {group.scores.proposal}
                    </span>
                  )}
                  {group.scores.progress1 && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                      Progress 1: {group.scores.progress1}
                    </span>
                  )}
                  {group.scores.progress2 && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                      Progress 2: {group.scores.progress2}
                    </span>
                  )}
                  {group.scores.final && (
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                      Final: {group.scores.final}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Dibuat: {group.createdAt}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onView}
            className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={onEdit}
            className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
            title="Edit Kelompok"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(group.id)}
            className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
            title="Hapus Kelompok"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktif', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Selesai', icon: CheckCircle },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const CreationBadge = ({ createdBy }) => {
    const badgeConfig = {
      dosen: { color: 'bg-blue-50 text-blue-700', label: 'Manual' },
      auto: { color: 'bg-purple-50 text-purple-700', label: 'Otomatis' },
      student: { color: 'bg-orange-50 text-orange-700', label: 'Mahasiswa' }
    };

    const config = badgeConfig[createdBy] || badgeConfig.dosen;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const ManualGroupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      taskId: '',
      selectedMembers: [],
      leader: null
    });

    const [availableStudents, setAvailableStudents] = useState(students);

    // Auto-generate group name when task is selected
    useEffect(() => {
      if (formData.taskId) {
        const nextLetter = getNextGroupLetter(formData.taskId);
        setFormData(prev => ({
          ...prev,
          name: `Kelompok ${nextLetter}`
        }));
      }
    }, [formData.taskId]);

    // Auto-select random leader when members change
    useEffect(() => {
      if (formData.selectedMembers.length > 0 && !formData.leader) {
        const randomLeaderId = randomSelectLeader(formData.selectedMembers);
        setFormData(prev => ({
          ...prev,
          leader: randomLeaderId
        }));
      }
    }, [formData.selectedMembers]);

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Manual group form data:', formData);
      setActiveView('list');
    };

    const addMember = (student) => {
      if (!formData.selectedMembers.find(m => m.id === student.id)) {
        setFormData({
          ...formData,
          selectedMembers: [...formData.selectedMembers, student]
        });
        setAvailableStudents(availableStudents.filter(s => s.id !== student.id));
      }
    };

    const removeMember = (studentId) => {
      const member = formData.selectedMembers.find(m => m.id === studentId);
      const newMembers = formData.selectedMembers.filter(m => m.id !== studentId);
      
      setFormData({
        ...formData,
        selectedMembers: newMembers,
        leader: formData.leader === studentId ? (newMembers.length > 0 ? randomSelectLeader(newMembers) : null) : formData.leader
      });
      
      if (member) {
        setAvailableStudents([...availableStudents, member]);
      }
    };

    const shuffleLeader = () => {
      if (formData.selectedMembers.length > 0) {
        const newLeader = randomSelectLeader(formData.selectedMembers);
        setFormData({ ...formData, leader: newLeader });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Kelompok Manual</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kelompok *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Akan terisi otomatis setelah pilih tugas"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Nama akan di-generate otomatis berdasarkan alfabet per tugas</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugas Besar *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Tugas Besar</option>
                {tasks.filter(task => task.status === 'active').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Students */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mahasiswa Tersedia</h3>
              <div className="border border-gray-200 rounded-lg p-4 h-80 overflow-y-auto">
                {availableStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.npm}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMember(student)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
                {availableStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Semua mahasiswa sudah dipilih</p>
                )}
              </div>
            </div>

            {/* Selected Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Anggota Kelompok ({formData.selectedMembers.length})
                </h3>
                {formData.selectedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={shuffleLeader}
                    className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                    title="Acak Ketua"
                  >
                    <RefreshCw size={12} />
                    Acak Ketua
                  </button>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg p-4 h-80 overflow-y-auto">
                {formData.selectedMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.npm}</p>
                      {formData.leader === member.id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Ketua</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, leader: member.id })}
                        className={`text-xs px-2 py-1 rounded ${
                          formData.leader === member.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Ketua
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.selectedMembers.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Pilih mahasiswa dari kolom sebelah</p>
                )}
              </div>
            </div>
          </div>

          {formData.selectedMembers.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Info Kelompok</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Nama: {formData.name}</li>
                <li>• Anggota: {formData.selectedMembers.length} orang</li>
                <li>• Ketua: {formData.leader ? formData.selectedMembers.find(m => m.id === formData.leader)?.name : 'Belum dipilih'}</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={formData.selectedMembers.length === 0 || !formData.leader}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buat Kelompok
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AutoGroupForm = () => {
    const [formData, setFormData] = useState({
      taskId: '',
      groupSize: 4,
      groupCount: 0,
      distribution: 'equal'
    });

    const [previewGroups, setPreviewGroups] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const calculateGroups = () => {
      const totalStudents = students.length;
      const baseGroups = Math.floor(totalStudents / formData.groupSize);
      setFormData({ ...formData, groupCount: baseGroups });
    };

    const generatePreview = () => {
      if (!formData.taskId) return;
      
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
      const groups = [];
      const totalStudents = shuffledStudents.length;
      const baseGroupSize = formData.groupSize;
      const remainder = totalStudents % baseGroupSize;
      const baseGroupCount = Math.floor(totalStudents / baseGroupSize);
      
      for (let i = 0; i < baseGroupCount; i++) {
        const startIndex = i * baseGroupSize;
        const endIndex = startIndex + baseGroupSize;
        const groupMembers = shuffledStudents.slice(startIndex, endIndex);
        
        const nextLetter = String.fromCharCode(65 + i);
        groups.push({
          name: `Kelompok ${nextLetter}`,
          members: groupMembers,
          leader: groupMembers[Math.floor(Math.random() * groupMembers.length)]
        });
      }
      
      if (remainder > 0) {
        const remainingStudents = shuffledStudents.slice(baseGroupCount * baseGroupSize);
        
        remainingStudents.forEach((student, index) => {
          const targetGroupIndex = index % groups.length;
          groups[targetGroupIndex].members.push(student);
        });
      }
      
      setFormData(prev => ({ ...prev, groupCount: groups.length }));
      setPreviewGroups(groups);
      setShowPreview(true);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Auto group form data:', formData, previewGroups);
      setActiveView('list');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Kelompok Otomatis</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugas Besar *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Tugas Besar</option>
                {tasks.filter(task => task.status === 'active').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Anggota
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={formData.groupSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setFormData({ ...formData, groupSize: size });
                  setShowPreview(false);
                }}
                onBlur={calculateGroups}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Distribusi
              </label>
              <select
                value={formData.distribution}
                onChange={(e) => {
                  setFormData({ ...formData, distribution: e.target.value });
                  setShowPreview(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="equal">Distribusi Merata</option>
                <option value="random">Acak Penuh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimasi Jumlah Kelompok
              </label>
              <input
                type="number"
                value={formData.groupCount}
                onChange={(e) => {
                  setFormData({ ...formData, groupCount: parseInt(e.target.value) });
                  setShowPreview(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Informasi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Total mahasiswa: {students.length} orang</li>
              <li>• Ukuran kelompok: {formData.groupSize} orang per kelompok</li>
              <li>• Jumlah kelompok: {Math.floor(students.length / formData.groupSize)} kelompok</li>
              <li>• Nama kelompok: A, B, C, dst. (auto-generate)</li>
              <li>• Ketua: Dipilih secara acak dari setiap kelompok</li>
              <li>• Sisa mahasiswa: {students.length % formData.groupSize} orang 
                {students.length % formData.groupSize > 0 && 
                  ` (akan didistribusikan ke ${Math.min(students.length % formData.groupSize, Math.floor(students.length / formData.groupSize))} kelompok pertama)`
                }
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={generatePreview}
              disabled={!formData.taskId || formData.groupSize < 2}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Shuffle size={16} />
              Generate Preview
            </button>
          </div>

          {showPreview && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Preview Kelompok</h4>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {previewGroups.map((group, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium mb-2">{group.name} ({group.members.length} anggota)</h5>
                    <div className="flex flex-wrap gap-2">
                      {group.members.map(member => (
                        <span 
                          key={member.id}
                          className={`px-2 py-1 rounded text-sm ${
                            member.id === group.leader.id 
                              ? 'bg-blue-100 text-blue-800 font-medium' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {member.name} {member.id === group.leader.id && '(Ketua)'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!showPreview || previewGroups.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buat Kelompok
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StudentFormCreation = () => {
    const [formData, setFormData] = useState({
      taskId: '',
      minMembers: 3,
      maxMembers: 5,
      deadline: ''
    });

    const handleSubmit = () => {
      console.log('Student form creation:', formData);
      alert('Form berhasil dibuat! Link form akan dikirim ke semua mahasiswa di mata kuliah ini.');
      setActiveView('list');
    };

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Form Kelompok untuk Mahasiswa</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Info</h4>
                <p className="text-sm text-blue-800">
                  Form ini akan dikirim ke <strong>semua mahasiswa</strong> yang terdaftar di mata kuliah ini ({students.length} mahasiswa). 
                  Mahasiswa dapat membentuk kelompok sendiri sesuai konfigurasi yang Anda tentukan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugas Besar *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Tugas Besar</option>
                {tasks.filter(task => task.status === 'active').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Pengisian *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimal Anggota *
              </label>
              <input
                type="number"
                min="2"
                max={formData.maxMembers}
                value={formData.minMembers}
                onChange={(e) => setFormData({ ...formData, minMembers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimal Anggota *
              </label>
              <input
                type="number"
                min={formData.minMembers}
                max="10"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">Ringkasan</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Total mahasiswa: <strong>{students.length} orang</strong></li>
              <li>• Ukuran kelompok: <strong>{formData.minMembers} - {formData.maxMembers} anggota</strong></li>
              <li>• Deadline: <strong>{formData.deadline ? new Date(formData.deadline).toLocaleString('id-ID') : '-'}</strong></li>
            </ul>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.taskId || !formData.deadline}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              Buat Form & Kirim ke Semua Mahasiswa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GroupChoiceForm = () => {
    const [formData, setFormData] = useState({
      taskId: '',
      groupCount: 5,
      minCapacity: 7,
      maxCapacity: 8,
      deadline: '',
      allowMove: false
    });

    const [generatedGroups, setGeneratedGroups] = useState([]);

    const generateGroups = () => {
      const groups = [];
      for (let i = 0; i < formData.groupCount; i++) {
        const letter = String.fromCharCode(65 + i);
        groups.push({
          name: `Kelompok ${letter}`,
          capacity: `${formData.minCapacity}-${formData.maxCapacity}`,
          currentMembers: 0,
          members: []
        });
      }
      setGeneratedGroups(groups);
    };

    useEffect(() => {
      if (formData.groupCount > 0) {
        generateGroups();
      }
    }, [formData.groupCount, formData.minCapacity, formData.maxCapacity]);

    const handleSubmit = () => {
      console.log('Group choice form:', formData, generatedGroups);
      alert('Pilihan kelompok berhasil dibuat! Mahasiswa sekarang dapat memilih kelompok mereka.');
      setActiveView('list');
    };

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Kelompok dari Pilihan</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Sistem Pilihan Kelompok</h4>
                <p className="text-sm text-orange-800">
                  Anda akan membuat beberapa slot kelompok kosong. Mahasiswa dapat memilih sendiri kelompok mana yang ingin mereka masuki (seperti polling/voting).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugas Besar *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Tugas Besar</option>
                {tasks.filter(task => task.status === 'active').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Kelompok *
              </label>
              <input
                type="number"
                min="2"
                max="26"
                value={formData.groupCount}
                onChange={(e) => setFormData({ ...formData, groupCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Kelompok akan diberi nama A, B, C, dst.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapasitas Minimal *
              </label>
              <input
                type="number"
                min="2"
                max={formData.maxCapacity}
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapasitas Maksimal *
              </label>
              <input
                type="number"
                min={formData.minCapacity}
                max="15"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Pemilihan *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMove}
                onChange={(e) => setFormData({ ...formData, allowMove: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Izinkan mahasiswa pindah kelompok sebelum deadline</span>
            </label>
          </div>

          {generatedGroups.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Preview Kelompok yang Akan Dibuat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedGroups.map((group, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{group.name}</h4>
                    <p className="text-sm text-gray-600">
                      Kapasitas: {group.capacity} anggota
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mahasiswa: 0/{formData.maxCapacity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Ringkasan</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Total mahasiswa: {students.length} orang</li>
              <li>• Jumlah kelompok: {formData.groupCount} kelompok</li>
              <li>• Kapasitas per kelompok: {formData.minCapacity}-{formData.maxCapacity} anggota</li>
              <li>• Total kapasitas: {formData.groupCount * formData.maxCapacity} tempat</li>
              <li>• Deadline: {formData.deadline ? new Date(formData.deadline).toLocaleString('id-ID') : '-'}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.taskId || !formData.deadline}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={20} />
              Buat & Aktifkan Pilihan
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render based on active view
  switch (activeView) {
    case 'create-manual':
      return <ManualGroupForm />;
    case 'create-auto':
      return <AutoGroupForm />;
    case 'create-student-form':
      return <StudentFormCreation />;
    case 'create-choice':
      return <GroupChoiceForm />;
    default:
      return <GroupList />;
  }
};

export default DosenGroupManagement;