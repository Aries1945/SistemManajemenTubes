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
      
      // Clear any existing authentication data before login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;// Store user data in context and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token); // Also store token separately for tugasBesarApi
      
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

  // Logout function - comprehensive cleanup
  const logout = () => {// Clear user data from state
    setUser(null);
    
    // Clear ALL possible token/user storage locations
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userToken');
    
    // Also clear session storage if any
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('userToken');
    
    // Clear Authorization header from axios
    delete api.defaults.headers.common['Authorization'];
    
    // Force refresh the page to ensure complete state reset
    localStorage.clear(); // Clear everything from localStorage
    sessionStorage.clear(); // Clear everything from sessionStorage// Redirect to login
    navigate('/login');
    
    // Optional: Force page reload to ensure complete cleanup
    window.location.reload();
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

  // Function to update user data
  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) {
        // If no previous user, just use the updated data
        const newUser = updatedUserData;
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
      }
      // Merge with previous user data
      const newUser = { ...prevUser, ...updatedUserData };
      // Also update localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Auth context value
  const value = {
    user,
    setUser: updateUser,
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