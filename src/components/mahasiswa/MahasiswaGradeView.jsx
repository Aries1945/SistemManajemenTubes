import React, { useState } from 'react';
import { 
  Star, TrendingUp, TrendingDown, Award, Target, 
  FileText, Calendar, BarChart3, Eye, Download
} from 'lucide-react';

const MahasiswaGradeView = ({ courseId, courseName, myGrade, averageGrade }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

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
      feedback: 'Perlu lebih memahami konsep closure dan async/await.'
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
      feedback: 'Bagus! Tapi perlu perbaikan pada responsive design untuk mobile.'
    },
    {
      id: 3,
      title: 'Tugas 2: JavaScript Interactive Features',
      type: 'assignment',
      date: '2024-10-25',
      maxScore: 100,
      myScore: 92,
      classAverage: 85,
      weight: 15,
      feedback: 'Excellent work! Implementasi yang sangat baik dan kode yang clean.'
    },
    {
      id: 4,
      title: 'UTS: Mid-term Examination',
      type: 'exam',
      date: '2024-11-01',
      maxScore: 100,
      myScore: 85,
      classAverage: 78,
      weight: 25,
      feedback: 'Pemahaman konsep sudah baik, namun perlu latihan lebih untuk implementasi.'
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
      feedback: 'Good job! Component structure bisa diperbaiki. Perhatikan best practices React.'
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
  const myPosition = 12; // out of 45 students
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
            <div key={grade.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center text-gray-600">
                      {getTypeIcon(grade.type)}
                      <span className="ml-1 text-xs">{getTypeText(grade.type)}</span>
                    </div>
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
                  <div className="flex items-center space-x-6 mb-3">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Nilai Saya:</span>
                      <span className={`text-lg font-bold ${getGradeColor(grade.myScore)}`}>
                        {grade.myScore}/{grade.maxScore}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${gradeBadge.color}`}>
                        {gradeBadge.grade}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Rata-rata:</span>
                      <span className="text-lg font-medium text-gray-700">
                        {grade.classAverage}/{grade.maxScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <PerformanceIcon className={`h-4 w-4 ${performance.color} mr-1`} />
                      <span className={`text-sm font-medium ${performance.color}`}>
                        {performance.text}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Performa vs Kelas</span>
                      <span className="text-xs text-gray-600">
                        {grade.myScore > grade.classAverage ? '+' : ''}{grade.myScore - grade.classAverage} poin
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-400 h-2 rounded-full" 
                          style={{ width: `${(grade.classAverage / grade.maxScore) * 100}%` }}
                        ></div>
                      </div>
                      <div 
                        className="absolute top-0 bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(grade.myScore / grade.maxScore) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>Saya: {grade.myScore}</span>
                      <span>Avg: {grade.classAverage}</span>
                      <span>{grade.maxScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {grade.feedback && (
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500 mb-3">
                  <p className="text-sm font-medium text-blue-800 mb-1">Feedback Dosen:</p>
                  <p className="text-sm text-blue-700">{grade.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="h-3 w-3 mr-1" />
                  <span>Kontribusi: {grade.weight}% dari nilai akhir</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
                  </button>
                  <button className="flex items-center text-sm text-green-600 hover:text-green-800 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                </div>
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

      {/* Study Recommendations */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Rekomendasi Belajar</h4>
        <div className="space-y-3">
          {calculateWeightedGrade() < averageGrade ? (
            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-yellow-800 mb-1">Perlu Peningkatan</p>
              <p className="text-sm text-yellow-700">
                Nilai Anda saat ini di bawah rata-rata kelas. Fokus pada pemahaman konsep dasar dan latihan soal.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <p className="text-sm font-medium text-green-800 mb-1">Performa Baik</p>
              <p className="text-sm text-green-700">
                Pertahankan konsistensi belajar dan fokus pada topik yang masih challenging.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 border border-gray-200 rounded">
              <h5 className="font-medium text-gray-900 mb-2">Target Nilai Akhir</h5>
              <p className="text-2xl font-bold text-blue-600">A</p>
              <p className="text-xs text-gray-500">Butuh rata-rata 90+ untuk sisa assessment</p>
            </div>
            <div className="p-3 border border-gray-200 rounded">
              <h5 className="font-medium text-gray-900 mb-2">Area Perbaikan</h5>
              <p className="text-sm text-gray-700">JavaScript Advanced Concepts</p>
              <p className="text-xs text-gray-500">Berdasarkan feedback dosen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaGradeView;