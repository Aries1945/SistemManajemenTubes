import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login' }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'dosen':
        return <Navigate to="/dosen/dashboard" replace />;
      case 'mahasiswa':
        return <Navigate to="/mahasiswa/dashboard" replace />;
      default:
        return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;