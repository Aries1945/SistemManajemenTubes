import React from 'react';
import { BookOpen, Plus, Edit, Trash2, ChevronDown } from 'lucide-react';

const CoursesSection = ({ 
  courses, 
  semesterFilter, 
  setSemesterFilter,
  getFilteredCourses,
  setIsCourseModalOpen,
  openDeleteConfirmation
}) => {
  const filteredCourses = getFilteredCourses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Kuliah</h1>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Semua Semester</option>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          
          <button 
            onClick={() => setIsCourseModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.nama}</h3>
                  <p className="text-gray-600">{course.kode} • {course.sks} SKS</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Dosen: {course.dosen_nama || 'Belum ditentukan'}</p>
                <p>Semester: {course.semester} {course.tahun_ajaran}</p>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                  Detail
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                
                <button 
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  onClick={() => openDeleteConfirmation(course.id, 'course', course.nama)}
                  title="Hapus Mata Kuliah"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white p-8 rounded-xl shadow-lg text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mata kuliah</h3>
            <p className="text-gray-500 mb-4">Belum ada mata kuliah yang terdaftar dalam sistem</p>
            <button 
              onClick={() => setIsCourseModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Mata Kuliah Pertama</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesSection;