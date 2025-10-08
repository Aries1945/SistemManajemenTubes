import React, { useState } from 'react';
import { Plus, Eye, Edit2, Trash2, Calendar, Users, FileText, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

const DosenTaskManagement = ({ courseId, courseName }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Sistem E-Commerce',
      description: 'Membuat aplikasi e-commerce dengan fitur lengkap',
      deadline: '2024-12-15',
      maxStudents: 4,
      status: 'active',
      createdAt: '2024-10-01',
      progressTasks: [
        {
          id: 1,
          title: 'Proposal dan Analisis Kebutuhan',
          description: 'Membuat proposal proyek dan analisis kebutuhan sistem',
          deadline: '2024-10-20',
          status: 'completed',
          weight: 15
        },
        {
          id: 2,
          title: 'Desain UI/UX dan Database',
          description: 'Membuat wireframe, mockup, dan desain database',
          deadline: '2024-11-10',
          status: 'active',
          weight: 20
        },
        {
          id: 3,
          title: 'Implementasi Backend',
          description: 'Mengembangkan API dan sistem backend',
          deadline: '2024-11-25',
          status: 'pending',
          weight: 30
        },
        {
          id: 4,
          title: 'Implementasi Frontend',
          description: 'Mengembangkan antarmuka pengguna',
          deadline: '2024-12-05',
          status: 'pending',
          weight: 25
        },
        {
          id: 5,
          title: 'Testing dan Deployment',
          description: 'Testing sistem dan deployment aplikasi',
          deadline: '2024-12-15',
          status: 'pending',
          weight: 10
        }
      ]
    },
    {
      id: 2,
      title: 'Aplikasi Mobile Learning',
      description: 'Membuat aplikasi mobile untuk pembelajaran online',
      deadline: '2024-12-20',
      maxStudents: 3,
      status: 'draft',
      createdAt: '2024-10-05',
      progressTasks: []
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateProgressModal, setShowCreateProgressModal] = useState(false);
  const [editingProgressTask, setEditingProgressTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    maxStudents: 4
  });

  const [newProgressTask, setNewProgressTask] = useState({
    title: '',
    description: '',
    deadline: '',
    weight: 0
  });

  const handleCreateTask = () => {
    const task = {
      id: Date.now(),
      ...newTask,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      progressTasks: []
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', deadline: '', maxStudents: 4 });
    setShowCreateModal(false);
  };

  const handlePreviewTask = (task) => {
    setSelectedTask(task);
    setShowPreviewModal(true);
  };

  const handleCreateProgressTask = () => {
    if (editingProgressTask) {
      // Update existing progress task
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          const updatedProgressTasks = task.progressTasks.map(pt => 
            pt.id === editingProgressTask.id ? { ...pt, ...newProgressTask } : pt
          );
          return { ...task, progressTasks: updatedProgressTasks };
        }
        return task;
      });
      setTasks(updatedTasks);
      setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id));
    } else {
      // Create new progress task
      const progressTask = {
        id: Date.now(),
        ...newProgressTask,
        status: 'pending'
      };
      
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            progressTasks: [...task.progressTasks, progressTask]
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id));
    }
    
    setNewProgressTask({ title: '', description: '', deadline: '', weight: 0 });
    setShowCreateProgressModal(false);
    setEditingProgressTask(null);
  };

  const handleEditProgressTask = (progressTask) => {
    setNewProgressTask({
      title: progressTask.title,
      description: progressTask.description,
      deadline: progressTask.deadline,
      weight: progressTask.weight
    });
    setEditingProgressTask(progressTask);
    setShowCreateProgressModal(true);
  };

  const handleDeleteProgressTask = (progressTaskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          progressTasks: task.progressTasks.filter(pt => pt.id !== progressTaskId)
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setSelectedTask(updatedTasks.find(t => t.id === selectedTask.id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'active': return <Clock size={16} className="text-blue-600" />;
      case 'pending': return <AlertCircle size={16} className="text-gray-600" />;
      case 'overdue': return <AlertCircle size={16} className="text-red-600" />;
      default: return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Manajemen Tugas Besar</h3>
          <p className="text-gray-600">Kelola tugas besar dan progres untuk {courseName}</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Buat Tugas Besar
        </button>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg">{task.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'active' ? 'Aktif' : 'Draft'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                <span>Max {task.maxStudents} mahasiswa/kelompok</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{task.progressTasks.length} tugas progres</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handlePreviewTask(task)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <Eye size={16} />
                Preview
              </button>
              <button className="bg-gray-50 text-gray-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Buat Tugas Besar Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Tugas</label>
                <input 
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan judul tugas besar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                  placeholder="Deskripsi tugas besar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input 
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Maksimal Anggota Kelompok</label>
                <input 
                  type="number"
                  value={newTask.maxStudents}
                  onChange={(e) => setNewTask({...newTask, maxStudents: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleCreateTask}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Buat Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Task Modal */}
      {showPreviewModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">{selectedTask.title}</h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Task Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 mb-2">{selectedTask.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Deadline: </span>
                    <span className="font-medium">{new Date(selectedTask.deadline).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Anggota: </span>
                    <span className="font-medium">{selectedTask.maxStudents} mahasiswa</span>
                  </div>
                </div>
              </div>

              {/* Progress Tasks */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Tugas Progres</h4>
                <button 
                  onClick={() => setShowCreateProgressModal(true)}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Tambah Progres
                </button>
              </div>

              <div className="space-y-3">
                {selectedTask.progressTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Belum ada tugas progres</p>
                    <p className="text-sm">Klik "Tambah Progres" untuk menambah tugas progres</p>
                  </div>
                ) : (
                  selectedTask.progressTasks.map((progressTask, index) => (
                    <div key={progressTask.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <h5 className="font-medium">{progressTask.title}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(progressTask.status)}`}>
                            {getStatusIcon(progressTask.status)}
                            {progressTask.status === 'completed' ? 'Selesai' : 
                             progressTask.status === 'active' ? 'Aktif' : 'Pending'}
                          </span>
                          <button 
                            onClick={() => handleEditProgressTask(progressTask)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProgressTask(progressTask.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{progressTask.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Deadline: {new Date(progressTask.deadline).toLocaleDateString('id-ID')}</span>
                        <span>Bobot: {progressTask.weight}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Progress Task Modal */}
      {showCreateProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProgressTask ? 'Edit Tugas Progres' : 'Tambah Tugas Progres'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Tugas Progres</label>
                <input 
                  type="text"
                  value={newProgressTask.title}
                  onChange={(e) => setNewProgressTask({...newProgressTask, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan judul tugas progres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea 
                  value={newProgressTask.description}
                  onChange={(e) => setNewProgressTask({...newProgressTask, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                  placeholder="Deskripsi tugas progres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input 
                  type="date"
                  value={newProgressTask.deadline}
                  onChange={(e) => setNewProgressTask({...newProgressTask, deadline: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bobot Nilai (%)</label>
                <input 
                  type="number"
                  value={newProgressTask.weight}
                  onChange={(e) => setNewProgressTask({...newProgressTask, weight: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowCreateProgressModal(false);
                  setEditingProgressTask(null);
                  setNewProgressTask({ title: '', description: '', deadline: '', weight: 0 });
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleCreateProgressTask}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingProgressTask ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DosenTaskManagement;