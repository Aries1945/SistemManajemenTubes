import React, { useState } from 'react';
import { 
  Star, TrendingUp, TrendingDown, Award, Target, 
  FileText, Calendar, BarChart3, Eye, Download, X, Users, User
} from 'lucide-react';

const MahasiswaGradeView = ({ courseId, courseName, myGrade = 85.5, averageGrade = 80 }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Sample grades data
  const gradesData = [
    {
      id: 1,
      title: 'Quiz: JavaScript Fundamentals',
      type: 'quiz',
      date: '2024-10-10',
      maxScore: 100,
      myScore: 78,
      classAverage: 75,
      weight: 10,
      feedback: 'Perlu lebih memahami konsep closure dan async/await.',
      isGroupTask: false,
      detailedScores: {
        criteria: [
          { name: 'Pemahaman Konsep', maxScore: 30, score: 24, notes: 'Konsep dasar sudah dipahami' },
          { name: 'Implementasi Code', maxScore: 40, score: 30, notes: 'Perlu perbaikan pada async/await' },
          { name: 'Best Practices', maxScore: 20, score: 16, notes: 'Code structure cukup baik' },
          { name: 'Testing', maxScore: 10, score: 8, notes: 'Test coverage bisa ditingkatkan' }
        ]
      }
    },
    {
      id: 2,
      title: 'Tugas 1: HTML & CSS Fundamentals',
      type: 'assignment',
      date: '2024-10-15',
      maxScore: 100,
      myScore: 88,
      classAverage: 82,
      weight: 15,
      feedback: 'Bagus! Tapi perlu perbaikan pada responsive design untuk mobile.',
      isGroupTask: false,
      detailedScores: {
        criteria: [
          { name: 'HTML Structure', maxScore: 20, score: 18, notes: 'Semantic HTML sudah baik' },
          { name: 'CSS Styling', maxScore: 30, score: 27, notes: 'Design menarik dan konsisten' },
          { name: 'Responsive Design', maxScore: 25, score: 20, notes: 'Mobile view perlu diperbaiki' },
          { name: 'Kreativitas', maxScore: 15, score: 13, notes: 'Layout cukup kreatif' },
          { name: 'W3C Validation', maxScore: 10, score: 10, notes: 'Perfect validation' }
        ]
      }
    },
    {
      id: 4,
      title: 'Project: E-Commerce Website',
      type: 'assignment',
      date: '2024-11-20',
      maxScore: 100,
      myScore: 90,
      classAverage: 85,
      weight: 25,
      feedback: 'Excellent teamwork! Implementasi fitur lengkap dan UI/UX sangat baik.',
      isGroupTask: true,
      groupMembers: [
        { 
          id: 1, 
          name: 'John Doe', 
          npm: '2023001',
          score: 90,
          individualFeedback: 'Leadership sangat baik, koordinasi tim excellent. Code quality tinggi pada backend implementation.'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          npm: '2023002',
          score: 92,
          individualFeedback: 'Frontend implementation luar biasa. UI/UX design sangat menarik dan user-friendly.'
        },
        { 
          id: 3, 
          name: 'Bob Wilson', 
          npm: '2023003',
          score: 88,
          individualFeedback: 'Database design solid. API integration berjalan dengan baik, perlu lebih fokus pada error handling.'
        },
        { 
          id: 4, 
          name: 'Alice Brown', 
          npm: '2023004',
          score: 89,
          individualFeedback: 'Testing coverage baik. Documentation lengkap dan mudah dipahami. Deployment process smooth.'
        }
      ],
      detailedScores: {
        criteria: [
          { name: 'Functionality', maxScore: 40, score: 37, notes: 'Semua fitur berjalan dengan baik' },
          { name: 'Code Quality', maxScore: 20, score: 18, notes: 'Clean code, good structure' },
          { name: 'UI/UX Design', maxScore: 15, score: 14, notes: 'Design modern dan responsive' },
          { name: 'Documentation', maxScore: 15, score: 13, notes: 'Documentation cukup lengkap' },
          { name: 'Presentation', maxScore: 10, score: 8, notes: 'Presentasi jelas dan terstruktur' }
        ]
      }
    },
    {
      id: 5,
      title: 'Tugas 3: React.js Application',
      type: 'assignment',
      date: '2024-11-05',
      maxScore: 100,
      myScore: 85,
      classAverage: 80,
      weight: 15,
      feedback: 'Good job! Component structure bisa diperbaiki. Perhatikan best practices React.',
      isGroupTask: false,
      detailedScores: {
        criteria: [
          { name: 'Component Structure', maxScore: 25, score: 20, notes: 'Structure bisa lebih modular' },
          { name: 'State Management', maxScore: 25, score: 22, notes: 'State handling sudah baik' },
          { name: 'Routing', maxScore: 20, score: 17, notes: 'Routing implementation correct' },
          { name: 'API Integration', maxScore: 20, score: 18, notes: 'API calls handled properly' },
          { name: 'UI/UX', maxScore: 10, score: 8, notes: 'User interface cukup baik' }
        ]
      }
    }
  ];

  // Calculate weighted average
  const calculateWeightedGrade = () => {
    const totalWeight = gradesData.reduce((sum, grade) => sum + grade.weight, 0);
    const weightedSum = gradesData.reduce((sum, grade) => sum + (grade.myScore * grade.weight), 0);
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  };

  // Grade distribution for chart
  const gradeDistribution = [
    { range: 'A (90-100)', count: 8, percentage: 18 },
    { range: 'B (80-89)', count: 15, percentage: 33 },
    { range: 'C (70-79)', count: 12, percentage: 27 },
    { range: 'D (60-69)', count: 7, percentage: 16 },
    { range: 'E (0-59)', count: 3, percentage: 7 }
  ];

  // My position in class
  const myPosition = 12;
  const totalStudents = 45;

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score) => {
    if (score >= 90) return { color: 'bg-green-100 text-green-800', grade: 'A' };
    if (score >= 80) return { color: 'bg-blue-100 text-blue-800', grade: 'B' };
    if (score >= 70) return { color: 'bg-yellow-100 text-yellow-800', grade: 'C' };
    if (score >= 60) return { color: 'bg-orange-100 text-orange-800', grade: 'D' };
    return { color: 'bg-red-100 text-red-800', grade: 'E' };
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <FileText className="h-4 w-4" />;
      case 'exam':
        return <Award className="h-4 w-4" />;
      case 'assignment':
        return <Target className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'quiz':
        return 'Quiz';
      case 'exam':
        return 'Ujian';
      case 'assignment':
        return 'Tugas';
      default:
        return 'Penilaian';
    }
  };

  const getPerformanceIndicator = (myScore, classAverage) => {
    const diff = myScore - classAverage;
    if (diff > 10) return { icon: TrendingUp, color: 'text-green-600', text: 'Sangat Baik' };
    if (diff > 5) return { icon: TrendingUp, color: 'text-blue-600', text: 'Baik' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-yellow-600', text: 'Di Atas Rata-rata' };
    if (diff > -5) return { icon: TrendingDown, color: 'text-orange-600', text: 'Di Bawah Rata-rata' };
    return { icon: TrendingDown, color: 'text-red-600', text: 'Perlu Perbaikan' };
  };

  const handlePreview = (grade) => {
    setSelectedGrade(grade);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedGrade(null);
  };

  const GradePreview = () => {
    if (!selectedGrade) return null;

    const gradeBadge = getGradeBadge(selectedGrade.myScore);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(selectedGrade.type)}
                  <span className="text-sm opacity-90">{getTypeText(selectedGrade.type)}</span>
                  {selectedGrade.isGroupTask && (
                    <span className="flex items-center gap-1 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                      <Users size={12} />
                      Tugas Kelompok
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedGrade.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(selectedGrade.date).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span>Bobot: {selectedGrade.weight}%</span>
                </div>
              </div>
              <button 
                onClick={handleClosePreview}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-1">Nilai Anda</p>
                <p className="text-3xl font-bold text-green-600">{selectedGrade.myScore}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${gradeBadge.color}`}>
                  Grade {gradeBadge.grade}
                </span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Rata-rata Kelas</p>
                <p className="text-3xl font-bold text-blue-600">{selectedGrade.classAverage}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {selectedGrade.myScore > selectedGrade.classAverage ? '+' : ''}{selectedGrade.myScore - selectedGrade.classAverage} dari rata-rata
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Skor Maksimal</p>
                <p className="text-3xl font-bold text-purple-600">{selectedGrade.maxScore}</p>
                <p className="text-xs text-purple-600 mt-2">
                  {Math.round((selectedGrade.myScore / selectedGrade.maxScore) * 100)}% tercapai
                </p>
              </div>
            </div>

            {/* Detailed Scores Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Rincian Penilaian</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kriteria
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skor Maksimal
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skor Anda
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Persentase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGrade.detailedScores.criteria.map((criterion, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {criterion.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                          {criterion.maxScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-semibold ${getGradeColor(criterion.score / criterion.maxScore * 100)}`}>
                            {criterion.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (criterion.score / criterion.maxScore) >= 0.9 ? 'bg-green-500' :
                                  (criterion.score / criterion.maxScore) >= 0.8 ? 'bg-blue-500' :
                                  (criterion.score / criterion.maxScore) >= 0.7 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {Math.round((criterion.score / criterion.maxScore) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {criterion.notes}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {selectedGrade.maxScore}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${getGradeColor(selectedGrade.myScore)}`}>
                          {selectedGrade.myScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {Math.round((selectedGrade.myScore / selectedGrade.maxScore) * 100)}%
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Feedback Dosen</h3>
              <p className="text-sm text-blue-800">{selectedGrade.feedback}</p>
            </div>

            {/* Group Members Scores (for group tasks) */}
            {selectedGrade.isGroupTask && selectedGrade.groupMembers && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-purple-50 px-6 py-3 border-b border-purple-200">
                  <h3 className="font-semibold text-purple-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Nilai & Feedback Anggota Kelompok
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {selectedGrade.groupMembers.map((member, index) => (
                    <div key={member.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">NPM: {member.npm}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(member.score)}`}>
                            {member.score}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGradeBadge(member.score).color}`}>
                            Grade {getGradeBadge(member.score).grade}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border-l-4 border-purple-500">
                        <p className="text-sm text-gray-700 italic">"{member.individualFeedback}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={handleClosePreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Tutup
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return <GradePreview />;
  }

  return (
    <div className="space-y-6">
      {/* Grade Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Ringkasan Nilai</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{calculateWeightedGrade()}</p>
            <p className="text-sm text-gray-600">Nilai Akhir Saya</p>
            <div className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeBadge(calculateWeightedGrade()).color}`}>
                Grade {getGradeBadge(calculateWeightedGrade()).grade}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{averageGrade}</p>
            <p className="text-sm text-gray-600">Rata-rata Kelas</p>
            <p className="text-xs text-gray-500 mt-1">
              {calculateWeightedGrade() > averageGrade ? 'Di atas rata-rata' : 'Di bawah rata-rata'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{myPosition}</p>
            <p className="text-sm text-gray-600">Ranking Kelas</p>
            <p className="text-xs text-gray-500 mt-1">dari {totalStudents} mahasiswa</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{Math.round(((totalStudents - myPosition + 1) / totalStudents) * 100)}%</p>
            <p className="text-sm text-gray-600">Persentil</p>
            <p className="text-xs text-gray-500 mt-1">posisi kelas</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Detail Nilai per Assessment</h4>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">Semua Periode</option>
          <option value="recent">30 Hari Terakhir</option>
          <option value="midterm">Sebelum UTS</option>
          <option value="final">Setelah UTS</option>
        </select>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        {gradesData.map(grade => {
          const performance = getPerformanceIndicator(grade.myScore, grade.classAverage);
          const PerformanceIcon = performance.icon;
          const gradeBadge = getGradeBadge(grade.myScore);
          
          return (
            <div 
              key={grade.id} 
              onClick={() => handlePreview(grade)}
              className="bg-white border rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center text-gray-600">
                      {getTypeIcon(grade.type)}
                      <span className="ml-1 text-xs">{getTypeText(grade.type)}</span>
                    </div>
                    {grade.isGroupTask && (
                      <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        <Users size={12} />
                        Kelompok
                      </span>
                    )}
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">Bobot: {grade.weight}%</span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{grade.title}</h4>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(grade.date).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  {/* Score Comparison */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Nilai:</span>
                      <span className={`text-lg font-bold ${getGradeColor(grade.myScore)}`}>
                        {grade.myScore}/{grade.maxScore}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${gradeBadge.color}`}>
                        {gradeBadge.grade}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <PerformanceIcon className={`h-4 w-4 ${performance.color} mr-1`} />
                      <span className={`text-sm font-medium ${performance.color}`}>
                        {performance.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Click indicator */}
              <div className="flex items-center justify-center pt-3 border-t border-gray-100">
                <span className="flex items-center text-sm text-blue-600 font-medium">
                  <Eye className="h-4 w-4 mr-1" />
                  Klik untuk melihat detail nilai dan feedback
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade Distribution */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Distribusi Nilai Kelas</h4>
        <div className="space-y-3">
          {gradeDistribution.map((dist, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-20">{dist.range}</span>
                <div className="w-48 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full" 
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{dist.count} mahasiswa</span>
                <span className="text-sm font-medium text-gray-900">{dist.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded">
          <div className="flex items-center">
            <Target className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Posisi Anda: Ranking {myPosition} dari {totalStudents} mahasiswa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaGradeView;