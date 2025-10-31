import React, { useState } from 'react';

import { 
  Star, Plus, Edit, Trash2, Save, X, Eye,
  FileText, Calendar, Users, TrendingUp,
  Download, Upload, Settings, AlertCircle,
  CheckCircle, Clock, BarChart3
} from 'lucide-react';

const DosenGradingManagement = ({ courseId, courseName, taskId = null }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'components', 'input-grades', 'rubrics'
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);

  // Sample data - akan diganti dengan data dari API
  const tasks = [
    { id: 1, title: 'Sistem E-Commerce', status: 'active', totalWeight: 100 },
    { id: 2, title: 'Database Design Project', status: 'completed', totalWeight: 100 }
  ];

  const assessmentComponents = [
    {
      id: 1,
      taskId: 1,
      name: 'Proposal',
      description: 'Proposal awal sistem yang akan dibuat',
      weight: 20,
      deadline: '2024-10-15',
      status: 'completed',
      rubric: {
        criteria: [
          { name: 'Kelengkapan', weight: 30, maxScore: 100 },
          { name: 'Kesesuaian Topik', weight: 25, maxScore: 100 },
          { name: 'Metodologi', weight: 25, maxScore: 100 },
          { name: 'Presentasi', weight: 20, maxScore: 100 }
        ]
      },
      createdAt: '2024-09-20'
    },
    {
      id: 2,
      taskId: 1,
      name: 'Progress 1',
      description: 'Laporan kemajuan tahap pertama',
      weight: 25,
      deadline: '2024-11-15',
      status: 'active',
      rubric: {
        criteria: [
          { name: 'Implementasi', weight: 40, maxScore: 100 },
          { name: 'Dokumentasi', weight: 30, maxScore: 100 },
          { name: 'Testing', weight: 30, maxScore: 100 }
        ]
      },
      createdAt: '2024-10-01'
    },
    {
      id: 3,
      taskId: 1,
      name: 'Progress 2',
      description: 'Laporan kemajuan tahap kedua',
      weight: 25,
      deadline: '2024-12-01',
      status: 'draft',
      rubric: null,
      createdAt: '2024-10-15'
    },
    {
      id: 4,
      taskId: 1,
      name: 'Final Presentation',
      description: 'Presentasi final dan demo aplikasi',
      weight: 30,
      deadline: '2024-12-15',
      status: 'draft',
      rubric: null,
      createdAt: '2024-10-15'
    }
  ];

  const groups = [
    { id: 1, name: 'Kelompok Alpha', memberCount: 3, taskId: 1 },
    { id: 2, name: 'Kelompok Beta', memberCount: 4, taskId: 1 },
    { id: 3, name: 'Kelompok Gamma', memberCount: 3, taskId: 1 },
    { id: 4, name: 'Kelompok Delta', memberCount: 4, taskId: 1 }
  ];

  const grades = [
    // Proposal grades
    { groupId: 1, componentId: 1, score: 88, feedback: 'Proposal yang baik, perlu perbaikan di metodologi', gradedAt: '2024-10-16' },
    { groupId: 2, componentId: 1, score: 92, feedback: 'Excellent proposal dengan metodologi yang jelas', gradedAt: '2024-10-16' },
    { groupId: 3, componentId: 1, score: 85, feedback: 'Good proposal, bisa ditingkatkan lagi', gradedAt: '2024-10-16' },
    { groupId: 4, componentId: 1, score: 90, feedback: 'Very good proposal overall', gradedAt: '2024-10-16' },
    
    // Progress 1 grades (partial)
    { groupId: 1, componentId: 2, score: 85, feedback: 'Implementasi sudah baik, dokumentasi perlu dilengkapi', gradedAt: '2024-11-16' },
    { groupId: 2, componentId: 2, score: 89, feedback: 'Great progress, keep it up!', gradedAt: '2024-11-16' }
  ];

  const getComponentGrades = (componentId) => {
    return grades.filter(grade => grade.componentId === componentId);
  };

  const getGroupGrade = (groupId, componentId) => {
    return grades.find(grade => grade.groupId === groupId && grade.componentId === componentId);
  };

  const calculateGroupAverage = (groupId) => {
    const groupGrades = grades.filter(grade => grade.groupId === groupId);
    if (groupGrades.length === 0) return null;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    groupGrades.forEach(grade => {
      const component = assessmentComponents.find(comp => comp.id === grade.componentId);
      if (component) {
        totalWeightedScore += grade.score * (component.weight / 100);
        totalWeight += component.weight;
      }
    });
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight * 100).toFixed(1) : null;
  };

  const GradingOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Penilaian Tugas Besar</h2>
          <p className="text-gray-600">{courseName}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView('components')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Kelola Komponen
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download size={20} />
            Export Nilai
          </button>
        </div>
      </div>

      {/* Task Selection */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tugas Besar</label>
        <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
              <p className="text-2xl font-bold text-purple-600">{grades.length}</p>
            </div>
            <Star className="text-purple-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rata-rata Kelas</p>
              <p className="text-2xl font-bold text-orange-600">87.2</p>
            </div>
            <TrendingUp className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Progress Penilaian</h3>
        <div className="space-y-4">
          {assessmentComponents.map(component => {
            const componentGrades = getComponentGrades(component.id);
            const progress = (componentGrades.length / groups.length) * 100;
            
            return (
              <div key={component.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{component.name}</h4>
                    <StatusBadge status={component.status} />
                    <span className="text-sm text-gray-500">Bobot: {component.weight}%</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {componentGrades.length}/{groups.length} kelompok dinilai
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Deadline: {component.deadline}</span>
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
          })}
        </div>
      </div>

      {/* Quick Grade Input */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Rekapitulasi Nilai per Kelompok</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelompok</th>
                {assessmentComponents.map(component => (
                  <th key={component.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
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
                  {assessmentComponents.map(component => {
                    const grade = getGroupGrade(group.id, component.id);
                    return (
                      <td key={component.id} className="px-4 py-3 text-center">
                        {grade ? (
                          <span className="font-medium text-green-600">{grade.score}</span>
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
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
            <StatusBadge status={component.status} />
          </div>
          <p className="text-gray-600 mb-4">{component.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Bobot</p>
              <p className="font-medium text-lg">{component.weight}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="font-medium">{component.deadline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{component.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rubrik</p>
              <p className="font-medium">{component.rubric ? 'Tersedia' : 'Belum dibuat'}</p>
            </div>
          </div>

          {component.rubric && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Kriteria Penilaian:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {component.rubric.criteria.map((criteria, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{criteria.name}</span>
                    <span className="text-gray-600"> ({criteria.weight}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Dibuat: {component.createdAt}
        </div>
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors">
            <Eye size={16} />
          </button>
          <button 
            onClick={onEdit}
            className="text-green-600 hover:text-green-800 p-2 rounded transition-colors"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(component.id)}
            className="text-red-600 hover:text-red-800 p-2 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const GradeInput = () => {
    if (!selectedComponent) return null;

    const [grades, setGrades] = useState(() => {
      // Initialize grades with existing data
      const initialGrades = {};
      groups.forEach(group => {
        const existingGrade = getGroupGrade(group.id, selectedComponent.id);
        initialGrades[group.id] = {
          score: existingGrade ? existingGrade.score : '',
          feedback: existingGrade ? existingGrade.feedback : ''
        };
      });
      return initialGrades;
    });

    const handleGradeChange = (groupId, field, value) => {
      setGrades(prev => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [field]: value
        }
      }));
    };

    const handleSaveGrades = () => {setActiveView('overview');
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
            <p className="text-gray-600">Bobot: {selectedComponent.weight}% • Deadline: {selectedComponent.deadline}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Daftar Kelompok</h3>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Upload size={16} />
                Import Excel
              </button>
              <button 
                onClick={handleSaveGrades}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Simpan Semua
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
                      type="number"
                      min="0"
                      max="100"
                      value={grades[group.id]?.score || ''}
                      onChange={(e) => handleGradeChange(group.id, 'score', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan nilai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback/Catatan
                    </label>
                    <textarea
                      value={grades[group.id]?.feedback || ''}
                      onChange={(e) => handleGradeChange(group.id, 'feedback', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

  // Render based on active view
  switch (activeView) {
    case 'components':
      return <ComponentsManagement />;
    case 'input-grades':
      return <GradeInput />;
    default:
      return <GradingOverview />;
  }
};

export default DosenGradingManagement;