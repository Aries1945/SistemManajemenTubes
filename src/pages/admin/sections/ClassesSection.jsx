import React from 'react';
import { ClipboardList, Users, BookOpen, Plus, Trash2 } from 'lucide-react';

const ClassesSection = ({ 
  classes, 
  courses,
  openEnrollModal,
  openDeleteConfirmation,
  openClassModal
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
        <div className="text-sm text-gray-600">
          Total: {classes.length} kelas
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map(classItem => (
            <div key={classItem.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classItem.nama}</h3>
                  <p className="text-gray-600">{classItem.course_nama} • {classItem.course_kode}</p>
                  {classItem.kode && <p className="text-sm text-gray-500">Kode: {classItem.kode}</p>}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Dosen: {classItem.dosen_nama || 'Belum ditentukan'}</p>
                <p>Kapasitas: {classItem.jumlah_mahasiswa || 0}/{classItem.kapasitas || 'Unlimited'}</p>
                {classItem.ruangan && <p>Ruangan: {classItem.ruangan}</p>}
                {classItem.jadwal && <p>Jadwal: {classItem.jadwal}</p>}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => openEnrollModal(classItem)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Kelola Mahasiswa
                </button>
                <button 
                  onClick={() => openDeleteConfirmation(classItem.id, 'class', classItem.nama)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                  title="Hapus Kelas"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada kelas</h3>
            <p className="text-gray-500">Kelas akan muncul setelah dibuat dari mata kuliah</p>
          </div>
        )}
      </div>

      {/* Courses with Classes Management */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Buat Kelas untuk Mata Kuliah</h2>
          <p className="text-sm text-gray-600">Pilih mata kuliah untuk membuat kelas baru</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.nama}</h3>
                    <p className="text-sm text-gray-600">{course.kode} • {course.sks} SKS</p>
                    <p className="text-sm text-gray-500">{course.semester} {course.tahun_ajaran}</p>
                  </div>
                  <button
                    onClick={() => openClassModal(course)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Buat Kelas
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mata kuliah</h3>
              <p className="text-gray-500">Buat mata kuliah terlebih dahulu sebelum membuat kelas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassesSection;