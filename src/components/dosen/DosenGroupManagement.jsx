import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Eye, UserPlus, UserMinus,
  Shuffle, Save, X, Search, Filter, Download,
  CheckCircle, AlertCircle, Clock, RefreshCw, List
} from 'lucide-react';
import { getTugasBesar } from '../../utils/tugasBesarApi';
import { 
  getKelompok, 
  getMahasiswaForGrouping, 
  createManualGroup, 
  createAutomaticGroups, 
  enableStudentChoice, 
  deleteKelompok 
} from '../../utils/kelompokApi';

const DosenGroupManagement = ({ courseId, classId, courseName = 'Pemrograman Web', className = '', selectedTaskId = null, selectedTaskTitle = 'Tugas Besar' }) => {const [activeView, setActiveView] = useState(selectedTaskId ? 'list' : 'task-list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Fixed task state
  const [currentTaskId, setCurrentTaskId] = useState(selectedTaskId);
  const [currentTaskTitle, setCurrentTaskTitle] = useState(selectedTaskTitle);
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Notification Modal State
  const [notification, setNotification] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showCancel: false
  });

  // Notification Helper Functions
  const showNotification = (type, title, message, options = {}) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      onConfirm: options.onConfirm || (() => setNotification(prev => ({...prev, show: false}))),
      onCancel: options.onCancel || null,
      showCancel: options.showCancel || false
    });
  };

  const showSuccess = (title, message, options = {}) => showNotification('success', title, message, options);
  const showError = (title, message, options = {}) => showNotification('error', title, message, options);
  const showWarning = (title, message, options = {}) => showNotification('warning', title, message, options);
  const showInfo = (title, message, options = {}) => showNotification('info', title, message, options);
  
  const showConfirm = (title, message, onConfirm, onCancel = null) => {
    showNotification('warning', title, message, {
      onConfirm,
      onCancel: onCancel || (() => setNotification(prev => ({...prev, show: false}))),
      showCancel: true
    });
  };

  // Set selectedTask if coming from props
  useEffect(() => {
    if (selectedTaskId && selectedTaskTitle && tasks.length > 0) {
      const task = tasks.find(t => t.id.toString() === selectedTaskId.toString());
      if (task) {
        setSelectedTask(task);
      } else {
        const basicTask = {
          id: selectedTaskId,
          title: selectedTaskTitle,
          status: 'active'
        };
        setSelectedTask(basicTask);
      }
    }
  }, [selectedTaskId, selectedTaskTitle, tasks]);

  // Group Member Validation Functions
  const validateGroupSize = (memberCount, minSize = 2, maxSize = 4) => {
    return {
      isValid: memberCount >= minSize && memberCount <= maxSize,
      isUnderMin: memberCount < minSize,
      isOverMax: memberCount > maxSize,
      needsMore: minSize - memberCount,
      exceedsBy: memberCount - maxSize
    };
  };

  const getGroupSizeMessage = (memberCount, minSize = 2, maxSize = 4) => {
    if (memberCount < minSize) {
      return `Kelompok terlalu kecil (${memberCount} anggota)`;
    }
    if (memberCount > maxSize) {
      return `Kelompok terlalu besar (${memberCount} anggota)`;
    }
    return `Kelompok valid (${memberCount} anggota)`;
  };

  // Load initial data
  useEffect(() => {loadTasks();
    // Only load students when we have a valid currentTaskId
    if (currentTaskId) {
      loadStudents();
    }
  }, [courseId, classId, currentTaskId]);

  useEffect(() => {
    if (currentTaskId) {
      loadGroups();
      loadStudents(); // Also load students when task changes
    }
  }, [currentTaskId]);

  const loadTasks = async () => {// Add safety check for courseId
    if (!courseId) {setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getTugasBesar(courseId, classId);
      
      if (response && response.success) {
        setTasks(response.data || response.tugasBesar || []);
      } else if (response && (response.data || response.tugasBesar)) {
        // Sometimes API returns data directly without success flag
        setTasks(response.data || response.tugasBesar || []);
      } else {
        // Set empty array instead of showing error for better UX
        setTasks([]);
        showError('Error', 'Gagal memuat daftar tugas besar');
      }
    } catch (error) {
      console.error('💥 Error loading tasks:', error);
      // Set empty array instead of keeping loading
      setTasks([]);
      showError('Error', 'Gagal memuat daftar tugas besar: ' + error.message);
    } finally {setLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!currentTaskId) {
      return;
    }
    
    try {
      setLoadingGroups(true);
      
      const response = await getKelompok(currentTaskId);
      // Handle both response formats
      if (response && (response.success || Array.isArray(response))) {
        // If response has success flag, use response.data
        // If response is an array (old format), use it directly
        const groupsData = response.success ? response.data : response;
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } else {setGroups([]);
        showError('Error', 'Gagal memuat daftar kelompok: Format respons tidak valid');
      }
    } catch (error) {
      console.error('💥 loadGroups: Error:', error);
      setGroups([]);
      showError('Error', 'Gagal memuat daftar kelompok: ' + error.message);
    } finally {setLoadingGroups(false);
    }
  };

  const loadStudents = async () => {
    if (!currentTaskId) {
      return;
    }
    
    try {
      const response = await getMahasiswaForGrouping(currentTaskId);
      // Handle both response formats
      if (response && (response.success || Array.isArray(response))) {
        // If response has success flag, use response.mahasiswa or response.data
        // If response is an array (old format), use it directly
        const studentsData = response.success 
          ? (response.mahasiswa || response.data) 
          : response;
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        
        // Don't show error if students array is empty - this is normal when all students are assigned
        if (!Array.isArray(studentsData) || studentsData.length === 0) {}
      } else {setStudents([]);
        // Don't show error for null or undefined response - might be empty data
        if (response !== null && response !== undefined) {
          showError('Error', 'Gagal memuat daftar mahasiswa: Format respons tidak valid');
        }
      }
    } catch (error) {
      console.error('💥 loadStudents: Error:', error);
      setStudents([]);
      
      // Only show error for actual network/server errors, not for empty results
      if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
        showError('Error', 'Gagal memuat daftar mahasiswa: ' + error.message);
      } else {}
    }
  };

  // Helper functions for group creation
  const getAvailableStudentsForTask = (taskId) => {
    // Fix field mapping untuk taskId
    const taskGroups = groups.filter(group => {
      const groupTaskId = group.taskId || group.tugas_besar_id;
      return groupTaskId && groupTaskId.toString() === taskId.toString();
    });
    
    const assignedStudentIds = taskGroups.flatMap(group => {
      const members = group.members || [];
      return members.map(member => member.id);
    });
    
    return students.filter(student => !assignedStudentIds.includes(student.id));
  };

  const getNextGroupLetter = (taskId) => {
    // Fix field mapping untuk taskId dan nama kelompok
    const taskGroups = groups.filter(group => {
      const groupTaskId = group.taskId || group.tugas_besar_id;
      return groupTaskId && groupTaskId.toString() === taskId.toString();
    });
    
    const usedLetters = taskGroups.map(group => {
      const groupName = group.name || group.nama_kelompok || '';
      const match = groupName.match(/Kelompok ([A-Z])/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      if (!usedLetters.includes(letter)) {
        return letter;
      }
    }
    return 'A';
  };

  const randomSelectLeader = (members) => {
    if (members.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * members.length);
    return members[randomIndex].id;
  };

  // Manual Group Creation Handler
  const handleCreateManualGroup = async (formData) => {
    try {
      const response = await createManualGroup(formData);
      
      if (response.success) {
        showSuccess('Berhasil', 'Kelompok berhasil dibuat');
        setActiveView('list');
        await loadGroups();
      } else {
        showError('Error', response.message || 'Gagal membuat kelompok');
      }
    } catch (error) {
      console.error('Error creating manual group:', error);
      showError('Error', 'Gagal membuat kelompok: ' + error.message);
    }
  };

  // Delete Group Handler
  const handleDeleteGroup = async (groupId) => {
    try {
      const response = await deleteKelompok(groupId);
      if (response.success) {
        showSuccess('Berhasil', 'Kelompok berhasil dihapus');
        await loadGroups();
      } else {
        showError('Error', response.message || 'Gagal menghapus kelompok');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      showError('Error', 'Gagal menghapus kelompok');
    }
  };

  // Manual Group Form Component
  const ManualGroupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      selectedMembers: [],
      leader: null
    });

    const [availableStudents, setAvailableStudents] = useState([]);

    // Update available students based on current task
    useEffect(() => {
      if (currentTaskId) {
        const available = getAvailableStudentsForTask(currentTaskId);
        setAvailableStudents(available);
        
        // Clear selected members if any of them are now unavailable
        const validMembers = formData.selectedMembers.filter(member => 
          available.some(student => student.id === member.id)
        );
        
        if (validMembers.length !== formData.selectedMembers.length) {
          setFormData(prev => ({
            ...prev,
            selectedMembers: validMembers,
            leader: validMembers.find(m => m.id === prev.leader) ? prev.leader : null
          }));
        }
      }
    }, [currentTaskId, groups, students]);

    // Auto-generate group name when component loads
    useEffect(() => {
      if (currentTaskId) {
        const nextLetter = getNextGroupLetter(currentTaskId);
        setFormData(prev => ({
          ...prev,
          name: `Kelompok ${nextLetter}`
        }));
      }
    }, [currentTaskId]);

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
      e.preventDefault();// Create form data with current task ID and member IDs
      const submitData = {
        taskId: currentTaskId,
        name: formData.name,
        members: formData.selectedMembers.map(member => member.id),
        leaderId: formData.leader
      };// Basic validation
      if (!formData.name || !currentTaskId || formData.selectedMembers.length === 0 || formData.leader === null || formData.leader === undefined) {showError(
          'Data Tidak Lengkap',
          'Harap lengkapi semua field yang diperlukan: nama kelompok, anggota, dan ketua kelompok.'
        );
        return;
      }
      
      // Group size validation - STRICT enforcement
      const minSize = selectedTask?.minGroupSize || 2;
      const maxSize = selectedTask?.maxGroupSize || 4;
      const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
      
      if (!validation.isValid) {
        const message = getGroupSizeMessage(formData.selectedMembers.length, minSize, maxSize);
        
        if (validation.isUnderMin) {
          showError(
            'Ukuran Kelompok Tidak Valid',
            `${message}. Kelompok minimal harus memiliki ${minSize} anggota. Tambahkan ${validation.needsMore} anggota lagi.`
          );
          return; // BLOCK creation
        }
        
        if (validation.isOverMax) {
          showError(
            'Ukuran Kelompok Melebihi Batas',
            `${message}. Kelompok maksimal hanya boleh ${maxSize} anggota. Kurangi ${validation.exceedsBy} anggota.`
          );
          return; // BLOCK creation
        }
      }handleCreateManualGroup(submitData);
    };

    const addMember = (student) => {
      // Check max size before adding
      const maxSize = selectedTask?.maxGroupSize || 4;
      if (formData.selectedMembers.length >= maxSize) {
        showWarning(
          'Batas Maksimal Tercapai',
          `Kelompok sudah mencapai batas maksimal ${maxSize} anggota. Tidak dapat menambah anggota lagi.`
        );
        return;
      }
      
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
        leader: formData.leader === studentId ? null : formData.leader
      });
      
      if (member) {
        setAvailableStudents([...availableStudents, member].sort((a, b) => a.name.localeCompare(b.name)));
      }
    };

    const shuffleLeader = () => {
      const randomLeaderId = randomSelectLeader(formData.selectedMembers);
      setFormData({
        ...formData,
        leader: randomLeaderId
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali ke Manajemen Kelompok
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Kelompok Manual</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          {/* Header Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Membuat Kelompok untuk: {currentTaskTitle}
                  {className && <span className="text-blue-700"> - {className}</span>}
                </h4>
                <p className="text-sm text-blue-700">
                  Tambahkan mahasiswa dari {className || `kelas ID ${classId}`} dan tentukan ketua kelompok
                </p>
                {classId && (
                  <p className="text-xs text-blue-600 mt-1">
                    Hanya mahasiswa dari kelas ini yang dapat ditambahkan ke kelompok
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kelompok *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama kelompok akan otomatis di-generate"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nama akan di-generate otomatis berdasarkan alfabet per tugas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Students */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mahasiswa Tersedia</h3>
                  <div className="text-sm text-gray-500">
                    {availableStudents.length} dari {students.length} tersedia
                  </div>
                </div>
                
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
                  
                  {availableStudents.length === 0 && students.length > 0 && (
                    <div className="text-center py-8">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                          <AlertCircle className="text-yellow-600 mr-2" size={20} />
                          <p className="font-medium text-yellow-800">Tidak Ada Mahasiswa Tersedia</p>
                        </div>
                        <p className="text-yellow-700 text-sm">
                          Semua mahasiswa ({students.length}) sudah tergabung dalam kelompok lain untuk tugas ini.
                        </p>
                        <p className="text-yellow-600 text-xs mt-2">
                          Hapus kelompok yang ada atau tambahkan mahasiswa baru ke mata kuliah untuk membuat kelompok baru.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {availableStudents.length === 0 && students.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-2">
                          <AlertCircle className="text-red-600 mr-2" size={20} />
                          <p className="font-medium text-red-800">Tidak Ada Data Mahasiswa</p>
                        </div>
                        <p className="text-red-700 text-sm">
                          Belum ada mahasiswa yang terdaftar di mata kuliah ini.
                        </p>
                        <p className="text-red-600 text-xs mt-2">
                          Pastikan mahasiswa sudah mendaftar ke mata kuliah ini terlebih dahulu.
                        </p>
                      </div>
                    </div>
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

            {/* Debug Info */}
            {formData.selectedMembers.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Info Kelompok</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Nama: {formData.name}</li>
                  <li>• Anggota: {formData.selectedMembers.length} orang</li>
                  <li>• Ketua: {formData.leader !== null && formData.leader !== undefined ? formData.selectedMembers.find(m => m.id === formData.leader)?.name || `ID: ${formData.leader}` : 'Belum dipilih'}</li>
                  <li>• Task ID: {currentTaskId || 'Tidak ada'}</li>
                </ul>
                <div className="mt-2 text-xs text-blue-600">
                  Debug: Leader ID = {JSON.stringify(formData.leader)}, Current Task = {JSON.stringify(currentTaskId)}
                </div>
              </div>
            )}

            {/* Enhanced Debug info untuk status tombol submit dan info mahasiswa */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-gray-700">
              <strong>🐛 Debug Status Submit:</strong><br/>
              • Nama: {formData.name ? '✅ Ada' : '❌ Kosong'} ("{formData.name}")<br/>
              • Anggota: {formData.selectedMembers.length > 0 ? '✅ Ada' : '❌ Kosong'} ({formData.selectedMembers.length} mahasiswa)<br/>
              • Ketua: {formData.leader !== null && formData.leader !== undefined ? '✅ Dipilih' : '❌ Belum dipilih'} (ID: {JSON.stringify(formData.leader)})<br/>
              • Task: {currentTaskId ? '✅ Ada' : '❌ Kosong'} (ID: {currentTaskId || 'undefined'})<br/>
              • <strong>Validasi Ukuran: {(() => {
                const minSize = selectedTask?.minGroupSize || 2;
                const maxSize = selectedTask?.maxGroupSize || 4;
                const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
                return validation.isValid ? '✅ Valid' : `❌ ${validation.isUnderMin ? 'Kurang' : 'Kelebihan'} ${validation.isUnderMin ? validation.needsMore : validation.exceedsBy}`;
              })()}</strong><br/>
              • <strong>Total Mahasiswa: {students.length} | Tersedia: {availableStudents.length}</strong><br/>
              • <strong>Tombol Submit: {(() => {
                const minSize = selectedTask?.minGroupSize || 2;
                const maxSize = selectedTask?.maxGroupSize || 4;
                const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
                const basicValid = formData.selectedMembers.length > 0 && formData.leader !== null && formData.leader !== undefined && formData.name && currentTaskId;
                return (basicValid && validation.isValid) ? '🟢 ENABLED' : '🔒 DISABLED';
              })()}</strong>
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
                type="submit"
                disabled={(() => {
                  const minSize = selectedTask?.minGroupSize || 2;
                  const maxSize = selectedTask?.maxGroupSize || 4;
                  const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
                  const basicInvalid = formData.selectedMembers.length === 0 || formData.leader === null || formData.leader === undefined || !formData.name || !currentTaskId;
                  return basicInvalid || !validation.isValid;
                })()}
                className={`px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2 ${
                  (() => {
                    const minSize = selectedTask?.minGroupSize || 2;
                    const maxSize = selectedTask?.maxGroupSize || 4;
                    const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
                    const basicValid = formData.selectedMembers.length > 0 && formData.leader !== null && formData.leader !== undefined && formData.name && currentTaskId;
                    
                    if (!basicValid) {
                      return 'bg-gray-400 text-gray-200';
                    }
                    
                    if (!validation.isValid) {
                      return 'bg-red-500 text-white cursor-not-allowed';
                    }
                    
                    return 'bg-blue-600 text-white hover:bg-blue-700';
                  })()
                }`}
              >
                {(() => {
                  const minSize = selectedTask?.minGroupSize || 2;
                  const maxSize = selectedTask?.maxGroupSize || 4;
                  const validation = validateGroupSize(formData.selectedMembers.length, minSize, maxSize);
                  const basicValid = formData.selectedMembers.length > 0 && formData.leader !== null && formData.leader !== undefined && formData.name && currentTaskId;
                  
                  if (formData.selectedMembers.length === 0) {
                    return 'Pilih Anggota Dulu';
                  }
                  
                  if (!basicValid) {
                    return 'Data Tidak Lengkap';
                  }
                  
                  if (validation.isUnderMin) {
                    return (
                      <>
                        <AlertCircle size={16} />
                        Kurang {validation.needsMore} Anggota
                      </>
                    );
                  }
                  
                  if (validation.isOverMax) {
                    return (
                      <>
                        <AlertCircle size={16} />
                        Kelebihan {validation.exceedsBy} Anggota
                      </>
                    );
                  }
                  
                  return (
                    <>
                      <CheckCircle size={16} />
                      Buat Kelompok
                    </>
                  );
                })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Notification Modal Component
  const NotificationModal = () => {
    if (!notification.show) return null;

    const typeStyles = {
      success: 'text-green-800 bg-green-50 border-green-200',
      error: 'text-red-800 bg-red-50 border-red-200',
      warning: 'text-yellow-800 bg-yellow-50 border-yellow-200',
      info: 'text-blue-800 bg-blue-50 border-blue-200'
    };

    const iconStyles = {
      success: <CheckCircle className="text-green-600" size={24} />,
      error: <AlertCircle className="text-red-600" size={24} />,
      warning: <AlertCircle className="text-yellow-600" size={24} />,
      info: <AlertCircle className="text-blue-600" size={24} />
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className={`p-6 border-l-4 ${typeStyles[notification.type]}`}>
            <div className="flex items-start gap-4">
              {iconStyles[notification.type]}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{notification.title}</h3>
                <p className="text-sm mt-2">{notification.message}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
            {notification.showCancel && (
              <button
                onClick={notification.onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
            )}
            <button
              onClick={notification.onConfirm}
              className={`px-4 py-2 rounded-lg transition-colors text-white ${
                notification.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                notification.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {notification.showCancel ? 'Ya' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Task Selection Component
  const TaskListView = () => {
    // Add error boundary for safer rendering
    if (!Array.isArray(tasks)) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat tugas...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pilih Tugas untuk Kelola Kelompok
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {className ? `${className} - ${courseName}` : courseName} | Class ID: {classId} | Course ID: {courseId}
            </p>
            {classId && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📚 Menampilkan tugas besar khusus untuk kelas {className || classId}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Semua tugas dan kelompok di halaman ini terisolasi per kelas sesuai sistem class-specific yang telah diimplementasikan.
                </p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat tugas...</p>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada tugas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Buat tugas terlebih dahulu sebelum mengelola kelompok
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Debug Info:</strong><br/>
                CourseId: {courseId}<br/>
                Tasks loaded: {tasks ? tasks.length : 'null'}<br/>
                Loading: {loading ? 'true' : 'false'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map(task => {
              try {
                return (
                  <div key={task.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.judul || task.title || 'Untitled Task'}</h3>
                          <p className="text-gray-600 text-sm mb-4">{task.deskripsi || task.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Tanggal: {
                                task.tanggal_mulai || task.startDate ? 
                                new Date(task.tanggal_mulai || task.startDate).toLocaleDateString() : 
                                'TBD'
                              } - {
                                task.tanggal_selesai || task.endDate ? 
                                new Date(task.tanggal_selesai || task.endDate).toLocaleDateString() : 
                                'TBD'
                              }
                            </span>
                            <span>Min: {task.min_group_size || task.minGroupSize || 2} | Max: {task.max_group_size || task.maxGroupSize || 4}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setCurrentTaskId(task.id);
                              setCurrentTaskTitle(task.judul || task.title || 'Untitled Task');
                              setSelectedTask(task);
                              setActiveView('list');
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Users size={16} />
                            Kelola Kelompok
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error('Error rendering task:', task, error);
                return (
                  <div key={task.id || Math.random()} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error loading task data</p>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  // Group List View Component
  const GroupListView = () => {
    // Fix field mapping - API mengembalikan tugas_besar_id, bukan taskId
    const taskGroups = groups.filter(group => {
      const groupTaskId = group.taskId || group.tugas_besar_id;
      return groupTaskId && groupTaskId.toString() === currentTaskId.toString();
    });
    
    const filteredGroups = taskGroups.filter(group => {
      const groupName = group.name || group.nama_kelompok || '';
      const members = group.members || [];
      
      return groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        members.some(member => 
          member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });// Get group formation method from selected task
    const groupFormation = selectedTask?.groupFormation || selectedTask?.grouping_method || 'manual';// Determine available buttons based on group formation method
    const getAvailableGroupActions = () => {
      switch (groupFormation) {
        case 'manual':
          return [
            { 
              key: 'manual', 
              label: 'Buat Manual', 
              icon: Plus, 
              action: () => setActiveView('create-manual'),
              className: 'bg-blue-600 text-white hover:bg-blue-700'
            }
          ];
        case 'automatic':
        case 'auto':
          return [
            { 
              key: 'auto', 
              label: 'Buat Otomatis', 
              icon: Shuffle, 
              action: () => setActiveView('create-auto'),
              className: 'bg-green-600 text-white hover:bg-green-700'
            }
          ];
        case 'student_choice':
        case 'student-choice':
          return [
            { 
              key: 'enable-choice', 
              label: 'Aktifkan Pilihan Mahasiswa', 
              icon: Users, 
              action: () => setActiveView('enable-student-choice'),
              className: 'bg-purple-600 text-white hover:bg-purple-700'
            }
          ];
        default:
          // Fallback: show all options if method unclear
          return [
            { 
              key: 'manual', 
              label: 'Buat Manual', 
              icon: Plus, 
              action: () => setActiveView('create-manual'),
              className: 'bg-blue-600 text-white hover:bg-blue-700'
            },
            { 
              key: 'auto', 
              label: 'Buat Otomatis', 
              icon: Shuffle, 
              action: () => setActiveView('create-auto'),
              className: 'bg-green-600 text-white hover:bg-green-700'
            }
          ];
      }
    };

    const availableActions = getAvailableGroupActions();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manajemen Kelompok - {currentTaskTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {className ? `${className} - ${courseName}` : courseName} | 
              Sistem Pemilihan: <span className="font-medium capitalize">
                {groupFormation === 'manual' ? 'Manual (Dosen)' : 
                 groupFormation === 'automatic' || groupFormation === 'auto' ? 'Otomatis (Sistem)' : 
                 groupFormation === 'student_choice' || groupFormation === 'student-choice' ? 'Pilihan Mahasiswa' : 
                 'Tidak Diketahui'}
              </span>
            </p>
            {classId && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>👥 Kelompok untuk {className || `Kelas ID ${classId}`} - {currentTaskTitle}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Kelompok yang ditampilkan terisolasi khusus untuk kelas ini. Mahasiswa dari kelas lain tidak akan terlihat di sini.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {availableActions.map(action => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={action.action}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${action.className}`}
                >
                  <IconComponent size={20} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari kelompok atau nama mahasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {loadingGroups ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat kelompok...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kelompok</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mulai dengan membuat kelompok manual atau otomatis
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredGroups.map(group => {
              // Handle field mapping untuk compatibility
              const groupName = group.name || group.nama_kelompok || 'Kelompok Tanpa Nama';
              const groupMembers = group.members || [];
              const groupLeaderId = group.leaderId || group.leader_id;return (
                <div key={group.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {groupMembers.length} anggota
                          </span>
                          {group.creation_method && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              group.creation_method === 'manual' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {group.creation_method === 'manual' ? 'Manual' : 'Otomatis'}
                            </span>
                          )}
                        </div>
                        
                        {/* Tampilkan hanya ketua kelompok */}
                        <div className="space-y-2">
                          {(() => {
                            const leader = groupMembers.find(member => 
                              groupLeaderId === member.id || member.role === 'leader'
                            );
                            
                            if (leader) {
                              return (
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">Ketua : </span>
                                  <span>{leader.name}</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">Ketua : </span>
                                  <span className="italic">Belum ditentukan</span>
                                </div>
                              );
                            }
                          })()}
                          
                          {/* Info ringkas anggota lainnya */}
                          {groupMembers.length > 1 && (
                            <div className="text-xs text-gray-500 mt-2">
                              <Users size={12} className="inline mr-1" />
                              <span>{groupMembers.length - 1} anggota lainnya</span>
                            </div>
                          )}
                          
                          {/* Tanggal dibuat */}
                          {(group.created_at || group.createdAt) && (
                            <div className="text-xs text-gray-400 mt-2">
                              <Clock size={12} className="inline mr-1" />
                              <span>Dibuat {new Date(group.created_at || group.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                          }}
                          className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
                          title="Lihat Detail Kelompok"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                        <button
                          onClick={() => {
                            showConfirm(
                              'Konfirmasi Hapus',
                              `Apakah Anda yakin ingin menghapus kelompok "${groupName}"? Tindakan ini tidak dapat dibatalkan.`,
                              () => handleDeleteGroup(group.id)
                            );
                          }}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                          title="Hapus Kelompok"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Automatic Group Creation Component
  const AutomaticGroupForm = () => {
    const [formData, setFormData] = useState({
      groupSize: selectedTask?.maxGroupSize || selectedTask?.max_group_size || 4
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const response = await createAutomaticGroups(currentTaskId, formData.groupSize);
        if (response.success) {
          showSuccess('Berhasil', `${response.kelompokTerbentuk || 'Beberapa'} kelompok berhasil dibuat secara otomatis`);
          setActiveView('list');
          await loadGroups();
        } else {
          showError('Error', response.message || 'Gagal membuat kelompok otomatis');
        }
      } catch (error) {
        console.error('Error creating automatic groups:', error);
        showError('Error', 'Gagal membuat kelompok otomatis: ' + error.message);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali ke Manajemen Kelompok
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Buat Kelompok Otomatis</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          {/* Header Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shuffle className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-green-900">
                  Pembentukan Otomatis: {currentTaskTitle}
                  {className && <span className="text-green-700"> - {className}</span>}
                </h4>
                <p className="text-sm text-green-700">
                  Sistem akan membentuk kelompok secara otomatis dari mahasiswa {className || `kelas ID ${classId}`}
                </p>
                {classId && (
                  <p className="text-xs text-green-600 mt-1">
                    Hanya mahasiswa dari kelas ini yang akan dikelompokkan
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukuran Kelompok *
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.groupSize}
                  onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Jumlah anggota per kelompok yang akan dibentuk</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Info Mahasiswa</h5>
                <p className="text-sm text-blue-800">Total mahasiswa tersedia: <span className="font-medium">{students.length}</span></p>
                <p className="text-sm text-blue-800">
                  Perkiraan kelompok: <span className="font-medium">
                    {formData.groupSize > 0 ? Math.ceil(students.length / formData.groupSize) : 0}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Bagaimana Pembentukan Otomatis Bekerja?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sistem akan membagi mahasiswa secara merata berdasarkan ukuran kelompok</li>
                <li>• Nama kelompok akan digenerate otomatis (Kelompok A, B, C, dst.)</li>
                <li>• Ketua kelompok akan dipilih secara acak untuk setiap kelompok</li>
                <li>• Jika ada sisa mahasiswa, akan ditambahkan ke kelompok terakhir</li>
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
                type="submit"
                disabled={students.length === 0}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  students.length === 0 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Shuffle size={16} />
                {students.length === 0 ? 'Tidak Ada Mahasiswa' : 'Buat Kelompok Otomatis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Enable Student Choice Component
  const EnableStudentChoiceForm = () => {
    const [formData, setFormData] = useState({
      maxGroupSize: selectedTask?.maxGroupSize || selectedTask?.max_group_size || 4,
      minGroupSize: selectedTask?.minGroupSize || selectedTask?.min_group_size || 2,
      numberOfGroups: Math.ceil(students.length / (selectedTask?.maxGroupSize || selectedTask?.max_group_size || 4))
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const response = await enableStudentChoice(currentTaskId, {
          maxGroupSize: formData.maxGroupSize,
          minGroupSize: formData.minGroupSize,
          numberOfGroups: formData.numberOfGroups
        });
        if (response.success) {
          showSuccess('Berhasil', `Mode pilihan mahasiswa telah diaktifkan. ${response.groups?.length || 0} kelompok kosong telah dibuat.`);
          setActiveView('list');
          await loadGroups();
        } else {
          showError('Error', response.message || 'Gagal mengaktifkan mode pilihan mahasiswa');
        }
      } catch (error) {
        console.error('Error enabling student choice:', error);
        showError('Error', 'Gagal mengaktifkan mode pilihan mahasiswa: ' + error.message);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali ke Manajemen Kelompok
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Aktifkan Pilihan Mahasiswa</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
          {/* Header Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-purple-900">
                  Mode Pilihan Mahasiswa: {currentTaskTitle}
                  {className && <span className="text-purple-700"> - {className}</span>}
                </h4>
                <p className="text-sm text-purple-700">
                  Mahasiswa dari {className || `kelas ID ${classId}`} dapat memilih dan bergabung dengan kelompok sendiri
                </p>
                {classId && (
                  <p className="text-xs text-purple-600 mt-1">
                    Kelompok terbatas untuk mahasiswa kelas ini saja
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukuran Minimal Kelompok *
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.minGroupSize}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      minGroupSize: newMin,
                      numberOfGroups: Math.ceil(students.length / formData.maxGroupSize)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukuran Maksimal Kelompok *
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.maxGroupSize}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      maxGroupSize: newMax,
                      numberOfGroups: Math.ceil(students.length / newMax)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Kelompok yang Dibuat *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfGroups}
                  onChange={(e) => setFormData({ ...formData, numberOfGroups: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saran: {Math.ceil(students.length / formData.maxGroupSize)} kelompok untuk {students.length} mahasiswa
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Info Mahasiswa</h5>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>Total mahasiswa tersedia: <span className="font-medium">{students.length}</span></div>
                <div>Kelompok yang akan dibuat: <span className="font-medium">{formData.numberOfGroups}</span></div>
                <div>Kapasitas per kelompok: <span className="font-medium">{formData.minGroupSize} - {formData.maxGroupSize} orang</span></div>
                <div>Total kapasitas: <span className="font-medium">{formData.numberOfGroups * formData.maxGroupSize} tempat</span></div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Bagaimana Mode Pilihan Mahasiswa Bekerja?</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Sistem akan membuat kelompok kosong sesuai jumlah yang ditentukan</li>
                <li>• Mahasiswa dapat melihat kelompok yang tersedia dan bergabung</li>
                <li>• Mahasiswa dapat melihat siapa saja yang sudah bergabung di setiap kelompok</li>
                <li>• Ketua kelompok akan dipilih otomatis saat kelompok penuh</li>
                <li>• Ukuran kelompok dibatasi sesuai pengaturan di atas</li>
                <li>• Dosen dapat memantau dan mengelola kelompok yang terbentuk</li>
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
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Aktifkan Mode Pilihan Mahasiswa
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Group Detail Modal Component
  const GroupDetailModal = () => {
    if (!selectedGroup) return null;

    const groupName = selectedGroup.name || selectedGroup.nama_kelompok || 'Kelompok Tanpa Nama';
    const groupMembers = selectedGroup.members || [];
    const groupLeaderId = selectedGroup.leaderId || selectedGroup.leader_id;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detail {groupName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {groupMembers.length} anggota • Dibuat {
                    selectedGroup.created_at || selectedGroup.createdAt ? 
                    new Date(selectedGroup.created_at || selectedGroup.createdAt).toLocaleDateString('id-ID') : 
                    'tanggal tidak diketahui'
                  }
                </p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Daftar Anggota</h4>
            
            {groupMembers.length > 0 ? (
              <div className="space-y-4">
                {groupMembers.map((member, index) => {
                  const isLeader = groupLeaderId === member.id || member.role === 'leader';
                  
                  return (
                    <div key={member.id || index} className={`p-4 rounded-lg border ${
                      isLeader ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          isLeader ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}>
                          {(member.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900">{member.name || 'Nama tidak tersedia'}</h5>
                            {isLeader && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                Ketua
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            NPM: {member.npm || 'Tidak tersedia'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {member.email || 'Tidak tersedia'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 mt-2">Tidak ada anggota ditemukan</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setSelectedGroup(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                showConfirm(
                  'Konfirmasi Hapus',
                  `Apakah Anda yakin ingin menghapus kelompok "${groupName}"? Tindakan ini tidak dapat dibatalkan.`,
                  () => {
                    handleDeleteGroup(selectedGroup.id);
                    setSelectedGroup(null); // Close modal after delete
                  }
                );
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Hapus Kelompok
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render with enhanced validation
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {activeView === 'task-list' && <TaskListView />}
      {activeView === 'list' && <GroupListView />}
      {activeView === 'create-manual' && <ManualGroupForm />}
      {activeView === 'create-auto' && <AutomaticGroupForm />}
      {activeView === 'enable-student-choice' && <EnableStudentChoiceForm />}
      
      <NotificationModal />
      {selectedGroup && <GroupDetailModal />}
    </div>
  );
};

export default DosenGroupManagement;