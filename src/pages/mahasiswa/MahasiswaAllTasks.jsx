import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Calendar, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Search, Filter, BookOpen, ArrowLeft, Users, Eye, X, UserPlus, UserMinus
} from 'lucide-react';
import { getMahasiswaCourses, getTugasBesarByCourse } from '../../utils/mahasiswaApi';
import { getAvailableGroups, joinGroup, leaveStudentGroup, getCurrentGroup } from '../../utils/kelompokApi';

// Function untuk check apakah mahasiswa bisa pilih kelompok
const canSelectGroup = (tugas) => {
  // Mahasiswa bisa pilih kelompok HANYA jika:
  // grouping_method adalah 'student_choice' DAN student_choice_enabled = true
  return tugas.grouping_method === 'student_choice' && tugas.student_choice_enabled === true;
};

const MahasiswaAllTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedTugasForGroup, setSelectedTugasForGroup] = useState(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all courses enrolled by mahasiswa
      const coursesResponse = await getMahasiswaCourses();
      const courses = coursesResponse?.data?.courses || coursesResponse?.courses || [];
      
      if (courses.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Fetch all tugas besar from all courses
      const allTasksPromises = courses.map(async (course) => {
        try {
          const tugasResponse = await getTugasBesarByCourse(course.course_id);
          const tugasList = tugasResponse?.tugasBesar || tugasResponse?.data?.tugasBesar || [];
          
          // Add course info to each task
          return tugasList.map(task => ({
            ...task,
            courseName: course.course_name,
            courseCode: course.course_code,
            courseId: course.course_id,
            className: course.class_name
          }));
        } catch (err) {
          console.error(`Error loading tasks for course ${course.course_name}:`, err);
          return [];
        }
      });
      
      const tasksArrays = await Promise.all(allTasksPromises);
      const allTasks = tasksArrays.flat();
      
      // Sort by deadline (upcoming first)
      allTasks.sort((a, b) => {
        const dateA = a.tanggal_selesai ? new Date(a.tanggal_selesai) : new Date(0);
        const dateB = b.tanggal_selesai ? new Date(b.tanggal_selesai) : new Date(0);
        return dateA - dateB;
      });
      
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading all tasks:', err);
      setError('Gagal memuat daftar tugas besar: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (task) => {
    if (!task.tanggal_selesai) return 'unknown';
    const deadline = new Date(task.tanggal_selesai);
    const now = new Date();
    
    if (deadline < now) return 'overdue';
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return 'urgent';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ditentukan';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchTerm || 
      task.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    if (filterStatus === 'all') return matchesSearch;
    const status = getTaskStatus(task);
    if (filterStatus === 'active') return matchesSearch && status === 'active';
    if (filterStatus === 'urgent') return matchesSearch && status === 'urgent';
    if (filterStatus === 'overdue') return matchesSearch && status === 'overdue';
    
    return matchesSearch;
  });

  const handleTaskClick = (task, event) => {
    // Prevent navigation if clicking on buttons
    if (event && (event.target.closest('button') || event.target.closest('a'))) {
      return;
    }
    navigate(`/mahasiswa/dashboard/courses/${task.courseId}`);
  };

  const handleJoinKelompok = (tugas, event) => {
    if (event) {
      event.stopPropagation(); // Prevent card click
    }
    
    // Check if task allows student choice and is still active
    if (!canSelectGroup(tugas)) {
      alert('Pemilihan kelompok tidak diizinkan untuk tugas ini.');
      return;
    }

    // Check if task is still active (not ended)
    const now = new Date();
    const endDate = new Date(tugas.end_date || tugas.tanggal_selesai);
    
    if (now > endDate) {
      alert('Tugas sudah berakhir. Tidak dapat memilih kelompok lagi.');
      return;
    }

    // Open group selection modal
    setSelectedTugasForGroup(tugas);
    setShowGroupModal(true);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setSelectedTugasForGroup(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat daftar tugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mahasiswa/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Kembali ke Dashboard</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-green-600" />
              Semua Tugas Besar
            </h1>
            <p className="text-gray-600 mt-2">Daftar semua tugas besar dari semua mata kuliah</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas atau mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="urgent">Mendesak</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const status = getTaskStatus(task);
            const statusConfig = {
              active: { color: 'bg-green-100 text-green-800', label: 'Aktif' },
              urgent: { color: 'bg-yellow-100 text-yellow-800', label: 'Mendesak' },
              overdue: { color: 'bg-red-100 text-red-800', label: 'Terlambat' },
              unknown: { color: 'bg-gray-100 text-gray-800', label: 'Tidak diketahui' }
            };
            
            return (
              <div
                key={task.id || index}
                onClick={(e) => handleTaskClick(task, e)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.judul || task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {task.courseCode} - {task.courseName}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {task.className}
                      </span>
                    </div>
                    {task.deskripsi && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.deskripsi}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {formatDate(task.tanggal_selesai)}
                    </span>
                    {task.tanggal_mulai && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Mulai: {formatDate(task.tanggal_mulai)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/mahasiswa/dashboard/courses/${task.courseId}`);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Lihat Detail
                    </button>
                    {canSelectGroup(task) && (
                      <button
                        onClick={(e) => handleJoinKelompok(task, e)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Pilih Kelompok
                      </button>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Tidak ada tugas yang sesuai' : 'Belum ada tugas besar'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Coba ubah filter atau kata kunci pencarian'
              : 'Anda belum memiliki tugas besar dari mata kuliah yang diambil'}
          </p>
        </div>
      )}

      {/* Group Selection Modal */}
      {showGroupModal && selectedTugasForGroup && (
        <GroupSelectionModal 
          tugas={selectedTugasForGroup} 
          onClose={closeGroupModal}
          courseId={selectedTugasForGroup.courseId}
        />
      )}
    </div>
  );
};

// Modal Component untuk Group Selection (copied from MahasiswaCourseDetail)
const GroupSelectionModal = ({ tugas, onClose, courseId }) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (tugas?.id) {
      loadGroupData();
    }
  }, [tugas]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load current group and available groups
      const [currentGroupResponse, availableGroupsResponse] = await Promise.all([
        getCurrentGroup(tugas.id),
        getAvailableGroups(tugas.id)
      ]);
      
      // Set current group
      if (currentGroupResponse.success && currentGroupResponse.hasGroup) {
        setCurrentGroup(currentGroupResponse.kelompok);
      } else {
        setCurrentGroup(null);
      }

      // Set available groups
      if (availableGroupsResponse.success) {
        if (availableGroupsResponse.alreadyInGroup) {
          setCurrentGroup(availableGroupsResponse.currentGroup);
          setAvailableGroups([]);
        } else {
          setAvailableGroups(availableGroupsResponse.kelompok || []);
        }
      } else {
        setError(availableGroupsResponse.message || 'Gagal memuat data kelompok');
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      setError('Gagal memuat data kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleJoinGroup = async (kelompokId) => {
    try {
      setLoading(true);
      const response = await joinGroup(kelompokId);
      
      if (response.success) {
        showNotification('success', response.message);
        await loadGroupData();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showNotification('error', response.error || 'Gagal bergabung dengan kelompok');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      showNotification('error', 'Gagal bergabung dengan kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (kelompokId) => {
    try {
      setLoading(true);
      const response = await leaveStudentGroup(kelompokId);
      
      if (response.success) {
        showNotification('success', response.message);
        await loadGroupData();
      } else {
        showNotification('error', response.error || 'Gagal keluar dari kelompok');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      showNotification('error', 'Gagal keluar dari kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Pilih Kelompok</h3>
              <p className="text-sm text-gray-600 mt-1">{tugas.title || tugas.judul}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`p-4 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
            'bg-red-50 border-red-200 text-red-800'
          } border-b`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data kelompok...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadGroupData}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : currentGroup ? (
            // Show current group
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Kelompok Anda Saat Ini</h4>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-medium">{currentGroup.nama_kelompok}</h5>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {currentGroup.member_count || (currentGroup.members?.length || 0)} anggota
                    </span>
                  </div>
                  
                  {currentGroup.members && currentGroup.members.length > 0 ? (
                    <div className="space-y-2">
                      <h6 className="font-medium text-gray-700 mb-2">Anggota:</h6>
                      {currentGroup.members.map((member, index) => (
                        <div key={member.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.npm}</p>
                          </div>
                          {member.isLeader && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Ketua
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Belum ada informasi anggota.</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <button
                      onClick={() => handleLeaveGroup(currentGroup.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      disabled={loading}
                    >
                      Keluar dari Kelompok
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : availableGroups.length > 0 ? (
            // Show available groups
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Kelompok Tersedia</h4>
                <div className="grid gap-4">
                  {availableGroups.map((group, idx) => (
                    <div key={`group-${group.id}-${idx}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-lg font-medium">{group.nama_kelompok}</h5>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {group.current_members || 0}/{group.max_members || 4} anggota
                          </span>
                          {group.current_members >= (group.max_members || 4) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                              Penuh
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {group.members && group.members.length > 0 ? (
                        <div className="mb-4">
                          <h6 className="font-medium text-gray-700 mb-2">Anggota saat ini:</h6>
                          <div className="space-y-1">
                            {group.members.map((member, index) => (
                              <div key={member.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-gray-600">{member.npm}</p>
                                </div>
                                {member.isLeader && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                    Ketua
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 mb-4">Belum ada anggota. Jadilah yang pertama!</p>
                      )}
                      
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={loading || group.current_members >= (group.max_members || 4)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          group.current_members >= (group.max_members || 4)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {group.current_members >= (group.max_members || 4) ? 'Kelompok Penuh' : 'Bergabung'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No groups available
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" size={48} />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Kelompok Tersedia</h4>
              <p className="text-gray-600">
                Semua kelompok sudah penuh atau belum ada kelompok yang dibuat untuk tugas ini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaAllTasks;

