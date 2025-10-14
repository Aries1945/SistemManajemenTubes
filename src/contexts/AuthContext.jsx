import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set the Authorization header for future API calls
        api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Update the login function to match what LoginPage expects
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      
      // Store user data in context and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set the Authorization header for future API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle inactive account specifically
      if (error.response?.data?.status === 'inactive') {
        return {
          success: false,
          error: 'Akun Anda tidak aktif. Silakan hubungi administrator.'
        };
      }
      
      return {
        success: false, 
        error: error.response?.data?.error || 'Login gagal. Silakan coba lagi.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear user data
    setUser(null);
    localStorage.removeItem('user');
    
    // Clear Authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Redirect to login
    navigate('/login');
  };
  
  const redirectUserBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'dosen':
        navigate('/dosen/dashboard');
        break;
      case 'mahasiswa':
        navigate('/mahasiswa/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  // Auth context value
  const value = {
    user,
    isLoading,
    login,
    logout,
    redirectUserBasedOnRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};