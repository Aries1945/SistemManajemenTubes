import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/RouteGuard';
import LoginPage from './pages/loginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DosenDashboard from './pages/dosen/DosenDashboard';
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard';
import MahasiswaProfile from './pages/mahasiswa/MahasiswaProfile';
import MahasiswaSettings from './pages/mahasiswa/MahasiswaSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/admin/dashboard/*" 
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AdminDashboard />
              </RouteGuard>
            } 
          />
          
          <Route 
            path="/dosen/dashboard/*" 
            element={
              <RouteGuard allowedRoles={['dosen']}>
                <DosenDashboard />
              </RouteGuard>
            } 
          />
          
          <Route 
            path="/mahasiswa/dashboard/*" 
            element={
              <RouteGuard allowedRoles={['mahasiswa']}>
                <MahasiswaDashboard />
              </RouteGuard>
            } 
          />
          
          <Route 
            path="/mahasiswa/profile" 
            element={
              <RouteGuard allowedRoles={['mahasiswa']}>
                <MahasiswaProfile />
              </RouteGuard>
            } 
          />
          
          <Route 
            path="/mahasiswa/settings" 
            element={
              <RouteGuard allowedRoles={['mahasiswa']}>
                <MahasiswaSettings />
              </RouteGuard>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;