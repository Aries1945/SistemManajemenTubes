import React, { useState } from 'react';
import { Users, Search, UserPlus, UserMinus, CheckCircle, Clock, AlertTriangle, Star } from 'lucide-react';

const MahasiswaGroups = () => {
  const [activeTab, setActiveTab] = useState('my-groups'); // 'my-groups', 'available-groups'
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - akan diganti dengan data dari API
  const myGroups = [
    {
      id: 1,
      name: 'Kelompok Alpha',
      course: 'Pemrograman Web',
      courseCode: 'IF123',
      task: 'Sistem E-Commerce',
      members: [
        { id: 1, name: 'Alice Johnson', npm: '2021730001', role: 'leader', isMe: true },
        { id: 2, name: 'Bob Smith', npm: '2021730002', role: 'member', isMe: false },
        { id: 3, name: 'Charlie Brown', npm: '2021730003', role: 'member', isMe: false }
      ],
      status: 'active',
      createdAt: '2024-10-01',
      averageGrade: 88.5,
      completedTasks: 1,
      activeTasks: 2
    },
    {
      id: 2,
      name: 'Kelompok Beta',
      course: 'Rekayasa Perangkat Lunak',
      courseCode: 'IF345',
      task: 'Project Management System',
      members: [
        { id: 1, name: 'Alice Johnson', npm: '2021730001', role: 'member', isMe: true },
        { id: 4, name: 'Diana Prince', npm: '2021730004', role: 'leader', isMe: false },
        { id: 5, name: 'Edward Norton', npm: '2021730005', role: 'member', isMe: false },
        { id: 6, name: 'Fiona Green', npm: '2021730006', role: 'member', isMe: false }
      ],
      status: 'active',
      createdAt: '2024-09-15',
      averageGrade: 89.2,
      completedTasks: 2,
      activeTasks: 3
    }
  ];

  const availableGroups = [
    {
      id: 3,
      name: 'Kelompok Gamma',
      course: 'Basis Data',
      courseCode: 'IF234',
      task: 'Database Design Project',
      currentMembers: 2,
      maxMembers: 4,
      members: [
        { id: 7, name: 'George Wilson', npm: '2021730007', role: 'leader' },
        { id: 8, name: 'Hannah Davis', npm: '2021730008', role: 'member' }
      ],
      requirements: 'Memiliki pengalaman SQL, preferensi yang bisa MySQL/PostgreSQL',
      createdAt: '2024-10-05',
      isOpen: true
    },
    {
      id: 4,
      name: 'Kelompok Delta',
      course: 'Basis Data',
      courseCode: 'IF234',
      task: 'Database Design Project',
      currentMembers: 3,
      maxMembers: 4,
      members: [
        { id: 9, name: 'Ian Murphy', npm: '2021730009', role: 'leader' },
        { id: 10, name: 'Julia Roberts', npm: '2021730010', role: 'member' },
        { id: 11, name: 'Kevin Hart', npm: '2021730011', role: 'member' }
      ],
      requirements: 'Aktif berkomunikasi, berpengalaman dalam pemodelan data',
      createdAt: '2024-10-03',
      isOpen: true
    },
    {
      id: 5,
      name: 'Kelompok Echo',
      course: 'Basis Data',
      courseCode: 'IF234',
      task: 'Database Design Project',
      currentMembers: 4,
      maxMembers: 4,
      members: [
        { id: 12, name: 'Liam Wilson', npm: '2021730012', role: 'leader' },
        { id: 13, name: 'Mia Johnson', npm: '2021730013', role: 'member' },
        { id: 14, name: 'Noah Davis', npm: '2021730014', role: 'member' },
        { id: 15, name: 'Olivia Brown', npm: '2021730015', role: 'member' }
      ],
      requirements: null,
      createdAt: '2024-09-28',
      isOpen: false
    }
  ];

  const filteredAvailableGroups = availableGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.members.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const MyGroupsTab = () => (
    <div className="space-y-6">
      {myGroups.map(group => (
        <MyGroupCard key={group.id} group={group} />
      ))}
      
      {myGroups.length === 0 && (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum bergabung kelompok</h3>
          <p className="text-gray-600 mb-4">Anda belum bergabung dengan kelompok manapun.</p>
          <button 
            onClick={() => setActiveTab('available-groups')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cari Kelompok
          </button>
        </div>
      )}
    </div>
  );

  const AvailableGroupsTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari kelompok berdasarkan nama, mata kuliah, atau anggota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Available Groups */}
      {filteredAvailableGroups.map(group => (
        <AvailableGroupCard key={group.id} group={group} />
      ))}
      
      {filteredAvailableGroups.length === 0 && (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Tidak ada kelompok yang sesuai' : 'Tidak ada kelompok tersedia'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Semua kelompok sudah penuh atau Anda sudah bergabung'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelompok Saya</h1>
          <p className="text-gray-600">Kelola dan cari kelompok tugas besar</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('my-groups')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'my-groups' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kelompok Saya ({myGroups.length})
          </button>
          <button 
            onClick={() => setActiveTab('available-groups')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'available-groups' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kelompok Tersedia ({availableGroups.filter(g => g.isOpen).length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'my-groups' ? <MyGroupsTab /> : <AvailableGroupsTab />}
        </div>
      </div>
    </div>
  );
};

const MyGroupCard = ({ group }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Aktif</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
            {getStatusBadge(group.status)}
          </div>
          <p className="text-gray-600 mb-2">{group.course} ({group.courseCode})</p>
          <p className="text-sm text-gray-500 mb-4">Tugas: {group.task}</p>
        </div>
      </div>

      {/* Members */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-3">Anggota Kelompok ({group.members.length} orang)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {group.members.map(member => (
            <div key={member.id} className={`flex items-center gap-2 p-2 rounded ${member.isMe ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="flex-1">
                <p className={`font-medium ${member.isMe ? 'text-blue-900' : 'text-gray-900'}`}>
                  {member.name} {member.isMe && '(Anda)'}
                </p>
                <p className="text-sm text-gray-600">{member.npm}</p>
              </div>
              {member.role === 'leader' && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  Ketua
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{group.averageGrade}</p>
          <p className="text-sm text-gray-600">Rata-rata Nilai</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{group.completedTasks}</p>
          <p className="text-sm text-gray-600">Tugas Selesai</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{group.activeTasks}</p>
          <p className="text-sm text-gray-600">Tugas Aktif</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Lihat Detail
        </button>
        <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
          Chat Kelompok
        </button>
        {group.members.find(m => m.isMe)?.role === 'leader' && (
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
            Kelola
          </button>
        )}
      </div>
    </div>
  );
};

const AvailableGroupCard = ({ group }) => {
  const handleJoinGroup = () => {
    console.log('Join group:', group.id);
    // Handle join group logic
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
            {group.isOpen ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Terbuka
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                Penuh
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{group.course} ({group.courseCode})</p>
          <p className="text-sm text-gray-500 mb-3">Tugas: {group.task}</p>
          
          {group.requirements && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Requirements:</span> {group.requirements}
              </p>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-2">
            {group.currentMembers}/{group.maxMembers} anggota
          </p>
          {group.isOpen ? (
            <button 
              onClick={handleJoinGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <UserPlus size={16} />
              Bergabung
            </button>
          ) : (
            <button 
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed text-sm"
            >
              Penuh
            </button>
          )}
        </div>
      </div>

      {/* Current Members */}
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Anggota Saat Ini</h4>
        <div className="flex flex-wrap gap-2">
          {group.members.map(member => (
            <div key={member.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
              <span className="text-sm text-gray-900">{member.name}</span>
              {member.role === 'leader' && (
                <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs">
                  Ketua
                </span>
              )}
            </div>
          ))}
          {group.isOpen && Array.from({ length: group.maxMembers - group.currentMembers }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-100 border-2 border-dashed border-gray-300 px-3 py-1 rounded">
              <span className="text-sm text-gray-500">Slot kosong</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MahasiswaGroups;