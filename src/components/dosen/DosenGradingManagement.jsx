import React, { useState, useEffect } from 'react';

import { 
  Star, Plus, Edit, Trash2, Save, X, Eye,
  FileText, Calendar, Users, TrendingUp,
  Download, Upload, Settings, AlertCircle,
  CheckCircle, Clock, BarChart3
} from 'lucide-react';

import { 
  getTugasBesarForGrading, 
  getGradingData,
  saveNilai,
  updatePenilaianVisibility
} from '../../utils/penilaianApi';

const DosenGradingManagement = ({ courseId, courseName, taskId = null, classId = null, isReadOnly = false }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Data from API
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(taskId);
  const [gradingData, setGradingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const formatApiErrorMessage = (message, fallback) => {
    if (!message) return fallback;
    const normalized = message.toLowerCase();
    if (normalized.includes('access denied')) {
      return 'Akses ditolak: Anda hanya dapat melihat penilaian dari kelas yang Anda ajar atau mata kuliah yang Anda pengampu.';
    }
    return `${fallback}: ${message}`;
  };
  const readOnlyMessage = 'Anda terdaftar sebagai dosen pengampu pada kelas ini sehingga tidak dapat mengubah data penilaian.';
  const guardReadOnlyAction = (actionDescription = 'mengubah data penilaian') => {
    if (!isReadOnly) return false;
    alert(`${readOnlyMessage} Silakan hubungi dosen pengajar untuk ${actionDescription}.`);
    return true;
  };

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, [courseId, classId]);

  // Load grading data when task is selected
  useEffect(() => {
    if (selectedTaskId) {
      loadGradingData(selectedTaskId);
    } else {
      setGradingData(null);
    }
  }, [selectedTaskId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTugasBesarForGrading(courseId, classId);
      
      if (response.success) {
        const transformedTasks = (response.tugasBesar || []).map(task => ({
          id: task.id,
          title: task.judul || task.title,
          status: 'active', // You can determine status based on dates
          totalWeight: 100
        }));
        setTasks(transformedTasks);
        
        // Auto-select first task if no taskId provided
        if (!selectedTaskId && transformedTasks.length > 0) {
          setSelectedTaskId(transformedTasks[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      const friendly = formatApiErrorMessage(err.message, 'Gagal memuat daftar tugas besar');
      setError(friendly);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGradingData = async (tugasId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading grading data for tugasId:', tugasId);
      const response = await getGradingData(tugasId);
      console.log('Grading data response:', response);
      
      if (response.success) {
        setGradingData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load grading data');
      }
    } catch (err) {
      console.error('Error loading grading data:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        tugasId: tugasId
      });
      const friendly = formatApiErrorMessage(err.message, 'Gagal memuat data penilaian');
      setError(friendly);
      setGradingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (visible) => {
    if (!selectedTaskId) return;
    if (guardReadOnlyAction('mengubah visibilitas penilaian')) return;
    
    try {
      setUpdatingVisibility(true);
      const response = await updatePenilaianVisibility(selectedTaskId, visible);
      
      if (response.success) {
        // Update local state
        setGradingData(prev => ({
          ...prev,
          tugas: {
            ...prev.tugas,
            penilaian_visible: visible
          }
        }));
      } else {
        setError(response.error || 'Gagal mengupdate visibility');
      }
    } catch (err) {
      console.error('Error updating visibility:', err);
      setError(err.message || 'Gagal mengupdate visibility');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  // Get assessment components from grading data
  const assessmentComponents = gradingData?.komponen || [];

  // Get groups from grading data
  const groups = gradingData?.groups || [];

  // Get grades - map nilai to groups and components
  const getComponentGrades = (componentIndex) => {
    if (!gradingData || !gradingData.nilai || !gradingData.komponen) return [];
    
    const component = gradingData.komponen[componentIndex];
    if (!component) return [];
    
    // Get komponen_penilaian id for this component
    // We need to match by name since komponen is JSONB
    // For now, we'll get all nilai and filter by komponen_nama
    return gradingData.nilai.filter(n => n.komponen_nama === component.name);
  };

  const getGroupGrade = (groupId, componentIndex) => {
    if (!gradingData || !gradingData.nilai || !gradingData.komponen || !gradingData.groups) return null;
    
    const component = gradingData.komponen[componentIndex];
    if (!component) return null;
    
    // Get group members
    const group = gradingData.groups.find(g => g.id === groupId);
    if (!group) return null;
    
    // Get nilai for this group and component
    // Match by kelompok_id and komponen_nama
    const groupNilai = gradingData.nilai.filter(n => 
      n.kelompok_id === groupId && n.komponen_nama === component.name
    );
    
    if (groupNilai.length > 0) {
      // Calculate average for group members
      const avgNilai = groupNilai.reduce((sum, n) => sum + n.nilai, 0) / groupNilai.length;
      const catatan = groupNilai[0]?.catatan || '';
      return {
        nilai: parseFloat(avgNilai.toFixed(1)),
        catatan: catatan
      };
    }
    
    return null;
  };

  const calculateGroupAverage = (groupId) => {
    if (!gradingData || !assessmentComponents.length) return null;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    assessmentComponents.forEach((component, index) => {
      const grade = getGroupGrade(groupId, index);
      if (grade && grade.nilai) {
        totalWeightedScore += parseFloat(grade.nilai) * (component.weight / 100);
        totalWeight += component.weight;
      }
    });
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
  };

  const GradingOverview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Memuat data penilaian...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Error: {error}</span>
          </div>
          <button 
            onClick={() => selectedTaskId && loadGradingData(selectedTaskId)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Coba lagi
          </button>
        </div>
      );
    }

    if (!gradingData) {
      return (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Tugas Besar</h3>
          <p className="text-gray-600">Pilih tugas besar untuk melihat data penilaian</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Penilaian Tugas Besar</h2>
            <p className="text-gray-600">{gradingData.tugas?.course_name || courseName}</p>
            {gradingData.tugas?.class_name && (
              <p className="text-sm text-gray-500">Kelas: {gradingData.tugas.class_name}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Toggle Visibility */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-300">
              <span className="text-sm font-medium text-gray-700">Tampilkan ke Mahasiswa:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gradingData.tugas?.penilaian_visible || false}
                  onChange={(e) => {
                    if (guardReadOnlyAction('mengubah visibilitas penilaian')) {
                      return;
                    }
                    handleToggleVisibility(e.target.checked);
                  }}
                  disabled={updatingVisibility || isReadOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              {updatingVisibility && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={20} />
              Export Nilai
            </button>
          </div>
        </div>

        {/* Task Selection */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tugas Besar</label>
          <select 
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(parseInt(e.target.value))}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Pilih Tugas Besar --</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Kelompok</p>
                <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Komponen Penilaian</p>
                <p className="text-2xl font-bold text-green-600">{assessmentComponents.length}</p>
              </div>
              <FileText className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Nilai Terinput</p>
                <p className="text-2xl font-bold text-purple-600">{gradingData.nilai?.length || 0}</p>
              </div>
              <Star className="text-purple-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rata-rata Kelas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(() => {
                    let total = 0;
                    let count = 0;
                    groups.forEach(group => {
                      const avg = calculateGroupAverage(group.id);
                      if (avg) {
                        total += parseFloat(avg);
                        count++;
                      }
                    });
                    return count > 0 ? (total / count).toFixed(1) : '0.0';
                  })()}
                </p>
              </div>
              <TrendingUp className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Progress Penilaian</h3>
          <div className="space-y-4">
            {assessmentComponents.length > 0 ? (
              assessmentComponents.map((component, index) => {
                // Count how many groups have nilai for this component
                const gradedGroups = groups.filter(group => {
                  const grade = getGroupGrade(group.id, index);
                  return grade && grade.nilai !== null && grade.nilai !== undefined;
                });
                const progress = groups.length > 0 ? (gradedGroups.length / groups.length) * 100 : 0;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{component.name}</h4>
                        <span className="text-sm text-gray-500">Bobot: {component.weight}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {gradedGroups.length}/{groups.length} kelompok dinilai
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Deadline: {component.deadline ? new Date(component.deadline).toLocaleDateString('id-ID') : 'Belum diatur'}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedComponent(component);
                          setActiveView('input-grades');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Input Nilai →
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada komponen penilaian</p>
            )}
          </div>
        </div>

        {/* Quick Grade Input */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Rekapitulasi Nilai per Kelompok</h3>
          {groups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelompok</th>
                    {assessmentComponents.map((component, index) => (
                      <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {component.name}<br/>
                        <span className="font-normal">({component.weight}%)</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groups.map(group => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-gray-600">{group.memberCount} anggota</div>
                      </td>
                      {assessmentComponents.map((component, index) => {
                        const grade = getGroupGrade(group.id, index);
                        return (
                          <td key={index} className="px-4 py-3 text-center">
                            {grade && grade.nilai ? (
                              <span className="font-medium text-green-600">{grade.nilai}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        {calculateGroupAverage(group.id) ? (
                          <span className="font-bold text-blue-600">{calculateGroupAverage(group.id)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => {
                            setSelectedGroup(group);
                            setActiveView('group-detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Belum ada kelompok untuk tugas besar ini</p>
          )}
        </div>
      </div>
    );
  };

  const ComponentsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveView('overview')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Kembali
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Kelola Komponen Penilaian</h2>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Atur komponen penilaian untuk tugas besar</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Tambah Komponen
        </button>
      </div>

      <div className="grid gap-6">
        {assessmentComponents.map(component => (
          <ComponentCard 
            key={component.id} 
            component={component}
            onEdit={() => {
              setSelectedComponent(component);
              // Handle edit
            }}
            onDelete={(id) => {
              // Handle delete
            }}
          />
        ))}
      </div>
    </div>
  );

  const ComponentCard = ({ component, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">{component.name}</h3>
          </div>
          {component.description && (
            <p className="text-gray-600 mb-4">{component.description}</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Bobot</p>
              <p className="font-medium text-lg">{component.weight}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="font-medium">
                {component.deadline ? new Date(component.deadline).toLocaleDateString('id-ID') : 'Belum diatur'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Komponen penilaian dari tugas besar
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button 
              onClick={onEdit}
              className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
              title="Edit melalui Tugas Besar"
            >
              <Edit size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const GradeInput = () => {
    if (!selectedComponent) return null;

    const [grades, setGrades] = useState(() => {
      // Initialize grades with existing data
      const initialGrades = {};
      groups.forEach(group => {
        const existingGrade = getGroupGrade(group.id, selectedComponent.index);
        initialGrades[group.id] = {
          score: existingGrade && existingGrade.nilai ? existingGrade.nilai : '',
          feedback: existingGrade && existingGrade.catatan ? existingGrade.catatan : ''
        };
      });
      return initialGrades;
    });

    const [validationErrors, setValidationErrors] = useState({});

    const handleGradeChange = (groupId, field, value) => {
      if (field === 'score') {
        // Allow empty string for clearing the field
        if (value === '' || value === null || value === undefined) {
          setGrades(prev => ({
            ...prev,
            [groupId]: {
              ...prev[groupId],
              [field]: ''
            }
          }));
          // Clear validation error for this field
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[groupId];
            return newErrors;
          });
          return;
        }

        // Filter: hanya izinkan angka dan satu titik desimal
        // Hapus semua karakter yang bukan angka atau titik
        let filteredValue = value.toString().replace(/[^0-9.]/g, '');
        
        // Hanya izinkan satu titik desimal
        const parts = filteredValue.split('.');
        if (parts.length > 2) {
          filteredValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Jika kosong setelah filter, set ke empty string
        if (filteredValue === '' || filteredValue === '.') {
          setGrades(prev => ({
            ...prev,
            [groupId]: {
              ...prev[groupId],
              [field]: filteredValue === '.' ? '0.' : ''
            }
          }));
          // Clear validation error
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[groupId];
            return newErrors;
          });
          return;
        }

        // Convert to number untuk validasi
        const numValue = parseFloat(filteredValue);
        
        // Jika bukan angka valid, jangan update
        if (isNaN(numValue)) {
          return;
        }

        // Otomatis batasi ke maksimum 100 saat user mengetik
        let finalValue = filteredValue;
        if (numValue > 100) {
          // Jika nilai lebih dari 100, langsung batasi ke 100
          finalValue = '100';
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[groupId];
            return newErrors;
          });
        } else if (numValue < 0) {
          // Jika negatif, set ke 0
          finalValue = '0';
          setValidationErrors(prev => ({
            ...prev,
            [groupId]: 'Nilai tidak boleh kurang dari 0'
          }));
        } else {
          // Valid value, clear error
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[groupId];
            return newErrors;
          });
        }

        // Update state dengan nilai yang sudah difilter dan dibatasi
        setGrades(prev => ({
          ...prev,
          [groupId]: {
            ...prev[groupId],
            [field]: finalValue
          }
        }));
      } else {
        // For non-score fields (like feedback), just update normally
        setGrades(prev => ({
          ...prev,
          [groupId]: {
            ...prev[groupId],
            [field]: value
          }
        }));
      }
    };

    const handleSaveGrades = async () => {
      if (guardReadOnlyAction('menyimpan nilai')) return;
      
      // Validate all grades before saving
      const errors = {};
      let hasErrors = false;

      Object.entries(grades).forEach(([groupId, gradeData]) => {
        if (gradeData.score !== '' && gradeData.score !== null && gradeData.score !== undefined) {
          const numValue = parseFloat(gradeData.score);
          
          if (isNaN(numValue)) {
            errors[groupId] = 'Nilai harus berupa angka';
            hasErrors = true;
          } else if (numValue < 0) {
            errors[groupId] = 'Nilai tidak boleh kurang dari 0';
            hasErrors = true;
          } else if (numValue > 100) {
            errors[groupId] = 'Nilai tidak boleh lebih dari 100';
            hasErrors = true;
          }
        }
      });

      if (hasErrors) {
        setValidationErrors(errors);
        alert('Terdapat nilai yang tidak valid. Silakan perbaiki nilai yang ditandai dengan warna merah sebelum menyimpan.');
        return;
      }

      try {
        setSaving(true);
        
        // Save grades for each group
        const savePromises = Object.entries(grades).map(async ([groupId, gradeData]) => {
          if (gradeData.score && gradeData.score !== '') {
            const numValue = parseFloat(gradeData.score);
            // Double check before sending to API
            if (numValue >= 0 && numValue <= 100) {
              await saveNilai(
                selectedTaskId,
                parseInt(groupId),
                selectedComponent.index,
                numValue,
                gradeData.feedback || ''
              );
            }
          }
        });
        
        await Promise.all(savePromises);
        
        // Reload grading data
        await loadGradingData(selectedTaskId);
        
        setActiveView('overview');
        alert('Nilai berhasil disimpan!');
      } catch (error) {
        console.error('Error saving grades:', error);
        alert('Gagal menyimpan nilai: ' + error.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView('overview')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Input Nilai: {selectedComponent.name}</h2>
            <p className="text-gray-600">
              Bobot: {selectedComponent.weight}% • 
              Deadline: {selectedComponent.deadline ? new Date(selectedComponent.deadline).toLocaleDateString('id-ID') : 'Belum diatur'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Daftar Kelompok</h3>
            <div className="flex gap-2">
              <button className={`bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`} disabled={isReadOnly}>
                <Upload size={16} />
                Import Excel
              </button>
              <button 
                onClick={handleSaveGrades}
                disabled={saving || isReadOnly}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan Semua
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div>
                    <h4 className="font-medium text-lg">{group.name}</h4>
                    <p className="text-sm text-gray-600">{group.memberCount} anggota</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai (0-100)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={grades[group.id]?.score || ''}
                      onChange={(e) => handleGradeChange(group.id, 'score', e.target.value)}
                      onKeyDown={(e) => {
                        // Izinkan: angka, titik, backspace, delete, tab, escape, enter, arrow keys
                        const allowedKeys = [
                          'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                          'Home', 'End'
                        ];
                        
                        // Izinkan Ctrl/Cmd + A, C, V, X, Z
                        if (e.ctrlKey || e.metaKey) {
                          if (['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
                            return;
                          }
                        }
                        
                        // Izinkan angka 0-9
                        if (e.key >= '0' && e.key <= '9') {
                          return;
                        }
                        
                        // Izinkan titik desimal (hanya satu)
                        if (e.key === '.' && !e.target.value.includes('.')) {
                          return;
                        }
                        
                        // Izinkan tombol navigasi
                        if (allowedKeys.includes(e.key)) {
                          return;
                        }
                        
                        // Blokir semua karakter lain (huruf, simbol, dll)
                        e.preventDefault();
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        // Filter hanya angka dan titik desimal
                        const filtered = pastedText.replace(/[^0-9.]/g, '');
                        // Hanya izinkan satu titik desimal
                        const parts = filtered.split('.');
                        const cleanValue = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('') 
                          : filtered;
                        
                        if (cleanValue) {
                          handleGradeChange(group.id, 'score', cleanValue);
                        }
                      }}
                      onBlur={(e) => {
                        // Validate on blur and ensure value is within range
                        const value = e.target.value;
                        if (value !== '' && value !== null && value !== undefined) {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            let finalValue = value;
                            if (numValue < 0) {
                              finalValue = '0';
                              setValidationErrors(prev => ({
                                ...prev,
                                [group.id]: 'Nilai tidak boleh kurang dari 0'
                              }));
                              handleGradeChange(group.id, 'score', '0');
                            } else if (numValue > 100) {
                              finalValue = '100';
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[group.id];
                                return newErrors;
                              });
                              handleGradeChange(group.id, 'score', '100');
                            } else {
                              // Clear error if valid
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[group.id];
                                return newErrors;
                              });
                            }
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors[group.id] 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300'
                      } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={isReadOnly}
                      placeholder="Masukkan nilai (0-100)"
                    />
                    {validationErrors[group.id] && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors[group.id]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback/Catatan
                    </label>
                    <textarea
                      value={grades[group.id]?.feedback || ''}
                      onChange={(e) => handleGradeChange(group.id, 'feedback', e.target.value)}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={isReadOnly}
                      placeholder="Berikan feedback untuk kelompok"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktif', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Selesai', icon: CheckCircle },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft', icon: Clock },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan', icon: AlertCircle }
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

  // Group Detail View
  const GroupDetailView = () => {
    if (!selectedGroup || !gradingData) {
      return (
        <div className="text-center py-12">
          <AlertCircle size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kelompok tidak ditemukan</h3>
          <button 
            onClick={() => setActiveView('overview')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Kembali ke Overview
          </button>
        </div>
      );
    }

    // Get all nilai for this group
    const groupNilai = gradingData.nilai?.filter(n => n.kelompok_id === selectedGroup.id) || [];
    
    // Group nilai by komponen
    const nilaiByKomponen = {};
    groupNilai.forEach(nilai => {
      if (!nilaiByKomponen[nilai.komponen_nama]) {
        nilaiByKomponen[nilai.komponen_nama] = [];
      }
      nilaiByKomponen[nilai.komponen_nama].push(nilai);
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedGroup(null);
              setActiveView('overview');
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detail Kelompok: {selectedGroup.name}</h2>
            <p className="text-gray-600">{selectedGroup.memberCount} anggota</p>
          </div>
        </div>

        {/* Group Summary */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Rekapitulasi Nilai per Komponen</h3>
          <div className="space-y-4">
            {assessmentComponents.map((component, index) => {
              const grade = getGroupGrade(selectedGroup.id, index);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{component.name}</h4>
                      <p className="text-sm text-gray-600">Bobot: {component.weight}%</p>
                      {component.description && (
                        <p className="text-sm text-gray-500 mt-1">{component.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {grade && grade.nilai ? (
                        <>
                          <p className="text-2xl font-bold text-green-600">{grade.nilai}</p>
                          {grade.catatan && (
                            <p className="text-sm text-gray-600 mt-1 max-w-xs">{grade.catatan}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">Belum dinilai</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Average */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">Rata-rata Akhir</h4>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateGroupAverage(selectedGroup.id) || '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Member Grades (if available) */}
        {groupNilai.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Detail Nilai per Anggota</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komponen</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Catatan</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupNilai.map((nilai, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{nilai.komponen_nama}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-green-600">{nilai.nilai}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">{nilai.catatan || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {nilai.created_at ? new Date(nilai.created_at).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Go back to overview to edit grades
              setActiveView('overview');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Overview
          </button>
        </div>
      </div>
    );
  };

  // Render based on active view
  switch (activeView) {
    case 'components':
      return <ComponentsManagement />;
    case 'input-grades':
      return <GradeInput />;
    case 'group-detail':
      return <GroupDetailView />;
    default:
      return <GradingOverview />;
  }
};

export default DosenGradingManagement;