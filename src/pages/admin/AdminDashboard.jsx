import React, { useState } from 'react';
import { Shield, Bell, LogOut, BarChart3, Users, BookOpen, ClipboardList, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import LogoIF2 from '../../assets/LogoIF2.png';

// Hooks
import { useAdminData } from '../../hooks/useAdminData';

// Helpers
import * as adminHelpers from '../../utils/adminHelpers';

// Components
import CreateDosenModal from '../../components/admin/CreateDosenModal';
import CreateMahasiswaModal from '../../components/admin/CreateMahasiswaModal';
import CreateCourseModal from '../../components/admin/CreateCourseModal';
import CreateClassModal from '../../components/admin/CreateClassModal';
import EnrollStudentsModal from '../../components/admin/EnrollStudentsModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ServerStatusChecker from '../../components/ServerStatusChecker';
import DeleteConfirmationDialog from '../../components/admin/DeleteConfirmationDialog.jsx';

// Sections
import DashboardSection from './sections/DashboardSection.jsx';
import UsersSection from './sections/UsersSection.jsx';
import CoursesSection from './sections/CoursesSection.jsx';
import ClassesSection from './sections/ClassesSection.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const [serverAvailable, setServerAvailable] = useState(false);
  
  // Use custom hook for data management
  const {
    users,
    setUsers,
    courses,
    setCourses,
    classes,
    setClasses,
    systemLogs,
    stats,
    isLoading,
    error,
    recentActivity,
    fetchData
  } = useAdminData(serverAvailable, logout);

  // Modal states
  const [isDosenModalOpen, setIsDosenModalOpen] = useState(false);
  const [isMahasiswaModalOpen, setIsMahasiswaModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  
  // Selected items
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter states
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemType: null,
    itemName: null
  });

  // Helper function wrappers
  const getFilteredUsers = () => adminHelpers.getFilteredUsers(users, roleFilter, statusFilter, searchQuery);
  const getFilteredCourses = () => adminHelpers.getFilteredCourses(courses, semesterFilter);
  
  const toggleUserStatus = (userId, currentStatus, userRole) => 
    adminHelpers.toggleUserStatus(userId, currentStatus, setUsers);
  
  const handleCreateDosen = (dosenData) => 
    adminHelpers.handleCreateDosen(dosenData, setUsers);
  
  const handleCreateMahasiswa = (userData) => 
    adminHelpers.handleCreateMahasiswa(userData, setUsers);
  
  const handleCreateCourse = (courseData) => 
    adminHelpers.handleCreateCourse(courseData, setCourses);
  
  const handleCreateClass = (classData, courseId) => 
    adminHelpers.handleCreateClass(classData, courseId, fetchData);

  // Delete confirmation handlers
  const openDeleteConfirmation = (id, type, name) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemName: name
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemType: null,
      itemName: null
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirmation.itemType === 'user') {
        await adminHelpers.deleteUser(deleteConfirmation.itemId, setUsers);
      } else if (deleteConfirmation.itemType === 'course') {
        await adminHelpers.deleteCourse(deleteConfirmation.itemId, setCourses);
      } else if (deleteConfirmation.itemType === 'class') {
        await adminHelpers.deleteClass(deleteConfirmation.itemId, setClasses);
      }
    } catch (error) {
      console.error('Error during delete confirmation:', error);
    } finally {
      closeDeleteConfirmation();
    }
  };

  // Class management handlers
  const openClassModal = (course) => {
    setSelectedCourse(course);
    setIsClassModalOpen(true);
  };

  const openEnrollModal = (classItem) => {
    setSelectedClass(classItem);
    setIsEnrollModalOpen(true);
  };

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manajemen User', icon: Users },
    { id: 'courses', label: 'Mata Kuliah', icon: BookOpen },
    { id: 'classes', label: 'Manajemen Kelas', icon: ClipboardList }
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardSection 
            stats={stats}
            systemLogs={systemLogs}
            recentActivity={recentActivity}
            setActiveTab={setActiveTab}
          />
        );
      case 'users':
        return (
          <UsersSection
            users={users}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            getFilteredUsers={getFilteredUsers}
            toggleUserStatus={toggleUserStatus}
            openDeleteConfirmation={openDeleteConfirmation}
            setIsDosenModalOpen={setIsDosenModalOpen}
            setIsMahasiswaModalOpen={setIsMahasiswaModalOpen}
            handleEditUser={(user) => {
              setSelectedUser(user);
              setIsEditUserModalOpen(true);
            }}
          />
        );
      case 'courses':
        return (
          <CoursesSection
            courses={courses}
            semesterFilter={semesterFilter}
            setSemesterFilter={setSemesterFilter}
            getFilteredCourses={getFilteredCourses}
            setIsCourseModalOpen={setIsCourseModalOpen}
            openDeleteConfirmation={openDeleteConfirmation}
          />
        );
      case 'classes':
        return (
          <ClassesSection
            classes={classes}
            courses={courses}
            openEnrollModal={openEnrollModal}
            openDeleteConfirmation={openDeleteConfirmation}
            openClassModal={openClassModal}
          />
        );
      default:
        return (
          <DashboardSection 
            stats={stats}
            systemLogs={systemLogs}
            recentActivity={recentActivity}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // Server availability check
  if (!serverAvailable) {
    return <ServerStatusChecker onServerAvailable={() => setServerAvailable(true)} />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-600 border-b-purple-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading dashboard data...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 block w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 block w-full"
            >
              Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden hover:opacity-90 transition-opacity duration-300">
                  <img 
                    src={LogoIF2} 
                    alt="Logo IF" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="h-8 w-px bg-gray-200/60"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal Administrator</h1>
                  <p className="text-xs text-gray-500">Sistem Manajemen Tugas Besar</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.nama_lengkap || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@unpar.ac.id'}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Keluar"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gray-200/50 sticky top-24">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-purple-50 hover:shadow-md'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Modals */}
      <CreateDosenModal 
        isOpen={isDosenModalOpen}
        onClose={() => setIsDosenModalOpen(false)}
        onSubmit={handleCreateDosen}
      />

      <CreateMahasiswaModal
        isOpen={isMahasiswaModalOpen} 
        onClose={() => setIsMahasiswaModalOpen(false)}
        onSubmit={handleCreateMahasiswa}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdate={() => {
          fetchData();
        }}
      />

      <CreateCourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      <CreateClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSubmit={handleCreateClass}
        courseId={selectedCourse?.id}
        courseName={selectedCourse?.nama}
      />

      <EnrollStudentsModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        classId={selectedClass?.id}
        className={selectedClass?.nama}
      />

      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onCancel={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        itemType={deleteConfirmation.itemType}
        itemName={deleteConfirmation.itemName}
      />
      
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminDashboard;