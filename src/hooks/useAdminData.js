import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export const useAdminData = (serverAvailable, logout) => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDosen: 0,
    activeDosen: 0,
    totalMahasiswa: 0,
    activeMahasiswa: 0,
    totalMataKuliah: 0,
    serverUptime: 99.9
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let userData = [];
      try {
        console.log('Fetching users from API...');
        const usersResponse = await api.get('/admin/users');
        userData = usersResponse.data || [];
        console.log(`Received ${userData.length} users from API:`, userData);
        setUsers(userData);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        console.error('Error response:', err.response);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
        // Show error to user
        if (err.response?.status === 500) {
          toast.error('Gagal memuat data user. Silakan refresh halaman.');
        }
      }
      
      let courseData = [];
      try {
        const coursesResponse = await api.get('/admin/courses');
        courseData = coursesResponse.data || [];
        setCourses(courseData);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
      }
      
      try {
        const classesResponse = await api.get('/admin/classes');
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          logout();
          return;
        }
      }
      
      setStats({
        totalUsers: userData.length,
        activeUsers: userData.filter(u => u.is_active).length,
        totalDosen: userData.filter(u => u.role === 'dosen').length,
        activeDosen: userData.filter(u => u.role === 'dosen' && u.is_active).length,
        totalMahasiswa: userData.filter(u => u.role === 'mahasiswa').length,
        activeMahasiswa: userData.filter(u => u.role === 'mahasiswa' && u.is_active).length,
        totalMataKuliah: courseData.length,
        serverUptime: 99.9
      });
      
    } catch (error) {
      setError('Failed to load data');
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serverAvailable) {
      fetchData();
    }
  }, [serverAvailable]);

  useEffect(() => {
    if (users.length > 0 || courses.length > 0) {
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalDosen: users.filter(u => u.role === 'dosen').length,
        activeDosen: users.filter(u => u.role === 'dosen' && u.is_active).length,
        totalMahasiswa: users.filter(u => u.role === 'mahasiswa').length,
        activeMahasiswa: users.filter(u => u.role === 'mahasiswa' && u.is_active).length,
        totalMataKuliah: courses.length
      }));
    }
  }, [users, courses]);

  return {
    users,
    setUsers,
    courses,
    setCourses,
    classes,
    setClasses,
    systemLogs,
    setSystemLogs,
    stats,
    setStats,
    isLoading,
    error,
    recentActivity,
    setRecentActivity,
    fetchData
  };
};