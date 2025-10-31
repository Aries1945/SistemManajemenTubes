import React, { useState, useEffect } from 'react';

import { 
  Plus, Edit, Trash2, Eye, Calendar, Users, 
  FileText, Clock, CheckCircle, AlertCircle,
  Download, Upload, Settings
} from 'lucide-react';

// Import API functions
import { 
  getTugasBesar, 
  createTugasBesar, 
  updateTugasBesar, 
  deleteTugasBesar
} from '../../utils/tugasBesarApi';

const DosenTaskManagement = ({ courseId, courseName, classId, className, onNavigateToGroupManagement }) => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'detail'
  const [selectedTask, setSelectedTask] = useState(null);
  
  // API Integration states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helpers function
  const formatSistemPengelompokan = (groupFormation) => {
    const methodMap = {
      manual: 'Manual',
      automatic: 'Otomatis',
      student_choice: 'Pilihan Mahasiswa'
    };
    return methodMap[groupFormation] || 'Tidak Diketahui';
  };
  // Load tugas besar when component mounts
  useEffect(() => {
    loadTugasBesar();
  }, [courseId, classId]);

  const loadTugasBesar = async () => {
    try {
      setLoading(true);
      setError(null);// NEW: Pass classId to filter by specific class
      const response = await getTugasBesar(courseId, classId);
      
      // Transform API data to UI format
      const transformedTasks = (response.tugasBesar || []).map(task => {
        const transformedTask = {
          id: task.id,
          title: task.judul || task.title || 'Untitled',
          description: task.deskripsi || task.description || '',
          startDate: task.tanggal_mulai || task.startDate || '',
          endDate: task.tanggal_selesai || task.endDate || '',
          status: task.status || 'active',
          groupFormation: task.grouping_method || task.group_formation || task.groupFormation || 'manual',
          minGroupSize: task.min_group_size || task.minGroupSize || 3,
          maxGroupSize: task.max_group_size || task.maxGroupSize || 5,
          totalGroups: task.total_groups || task.totalGroups || 0,
          components: (typeof task.komponen === 'string' ? JSON.parse(task.komponen) : task.komponen) || task.components || [],
          deliverables: (typeof task.deliverable === 'string' ? JSON.parse(task.deliverable) : task.deliverable) || task.deliverables || [],
          createdAt: task.created_at || task.createdAt || '',
          updatedAt: task.updated_at || task.updatedAt || '',
          course: courseName,
          courseId: courseId
        };
        
        return transformedTask;
      });
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error loading tugas besar:', err);
      setError(err.message);
      // Set empty array as fallback
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const TaskList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Error: {error}</span>
          </div>
          <button 
            onClick={loadTugasBesar}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Coba lagi
          </button>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tugas Besar</h2>
          <p className="text-gray-600">{courseName}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Buat Tugas Besar
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onView={() => {
              setSelectedTask(task);
              setActiveView('detail');
            }}
            onEdit={() => {
              setSelectedTask(task);
              setActiveView('edit');
            }}
            onDelete={async (id) => {
              // Handle delete with confirmation
              if (window.confirm('Apakah Anda yakin ingin menghapus tugas besar ini?')) {
                try {
                  await deleteTugasBesar(courseId, id);
                  await loadTugasBesar(); // Reload list after delete
                } catch (error) {
                  console.error('Error deleting tugas besar:', error);
                  alert('Gagal menghapus tugas besar: ' + error.message);
                }
              }
            }}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tugas besar</h3>
          <p className="text-gray-600 mb-4">
            Mulai dengan membuat tugas besar pertama untuk mata kuliah ini.
          </p>
          <button 
            onClick={() => setActiveView('create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Tugas Besar
          </button>
        </div>
      )}
    </div>
    );
  }; // End TaskList function

  const TaskCard = ({ task, onView, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-medium">{task.endDate ? new Date(task.endDate).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-600">Kelompok</p>
                <p className="font-medium">{task.totalGroups || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-600">Komponen</p>
                <p className="font-medium">{task.components?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-600">Sistem Pengelompokan</p>
                <p className="font-medium">{formatSistemPengelompokan(task.groupFormation)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Dibuat: {task.createdAt ? new Date(task.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'N/A'} • 
          Diupdate: {task.updatedAt ? new Date(task.updatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'N/A'}
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
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
            title="Hapus"
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
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft', icon: Clock },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Selesai', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const TaskForm = ({ isEdit = false }) => {
    const [formData, setFormData] = useState(() => {
      if (isEdit && selectedTask) {
        // Convert date format for HTML input (YYYY-MM-DD)
        const formatDateForInput = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        // Map API data to form format
        return {
          title: selectedTask.judul || selectedTask.title || '',
          description: selectedTask.deskripsi || selectedTask.description || '',
          startDate: formatDateForInput(selectedTask.tanggal_mulai || selectedTask.startDate),
          endDate: formatDateForInput(selectedTask.tanggal_selesai || selectedTask.endDate),
          groupFormation: selectedTask.grouping_method || selectedTask.group_formation || selectedTask.groupFormation || 'manual',
          minGroupSize: selectedTask.min_group_size || selectedTask.minGroupSize || 3,
          maxGroupSize: selectedTask.max_group_size || selectedTask.maxGroupSize || 5,
          components: (selectedTask.components || [
            { name: 'Proposal', weight: 20, deadline: '' }
          ]).map(comp => ({
            ...comp,
            deadline: comp.deadline ? formatDateForInput(comp.deadline) : ''
          })),
          deliverables: selectedTask.deliverables || ['']
        };
      } else {
        // Default values for new task
        return {
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          groupFormation: 'manual',
          minGroupSize: 3,
          maxGroupSize: 5,
          components: [
            { name: 'Proposal', weight: 20, deadline: '' }
          ],
          deliverables: ['']
        };
      }
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setSubmitting(true);// Prepare data for API - match backend expectations
        const tugasData = {
          title: formData.title,
          description: formData.description,
          deadline: formData.endDate,
          startDate: formData.startDate,
          groupFormation: formData.groupFormation,
          minGroupSize: formData.minGroupSize,
          maxGroupSize: formData.maxGroupSize,
          components: formData.components,
          deliverables: formData.deliverables,
          class_id: classId // NEW: Include classId in tugas data
        };

        if (isEdit && selectedTask) {
          // Update existing task
          await updateTugasBesar(courseId, selectedTask.id, tugasData);} else {
          // Create new task - Ensure classId is required
          if (!classId) {
            throw new Error('Class ID is required for creating tugas besar');
          }
          await createTugasBesar(courseId, tugasData);}

        // Reload the task list to show updated data
        await loadTugasBesar();
        
        // Navigate back to list view
        setActiveView('list');
        
      } catch (error) {
        console.error('Error saving tugas besar:', error);
        alert('Gagal menyimpan tugas besar: ' + error.message);
      } finally {
        setSubmitting(false);
      }
    };

    const addComponent = () => {
      setFormData({
        ...formData,
        components: [...formData.components, { name: '', weight: 0, deadline: '' }]
      });
    };

    const removeComponent = (index) => {
      const newComponents = formData.components.filter((_, i) => i !== index);
      setFormData({ ...formData, components: newComponents });
    };

    const updateComponent = (index, field, value) => {
      const newComponents = [...formData.components];
      newComponents[index] = { ...newComponents[index], [field]: value };
      setFormData({ ...formData, components: newComponents });
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
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Tugas Besar' : 'Buat Tugas Besar Baru'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Tugas Besar *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan judul tugas besar"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Kuliah
                </label>
                <input
                  type="text"
                  value={courseName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jelaskan detail tugas besar yang akan dikerjakan mahasiswa"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Group Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pengaturan Kelompok</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembentukan Kelompok
              </label>
              <select
                value={formData.groupFormation}
                onChange={(e) => setFormData({ ...formData, groupFormation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual (Dosen yang menentukan)</option>
                <option value="automatic">Otomatis (Sistem yang menentukan)</option>
                <option value="student_choice">Pilihan Mahasiswa</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.groupFormation === 'automatic' 
                  ? 'Sistem akan menghitung ukuran kelompok optimal secara otomatis berdasarkan jumlah mahasiswa' 
                  : formData.groupFormation === 'manual'
                  ? 'Dosen akan membentuk kelompok secara manual'
                  : 'Mahasiswa dapat memilih kelompok mereka sendiri dengan batasan yang ditentukan'
                }
              </p>
            </div>

            {formData.groupFormation !== 'automatic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimal Anggota per Kelompok
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.minGroupSize}
                    onChange={(e) => setFormData({ ...formData, minGroupSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Anggota per Kelompok
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {formData.groupFormation === 'automatic' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Settings className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Pembentukan Kelompok Otomatis</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Sistem akan secara otomatis menghitung ukuran kelompok yang optimal berdasarkan:
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Jumlah total mahasiswa yang terdaftar</li>
                      <li>• Algoritma pembagian yang menghasilkan kelompok seimbang</li>
                      <li>• Ukuran kelompok ideal (3-5 anggota per kelompok)</li>
                      <li>• Meminimalkan sisa mahasiswa yang tidak terbagi</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Ukuran kelompok akan ditentukan saat proses pembentukan kelompok di menu Manajemen Kelompok.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Components */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Komponen Penilaian</h3>
              <button
                type="button"
                onClick={addComponent}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                + Tambah Komponen
              </button>
            </div>
            
            {formData.components.map((component, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Komponen
                    </label>
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => updateComponent(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Proposal, Progress 1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bobot (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={component.weight}
                      onChange={(e) => updateComponent(index, 'weight', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={component.deadline}
                      onChange={(e) => updateComponent(index, 'deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    {formData.components.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeComponent(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-sm text-gray-600">
              Total bobot: {formData.components.reduce((sum, comp) => sum + (comp.weight || 0), 0)}%
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {submitting ? 'Menyimpan...' : (isEdit ? 'Update Tugas' : 'Buat Tugas')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const TaskDetail = () => {
    if (!selectedTask) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('list')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
          <StatusBadge status={selectedTask.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Deskripsi</h3>
              <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
            </div>

            {/* Components */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Komponen Penilaian</h3>
              <div className="space-y-3">
                {(selectedTask.components || []).map((component, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{component.name}</p>
                      <p className="text-sm text-gray-600">Deadline: {component.deadline ? new Date(component.deadline).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'short', day: 'numeric' }) : 'Belum diatur'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{component.weight}%</p>
                    </div>
                  </div>
                ))}
                {(!selectedTask.components || selectedTask.components.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Belum ada komponen penilaian</p>
                )}
              </div>
            </div>

            {/* Deliverables */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
              <ul className="space-y-2">
                {(selectedTask.deliverables || []).map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
                {(!selectedTask.deliverables || selectedTask.deliverables.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Belum ada deliverables</p>
                )}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Informasi Tugas</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mata Kuliah</p>
                  <p className="font-medium">{selectedTask.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="font-medium">
                    {new Date(selectedTask.startDate).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })} - {new Date(selectedTask.endDate).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sistem Pengelompokan</p>
                  <p className="font-medium">{formatSistemPengelompokan(selectedTask.groupFormation)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ukuran Kelompok</p>
                  <p className="font-medium">
                    {selectedTask.groupFormation === 'automatic' 
                      ? 'Otomatis (ditentukan sistem)' 
                      : `${selectedTask.minGroupSize} - ${selectedTask.maxGroupSize} orang`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Kelompok</p>
                  <p className="font-medium">{selectedTask.totalGroups || 0}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Aksi</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setActiveView('edit');
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Tugas
                </button>
                <button 
                  onClick={() => {
                    if (onNavigateToGroupManagement) {
                      onNavigateToGroupManagement(selectedTask.id, selectedTask.title);
                    }
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Users size={16} />
                  Kelola Kelompok
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <FileText size={16} />
                  Lihat Penilaian
                </button>
                <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render based on active view
  switch (activeView) {
    case 'create':
      return <TaskForm />;
    case 'edit':
      return <TaskForm isEdit={true} />;
    case 'detail':
      return <TaskDetail />;
    default:
      return <TaskList />;
  }
};

export default DosenTaskManagement;