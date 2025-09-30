import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Dosen Components
import DosenDashboard from './pages/dosen/DosenDashboard';
import DosenCourses from './pages/dosen/DosenCourses';
import CourseDetail from './pages/dosen/CourseDetail';

// Mahasiswa Components
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard';
import MahasiswaCourses from './pages/mahasiswa/MahasiswaCourses';
import MahasiswaGroups from './pages/mahasiswa/MahasiswaGroups';
import MahasiswaAssignments from './pages/mahasiswa/MahasiswaAssignments';
import MahasiswaCourseDetail from './pages/mahasiswa/MahasiswaCourseDetail';

// Admin Components
import AdminCourseManagement from './pages/admin/AdminCourseManagement';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dosen Routes */}
          <Route path="/dashboard" element={<DosenDashboard />} />
          <Route path="/courses" element={<DosenCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          
          {/* Mahasiswa Routes */}
          <Route path="/student/dashboard" element={<MahasiswaDashboard />} />
          <Route path="/student/courses" element={<MahasiswaCourses />} />
          <Route path="/student/courses/:courseId" element={<MahasiswaCourseDetail />} />
          <Route path="/student/groups" element={<MahasiswaGroups />} />
          <Route path="/student/assignments" element={<MahasiswaAssignments />} />
          
          {/* Admin Routes */}
          <Route path="/admin/courses" element={<AdminCourseManagement />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;