import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, FileText, Star, Calendar, Clock, 
  CheckCircle, Download, Upload, MessageSquare, Users,
  BookOpen, Target, Award, AlertCircle, Play, Eye, ArrowLeft,
  RefreshCw, Plus, Settings, CheckSquare, XCircle, Clock3,
  ChevronLeft, BookOpenIcon, X, Info, UserPlus, UserMinus
} from 'lucide-react';
import { getTugasBesarByCourse, getCourseDetail, getPenilaianTugasBesar } from '../../utils/mahasiswaApi';
import { getAvailableGroups, joinGroup, leaveStudentGroup, getCurrentGroup } from '../../utils/kelompokApi';

// Utility functions - moved to top level so they can be used by all components
const formatDate = (dateString) => {
  if (!dateString) return 'Tanggal tidak tersedia';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'Tanggal tidak valid';
  }
};

// Utility function untuk convert grouping method ke bahasa Indonesia
const formatGroupingMethod = (method) => {
  const methodMap = {
    'student_choice': 'Pilihan Mahasiswa',
    'manual': 'Manual oleh Dosen',
    'automatic': 'Otomatis oleh Sistem',
    'random': 'Acak'
  };
  return methodMap[method] || method;
};

// Function untuk check apakah mahasiswa bisa pilih kelompok
const canSelectGroup = (tugas) => {
  // Validasi konsistensi data dulu
  const isConsistent = (tugas.grouping_method === 'student_choice') === (tugas.student_choice_enabled === true);
  
  // Mahasiswa bisa pilih kelompok HANYA jika:
  // grouping_method adalah 'student_choice' DAN student_choice_enabled = true
  // Ini memastikan konsistensi yang ketat
  return tugas.grouping_method === 'student_choice' && tugas.student_choice_enabled === true;
};

const MahasiswaCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [tugasBesar, setTugasBesar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedTugasForGroup, setSelectedTugasForGroup] = useState(null);
  const [tugasBesarNilai, setTugasBesarNilai] = useState([]); // Store nilai from visible tugas besar

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading course detail for courseId:', courseId);
      
      // Load course detail first
      const courseResponse = await getCourseDetail(courseId);
      
      console.log('Course response:', courseResponse);
      
      if (courseResponse && courseResponse.success) {
        const courseData = courseResponse.course;
        
        if (!courseData) {
          throw new Error('Data mata kuliah tidak ditemukan dalam response');
        }
        
        // Set course information from API
        setCourse({
          id: parseInt(courseId),
          name: courseData.course_name,
          code: courseData.course_code,
          lecturer: courseData.dosen_name || 'Belum ditentukan',
          lecturerNip: courseData.dosen_nip,
          lecturerDept: null,
          class: courseData.class_name || 'A',
          classId: courseData.class_id,
          semester: `${courseData.semester} ${courseData.tahun_ajaran}`,
          sks: courseData.sks || 3,
          capacity: courseData.kapasitas || 0,
          totalStudents: courseData.kapasitas || 0, // Could be enhanced with actual count
          myGrade: courseData.nilai_akhir || null,
          totalTasks: 0, // Will be updated from tugas besar
          completedTasks: 0, // Calculate based on submissions
          pendingTasks: 0, // Will be updated from tugas besar
          taskProgress: 0, // Will be calculated
          myGroup: null,
          groupMembers: [],
          enrolledAt: courseData.enrolled_at,
          enrollmentStatus: courseData.enrollment_status,
          description: courseData.course_description
        });
        
        // Load tugas besar for this course
        const tugasResponse = await getTugasBesarByCourse(courseId);
        
        if (tugasResponse && tugasResponse.success) {
          setTugasBesar(tugasResponse.tugasBesar);
          
          // Update course with tugas besar count
          setCourse(prev => ({
            ...prev,
            totalTasks: tugasResponse.tugasBesar.length,
            pendingTasks: tugasResponse.tugasBesar.length // All tasks are pending by default
          }));

          // Load penilaian for all tugas besar that are visible
          loadTugasBesarNilai(tugasResponse.tugasBesar);
        } else {
          setTugasBesar([]);
        }
        
      } else {
        setError('Mata kuliah tidak ditemukan atau Anda tidak terdaftar di mata kuliah ini.');
        setCourse(null);
        setTugasBesar([]);
      }
    } catch (err) {
      console.error('Error loading course detail:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Server error';
      setError('Gagal memuat detail mata kuliah: ' + errorMessage);
      setTugasBesar([]);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCourseDetail();
  };

  const loadTugasBesarNilai = async (tugasBesarList) => {
    const nilaiList = [];
    
    for (const tugas of tugasBesarList) {
      try {
        const response = await getPenilaianTugasBesar(tugas.id);
        if (response && response.success && response.visible && response.data && response.data.average !== null) {
          nilaiList.push({
            tugasId: tugas.id,
            tugasTitle: tugas.title || tugas.judul,
            nilai: response.data.average
          });
        }
      } catch (error) {
        console.error(`Error loading penilaian for tugas ${tugas.id}:`, error);
      }
    }
    
    setTugasBesarNilai(nilaiList);
    
    // Calculate average nilai from all visible tugas besar
    if (nilaiList.length > 0) {
      const totalNilai = nilaiList.reduce((sum, item) => sum + item.nilai, 0);
      const averageNilai = totalNilai / nilaiList.length;
      
      setCourse(prev => ({
        ...prev,
        myGrade: averageNilai.toFixed(1)
      }));
    }
  };

  const handleViewTugasDetail = (tugas) => {
    setSelectedTugas(tugas);
    setShowDetailModal(true);
  };

  const handleJoinKelompok = (tugas) => {
    // Check if task allows student choice and is still active
    if (!canSelectGroup(tugas)) {
      alert('Pemilihan kelompok tidak diizinkan untuk tugas ini.');
      return;
    }

    // Check if task is still active (not ended)
    const now = new Date();
    const endDate = new Date(tugas.end_date || tugas.tanggal_selesai);
    
    if (now > endDate) {
      alert('Tugas sudah berakhir. Tidak dapat memilih kelompok lagi.');
      return;
    }

    // Open group selection modal
    setSelectedTugasForGroup(tugas);
    setShowGroupModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTugas(null);
  };

  const closeGroupModal = () => {
    setShowGroupModal(false);
    setSelectedTugasForGroup(null);
  };

  const TugasBesarCard = ({ tugas }) => {
    // Parse JSONB data if it's string
  const parseJSONData = (data) => {
    // If data is already an array (JSONB from PostgreSQL), return it directly
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a string, try to parse it
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    // If it's null or undefined, return empty array
    return [];
  };
  
  const komponenData = parseJSONData(tugas.komponen);
    const deliverableData = parseJSONData(tugas.deliverable);

    const getStatusColor = (startDate, endDate) => {
      if (!startDate || !endDate) return 'bg-gray-100 text-gray-800 border-gray-200';
      
      try {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 'bg-gray-100 text-gray-800 border-gray-200';
        }
        
        if (now < start) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (now > end) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-green-100 text-green-800 border-green-200';
      } catch (error) {
        
        return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getStatusText = (startDate, endDate) => {
      if (!startDate || !endDate) return 'Status Tidak Diketahui';
      
      try {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 'Status Tidak Diketahui';
        }
        
        if (now < start) return 'Belum Dimulai';
        if (now > end) return 'Sudah Berakhir';
        return 'Sedang Berjalan';
      } catch (error) {
        
        return 'Status Tidak Diketahui';
      }
    };

    const getStatusIcon = (startDate, endDate) => {
      if (!startDate || !endDate) return <Info className="h-4 w-4" />;
      
      try {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return <Info className="h-4 w-4" />;
        }
        
        if (now < start) return <Clock3 className="h-4 w-4" />;
        if (now > end) return <XCircle className="h-4 w-4" />;
        return <CheckSquare className="h-4 w-4" />;
      } catch (error) {
        
        return <Info className="h-4 w-4" />;
      }
    };

    // Debugging: log tugas data

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h5 className="text-lg font-semibold text-gray-900 mb-1">
              {tugas.title || tugas.judul || 'Judul Tidak Tersedia'}
            </h5>
            <p className="text-gray-600 text-sm mb-2">
              {tugas.description || tugas.deskripsi || 'Deskripsi tidak tersedia'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tugas.start_date, tugas.end_date)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(tugas.start_date, tugas.end_date)}
              <span>{getStatusText(tugas.start_date, tugas.end_date)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p>
            <p className="text-sm font-medium">{formatDate(tugas.start_date || tugas.tanggal_mulai)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Tanggal Selesai</p>
            <p className="text-sm font-medium">{formatDate(tugas.end_date || tugas.tanggal_selesai)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Metode Kelompok</p>
            <p className="text-sm font-medium">{formatGroupingMethod(tugas.grouping_method)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ukuran Kelompok</p>
            <p className="text-sm font-medium">{tugas.min_group_size}-{tugas.max_group_size} orang</p>
          </div>
        </div>

        {/* Komponen dan Deliverable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {komponenData && komponenData.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Komponen Penilaian</p>
              <div className="space-y-1">
                {komponenData.map((komponen, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 rounded px-2 py-1">
                    {komponen.nama || komponen.name || 'Komponen'}: {komponen.bobot || komponen.weight || 0}%
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {deliverableData && deliverableData.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Deliverable</p>
              <div className="space-y-1">
                {deliverableData.map((item, idx) => (
                  <div key={idx} className="text-xs bg-blue-50 rounded px-2 py-1">
                    {item.nama || item.name || item.title || 'Deliverable'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tampilkan pesan jika tidak ada data */}
          {(!komponenData || komponenData.length === 0) && (!deliverableData || deliverableData.length === 0) && (
            <div className="col-span-2 text-center py-4">
              <p className="text-gray-500 text-sm">Belum ada komponen penilaian atau deliverable yang ditentukan</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start pt-3 border-t border-gray-100">
          <div className="flex flex-col text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Dibuat: {new Date(tugas.created_at).toLocaleDateString('id-ID')}</span>
            </div>
            {tugas.dosen_name && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Oleh: {tugas.dosen_name}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleViewTugasDetail(tugas)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
            >
              <Eye className="h-3 w-3 mr-1" />
              Lihat Detail
            </button>
            {canSelectGroup(tugas) && (
              <button 
                onClick={() => handleJoinKelompok(tugas)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
              >
                <Users className="h-3 w-3 mr-1" />
                Pilih Kelompok
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CourseOverview = () => (
    <div className="space-y-6">
      {/* Course Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">Informasi Mata Kuliah</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Dosen Pengampu</p>
            <p className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              {course.lecturer || 'Belum ditentukan'}
            </p>
            {course.lecturerNip && (
              <p className="text-xs text-gray-500 mt-1">NIP: {course.lecturerNip}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kelas</p>
            <p className="font-medium">{course.class}</p>
            <p className="text-xs text-gray-500 mt-1">ID Kelas: {course.classId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">SKS</p>
            <p className="font-medium">{course.sks} SKS</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Kapasitas Kelas</p>
            <p className="font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              {course.capacity} mahasiswa
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status Enrollment</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              course.enrollmentStatus === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.enrollmentStatus === 'active' ? 'Aktif' : course.enrollmentStatus}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Course Start Date</p>
            <p className="font-medium text-sm">
              {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('id-ID') : 'Tidak tersedia'}
            </p>
          </div>
        </div>
        
        {course.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi Mata Kuliah</h5>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
          </div>
        )}
      </div>

      {/* Tugas Besar Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold">Tugas Besar Kelas {course.class}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Tugas besar yang dibuat oleh {course.lecturer} untuk kelas ini
            </p>
            {course.classId && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📚 Menampilkan tugas khusus untuk {course.class}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Anda hanya dapat melihat tugas besar yang dibuat untuk kelas Anda. 
                  Tugas dari kelas lain tidak akan ditampilkan di sini.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{tugasBesar.length} tugas besar</span>
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data tugas besar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {tugasBesar.length > 0 ? (
          <div className="space-y-4">
            {tugasBesar.map((tugas, idx) => (
              <TugasBesarCard key={`tugas-${tugas.id}-${idx}`} tugas={tugas} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tugas Besar</h3>
            <p className="text-gray-500 mb-2">
              Belum ada tugas besar yang dibuat untuk {course.class}.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Informasi Class Isolation:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Tugas besar ditampilkan khusus untuk <strong>{course.class}</strong></li>
                <li>• Dosen pengampu: <strong>{course.lecturer}</strong></li>
                <li>• Class ID: <strong>{course.classId}</strong></li>
                <li>• Tugas dari kelas lain tidak akan ditampilkan di sini</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail mata kuliah...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Gagal memuat data</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Kembali ke Daftar Mata Kuliah
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate('/mahasiswa/dashboard/mata-kuliah')}
          className="text-green-600 hover:text-green-800 font-medium flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Mata Kuliah Saya
        </button>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow border mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-green-100">{course.code} • {course.sks} SKS</p>
                <div className="flex items-center gap-1">
                  <span className="text-green-100">•</span>
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {course.class}
                  </span>
                  {course.classId && (
                    <span className="text-green-200 text-xs">(ID: {course.classId})</span>
                  )}
                </div>
              </div>
              <p className="text-green-100 text-sm">{course.semester}</p>
              <div className="flex items-center text-sm text-green-100">
                <User className="h-4 w-4 mr-1" />
                <span>{course.lecturer}</span>
                {course.lecturerDept && (
                  <span className="ml-2 text-xs">• {course.lecturerDept}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Nilai Saya</p>
            {(() => {
              const calculatedGrade = course.myGrade || (tugasBesarNilai.length > 0 
                ? (tugasBesarNilai.reduce((sum, item) => sum + item.nilai, 0) / tugasBesarNilai.length).toFixed(1)
                : null);
              const hasGrade = calculatedGrade !== null && calculatedGrade !== undefined && calculatedGrade !== '';
              
              return (
                <>
                  <span className="text-3xl font-bold">
                    {hasGrade ? calculatedGrade : 'NA'}
                  </span>
                  <div className="flex items-center justify-end mt-1">
                    <Star className="h-4 w-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-green-100">
                      {hasGrade ? (() => {
                        const nilai = parseFloat(calculatedGrade);
                        return nilai >= 85 ? 'A' : nilai >= 80 ? 'A-' : nilai >= 75 ? 'B+' : nilai >= 70 ? 'B' : nilai >= 65 ? 'B-' : nilai >= 60 ? 'C+' : nilai >= 55 ? 'C' : nilai >= 50 ? 'C-' : nilai >= 45 ? 'D' : nilai >= 0 ? 'E' : 'NA';
                      })() : 'NA'}
                    </span>
                  </div>
                  {hasGrade && tugasBesarNilai.length > 0 && (
                    <p className="text-green-200 text-xs mt-1">
                      Dari {tugasBesarNilai.length} tugas besar
                    </p>
                  )}
                  {!hasGrade && (
                    <p className="text-green-200 text-xs mt-1">
                      Nilai belum tersedia
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
        
        {/* Status Enrollment */}
        <div className="mt-4 pt-4 border-t border-green-500 border-opacity-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.enrollmentStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {course.enrollmentStatus === 'active' ? 'Terdaftar Aktif' : course.enrollmentStatus}
              </span>
              {course.enrolledAt && (
                <span className="text-green-100 text-xs">
                  Terdaftar sejak: {new Date(course.enrolledAt).toLocaleDateString('id-ID')}
                </span>
              )}
            </div>
            <div className="text-right text-green-100 text-xs">
              <p>{course.totalTasks} Tugas Besar</p>
              <p>{course.completedTasks} Selesai • {course.pendingTasks} Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('nilai')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nilai'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="h-4 w-4 inline mr-2" />
            Nilai Saya
          </button>
          <button
            onClick={() => setActiveTab('kelompok')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kelompok'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Kelompok Saya
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <CourseOverview />}
      {activeTab === 'nilai' && <NilaiSaya tugasBesarNilai={tugasBesarNilai} course={course} />}
      {activeTab === 'kelompok' && <KelompokSaya tugasBesar={tugasBesar} course={course} />}

      {/* Tugas Besar Detail Modal */}
      {showDetailModal && selectedTugas && (
        <TugasBesarDetailModal 
          tugas={selectedTugas} 
          onClose={closeDetailModal}
          course={course}
          handleJoinKelompok={handleJoinKelompok}
        />
      )}

      {/* Group Selection Modal */}
      {showGroupModal && selectedTugasForGroup && (
        <GroupSelectionModal 
          tugas={selectedTugasForGroup} 
          onClose={closeGroupModal}
          courseId={courseId}
        />
      )}
    </div>
  );
};

// Modal Component untuk Detail Tugas Besar
const TugasBesarDetailModal = ({ 
  tugas, 
  onClose, 
  course, 
  handleJoinKelompok 
}) => {
  const [penilaian, setPenilaian] = useState(null);
  const [loadingPenilaian, setLoadingPenilaian] = useState(false);
  const [penilaianVisible, setPenilaianVisible] = useState(false);

  useEffect(() => {
    if (tugas?.id) {
      loadPenilaian();
    }
  }, [tugas?.id]);

  const loadPenilaian = async () => {
    try {
      setLoadingPenilaian(true);
      const response = await getPenilaianTugasBesar(tugas.id);
      if (response && response.success) {
        setPenilaianVisible(response.visible);
        if (response.visible && response.data) {
          setPenilaian(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading penilaian:', error);
      setPenilaianVisible(false);
    } finally {
      setLoadingPenilaian(false);
    }
  };

  const parseJSONData = (data) => {
    // If data is already an array (JSONB from PostgreSQL), return it directly
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a string, try to parse it
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        
        return [];
      }
    }
    // If it's null or undefined, return empty array
    return [];
  };

  // Format date untuk modal dengan format yang lebih lengkap
  const formatDateLong = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      return date.toLocaleDateString('id-ID', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      
      return 'Tanggal tidak valid';
    }
  };

  const komponenData = parseJSONData(tugas.komponen);
  const deliverableData = parseJSONData(tugas.deliverable);

  const getStatusColor = (startDate, endDate) => {
    if (!startDate || !endDate) return 'text-gray-600 bg-gray-50';
    
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'text-gray-600 bg-gray-50';
      }
      
      if (now < start) return 'text-blue-600 bg-blue-50';
      if (now > end) return 'text-red-600 bg-red-50';
      return 'text-green-600 bg-green-50';
    } catch (error) {
      
      return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Status Tidak Diketahui';
    
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Status Tidak Diketahui';
      }
      
      if (now < start) return 'Belum Dimulai';
      if (now > end) return 'Sudah Berakhir';
      return 'Sedang Berjalan';
    } catch (error) {
      
      return 'Status Tidak Diketahui';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {tugas.title || tugas.judul || 'Judul Tidak Tersedia'}
            </h2>
            <p className="text-sm text-gray-600">{course.name} - Kelas {course.class}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status dan Info Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${getStatusColor(tugas.start_date || tugas.tanggal_mulai, tugas.end_date || tugas.tanggal_selesai)}`}>
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <span className="font-medium">{getStatusText(tugas.start_date || tugas.tanggal_mulai, tugas.end_date || tugas.tanggal_selesai)}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium">Dosen: {tugas.dosen_name || course.lecturer || 'Tidak diketahui'}</span>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Deskripsi Tugas</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {tugas.description || tugas.deskripsi || 'Tidak ada deskripsi'}
              </p>
            </div>
          </div>

          {/* Waktu dan Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Mulai
              </h4>
              <p className="text-gray-700">
                {formatDateLong(tugas.start_date || tugas.tanggal_mulai)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Deadline
              </h4>
              <p className="text-gray-700">
                {formatDateLong(tugas.end_date || tugas.tanggal_selesai)}
              </p>
            </div>
          </div>

          {/* Pengaturan Kelompok */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Pengaturan Kelompok</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-blue-600 font-medium">Metode Pembentukan</span>
                  <p>{formatGroupingMethod(tugas.grouping_method)}</p>
                </div>
                <div>
                  <span className="text-sm text-blue-600 font-medium">Ukuran Kelompok</span>
                  <p>{tugas.min_group_size} - {tugas.max_group_size} orang</p>
                </div>
                <div>
                  <span className="text-sm text-blue-600 font-medium">Status Pemilihan</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      canSelectGroup(tugas) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <p className={canSelectGroup(tugas) ? 'text-green-700' : 'text-gray-600'}>
                      {canSelectGroup(tugas) ? 'Dapat Memilih Kelompok' : 'Tidak Dapat Memilih'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Komponen Penilaian */}
          {komponenData && komponenData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Komponen Penilaian</h3>
              <div className="space-y-2">
                {komponenData.map((komponen, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{komponen.nama || komponen.name || 'Komponen'}</span>
                    <span className="text-green-700 font-bold">{komponen.bobot || komponen.weight || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverable */}
          {deliverableData && deliverableData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Deliverable</h3>
              <div className="space-y-2">
                {deliverableData.map((item, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-medium text-purple-900">
                      {item.nama || item.name || item.title || 'Deliverable'}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-purple-700 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penilaian Section - Only show if visible */}
          {penilaianVisible && penilaian && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Penilaian Saya
              </h3>
              
              {penilaian.nilai && penilaian.nilai.length > 0 ? (
                <div className="space-y-3">
                  {penilaian.nilai.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{item.komponen_nama}</p>
                          <p className="text-sm text-gray-600">Bobot: {item.bobot}%</p>
                          {item.catatan && (
                            <p className="text-xs text-gray-500 mt-1">Catatan: {item.catatan}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">{item.nilai}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {penilaian.average !== null && (
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-lg text-white mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm opacity-90">Nilai Rata-rata</p>
                          <p className="text-xs opacity-75">Berdasarkan bobot komponen</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">{penilaian.average.toFixed(1)}</p>
                          <p className="text-sm opacity-90">
                            {penilaian.average >= 85 ? 'A' : penilaian.average >= 80 ? 'A-' : penilaian.average >= 75 ? 'B+' : penilaian.average >= 70 ? 'B' : penilaian.average >= 65 ? 'B-' : penilaian.average >= 60 ? 'C+' : penilaian.average >= 55 ? 'C' : penilaian.average >= 50 ? 'C-' : penilaian.average >= 45 ? 'D' : 'E'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    Belum ada nilai yang diberikan untuk tugas besar ini.
                  </p>
                </div>
              )}
            </div>
          )}

          {!penilaianVisible && !loadingPenilaian && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  Penilaian belum ditampilkan oleh dosen.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {canSelectGroup(tugas) && (
              <button 
                onClick={() => {
                  onClose();
                  handleJoinKelompok(tugas);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Pilih Kelompok
              </button>
            )}
            <button 
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Component untuk Group Selection
const GroupSelectionModal = ({ tugas, onClose, courseId }) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (tugas?.id) {
      loadGroupData();
    }
  }, [tugas]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load current group and available groups
      const [currentGroupResponse, availableGroupsResponse] = await Promise.all([
        getCurrentGroup(tugas.id),
        getAvailableGroups(tugas.id)
      ]);// Set current group
      if (currentGroupResponse.success && currentGroupResponse.hasGroup) {
        setCurrentGroup(currentGroupResponse.kelompok);
      } else {
        setCurrentGroup(null);
      }

      // Set available groups
      if (availableGroupsResponse.success) {
        if (availableGroupsResponse.alreadyInGroup) {
          setCurrentGroup(availableGroupsResponse.currentGroup);
          setAvailableGroups([]);
        } else {
          setAvailableGroups(availableGroupsResponse.kelompok || []);
        }
      } else {
        setError(availableGroupsResponse.message || 'Gagal memuat data kelompok');
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      setError('Gagal memuat data kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleJoinGroup = async (kelompokId) => {
    try {
      setLoading(true);
      const response = await joinGroup(kelompokId);
      
      if (response.success) {
        showNotification('success', response.message);
        // Immediately reload group data to reflect changes
        await loadGroupData();
        // Close modal after successful join
        setTimeout(() => {
          closeGroupModal();
        }, 1500); // Give time to show success message
      } else {
        showNotification('error', response.error || 'Gagal bergabung dengan kelompok');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      showNotification('error', 'Gagal bergabung dengan kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (kelompokId) => {
    try {
      setLoading(true);
      const response = await leaveStudentGroup(kelompokId);
      
      if (response.success) {
        showNotification('success', response.message);
        await loadGroupData(); // Reload data
      } else {
        showNotification('error', response.error || 'Gagal keluar dari kelompok');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      showNotification('error', 'Gagal keluar dari kelompok: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Pilih Kelompok</h3>
              <p className="text-sm text-gray-600 mt-1">{tugas.title || tugas.judul}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`p-4 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
            'bg-red-50 border-red-200 text-red-800'
          } border-b`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat data kelompok...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadGroupData}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : currentGroup ? (
            // Show current group
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Kelompok Anda Saat Ini</h4>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-medium">{currentGroup.nama_kelompok}</h5>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {currentGroup.member_count || (currentGroup.members?.length || 0)} anggota
                    </span>
                  </div>
                  
                  {currentGroup.members && currentGroup.members.length > 0 ? (
                    <div className="space-y-2">
                      <h6 className="font-medium text-gray-700 mb-2">Anggota:</h6>
                      {currentGroup.members.map((member, index) => (
                        <div key={member.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.npm}</p>
                          </div>
                          {member.isLeader && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Ketua
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Belum ada informasi anggota.</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <button
                      onClick={() => handleLeaveGroup(currentGroup.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      disabled={loading}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Keluar dari Kelompok
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : availableGroups.length > 0 ? (
            // Show available groups
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Kelompok Tersedia</h4>
                <div className="grid gap-4">
                  {availableGroups.map((group, idx) => (
                    <div key={`group-${group.id}-${idx}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-lg font-medium">{group.nama_kelompok}</h5>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {group.current_members || 0}/{group.max_members || 4} anggota
                          </span>
                          {group.current_members >= (group.max_members || 4) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                              Penuh
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {group.members && group.members.length > 0 ? (
                        <div className="mb-4">
                          <h6 className="font-medium text-gray-700 mb-2">Anggota saat ini:</h6>
                          <div className="space-y-1">
                            {group.members.map((member, index) => (
                              <div key={member.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-gray-600">{member.npm}</p>
                                </div>
                                {member.isLeader && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                    Ketua
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 mb-4">Belum ada anggota. Jadilah yang pertama!</p>
                      )}
                      
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={loading || group.current_members >= (group.max_members || 4)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          group.current_members >= (group.max_members || 4)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {group.current_members >= (group.max_members || 4) ? 'Kelompok Penuh' : 'Bergabung'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No groups available
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Kelompok Tersedia</h4>
              <p className="text-gray-600">
                Semua kelompok sudah penuh atau belum ada kelompok yang dibuat untuk tugas ini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Component untuk menampilkan nilai mahasiswa
const NilaiSaya = ({ tugasBesarNilai, course }) => {
  // Calculate average grade
  const calculateAverageGrade = () => {
    if (tugasBesarNilai.length > 0) {
      return (tugasBesarNilai.reduce((sum, item) => sum + item.nilai, 0) / tugasBesarNilai.length).toFixed(1);
    }
    if (course.myGrade !== null && course.myGrade !== undefined && course.myGrade !== '') {
      return course.myGrade;
    }
    return null;
  };

  const averageGrade = calculateAverageGrade();
  const hasGrade = averageGrade !== null && averageGrade !== undefined && averageGrade !== '';

  // Get grade letter
  const getGradeLetter = (nilai) => {
    if (!nilai || nilai === null || nilai === undefined || nilai === '') {
      return { letter: 'NA', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
    const nilaiNum = parseFloat(nilai);
    if (isNaN(nilaiNum)) {
      return { letter: 'NA', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
    if (nilaiNum >= 85) return { letter: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (nilaiNum >= 80) return { letter: 'A-', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (nilaiNum >= 75) return { letter: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (nilaiNum >= 70) return { letter: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (nilaiNum >= 65) return { letter: 'B-', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (nilaiNum >= 60) return { letter: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (nilaiNum >= 55) return { letter: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (nilaiNum >= 50) return { letter: 'C-', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (nilaiNum >= 45) return { letter: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (nilaiNum >= 0) return { letter: 'E', color: 'text-red-600', bgColor: 'bg-red-100' };
    return { letter: 'NA', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const gradeInfo = getGradeLetter(averageGrade);

  return (
    <div className="space-y-6">
      {/* Overall Grade Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-green-100 mb-2">Nilai Akhir</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold">{hasGrade ? averageGrade : 'NA'}</span>
              <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                {gradeInfo.letter}
              </span>
            </div>
            {hasGrade && tugasBesarNilai.length > 0 && (
              <p className="text-green-100 text-sm mt-3">
                <Award className="h-4 w-4 inline mr-1" />
                Rata-rata dari {tugasBesarNilai.length} tugas besar
              </p>
            )}
            {!hasGrade && (
              <p className="text-green-100 text-sm mt-3">
                Nilai belum tersedia
              </p>
            )}
          </div>
          <div className="text-center">
            <Star className="h-20 w-20 text-yellow-300 mx-auto mb-2" />
            <p className="text-sm text-green-100">
              {hasGrade ? (
                parseFloat(averageGrade) >= 70 ? 'Luar Biasa!' : parseFloat(averageGrade) >= 60 ? 'Bagus!' : 'Tetap Semangat!'
              ) : 'Nilai akan muncul setelah dosen memberikan penilaian'}
            </p>
          </div>
        </div>
      </div>

      {/* Grade Details */}
      {tugasBesarNilai.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Detail Nilai per Tugas Besar
          </h3>
          
          <div className="space-y-3">
            {tugasBesarNilai.map((item, idx) => {
              const itemGrade = getGradeLetter(item.nilai);
              return (
                <div 
                  key={`nilai-${item.tugasId}-${idx}`} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.tugasTitle}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Tugas Besar #{idx + 1}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {item.nilai.toFixed(1)}
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${itemGrade.bgColor} ${itemGrade.color} mt-1`}>
                          Grade {itemGrade.letter}
                        </div>
                      </div>
                      <div className="w-12 h-12 flex items-center justify-center">
                        {item.nilai >= 70 ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : item.nilai >= 50 ? (
                          <AlertCircle className="h-8 w-8 text-yellow-500" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grade Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(...tugasBesarNilai.map(item => item.nilai)).toFixed(1)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Nilai Terendah</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.min(...tugasBesarNilai.map(item => item.nilai)).toFixed(1)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Rata-rata</p>
                <p className="text-2xl font-bold text-purple-600">
                  {hasGrade ? averageGrade : 'NA'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Nilai</h3>
          <p className="text-gray-500">
            Nilai tugas besar belum tersedia atau belum dipublikasikan oleh dosen.
          </p>
        </div>
      )}

      {/* Grade Scale Reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Skala Penilaian
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-center">
            <div className="font-bold">A</div>
            <div>85-100</div>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-center">
            <div className="font-bold">A-</div>
            <div>80-84</div>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
            <div className="font-bold">B+</div>
            <div>75-79</div>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
            <div className="font-bold">B</div>
            <div>70-74</div>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
            <div className="font-bold">B-</div>
            <div>65-69</div>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-center">
            <div className="font-bold">C+</div>
            <div>60-64</div>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-center">
            <div className="font-bold">C</div>
            <div>55-59</div>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-center">
            <div className="font-bold">C-</div>
            <div>50-54</div>
          </div>
          <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded text-center">
            <div className="font-bold">D</div>
            <div>45-49</div>
          </div>
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-center">
            <div className="font-bold">E</div>
            <div>0-44</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component untuk menampilkan daftar kelompok mahasiswa
const KelompokSaya = ({ tugasBesar, course }) => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [tugasWithoutGroups, setTugasWithoutGroups] = useState([]); // Tugas besar yang belum punya kelompok
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedTugasForGroup, setSelectedTugasForGroup] = useState(null);

  useEffect(() => {
    loadMyGroups();
  }, [tugasBesar]);

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      const groupsData = [];
      const tasksWithoutGroupsList = [];
      
      // Load group for each tugas besar
      for (const tugas of tugasBesar) {
        try {
          const response = await getCurrentGroup(tugas.id);
          if (response && response.kelompok) {
            groupsData.push({
              tugas: tugas,
              kelompok: response.kelompok
            });
          } else {
            // Jika belum punya kelompok dan bisa pilih kelompok, tambahkan ke list
            if (canSelectGroup(tugas)) {
              tasksWithoutGroupsList.push(tugas);
            }
          }
        } catch (err) {
          console.error(`Error loading group for tugas ${tugas.id}:`, err);
        }
      }
      
      setMyGroups(groupsData);
      setTugasWithoutGroups(tasksWithoutGroupsList);
    } catch (err) {
      console.error('Error loading my groups:', err);
      setError('Gagal memuat data kelompok');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinKelompokFromKelompokSaya = (tugas) => {
    // Check if task allows student choice and is still active
    if (!canSelectGroup(tugas)) {
      alert('Pemilihan kelompok tidak diizinkan untuk tugas ini.');
      return;
    }

    // Check if task is still active (not ended)
    const now = new Date();
    const endDate = new Date(tugas.end_date || tugas.tanggal_selesai);
    
    if (now > endDate) {
      alert('Tugas sudah berakhir. Tidak dapat memilih kelompok lagi.');
      return;
    }

    // Open group selection modal
    setSelectedTugasForGroup(tugas);
    setShowGroupModal(true);
  };

  const closeGroupModalKelompokSaya = () => {
    setShowGroupModal(false);
    setSelectedTugasForGroup(null);
    // Reload groups after modal closes
    loadMyGroups();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Memuat data kelompok...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tugas Besar yang Belum Punya Kelompok */}
      {tugasWithoutGroups.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pilih Kelompok untuk Tugas Besar</h3>
          <p className="text-sm text-gray-600 mb-4">
            Anda belum memiliki kelompok untuk tugas besar berikut. Silakan pilih kelompok untuk bergabung.
          </p>
          <div className="space-y-3">
            {tugasWithoutGroups.map((tugas, idx) => (
              <div key={`tugas-no-group-${tugas.id}-${idx}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {tugas.title || tugas.judul}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {tugas.description || tugas.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Deadline: {tugas.end_date || tugas.tanggal_selesai ? new Date(tugas.end_date || tugas.tanggal_selesai).toLocaleDateString('id-ID') : 'Tidak ditentukan'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinKelompokFromKelompokSaya(tugas)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-4"
                  >
                    <Users className="h-4 w-4" />
                    Pilih Kelompok
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kelompok yang Sudah Dimiliki */}
      {myGroups.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Kelompok Saya</h3>
        
        <div className="space-y-4">
          {myGroups.map((item, idx) => (
            <div key={`group-${item.tugas.id}-${idx}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.kelompok.nama_kelompok}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Tugas Besar: <span className="font-medium">{item.tugas.title || item.tugas.judul}</span>
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {item.kelompok.members?.length || 0} anggota
                    </span>
                    <span className="flex items-center">
                      <Settings className="h-4 w-4 mr-1" />
                      {formatGroupingMethod(item.tugas.grouping_method)}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.kelompok.members?.length >= (item.tugas.min_group_size || 2)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.kelompok.members?.length >= (item.tugas.min_group_size || 2) ? 'Lengkap' : 'Belum Lengkap'}
                </span>
              </div>
              
              {item.kelompok.members && item.kelompok.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Anggota Kelompok:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.kelompok.members.map((member, memberIdx) => (
                      <div key={`member-${member.id || memberIdx}`} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {member.nama_lengkap || member.name || 'Nama tidak tersedia'}
                            {member.is_leader && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Ketua
                              </span>
                            )}
                          </p>
                          {member.nim && (
                            <p className="text-xs text-gray-500">NIM: {member.nim}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      ) : (
        myGroups.length === 0 && tugasWithoutGroups.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Kelompok</h3>
            <p className="text-gray-500">
              Anda belum terdaftar di kelompok manapun untuk tugas besar di mata kuliah ini.
            </p>
          </div>
        )
      )}

      {/* Group Selection Modal */}
      {showGroupModal && selectedTugasForGroup && (
        <GroupSelectionModal 
          tugas={selectedTugasForGroup} 
          onClose={closeGroupModalKelompokSaya}
          courseId={course?.id}
        />
      )}
    </div>
  );
};

export default MahasiswaCourseDetail;
