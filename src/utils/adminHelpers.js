import api from './api';
import { toast } from 'react-hot-toast';

export const toggleUserStatus = async (userId, currentStatus, setUsers) => {
  try {
    const newStatus = !currentStatus;
    await api.patch(`/admin/users/${userId}/status`, { is_active: newStatus });
    
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === userId ? { ...user, is_active: newStatus, status: newStatus ? 'active' : 'inactive' } : user
    ));
    
    toast.success(`User ${newStatus ? 'diaktifkan' : 'dinonaktifkan'} berhasil`);
  } catch (error) {
    console.error('Error toggling user status:', error);
    toast.error(`Gagal ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} user`);
  }
};

export const deleteUser = async (userId, setUsers) => {
  try {
    await api.delete(`/admin/users/${userId}`);
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast.success('User berhasil dihapus');
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error(error.response?.data?.error || 'Gagal menghapus user');
  }
};

export const deleteCourse = async (courseId, setCourses) => {
  try {
    await api.delete(`/admin/courses/${courseId}`);
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    toast.success('Mata kuliah berhasil dihapus');
  } catch (error) {
    console.error('Error deleting course:', error);
    toast.error(error.response?.data?.error || 'Gagal menghapus mata kuliah');
  }
};

export const deleteClass = async (classId, setClasses) => {
  try {
    await api.delete(`/admin/classes/${classId}`);
    setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
    toast.success('Kelas berhasil dihapus');
  } catch (error) {
    console.error('Error deleting class:', error);
    toast.error(error.response?.data?.error || 'Gagal menghapus kelas');
  }
};

export const handleCreateDosen = async (dosenData, setUsers) => {
  try {
    const response = await api.post('/admin/dosen', dosenData);
    
    if (response.data && response.data.user) {
      setUsers(prevUsers => [response.data.user, ...prevUsers]);
      toast.success(`Akun dosen untuk ${dosenData.nama_lengkap} berhasil dibuat`);
    } else {
      const updatedUsers = await api.get('/admin/users');
      setUsers(updatedUsers.data);
      toast.success('Akun dosen berhasil dibuat');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating dosen:', error);
    toast.error(error.response?.data?.error || 'Gagal membuat akun dosen');
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to create dosen account'
    };
  }
};

export const handleCreateMahasiswa = async (userData, setUsers) => {
  try {
    const dataWithPassword = {
      ...userData,
      password: userData.password || "123"
    };
    
    const response = await api.post('/admin/mahasiswa', dataWithPassword);
    const newUser = response.data.user;
    
    setUsers(prevUsers => [newUser, ...prevUsers]);
    toast.success(`Akun mahasiswa untuk ${newUser.nama_lengkap || newUser.email} berhasil dibuat`);
    
    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creating mahasiswa:', error);
    toast.error(error.response?.data?.error || 'Gagal membuat akun mahasiswa');
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to create mahasiswa'
    };
  }
};

export const handleCreateCourse = async (courseData, setCourses) => {
  try {
    const response = await api.post('/admin/courses', courseData);
    
    if (response.data && response.data.course) {
      setCourses(prevCourses => [response.data.course, ...prevCourses]);
      toast.success(`Mata kuliah ${courseData.nama} (${courseData.kode}) berhasil dibuat`);
    }
    
    return { success: true, course: response.data.course };
  } catch (error) {
    console.error('Error creating course:', error);
    toast.error(error.response?.data?.error || 'Gagal membuat mata kuliah');
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to create course'
    };
  }
};

export const handleCreateClass = async (classData, courseId, fetchData) => {
  try {
    const response = await api.post(`/admin/courses/${courseId}/classes`, classData);
    
    if (response.data && response.data.class) {
      fetchData();
      toast.success(`Kelas ${classData.nama} berhasil dibuat`);
      return { success: true };
    }
    
    return { success: false, error: 'Gagal membuat kelas' };
  } catch (error) {
    console.error('Error creating class:', error);
    toast.error(error.response?.data?.error || 'Gagal membuat kelas');
    return { success: false, error: error.response?.data?.error || 'Failed to create class' };
  }
};

export const getFilteredUsers = (users, roleFilter, statusFilter, searchQuery) => {
  return users.filter(user => {
    const roleMatches = roleFilter === 'all' || user.role === roleFilter;
    const statusMatches = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    const searchMatches = !searchQuery || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nama_lengkap && user.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.nim && user.nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.nip && user.nip.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return roleMatches && statusMatches && searchMatches;
  });
};

export const getFilteredCourses = (courses, semesterFilter) => {
  return courses.filter(course => {
    if (semesterFilter === 'all') return true;
    
    if (typeof course.semester === 'number') {
      return (semesterFilter === 'ganjil' && course.semester % 2 === 1) || 
             (semesterFilter === 'genap' && course.semester % 2 === 0);
    }
    
    if (course.semester && !isNaN(parseInt(course.semester))) {
      const semNum = parseInt(course.semester);
      return (semesterFilter === 'ganjil' && semNum % 2 === 1) || 
             (semesterFilter === 'genap' && semNum % 2 === 0);
    }
    
    if (typeof course.semester === 'string') {
      const semLower = course.semester.toLowerCase();
      return (semesterFilter === 'ganjil' && semLower.includes('ganjil')) || 
             (semesterFilter === 'genap' && semLower.includes('genap'));
    }
    
    return false;
  });
};