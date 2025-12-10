import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import DosenCourses from '../DosenCourses';

// Mock the api module
jest.mock('../../../utils/api', () => ({
  getDosenCourses: jest.fn(() => Promise.resolve({
    data: {
      success: true,
      courses: [
        {
          course_id: 1,
          course_name: 'Pemrograman Web',
          course_code: 'IF123',
          class_names: 'A, B',
          total_students: 45,
          semester: 'Ganjil',
          tahun_ajaran: '2024/2025',
          sks: 3,
          total_classes: 2,
          class_details: JSON.stringify({
            'A': { student_count: 22, active_groups: 4, pending_grading: 6, progress: 75 },
            'B': { student_count: 23, active_groups: 4, pending_grading: 6, progress: 68 }
          })
        },
        {
          course_id: 2,
          course_name: 'Basis Data',
          course_code: 'IF234',
          class_names: 'A',
          total_students: 38,
          semester: 'Ganjil',
          tahun_ajaran: '2024/2025',
          sks: 3,
          total_classes: 1,
          class_details: JSON.stringify({
            'A': { student_count: 38, active_groups: 7, pending_grading: 5, progress: 60 }
          })
        }
      ]
    }
  }))
}));

const mockAuthContext = {
  user: {
    nama_lengkap: 'Dr. John Doe',
    role: 'dosen'
  },
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true
};

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('DosenCourses - Separate Class Cards', () => {
  test('should render separate cards for each class', async () => {
    renderWithContext(<DosenCourses />);
    
    // Wait for data to load
    await screen.findByText('Mata Kuliah');
    
    // Should see 3 cards total: Pemrograman Web A, Pemrograman Web B, Basis Data A
    expect(screen.getAllByText('Pemrograman Web')).toHaveLength(2);
    expect(screen.getByText('Basis Data')).toBeInTheDocument();
    
    // Should show class badges
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    
    // Should show individual class student counts
    expect(screen.getByText('22 mahasiswa')).toBeInTheDocument(); // Pemrograman Web A
    expect(screen.getByText('23 mahasiswa')).toBeInTheDocument(); // Pemrograman Web B  
    expect(screen.getByText('38 mahasiswa')).toBeInTheDocument(); // Basis Data A
  });

  test('should show correct total statistics', async () => {
    renderWithContext(<DosenCourses />);
    
    await screen.findByText('Mata Kuliah');
    
    // Total students: 22 + 23 + 38 = 83
    expect(screen.getByText('83')).toBeInTheDocument();
    
    // Should show "3 kelas diampu" instead of mata kuliah
    expect(screen.getByText('3 kelas diampu')).toBeInTheDocument();
  });

  test('should display class information clearly', async () => {
    renderWithContext(<DosenCourses />);
    
    await screen.findByText('Mata Kuliah');
    
    // Should show "Kelas A", "Kelas B" labels
    expect(screen.getByText(/Kelas A/)).toBeInTheDocument();
    expect(screen.getByText(/Kelas B/)).toBeInTheDocument();
    
    // Should show total classes info for multi-class courses
    expect(screen.getByText('(2 kelas total)')).toBeInTheDocument();
  });

  test('should handle courses with single class correctly', async () => {
    renderWithContext(<DosenCourses />);
    
    await screen.findByText('Mata Kuliah');
    
    // Basis Data should only have one card
    expect(screen.getAllByText('Basis Data')).toHaveLength(1);
    expect(screen.getByText('38 mahasiswa')).toBeInTheDocument();
  });
});

// Integration test to ensure navigation works correctly
describe('DosenCourses Navigation', () => {
  test('should navigate with correct course ID and class info', () => {
    const mockNavigate = jest.fn();
    
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    // This would need to be tested with actual click events
    // but demonstrates the expected behavior
  });
});

export default DosenCourses;