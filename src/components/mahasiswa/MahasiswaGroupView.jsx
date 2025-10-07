import React, { useState } from 'react';
import { 
  Users, User, Mail, Phone, MessageSquare, FileText, 
  Calendar, Star, Award, Activity, Clock, CheckCircle
} from 'lucide-react';

const MahasiswaGroupView = ({ courseId, courseName, myGroup, groupMembers }) => {
  const [activeTab, setActiveTab] = useState('members');

  // Sample group data
  const groupData = {
    id: 5,
    name: 'Kelompok 5',
    members: [
      {
        id: 1,
        name: 'Anda',
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

  // Sample group tasks
  const groupTasks = [
    {
      id: 1,
      title: 'Project: E-Commerce Website',
      description: 'Membuat website e-commerce dengan fitur lengkap',
      dueDate: '2024-11-20',
      status: 'in_progress',
      progress: 65,
      assignedTo: ['John Doe', 'Jane Smith'],
      grade: null,
      submissions: []
    },
    {
      id: 2,
      title: 'Presentation: System Design',
      description: 'Presentasi design system untuk project e-commerce',
      dueDate: '2024-11-25',
      status: 'not_started',
      progress: 0,
      assignedTo: ['Anda', 'Bob Wilson'],
      grade: null,
      submissions: []
    },
    {
      id: 3,
      title: 'Report: Project Documentation',
      description: 'Dokumentasi lengkap project dan testing',
      dueDate: '2024-12-01',
      status: 'not_started',
      progress: 0,
      assignedTo: ['All Members'],
      grade: null,
      submissions: []
    }
  ];

  // Sample activities
  const recentActivities = [
    {
      id: 1,
      user: 'Jane Smith',
      action: 'mengupload file wireframe.pdf',
      timestamp: '2024-10-07 14:30',
      type: 'file_upload'
    },
    {
      id: 2,
      user: 'John Doe',
      action: 'menyelesaikan task "Database Design"',
      timestamp: '2024-10-07 10:15',
      type: 'task_complete'
    },
    {
      id: 3,
      user: 'Anda',
      action: 'menambahkan comment pada task "Frontend Development"',
      timestamp: '2024-10-06 16:45',
      type: 'comment'
    },
    {
      id: 4,
      user: 'Bob Wilson',
      action: 'bergabung dengan meeting online',
      timestamp: '2024-10-06 13:00',
      type: 'meeting'
    }
  ];

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

  const TasksTab = () => (
    <div className="space-y-6">
      {/* Tasks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Selesai</p>
              <p className="text-2xl font-bold text-green-700">{groupData.completedTasks}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Dalam Progress</p>
              <p className="text-2xl font-bold text-yellow-700">{groupData.inProgressTasks}</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Akan Datang</p>
              <p className="text-2xl font-bold text-blue-700">{groupData.upcomingTasks}</p>
            </div>
            <FileText className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {groupTasks.map(task => (
          <div key={task.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Deadline: {new Date(task.dueDate).toLocaleDateString('id-ID')}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status === 'completed' ? 'Selesai' :
                   task.status === 'in_progress' ? 'Dalam Progress' : 'Belum Dimulai'}
                </span>
                
                {task.grade && (
                  <div className="mt-2 flex items-center justify-end">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{task.grade}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button className="text-sm text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded hover:bg-green-50 transition-colors">
                  Lihat Detail
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                  Diskusi
                </button>
              </div>
              
              {task.status !== 'completed' && (
                <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition-colors">
                  Update Progress
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h4>
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
              <div className={`p-2 rounded-full ${
                activity.type === 'file_upload' ? 'bg-blue-100' :
                activity.type === 'task_complete' ? 'bg-green-100' :
                activity.type === 'comment' ? 'bg-yellow-100' :
                'bg-purple-100'
              }`}>
                {activity.type === 'file_upload' ? <FileText className="h-4 w-4 text-blue-600" /> :
                 activity.type === 'task_complete' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                 activity.type === 'comment' ? <MessageSquare className="h-4 w-4 text-yellow-600" /> :
                 <Activity className="h-4 w-4 text-purple-600" />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tasks'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tugas Kelompok
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Aktivitas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'tasks' && <TasksTab />}
      {activeTab === 'activity' && <ActivityTab />}
    </div>
  );
};

export default MahasiswaGroupView;