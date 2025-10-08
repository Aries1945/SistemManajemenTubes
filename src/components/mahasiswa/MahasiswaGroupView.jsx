import React, { useState } from 'react';
import { 
  Users, User, Mail, Phone, MessageSquare, FileText, 
  Calendar, Star, Award, Activity, Clock, CheckCircle, 
  UserPlus, X, AlertCircle, Save, List
} from 'lucide-react';

const MahasiswaGroupView = ({ courseId, courseName = 'Pemrograman Web' }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [hasActiveChoice, setHasActiveChoice] = useState(true); // Set true jika ada active choice dari dosen

  // Current user info
  const currentUser = {
    id: 1,
    name: 'Anda (Ahmad Fauzi)',
    nim: '20210001',
    email: 'you@university.ac.id',
    phone: '081234567890'
  };

  // Sample group data
  const groupData = {
    id: 5,
    name: 'Kelompok 5',
    members: [
      {
        id: 1,
        name: 'Anda (Ahmad Fauzi)',
        nim: '20210001',
        email: 'you@university.ac.id',
        phone: '081234567890',
        role: 'leader',
        avatar: null,
        isMe: true,
        lastActive: '2024-10-07',
        contributionScore: 95
      },
      {
        id: 2,
        name: 'John Doe',
        nim: '20210002',
        email: 'john.doe@university.ac.id',
        phone: '081234567891',
        role: 'member',
        avatar: null,
        isMe: false,
        lastActive: '2024-10-06',
        contributionScore: 88
      },
      {
        id: 3,
        name: 'Jane Smith',
        nim: '20210003',
        email: 'jane.smith@university.ac.id',
        phone: '081234567892',
        role: 'member',
        avatar: null,
        isMe: false,
        lastActive: '2024-10-07',
        contributionScore: 92
      },
      {
        id: 4,
        name: 'Bob Wilson',
        nim: '20210004',
        email: 'bob.wilson@university.ac.id',
        phone: '081234567893',
        role: 'member',
        avatar: null,
        isMe: false,
        lastActive: '2024-10-05',
        contributionScore: 85
      }
    ],
    totalTasks: 3,
    completedTasks: 1,
    inProgressTasks: 1,
    upcomingTasks: 1,
    averageGrade: 87.5,
    createdDate: '2024-09-15'
  };

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

  // Form configuration from dosen
  const groupFormConfig = {
    taskTitle: 'Project: E-Commerce Website',
    minMembers: 3,
    maxMembers: 5,
    deadline: '2024-10-15 23:59',
    autoApprove: true
  };

  // Form configuration from dosen for choice-based
  const groupChoiceConfig = {
    taskTitle: 'Project: E-Commerce Website',
    deadline: '2024-10-15 23:59',
    allowMove: true,
    groups: [
      { id: 'A', name: 'Group A', currentMembers: 7, maxCapacity: 8, members: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'] },
      { id: 'B', name: 'Group B', currentMembers: 8, maxCapacity: 8, members: ['Hannah', 'Ian', 'Julia', 'Kevin', 'Lisa', 'Mike', 'Nancy', 'Oscar'] },
      { id: 'C', name: 'Group C', currentMembers: 8, maxCapacity: 8, members: ['Paul', 'Quinn', 'Rachel', 'Steve', 'Tina', 'Uma', 'Victor', 'Wendy'] },
      { id: 'D', name: 'Group D', currentMembers: 7, maxCapacity: 8, members: ['Xander', 'Yara', 'Zack', 'Amy', 'Ben', 'Cara', 'Dan'] },
      { id: 'E', name: 'Group E', currentMembers: 7, maxCapacity: 8, members: ['Emma', 'Felix', 'Gina', 'Henry', 'Iris', 'Jack', 'Kelly'] }
    ]
  };

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
      setShowChoiceModal(false);
      setHasGroup(true);
      setHasActiveChoice(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Pilih Kelompok Anda</h2>
                <p className="text-sm opacity-90">{groupChoiceConfig.taskTitle}</p>
                <div className="flex items-center gap-4 text-sm opacity-90 mt-2">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Deadline: {new Date(groupChoiceConfig.deadline).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowChoiceModal(false)}
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
                    <li>• Klik "Show Group Members" untuk melihat siapa saja yang sudah bergabung</li>
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
              {selectedGroup ? `Dipilih: Group ${selectedGroup}` : 'Belum memilih kelompok'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChoiceModal(false)}
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

  const GroupFormationModal = () => {
    const [selectedMembers, setSelectedMembers] = useState([currentUser]);
    const [groupName, setGroupName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = availableStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nim.includes(searchTerm)
    );

    const toggleMember = (student) => {
      const isSelected = selectedMembers.find(m => m.id === student.id);
      
      if (isSelected) {
        setSelectedMembers(selectedMembers.filter(m => m.id !== student.id));
      } else {
        if (selectedMembers.length < groupFormConfig.maxMembers) {
          setSelectedMembers([...selectedMembers, student]);
        }
      }
    };

    const handleSubmit = () => {
      if (selectedMembers.length < groupFormConfig.minMembers) {
        alert(`Minimal ${groupFormConfig.minMembers} anggota diperlukan!`);
        return;
      }
      
      console.log('Submitting group:', {
        name: groupName,
        members: selectedMembers
      });
      
      alert('Kelompok berhasil dibuat! ' + (groupFormConfig.autoApprove ? 'Kelompok Anda sudah disetujui.' : 'Menunggu persetujuan dosen.'));
      setShowGroupForm(false);
      setHasGroup(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Bentuk Kelompok Anda</h2>
                <p className="text-sm opacity-90">{groupFormConfig.taskTitle}</p>
                <div className="flex items-center gap-4 text-sm opacity-90 mt-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(groupFormConfig.deadline).toLocaleDateString('id-ID')}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {groupFormConfig.minMembers}-{groupFormConfig.maxMembers} anggota
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowGroupForm(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Petunjuk Pembentukan Kelompok</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pilih anggota kelompok dengan mencentang checkbox</li>
                    <li>• Minimal {groupFormConfig.minMembers} anggota dan maksimal {groupFormConfig.maxMembers} anggota</li>
                    <li>• Anda otomatis menjadi ketua kelompok</li>
                    <li>• {groupFormConfig.autoApprove ? 'Kelompok akan langsung disetujui' : 'Kelompok perlu persetujuan dosen'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kelompok *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Contoh: Kelompok A, Tim Awesome, dll."
              />
            </div>

            {/* Current Members */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Anggota Terpilih ({selectedMembers.length}/{groupFormConfig.maxMembers})
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                {selectedMembers.length === 0 ? (
                  <p className="text-sm text-green-700 text-center py-2">Belum ada anggota terpilih</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMembers.map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                              {member.isMe && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Saya (Ketua)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">NIM: {member.nim}</p>
                          </div>
                        </div>
                        {!member.isMe && (
                          <button
                            onClick={() => toggleMember(member)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available Students */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Pilih Anggota Kelompok
                </h3>
                {selectedMembers.length >= groupFormConfig.maxMembers && (
                  <span className="text-sm text-orange-600">Maksimal anggota tercapai</span>
                )}
              </div>

              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Cari nama atau NIM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Students List */}
              <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                {filteredStudents.map(student => {
                  const isSelected = selectedMembers.find(m => m.id === student.id);
                  const isDisabled = selectedMembers.length >= groupFormConfig.maxMembers && !isSelected;

                  return (
                    <label 
                      key={student.id}
                      className={`flex items-center gap-3 p-3 border-b last:border-b-0 transition-colors ${
                        isSelected ? 'bg-green-50' : 
                        isDisabled ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 
                        'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => !isDisabled && toggleMember(student)}
                        disabled={isDisabled}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div className="bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">NIM: {student.nim}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </label>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Tidak ada mahasiswa yang sesuai</p>
                )}
              </div>
            </div>

            {/* Validation Info */}
            {selectedMembers.length > 0 && selectedMembers.length < groupFormConfig.minMembers && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-start gap-2">
                <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-sm text-orange-800">
                  Anda perlu menambahkan minimal {groupFormConfig.minMembers - selectedMembers.length} anggota lagi
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedMembers.length} dari {groupFormConfig.minMembers}-{groupFormConfig.maxMembers} anggota dipilih
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGroupForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedMembers.length < groupFormConfig.minMembers || !groupName.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={20} />
                Simpan Kelompok
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MembersTab = () => (
    <div className="space-y-6">
      {/* Group Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">{groupData.name}</h4>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {groupData.members.length} Anggota
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{groupData.completedTasks}</p>
            <p className="text-sm text-gray-600">Tugas Selesai</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{groupData.inProgressTasks}</p>
            <p className="text-sm text-gray-600">Dalam Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{groupData.upcomingTasks}</p>
            <p className="text-sm text-gray-600">Akan Datang</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{groupData.averageGrade}</p>
            <p className="text-sm text-gray-600">Nilai Rata-rata</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Anggota Kelompok</h4>
        <div className="space-y-4">
          {groupData.members.map(member => (
            <div key={member.id} className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
              member.isMe ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    member.isMe ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{member.name}</h5>
                      {member.isMe && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Saya
                        </span>
                      )}
                      {member.role === 'leader' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">NIM: {member.nim}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {member.phone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{member.contributionScore}</span>
                  </div>
                  <p className="text-xs text-gray-500">Kontribusi Score</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Aktif: {new Date(member.lastActive).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {!member.isMe && (
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
          ))}
        </div>
      </div>
    </div>
  );

  // No Group View
  if (!hasGroup) {
    return (
      <div className="space-y-6">
        {showChoiceModal && <GroupChoiceModal />}
        
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Anda Belum Memiliki Kelompok</h3>
          <p className="text-gray-600 mb-6">
            Pilih kelompok dari pilihan yang tersedia
          </p>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 max-w-md mx-auto mb-6">
            <h4 className="font-medium text-orange-900 mb-2">📋 Pilihan Kelompok Tersedia</h4>
            <ul className="text-sm text-orange-800 space-y-1 text-left">
              <li>• Tugas: {groupChoiceConfig.taskTitle}</li>
              <li>• Jumlah kelompok: {groupChoiceConfig.groups.length} kelompok</li>
              <li>• Deadline: {new Date(groupChoiceConfig.deadline).toLocaleDateString('id-ID', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</li>
            </ul>
          </div>

          <button
            onClick={() => setShowChoiceModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <List size={20} />
            Pilih Kelompok
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showGroupForm && <GroupFormationModal />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kelompok Saya</h3>
          <p className="text-sm text-gray-600">Kelola aktivitas dan tugas kelompok untuk {courseName}</p>
        </div>
        
        <button className="flex items-center text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <MessageSquare className="h-4 w-4 mr-2" />
          Group Chat
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'members'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Anggota
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && <MembersTab />}
    </div>
  );
};

export default MahasiswaGroupView;